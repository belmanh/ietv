import { db, storage } from "@/lib/firebase";
import { collection, doc, DocumentData, getDoc, getDocs, QueryDocumentSnapshot } from "firebase/firestore";
import { getDownloadURL, getMetadata, listAll, ref } from "firebase/storage";

export type VideoItem = {
  id: string;
  title: string;
  url: string;
  timeCreated?: string;
  thumbUrl?: string;
  likes?: number;
  views?: number;
  duration?: number; // seconds (optional)
};

// Lightweight in-memory cache to avoid refetching repeatedly within a short window
let _videosCache: { data: VideoItem[]; ts: number } | null = null;
let _videosPending: Promise<VideoItem[]> | null = null;
const VIDEOS_TTL_MS = 60_000; // 60s cache window

function isVideo(name: string, contentType?: string) {
  return contentType?.startsWith("video/") || /\.(mp4|mov|m4v|webm|mkv)$/i.test(name);
}
function prettyTitle(name: string) {
  const base = name.replace(/\.[^/.]+$/, "");
  try {
    // Normalize separators to spaces and collapse multiple spaces
    const decoded = decodeURIComponent(base).replaceAll('_', ' ').replaceAll('-', ' ');
  return decoded.replace(/\s+/g, ' ').trim(); // NOSONAR: compact multiple spaces intentionally
  }
  catch { return base; }
}
async function tryThumbByBase(base: string, storageRoot = 'thumbnails'): Promise<string | undefined> {
  const exts = ["jpg", "jpeg", "png", "webp"] as const;
  for (const ext of exts) {
    try {
      const tRef = ref(storage, `${storageRoot}/${base}.${ext}`);
      const u = await getDownloadURL(tRef);
      if (u) return u;
    } catch {}
  }
  return undefined;
}
// Note: we avoid listing the root of "videos" on Storage because rules often don't
// permit listing at the top-level. We'll prefer Firestore metadata to enumerate videos.

// NOSONAR: function is intentionally comprehensive to handle many data shapes
function normalizeCreated(createdAny: any): string | undefined {
  if (createdAny?.toDate?.()) {
    try { return createdAny.toDate().toISOString(); } catch { return undefined; }
  }
  return typeof createdAny === 'string' ? createdAny : undefined;
}

async function resolveVideoUrlAndBase(data: any, fallbackId: string): Promise<{ url: string | null; base?: string }> { // NOSONAR complexity
  const candidates: Array<string | undefined> = [
    data.url, data.videoUrl, data.downloadURL, data.downloadUrl, data?.video?.url, data?.file?.url, data.sourceUrl, data.streamUrl, data.hlsUrl, data?.media?.url,
  ];
  const direct = candidates.find((u) => typeof u === 'string' && u.startsWith('http')) || null;
  if (direct) return { url: direct };

  const pathCandidates: Array<string | undefined> = [
    data.storagePath, data.path, data.fullPath, data?.video?.path, data?.file?.path, data.videoPath, data.hlsPath, data.pathToVideo, data.remotePath,
    data?.storageFolder ? `${data.storageFolder}/${data.fileName || data.filename || data.name || 'video.mp4'}` : undefined,
  ];
  const path = pathCandidates.find((p) => typeof p === 'string');
  if (path) {
    const r = ref(storage, path);
    const url = await getDownloadURL(r);
    const last = path.split('/').pop() || '';
    return { url, base: last.replace(/\.[^.]+$/, '') };
  }
  const fileName = data.fileName || data.filename || data.name || undefined;
  const candidateNames = [
    fileName,
    fileName ? undefined : `${fallbackId}.m3u8`,
    fileName ? undefined : `${fallbackId}.mp4`,
    fileName ? undefined : `${fallbackId}.mov`,
    fileName ? undefined : `${fallbackId}.m4v`,
    fileName ? undefined : `${fallbackId}.webm`,
    fileName ? `hls/${fileName}` : `hls/${fallbackId}.m3u8`,
    'playlist.m3u8',
    'index.m3u8',
    'master.m3u8',
  ].filter(Boolean) as string[];
  for (const name of candidateNames) {
    const candidates = [
      `videos/${fallbackId}/${name}`,
      `videos/${fallbackId}/hls/${name}`,
      `videos/${fallbackId}/${fallbackId}/${name}`,
    ];
    for (const p of candidates) {
      try {
        const r = ref(storage, p);
        const meta = await getMetadata(r).catch(() => null as any);
        if (!meta || isVideo(name, meta?.contentType)) {
          const url = await getDownloadURL(r);
          const last = p.split('/').pop() || '';
          return { url, base: last.replace(/\.[^.]+$/, '') };
        }
      } catch {}
    }
  }
  return { url: null };
}

