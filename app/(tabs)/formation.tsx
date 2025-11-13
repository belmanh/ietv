import UserAvatar from '@/components/UserAvatar';
import { useTheme } from '@/context/ThemeProvider';
import { useThemeColors } from '@/hooks/useThemeColors';
import { auth, db, storage } from '@/lib/firebase';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { getDownloadURL, listAll, ref as storageRef } from 'firebase/storage';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FormationItem {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number; // en centimes
  trainer?: string;
  duration?: number; // en minutes ou secondes selon back
  hours?: number; // nombre d'heures direct si fourni
  level?: string;
}

// Helpers: enrich formations with data from Firebase Storage folders named after the formation title/id
const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
function toCandidatesFolderNames(name: string, id?: string) {
  const base = name?.trim() || '';
  const variants = [
    base,
    id || '',
    base.replace(/\s+/g, '_'),
    base.replace(/\s+/g, '-'),
    base.replace(/\s+/g, ''),
    encodeURIComponent(base),
  ].filter(Boolean);
  // de-dup
  return Array.from(new Set(variants));
}

async function fetchText(url: string): Promise<string | null> {
  try { const r = await fetch(url); if (!r.ok) return null; return await r.text(); } catch { return null; }
}
async function fetchJSON<T=any>(url: string): Promise<T | null> {
  try { const r = await fetch(url); if (!r.ok) return null; return await r.json(); } catch { return null; }
}

async function resolveAssetsFromFolder(folderPath: string): Promise<{ thumbUrl?: string; hours?: number; trainer?: string; }> {
  try {
    const folderRef = storageRef(storage, folderPath);
    const listed = await listAll(folderRef);
    // Thumbnail: prefer files named thumbnail/cover/thumb then any image
    const pickPreferredImage = () => {
      const files = listed.items || [];
      const lower = (s: string) => s.toLowerCase();
      const score = (n: string) => (lower(n).includes('thumbnail') || lower(n).includes('mini') ? 3 : lower(n).includes('cover') ? 2 : lower(n).includes('thumb') ? 1 : 0);
      const imgs = files.filter((f) => IMG_EXTS.some((e) => lower(f.name).endsWith(e)));
      imgs.sort((a,b) => score(a.name) - score(b.name)).reverse();
      return imgs[0];
    };
    const img = pickPreferredImage();
    const thumbUrl = img ? await getDownloadURL(img) : undefined;

    // Metadata: look for common meta files
    const metaNames = ['meta.json', 'info.json', 'data.json', 'formation.json'];
    let hours: number | undefined;
    let trainer: string | undefined;
    for (const name of metaNames) {
      const f = listed.items.find((i) => i.name.toLowerCase() === name);
      if (f) {
        const u = await getDownloadURL(f);
        const json = await fetchJSON<any>(u);
        if (json) {
          const h = json.hours ?? json.dureeHeures ?? json.durationHours ?? json.heures;
          if (typeof h === 'number') hours = h;
          const tr = json.trainer ?? json.formateur ?? json.instructor;
          if (typeof tr === 'string' && tr.trim()) trainer = tr.trim();
        }
        break;
      }
    }
    // Fallback: simple txt files
    const findTxt = (fileNames: string[]) => listed.items.find((i) => fileNames.includes(i.name.toLowerCase()));
    if (hours == null) {
      const hf = findTxt(['hours.txt','duree.txt','dureeheures.txt']);
      if (hf) { const u = await getDownloadURL(hf); const t = await fetchText(u); const v = t ? parseFloat(t) : NaN; if (Number.isFinite(v)) hours = v; }
    }
    if (!trainer) {
      const tf = findTxt(['trainer.txt','formateur.txt','instructor.txt']);
      if (tf) { const u = await getDownloadURL(tf); const t = await fetchText(u); if (t && t.trim()) trainer = t.trim(); }
    }

    return { thumbUrl, hours, trainer };
  } catch {
    return {};
  }
}

