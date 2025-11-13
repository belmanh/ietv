/* eslint-disable sonarjs/cognitive-complexity */
import { useTheme } from '@/context/ThemeProvider';
import { useThemeColors } from '@/hooks/useThemeColors';
import { auth, db, storage } from '@/lib/firebase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { VideoView, useVideoPlayer } from 'expo-video';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, listAll, ref as storageRef } from 'firebase/storage';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


type Comment = { id: string; text: string; author?: string; createdAt?: any };
type VideoDoc = { title?: string; description?: string; likes?: number; dislikes?: number };

const icons = {
  like: require('../../assets/images/like.png'),
  dislike: require('../../assets/images/dislike.png'),
  share: require('../../assets/images/share.png'),
  favorite: require('../../assets/images/favorites.png'),
  back: require('../../assets/images/back.png'), // ajoute une flèche si tu l’as
};

export default function VideoDetail() {
  const { bg: BG, text: TEXT, subtle: SUBTLE, card: CARD, accent: ACCENT } = useThemeColors();
  const { colorScheme } = useTheme();
  const { id, title, url } = useLocalSearchParams<{ id: string; title?: string; url: string }>();
  const videoRef = useMemo(() => doc(db, 'videos', String(id)), [id]);
  const commentsRef = useMemo(() => collection(db, 'videos', String(id), 'comments'), [id]);
  const router = useRouter();
  const [info, setInfo] = useState<VideoDoc>({ title, description: '', likes: 0, dislikes: 0 });
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  // Player expo-video (autoplay, PIP et plein écran autorisés)
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  // Source mémoïsée: préciser 'hls' uniquement si nécessaire
  const source = useMemo(() => {
    if (!playUrl) return null as any;
    const lower = playUrl.toLowerCase();
    const isHls = lower.includes('.m3u8');
    const src: any = { uri: playUrl };
    if (isHls) src.contentType = 'hls';
    return src;
  }, [playUrl]);
  // Crée le player seulement quand l'URL est prête; évite de l'initialiser avec une source vide
  const player = useVideoPlayer(source ?? undefined, (p) => { p.loop = false; });
  const [isFav, setIsFav] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const playerRef = useRef<any>(null);
  const [autoplayPref, setAutoplayPref] = useState(true);
  const [manuallyStarted, setManuallyStarted] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem('settings.autoplay');
        if (v !== null) setAutoplayPref(v === '1');
      } catch {}
    })();
  }, []);

  useEffect(() => {
    // Lecture uniquement; ne pas écrire le doc vidéo (bloqué par les règles)
    const unsubVideo = onSnapshot(videoRef, (snap) => snap.exists() && setInfo(snap.data() as VideoDoc));
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const unsubComments = onSnapshot(q, (snap) => {
      const list: Comment[] = [];
      for (const d of snap.docs) list.push({ id: d.id, ...(d.data() as any) });
      setComments(list);
    });

    // Likes/dislikes counters via sous-collections autorisées par les règles
    const likesCol = collection(db, 'videos', String(id), 'likes');
    const dislikesCol = collection(db, 'videos', String(id), 'dislikes');
    const unsubLikes = onSnapshot(likesCol, (snap) => setLikesCount(snap.size));
    const unsubDislikes = onSnapshot(dislikesCol, (snap) => setDislikesCount(snap.size));
    return () => { unsubVideo(); unsubComments(); unsubLikes(); unsubDislikes(); };
  }, [videoRef, commentsRef, title, id]);

  // Helpers
  const fromFirebaseApiUrlToPath = (u: string): string | null => {
    try {
      const urlObj = new URL(u);
      if (!urlObj.hostname.includes('firebasestorage.googleapis.com')) return null;
      const parts = urlObj.pathname.split('/');
      // Expect: /v0/b/<bucket>/o/<objectPath>
      const idx = parts.indexOf('o');
      if (idx > -1 && parts[idx + 1]) {
        const enc = parts[idx + 1];
        const decoded = decodeURIComponent(enc);
        return decoded || null;
      }
      return null;
    } catch { return null; }
  };

  async function resolvePlayUrlFor(videoId: string, urlParam?: string | null) {
    const normalize = async (raw: string) => {
      const isHttp = raw.startsWith('http://') || raw.startsWith('https://');
      const apiPath = isHttp ? fromFirebaseApiUrlToPath(raw) : null;
      const isGs = raw.startsWith('gs://');
      const treatAsStorage = isGs || !isHttp || !!apiPath;
      if (treatAsStorage) {
        const refPath = apiPath || raw;
        // If refPath looks like a folder (no dot extension and not ending with a known playlist file),
        // try best-effort guesses for the actual filename.
        const looksLikeFolder = !/\.[a-z0-9]+$/i.test(refPath);
        if (looksLikeFolder) {
          const url = await resolveFromFolder(refPath, videoId);
          if (url) return url;
          // If still not found, throw to be caught by caller
          throw new Error(`Aucun fichier média trouvé dans le dossier ${refPath}`);
        }
        return await getDownloadURL(storageRef(storage, refPath));
      }
      return raw;
    };

    if (urlParam) {
      return await normalize(urlParam);
    }

    const snap = await getDoc(doc(db, 'videos', String(videoId)));
    const data: any = snap.exists() ? snap.data() : {};
    const fromDoc: string | null = data?.video?.url || data?.url || data?.downloadURL || data?.videoUrl || null;
    if (fromDoc) return await normalize(fromDoc);

    const p: string | null = data?.video?.path || data?.storagePath || data?.fullPath
      || (data?.storageFolder ? `${data.storageFolder}/${data.fileName || data.filename || data.name || 'video.mp4'}` : null);
    if (p) {
      // If p is a folder or guessed filename might be wrong, attempt best-effort resolution
      const looksLikeFolder = !/\.[a-z0-9]+$/i.test(p);
      if (looksLikeFolder) {
        const url = await resolveFromFolder(p, videoId, data);
        if (url) return url;
      }
      try {
        return await getDownloadURL(storageRef(storage, p));
      } catch (e) {
        // Try guesses if the direct path fails
        const url = await resolveFromFolder(p, videoId, data);
        if (url) return url;
        throw e;
      }
    }
    return null;
  }

  const resolveFromFolder = async (folderOrPath: string, idForGuess: string, data: any = {}) => { // NOSONAR: complexity acceptable for robust path resolution
    // If a file was provided (ends with extension), fallback to its parent directory
    const raw = folderOrPath.replace(/\/$/, '');
    const hasExt = /\.[a-z0-9]+$/i.test(raw);
    const folder = hasExt && raw.includes('/') ? raw.slice(0, raw.lastIndexOf('/')) : raw;
    const providedName: string | undefined = data.fileName || data.filename || data.name;
    const names = buildCandidateNames(folder, idForGuess, providedName);
    for (const name of names) {
      const full = `${folder}/${name}`;
      console.log('[video] trying candidate', full);
      try {
        const r = storageRef(storage, full);
        // Essayez directement getDownloadURL: les règles peuvent interdire getMetadata alors que l'accès de téléchargement est autorisé.
        const url = await getDownloadURL(r);
        if (url) return url;
      } catch (e) {
        // Continue avec le candidat suivant
        console.warn('[video] candidate failed', full, e);
      }
    }
    // Fallback: lister les fichiers du dossier et choisir un média plausible
    try {
      const folderRef = storageRef(storage, folder);
      const listed = await listAll(folderRef);
      // If a file matches the folder name (ignoring case/space/underscore and extension), prefer it
      const norm = (s: string) => s
        .toLowerCase()
        .replaceAll(/\.[^/.]+$/g, '')
        .replaceAll(/[\s_-]+/g, '');
      const parts = folder.split('/').filter(Boolean);
      const base = norm(parts.at(-1) || '');
      const exact = (listed.items || []).find((i) => norm(i.name) === base);
      if (exact) return await getDownloadURL(exact);
      // Priorité: .m3u8 puis .mp4
      const items = listed.items || [];
      const pick = (ext: string) => items.find((i) => i.name.toLowerCase().endsWith(ext));
      const m3u8 = pick('.m3u8');
      if (m3u8) return await getDownloadURL(m3u8);
      const mp4 = pick('.mp4');
      if (mp4) return await getDownloadURL(mp4);
      // Essayer un niveau de sous-dossiers (ex: videos/<id>/hls/index.m3u8)
      for (const p of listed.prefixes || []) {
        try {
          const sub = await listAll(p);
          const sItems = sub.items || [];
          const sPick = (ext: string) => sItems.find((i) => i.name.toLowerCase().endsWith(ext));
          const sM3u8 = sPick('.m3u8');
          if (sM3u8) return await getDownloadURL(sM3u8);
          const sMp4 = sPick('.mp4');
          if (sMp4) return await getDownloadURL(sMp4);
        } catch {}
      }
    } catch (e) {
      console.warn('[video] listAll fallback failed for', folder, e);
    }
    return null;
  };

  const buildCandidateNames = (folder: string, idForGuess: string, providedName?: string) => {
    const c: string[] = [];
    if (providedName) c.push(providedName);
    const parts = folder.split('/').filter(Boolean);
    const baseName = (parts.slice().reverse()[0]) ?? '';
    const extras = [
      `${idForGuess}.mp4`, `${idForGuess}.m3u8`, `${idForGuess}.mov`, `${idForGuess}.m4v`, `${idForGuess}.webm`,
      baseName ? `${baseName}.mp4` : '', baseName ? `${baseName}.m3u8` : '',
      'index.m3u8', 'master.m3u8', 'video.mp4',
    ];
    for (const n of extras) if (n && !c.includes(n)) c.push(n);
    return c;
  };

  // Résoudre l'URL de lecture: param → doc.video.url/url → Storage path
  useEffect(() => { // NOSONAR: complex but necessary orchestration of player/autoplay/volume
    (async () => {
      setPlayerError(null);
      try {
        const fromParam = typeof url === 'string' && url ? decodeURIComponent(url) : null;
        const resolved = await resolvePlayUrlFor(String(id), fromParam);
        if (resolved) setPlayUrl(resolved);
        else setPlayerError("Impossible de déterminer l'URL de la vidéo.");
      } catch (e: any) {
        setPlayerError(e?.message || 'Erreur lors de la préparation de la vidéo.');
      }
    })();
  }, [id, url]);

  // Démarrer la lecture dès que l'URL est prête (iOS: démarrer muet puis réactiver le son)
  useEffect(() => {
    try {
      if (playUrl && player) {
        // iOS: démarrer en muet pour autoriser l'autoplay
        const startMuted = Platform.OS === 'ios' && autoplayPref;
        try {
          if (typeof (player as any).setIsMuted === 'function') {
            (player as any).setIsMuted(!!startMuted);
          } else {
            (player as any).muted = !!startMuted;
          }
        } catch {}
        if (autoplayPref) {
          (player as any).play?.();
        } else {
          (player as any).pause?.();
        }
        // Apply current volume
        try {
          if (typeof (player as any).setVolume === 'function') {
            (player as any).setVolume(volume);
          } else {
            (player as any).volume = volume;
          }
        } catch {}
      }
    } catch {}
  }, [playUrl, autoplayPref, volume]);

  // état favori pour l’utilisateur
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return setIsFav(false);
    const favRef = doc(db, 'users', u.uid, 'favorites', String(id)); // <-- safeId aussi ici
    getDoc(favRef).then((d) => setIsFav(d.exists()));
  }, [id]);

  const needAuth = () => {
    if (!auth.currentUser) {
      router.push('/auth/sign-in');
      return true;
    }
    return false;
  };

  const handleLike = async () => {
    if (needAuth()) return;
    const u = auth.currentUser!;
    const ref = doc(db, 'videos', String(id), 'likes', u.uid);
    const exists = (await getDoc(ref)).exists();
    if (exists) { await deleteDoc(ref); setLiked(false); }
    else { await setDoc(ref, { userId: u.uid, createdAt: serverTimestamp() }); setLiked(true); if (disliked) { const dref = doc(db,'videos',String(id),'dislikes',u.uid); await deleteDoc(dref); setDisliked(false);} }
  };
  const handleDislike = async () => {
    if (needAuth()) return;
    const u = auth.currentUser!;
    const ref = doc(db, 'videos', String(id), 'dislikes', u.uid);
    const exists = (await getDoc(ref)).exists();
    if (exists) { await deleteDoc(ref); setDisliked(false); }
    else { await setDoc(ref, { userId: u.uid, createdAt: serverTimestamp() }); setDisliked(true); if (liked) { const lref = doc(db,'videos',String(id),'likes',u.uid); await deleteDoc(lref); setLiked(false);} }
  };
  const toggleFavorite = async () => {
    if (needAuth()) return;
    const u = auth.currentUser!;
    const favRef = doc(db, 'users', u.uid, 'favorites', String(id)); // <-- safeId aussi ici
    const exists = (await getDoc(favRef)).exists();
    if (exists) {
      await deleteDoc(favRef);
      setIsFav(false);
    } else {
      await setDoc(favRef, { id: String(id), title: info.title || title, url: playUrl || url || '' }, { merge: true });
      setIsFav(true);
    }
  };
  const doShare = async () => {
    try {
      await Share.share({ message: `${info.title || title}\n${playUrl || url || ''}` });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  const submitComment = async () => {
    if (needAuth()) return;
    const text = newComment.trim(); if (!text) return;
    setNewComment('');
    await addDoc(commentsRef, { text, author: auth.currentUser?.displayName || 'Utilisateur', userId: auth.currentUser?.uid || '', createdAt: serverTimestamp() });
  };

  const playerHeight = 260;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            {icons.back ? <Image source={icons.back} style={[styles.headerIcon, { tintColor: TEXT }]} /> : <Text style={[styles.backTxt, { color: TEXT }]}>←</Text>}
          </Pressable>
          <Text numberOfLines={1} style={[styles.headerTitle, { color: TEXT }]}>{info.title || title}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.container]}>
          {playUrl ? (
            <VideoView
              key={playUrl}
              ref={playerRef}
              player={player}
              style={[styles.player, { height: playerHeight }]}
              contentFit="contain"
              surfaceType={Platform.OS === 'android' ? 'textureView' : undefined}
              onFirstFrameRender={() => {
                try {
                  if (autoplayPref) (player as any).play?.();
                  // Réactiver le son dès que possible
                  if (typeof (player as any).setIsMuted === 'function') {
                    (player as any).setIsMuted(false);
                  } else {
                    (player as any).muted = false;
                  }
                  // ensure volume is applied
                  try {
                    if (typeof (player as any).setVolume === 'function') {
                      (player as any).setVolume(volume);
                    } else {
                      (player as any).volume = volume;
                    }
                  } catch {}
                } catch {}
              }}
              allowsFullscreen
              allowsPictureInPicture
              nativeControls
            />
          ) : (
            <View style={[styles.player, { height: playerHeight, alignItems: 'center', justifyContent: 'center' }]}> 
              {playerError ? (
                <Text style={{ color: ACCENT }}>{playerError}</Text>
              ) : (
                <>
                  <ActivityIndicator color={ACCENT} />
                  <Text style={{ color: SUBTLE, marginTop: 8 }}>Préparation de la vidéo…</Text>
                </>
              )}
            </View>
          )}

          {/* Overlay pour démarrer manuellement si l'autoplay est désactivé */}
          {playUrl && !autoplayPref && (
            <Pressable
              onPress={() => { try { (player as any).play?.(); setManuallyStarted(true); } catch {} }}
              style={({ pressed }) => ([
                styles.overlayCenter,
                { opacity: pressed ? 0.8 : 1, height: playerHeight },
              ])}
            >
              {manuallyStarted ? null : <View style={[styles.playPill, { backgroundColor: ACCENT }]}><Text style={styles.playPillText}>Lire</Text></View>}
            </Pressable>
          )}

          {/* Simple mute/unmute icon (top-right) */}
          {playUrl && (
            <View style={[styles.muteOverlay, { height: playerHeight }]} pointerEvents="box-none">
              <Pressable
                onPress={() => {
                  const next = volume > 0 ? 0 : 1;
                  setVolume(next);
                  try {
                    if (typeof (player as any).setIsMuted === 'function') (player as any).setIsMuted(next === 0);
                    if (typeof (player as any).setVolume === 'function') (player as any).setVolume(next);
                    else (player as any).volume = next;
                  } catch {}
                }}
                style={({ pressed }) => ([styles.muteButton, { opacity: pressed ? 0.8 : 1 }])}
                hitSlop={10}
              >
                <Ionicons name={volume === 0 ? 'volume-mute' : 'volume-high'} size={18} color={TEXT} />
              </Pressable>
            </View>
          )}

          <View style={styles.row}>
            <Text style={[styles.title, { color: TEXT }]} numberOfLines={2}>{info.title || title || 'Vidéo'}</Text>
          </View>

          {/* Contrôles avancés retirés */}

          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} onPress={handleLike}>
              <Image source={icons.like} style={[styles.icon, { tintColor: TEXT }]} />
              <Text style={[styles.actionText, { color: TEXT }]}>{likesCount}</Text>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={handleDislike}>
              <Image source={icons.dislike} style={[styles.icon, { tintColor: TEXT }]} />
              <Text style={[styles.actionText, { color: TEXT }]}>{dislikesCount}</Text>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={toggleFavorite}>
              <Image source={icons.favorite} style={[styles.icon, { tintColor: isFav ? ACCENT : TEXT }]} />
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={doShare}>
              <Image source={icons.share} style={[styles.icon, { tintColor: TEXT }]} />
            </Pressable>

            {/* Bouton debug retiré */}
          </View>

          <Text style={[styles.sectionTitle, { color: TEXT }]}>Description</Text>
          <Text style={[styles.description, { color: SUBTLE }]}>{info.description || 'Aucune description.'}</Text>

          <Text style={[styles.sectionTitle, { color: TEXT }]}>Commentaires</Text>
          <View style={styles.commentInputRow}>
            <TextInput
              style={[styles.commentInput, { backgroundColor: CARD, color: TEXT }]}
              placeholder="Ajouter un commentaire..."
              placeholderTextColor={SUBTLE}
              value={newComment}
              onChangeText={setNewComment}
              returnKeyType="send"
              onSubmitEditing={submitComment}
            />
            <Pressable style={[styles.sendBtn, { backgroundColor: ACCENT }]} onPress={submitComment}>
              <Text style={styles.sendText}>Publier</Text>
            </Pressable>
          </View>

          {comments.map((c) => (
            <View key={c.id} style={[styles.commentItem, { backgroundColor: CARD }] }>
              <Text style={[styles.commentAuthor, { color: SUBTLE }]}>{c.author || 'Utilisateur'}</Text>
              <Text style={[styles.commentText, { color: TEXT }]}>{c.text}</Text>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 8, paddingTop: 6 },
  headerIcon: { width: 22, height: 22, resizeMode: 'contain' },
  backTxt: { fontSize: 22 },
  headerTitle: { fontSize: 16, fontWeight: '700', flex: 1 },

  container: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  player: { width: '100%', borderRadius: 12, backgroundColor: 'transparent' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { fontSize: 18, fontWeight: '800', flex: 1 },
  sizeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  sizeBtnText: { fontWeight: '700' },


  actions: { flexDirection: 'row', gap: 12, marginTop: 4, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  icon: { width: 18, height: 18, resizeMode: 'contain' },
  actionText: { fontWeight: '700' },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  description: {},

  commentInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 },
  commentInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  sendBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  sendText: { color: '#fff', fontWeight: '700' },
  commentItem: { borderRadius: 10, padding: 10, marginTop: 8 },
  commentAuthor: { fontWeight: '700', marginBottom: 2 },
  commentText: {},
  overlayCenter: { position: 'absolute', left: 16, right: 16, top: 0, alignItems: 'center', justifyContent: 'center' },
  playPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 9999 },
  playPillText: { color: '#fff', fontWeight: '800' },
  muteOverlay: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: 16, paddingTop: 10, alignItems: 'flex-end' },
  muteButton: { backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
});