async function tryThumbExplicit(data: any): Promise<string | undefined> {
  if (data?.thumb?.url || data?.thumbnailUrl || data?.posterUrl || data?.imageUrl) {
    return data.thumb?.url || data.thumbnailUrl || data.posterUrl || data.imageUrl;
  }
  if (data?.thumb?.path) {
    try { return await getDownloadURL(ref(storage, data.thumb.path)); } catch {}
  }
  return undefined;
}

async function tryThumbFromBaseOrFile(data: any, videoBaseName?: string): Promise<string | undefined> {
  const baseFromPath = (data?.video?.path ? String(data.video.path).split('/').pop() : '')?.replace(/\.[^.]+$/, '') || undefined;
  const base = baseFromPath || videoBaseName || (typeof data.fileName === 'string' ? String(data.fileName).replace(/\.[^.]+$/, '') : undefined);
  if (!base) return undefined;
  return await tryThumbByBase(base);
}

async function tryThumbFromFolder(data: any): Promise<string | undefined> {
  if (!data?.storageFolder) return undefined;
  const candidates = ["thumb", "thumbnail", "poster", "image", "cover"];
  const exts = ["jpg", "jpeg", "png", "webp"] as const;
  for (const name of candidates) {
    for (const ext of exts) {
      try {
        const r = ref(storage, `${data.storageFolder}/${name}.${ext}`);
        const u = await getDownloadURL(r);
        if (u) return u;
      } catch {}
    }
  }
  return undefined;
}

async function resolveThumbUrl(data: any, videoBaseName?: string): Promise<string | undefined> {
  return (await tryThumbExplicit(data))
    || (await tryThumbFromBaseOrFile(data, videoBaseName))
    || (await tryThumbFromFolder(data));
}

function pickDuration(data: any): number | undefined {
  if (!data) return undefined;
  const candidates = [data.duration, data.runtime, data.length, data?.video?.duration];
  for (const v of candidates) {
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) return v;
  }
  return undefined;
}

async function buildVideoFromFirestoreDoc(d: QueryDocumentSnapshot<DocumentData>): Promise<VideoItem | null> {
  const data: any = d.data() || {};
  const title = data.title || prettyTitle(String(data.fileName || data.filename || data.name || data?.video?.path || d.id));
  const timeCreated = normalizeCreated(data.timeCreated || data.createdAt || data.uploadedAt || data?.video?.timeCreated);
  const { url, base } = await resolveVideoUrlAndBase(data, d.id);
  if (!url) return null;
  const thumbUrl = await resolveThumbUrl(data, base);
    const duration = pickDuration(data);
  return { id: d.id, title, url, timeCreated, thumbUrl, likes: typeof data.likes === 'number' ? data.likes : undefined, views: typeof data.views === 'number' ? data.views : undefined, duration };
}

async function fetchFromFirestore(): Promise<VideoItem[]> {
  const col = collection(db, 'videos');
  const snap = await getDocs(col);
  const rows = await Promise.all(snap.docs.map(buildVideoFromFirestoreDoc));
  const list = rows.filter((x): x is VideoItem => !!x);
  if (!list.length) {
    // Log the first few doc ids to help diagnose mapping issues (non-fatal)
    const ids = snap.docs.slice(0, 5).map((d) => d.id);
    console.warn('[videos] No resolvable URLs from Firestore. Sample ids:', ids);
  }
  return list.sort((a, b) => new Date(b.timeCreated || 0).getTime() - new Date(a.timeCreated || 0).getTime());
}