async function enrichFormationFromStorage(base: FormationItem): Promise<FormationItem> {
  const result = { ...base };
  const candidates = toCandidatesFolderNames(base.title || base.id, base.id).map((n) => `formations/${n}`);
  for (const folder of candidates) {
    const assets = await resolveAssetsFromFolder(folder);
    const found = assets.thumbUrl || assets.hours != null || assets.trainer;
    if (found) {
      if (!result.thumbnailUrl && assets.thumbUrl) result.thumbnailUrl = assets.thumbUrl;
      if (result.hours == null && assets.hours != null) result.hours = assets.hours;
      if (!result.trainer && assets.trainer) result.trainer = assets.trainer;
      break;
    }
  }
  return result;
}

// Hook pour récupérer les formations (lecture publique d'après règles)
function useFormations() {
  const [items, setItems] = useState<FormationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, 'formations'));
        if (!mounted) return;
  const list: FormationItem[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        // Tri récents d'abord (suppose createdAt timestamp)
        const getMillis = (obj: any) => obj?.createdAt?.toMillis?.() || 0;
  list.sort((a,b) => getMillis(a) - getMillis(b)).reverse();
  // Enrichir avec Firebase Storage si nécessaire (miniature, heures, formateur)
  const enriched = await Promise.all(list.map(enrichFormationFromStorage));
  setItems(enriched);
        setError(null);
      } catch(e:any) {
        setError(e.message || 'Erreur de chargement');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);
  return { items, loading, error };
}

// Hook pour suivre les formations rejointes par l'utilisateur
function useEnrollments() {
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) { setEnrolledIds(new Set()); return; }
    const ref = collection(db, 'users', u.uid, 'enrollments');
    const unsub = onSnapshot(ref, snap => {
      const ids = new Set<string>();
      for (const d of snap.docs) ids.add(d.id);
      setEnrolledIds(ids);
    });
    return () => unsub();
  }, [auth.currentUser]);
  return enrolledIds;
}

