import UserAvatar from '@/components/UserAvatar';
import { useTheme } from '@/context/ThemeProvider';
import { useThemeColors } from '@/hooks/useThemeColors';
import { auth, db } from '@/lib/firebase';
import { fetchVideoById, VideoItem } from '@/lib/storage';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FavoriteEntry = { id: string; createdAt?: any }; // minimal shape from subcollection

// Hook: listen to user's favorites subcollection and hydrate with video data
function useFavoriteVideos() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<VideoItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) { setLoading(false); setItems([]); return; }
    const favCol = collection(db, 'users', u.uid, 'favorites');
    const unsub = onSnapshot(favCol, async (snap) => {
      try {
        setLoading(true);
        const entries: FavoriteEntry[] = snap.docs.map((d) => ({ id: d.id, createdAt: d.data()?.createdAt }));
        const createdMap = new Map(entries.map(e => [e.id, e.createdAt?.toMillis?.() || 0]));
        // Hydrate in parallel
        const videosList = await Promise.all(entries.map(e => fetchVideoById(e.id)));
        const videos: VideoItem[] = videosList.filter((v): v is VideoItem => !!v);
        // Sort by original favorite creation timestamp if available, else by timeCreated desc
        videos.sort((a, b) => {
          const fa = createdMap.get(a.id) || 0;
          const fb = createdMap.get(b.id) || 0;
          if (fb !== fa) return fb - fa;
          return new Date(b.timeCreated || 0).getTime() - new Date(a.timeCreated || 0).getTime();
        });
        setItems(videos);
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'Erreur lors du chargement des favoris');
      } finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

  return { loading, items, error };
}

function formatDuration(totalSeconds?: number) {
  if (!totalSeconds || totalSeconds <= 0) return '';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return [h, String(m).padStart(2,'0'), String(s).padStart(2,'0')].join(':');
  return [String(m).padStart(2,'0'), String(s).padStart(2,'0')].join(':');
}

export default function FavoritesScreen() {
  const { bg: BG, text: TEXT, subtle: SUBTLE, separator: SEPARATOR, accent: ACCENT } = useThemeColors();
  const { colorScheme } = useTheme();
  const router = useRouter();
  const { items, loading, error } = useFavoriteVideos();
  const user = auth.currentUser;

  const removeFavorite = useCallback(async (videoId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'favorites', String(videoId)));
    } catch (e) {
      console.warn('Failed to delete favorite', videoId, e);
    }
  }, [user]);

  const renderItem = ({ item }: { item: VideoItem }) => (
    <Pressable style={styles.row} onPress={() => router.push(`/video/${item.id}` as any)}>
      <Image source={{ uri: item.thumbUrl || 'https://via.placeholder.com/80x80.png?text=Video' }} style={styles.thumb} />
      <View style={styles.rowCenter}>
        <Text numberOfLines={2} style={[styles.rowTitle, { color: TEXT }]}>{item.title}</Text>
        {!!item.duration && <Text style={[styles.rowMeta, { color: SUBTLE }]}>{formatDuration(item.duration)}</Text>}
      </View>
      <Pressable onPress={() => removeFavorite(item.id)} hitSlop={8} style={styles.deleteBtn}>
        <Feather name="trash-2" size={22} color={ACCENT} />
      </Pressable>
    </Pressable>
  );

  const keyExtractor = (v: VideoItem) => v.id;
  const Separator = useCallback(() => <View style={[styles.separator, { backgroundColor: SEPARATOR }]} />, [SEPARATOR]);

  const emptyState = useMemo(() => {
    if (loading) return <ActivityIndicator color={ACCENT} style={{ marginTop: 40 }} />;
    if (!user) return <Text style={{ color: SUBTLE, padding: 24, textAlign: 'center' }}>Connectez-vous pour voir vos favoris.</Text>;
    return <Text style={{ color: SUBTLE, padding: 24, textAlign: 'center' }}>Aucune vidéo favorite pour le moment.</Text>;
  }, [loading, user, SUBTLE, ACCENT]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BG }]} edges={['top']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: TEXT }]}>Favoris</Text>
          <Pressable onPress={() => router.push('/(tabs)/settings' as any)}>
            <UserAvatar />
          </Pressable>
        </View>
      </View>
      {error && <Text style={{ color: ACCENT, paddingHorizontal:16 }}>{error}</Text>}
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
  ItemSeparatorComponent={Separator}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListEmptyComponent={emptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 26, fontWeight: '700' },
  // Make separator (hr) slightly more visible
  separator: { height: 1, width: '100%', marginVertical: 10, opacity: 0.85, borderRadius: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  thumb: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#222' },
  rowCenter: { flex: 1, marginLeft: 12 },
  // Keep natural spacing below the title
  rowTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  rowMeta: { fontSize: 13 },
  // Center the trash icon vertically in the row
  deleteBtn: { paddingLeft: 12 },
});