async function fetchFromStorageFallback(): Promise<VideoItem[]> {
  const root = ref(storage, 'videos');
  const rootList = await listAll(root);
  const rows: VideoItem[] = [];
  const exts = ['.m3u8', '.mp4', '.mov', '.m4v', '.webm'];
  const norm = (s: string) => {
    const lower = s.toLowerCase();
    const withoutExt = lower.includes('.') ? lower.substring(0, lower.lastIndexOf('.')) : lower;
    return withoutExt.replaceAll(' ', '').replaceAll('_', '').replaceAll('-', '');
  };

  const addItem = async (id: string, pathRef: ReturnType<typeof ref>) => {
    try {
      const url = await getDownloadURL(pathRef);
      const name = pathRef.name;
      const base = name.replace(/\.[^.]+$/, '');
      const thumbUrl = await tryThumbByBase(base);
      rows.push({ id, title: prettyTitle(name), url, thumbUrl });
    } catch {}
  };

  for (const item of rootList.items || []) {
    const lower = item.name.toLowerCase();
    if (exts.some((e) => lower.endsWith(e))) {
      await addItem(item.name, item);
    }
  }
  for (const prefix of rootList.prefixes || []) {
    try {
      const sub = await listAll(prefix);
      const base = norm(prefix.name);
      const exact = sub.items.find((i) => norm(i.name) === base);
      if (exact) { await addItem(prefix.name, exact); continue; }
      const pick = (items: typeof sub.items, ext: string) => items.find((i) => i.name.toLowerCase().endsWith(ext));
      const m3u8 = pick(sub.items, '.m3u8');
      if (m3u8) { await addItem(prefix.name, m3u8); continue; }
      const mp4 = pick(sub.items, '.mp4');
      if (mp4) { await addItem(prefix.name, mp4); continue; }
      const anyPlayable = sub.items.find((i) => exts.some((e) => i.name.toLowerCase().endsWith(e)));
      if (anyPlayable) await addItem(prefix.name, anyPlayable);
    } catch {}
  }

  return rows;
}

export function clearVideosCache() {
  _videosCache = null;
}

export async function fetchVideosFromStorage(): Promise<VideoItem[]> {
  const now = Date.now();
  if (_videosCache && now - _videosCache.ts < VIDEOS_TTL_MS) {
    return _videosCache.data;
  }
  if (_videosPending) return _videosPending;

  _videosPending = (async () => {
    try {
      const rows = await fetchFromFirestore();
      const data = rows.length ? rows : await fetchFromStorageFallback();
      _videosCache = { data, ts: Date.now() };
      return data;
    } catch (e) {
      console.warn('videos: fetch failed, returning empty list', e);
      const data: VideoItem[] = [];
      _videosCache = { data, ts: Date.now() };
      return data;
    } finally {
      _videosPending = null;
    }
  })();

  return _videosPending;
}

// Fetch a single video by its Firestore document id using the same resolution logic
export async function fetchVideoById(id: string): Promise<VideoItem | null> {
  try {
    const dref = doc(db, 'videos', id);
    const snap = await getDoc(dref);
    if (!snap.exists()) return null;
    const data: any = snap.data() || {};
    const title = data.title || prettyTitle(String(data.fileName || data.filename || data.name || data?.video?.path || id));
    const timeCreated = normalizeCreated(data.timeCreated || data.createdAt || data.uploadedAt || data?.video?.timeCreated);
    const { url, base } = await resolveVideoUrlAndBase(data, id);
    if (!url) return null;
    const thumbUrl = await resolveThumbUrl(data, base);
    const duration = pickDuration(data);
    return { id, title, url, timeCreated, thumbUrl, likes: typeof data.likes === 'number' ? data.likes : undefined, views: typeof data.views === 'number' ? data.views : undefined, duration };
  } catch (e) {
    console.warn('fetchVideoById failed', id, e);
    return null;
  }
}