export default function FormationScreen() {
  const { bg: BG, text: TEXT, subtle: SUBTLE, accent: ACCENT, card: CARD, separator: SEP } = useThemeColors();
  const { colorScheme } = useTheme();
  const router = useRouter();
  const { items, loading, error } = useFormations();
  const enrolledIds = useEnrollments();
  const [user, setUser] = useState<any>(auth.currentUser);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  const [selected, setSelected] = useState<FormationItem | null>(null);
  const closeModal = useCallback(() => setSelected(null), []);

  const joinFormation = useCallback(async (formation: FormationItem) => {
    if (!user) {
      router.push('/auth/sign-in' as any);
      return;
    }
    try {
      const ref = doc(db, 'users', user.uid, 'enrollments', formation.id);
      await setDoc(ref, { formationId: formation.id, joinedAt: new Date() }, { merge: true });
    } catch (e) {
      console.warn('Join formation failed', e);
    }
  }, [user, router]);

  // Normalisation du prix et des heures depuis différents champs potentiels
  function resolvePrice(raw: FormationItem): number | undefined {
    const anyItem = raw as any;
    if (typeof raw.price === 'number') return raw.price;
    if (typeof anyItem.priceCents === 'number') return anyItem.priceCents; // alias possible
    if (typeof anyItem.prix === 'number') return anyItem.prix; // français
    return undefined;
  }
  const isFree = (price?: number) => price == null || price <= 0;
  function resolveHours(raw: FormationItem): number | undefined {
    const anyItem = raw as any;
    if (typeof raw.hours === 'number') return raw.hours;
    if (typeof anyItem.dureeHeures === 'number') return anyItem.dureeHeures;
    // si uniquement duration (minutes ou secondes), convertir en heures approx
    if (typeof raw.duration === 'number' && raw.duration > 0) {
      // supposons duration en minutes si < 10000, sinon en secondes
      const minutes = raw.duration < 10000 ? raw.duration : Math.round(raw.duration / 60);
      return +(minutes / 60).toFixed(1);
    }
    return undefined;
  }
  function resolveDuration(raw: FormationItem): number | undefined {
    const anyItem = raw as any;
    if (typeof raw.duration === 'number') return raw.duration;
    if (typeof anyItem.duree === 'number') return anyItem.duree;
    if (typeof anyItem.durationMinutes === 'number') return anyItem.durationMinutes;
    if (typeof anyItem.minutes === 'number') return anyItem.minutes;
    if (typeof anyItem.durationSeconds === 'number') return Math.round(anyItem.durationSeconds / 60);
    if (typeof anyItem.seconds === 'number') return Math.round(anyItem.seconds / 60);
    return undefined;
  }
  function resolveThumb(raw: FormationItem): string | undefined {
    const anyItem = raw as any;
    return raw.thumbnailUrl
      || anyItem.thumbnail
      || anyItem.miniatureUrl
      || anyItem.miniature
      || anyItem.image
      || anyItem.cover
      || anyItem.coverUrl
      || undefined;
  }

  const renderItem = useCallback(({ item }: { item: FormationItem }) => {
    const joined = enrolledIds.has(item.id);
    const thumbUri = resolveThumb(item) || 'https://via.placeholder.com/400x200.png?text=Formation';
    const priceVal = resolvePrice(item);
    const hoursVal = resolveHours(item);
    const durationVal = resolveDuration(item);
    return (
      <View style={[styles.card, { backgroundColor: CARD, borderColor: SEP }]}> 
        <Pressable style={styles.thumbWrap} onPress={() => setSelected(item)}>
          <Image source={{ uri: thumbUri }} style={styles.thumb} />
          <View style={[styles.overlayPill, styles.overlayTopLeft, { backgroundColor: ACCENT }]}> 
            <Text style={styles.overlayPillText}>{isFree(priceVal) ? 'Gratuite' : 'Payante'} • {formatPrice(priceVal)}</Text>
          </View>
          {joined && (
            <View style={[styles.overlayPill, styles.overlayTopRight, { backgroundColor: ACCENT }]}> 
              <Text style={styles.overlayPillText}>Inscrit</Text>
            </View>
          )}
          {typeof durationVal === 'number' && durationVal > 0 && (
            <View style={[styles.overlayPill, styles.overlayBottomRight, { backgroundColor: 'rgba(0,0,0,0.65)' }]}> 
              <Text style={[styles.overlayPillText, { color: '#fff' }]}>{formatDuration(durationVal)}</Text>
            </View>
          )}
        </Pressable>
        <View style={{ padding: 12 }}>
          <Text style={[styles.cardTitle, { color: TEXT }]} numberOfLines={2}>{item.title}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
            {item.trainer && <Text style={[styles.meta, { color: SUBTLE }]} numberOfLines={1}>Par {item.trainer}</Text>}
            {item.level && <Text style={[styles.meta, { color: SUBTLE }]} numberOfLines={1}>• {item.level}</Text>}
            {hoursVal != null && <Text style={[styles.meta, { color: SUBTLE }]} numberOfLines={1}>• ≈ {hoursVal} h</Text>}
          </View>
          {!joined && (
            <Pressable
              style={[styles.inlineJoinBtn, { backgroundColor: user ? ACCENT : '#777' }]} 
              onPress={() => joinFormation(item)}
              disabled={!user}
            >
              <Text style={styles.inlineJoinText}>{user ? 'Rejoindre' : 'Connexion requise'}</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }, [CARD, SEP, TEXT, SUBTLE, ACCENT, enrolledIds, user]);

  const keyExtractor = useCallback((f: FormationItem) => f.id, []);
  const ListSep = useCallback((color: string) => () => <View style={[styles.listSeparator, { backgroundColor: color }]} />, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BG }]} edges={['top']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <View style={styles.headerRow}>
          <Text style={[styles.screenTitle, { color: TEXT }]}>Formations</Text>
          <Pressable onPress={() => router.push('/(tabs)/settings' as any)}>
            <UserAvatar />
          </Pressable>
        </View>
      </View>
      {error && <Text style={{ color: ACCENT, paddingHorizontal:16 }}>{error}</Text>}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={ACCENT} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 }}
          ItemSeparatorComponent={ListSep(SEP)}
          ListEmptyComponent={<Text style={{ color: SUBTLE, textAlign: 'center', marginTop: 40 }}>Aucune formation disponible.</Text>}
        />
      )}

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={[styles.modalBackdrop]}> 
          <View style={[styles.modalContent, { backgroundColor: BG, borderColor: SEP }]}> 
            {selected && (
              <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                <Image source={{ uri: selected.thumbnailUrl || 'https://via.placeholder.com/600x300.png?text=Formation' }} style={styles.modalImage} />
                <Text style={[styles.modalTitle, { color: TEXT }]}>{selected.title}</Text>
                {selected.trainer && <Text style={[styles.modalMeta, { color: SUBTLE }]}>Formateur: {selected.trainer}</Text>}
                {selected.level && <Text style={[styles.modalMeta, { color: SUBTLE }]}>Niveau: {selected.level}</Text>}
                {(() => { const dr = resolveDuration(selected); return (typeof dr === 'number') ? <Text style={[styles.modalMeta, { color: SUBTLE }]}>Durée: {formatDuration(dr)}</Text> : null; })()}
                {(() => { const h = selected && (selected as any).hours; return (typeof h === 'number') ? <Text style={[styles.modalMeta, { color: SUBTLE }]}>Heures: {h}</Text> : null; })()}
                <Text style={[styles.modalPrice, { color: ACCENT }]}>
                  {(selected && isFree((selected as any).price)) ? 'Gratuite' : 'Payante'} • {formatPrice((selected as any).price)}
                </Text>
                {selected.description && <Text style={[styles.modalDesc, { color: TEXT }]}>{selected.description}</Text>}
                <View style={{ flexDirection: 'row', marginTop: 20, gap: 12 }}>
                  <Pressable style={[styles.outlineBtn, { borderColor: ACCENT }]} onPress={closeModal}>
                    <Text style={[styles.outlineBtnText, { color: ACCENT }]}>Fermer</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.primaryBtn, { backgroundColor: user ? ACCENT : '#999' }]}
                    onPress={() => selected && joinFormation(selected)}
                    disabled={!user}
                  >
                    <Text style={styles.primaryBtnText}>{user ? (enrolledIds.has(selected?.id || '') ? 'Déjà inscrit' : 'Rejoindre') : 'Connexion requise'}</Text>
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function formatPrice(price?: number) {
  if (price == null) return 'Gratuit';
  // Supposons centimes -> convertir en €
  if (price > 1000) return (price / 100).toFixed(2) + ' €';
  // Si prix parait petit, considérer déjà en €
  return price.toFixed(2) + ' €';
}

function formatDuration(d?: number) {
  if (!d || d <= 0) return '';
  // Par défaut considérer des minutes; si très grand, considérer des secondes -> minutes
  let minutes = d;
  if (d > 1000) minutes = Math.round(d / 60);
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h) return `${h} h ${String(m).padStart(2,'0')} min`;
  return `${m} min`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  screenTitle: { fontSize: 26, fontWeight: '700' },
  listSeparator: { height: 14 },
  card: { borderRadius: 14, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, elevation: 1 },
  thumbWrap: { position: 'relative' },
  thumb: { width: '100%', height: 180, backgroundColor: '#333' },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 4 },
  price: { fontSize: 14, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  overlayPill: { position: 'absolute', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  overlayTopLeft: { top: 8, left: 8 },
  overlayTopRight: { top: 8, right: 8 },
  overlayBottomRight: { bottom: 8, right: 8 },
  overlayPillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  inlineJoinBtn: { marginTop: 10, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  inlineJoinText: { color: '#fff', fontWeight: '700' },
  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: '90%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, borderWidth: StyleSheet.hairlineWidth },
  modalImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 14 },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  modalMeta: { fontSize: 13, marginTop: 2 },
  modalPrice: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  modalDesc: { fontSize: 14, lineHeight: 20, marginTop: 12 },
  outlineBtn: { flex: 1, borderWidth: 2, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  outlineBtnText: { fontWeight: '700' },
  primaryBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { fontWeight: '700', color: '#fff' },
});
