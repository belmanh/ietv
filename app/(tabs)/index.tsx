import UserAvatar from '@/components/UserAvatar';
import { useTheme } from '@/context/ThemeProvider';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useVideos } from '@/hooks/useVideos';
import type { VideoItem } from '@/lib/storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo } from 'react';
import type { ListRenderItem } from 'react-native';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { videos, loading, error } = useVideos();
  const router = useRouter();
  const { bg: BG, text: TEXT, subtle: SUBTLE, accent: ACCENT } = useThemeColors();
  const { colorScheme } = useTheme();

  // Debug instrumentation: log fetched videos to help diagnose empty UI
  useEffect(() => {
    // Log only a preview to avoid flooding console
    console.log('[home] videos length =', videos.length);
    if (videos.length) {
      console.log('[home] first video =', {
        id: videos[0]?.id,
        title: videos[0]?.title,
        url: videos[0]?.url,
        thumbUrl: videos[0]?.thumbUrl,
        timeCreated: videos[0]?.timeCreated,
      });
    }
  }, [videos]);

  // Auto-refresh à chaque retour sur l'onglet
  useFocusEffect(
    useCallback(() => {
      // Le hook useVideos gère déjà le chargement
    }, [])
  );

  const filtered = useMemo(() => videos, [videos]);
  
  // Choisir le héros: le plus liké, puis le plus récent en cas d'égalité
  const hero = useMemo(() => {
    if (!filtered.length) return null;
    return [...filtered].sort((a, b) => {
      const la = a.likes ?? 0, lb = b.likes ?? 0;
      if (lb !== la) return lb - la; // desc likes
      const ta = new Date(a.timeCreated || 0).getTime();
      const tb = new Date(b.timeCreated || 0).getTime();
      return tb - ta; // desc date
    })[0];
  }, [filtered]);

  // Préserver la taille des cartes et regrouper par lignes de 5 (scroll horizontal par ligne)
  const GAP = 12; // espacement horizontal entre cartes pour cette vue
  const firstFive = useMemo(() => filtered.slice(0, 5), [filtered]);
  const rest = useMemo(() => filtered.slice(5), [filtered]);
  const firstFiveInverted = useMemo(() => [...firstFive].reverse(), [firstFive]);
  const restInverted = useMemo(() => [...rest].reverse(), [rest]);
  const restRows = useMemo(() => {
    const rows: VideoItem[][] = [];
    for (let i = 0; i < restInverted.length; i += 5) rows.push(restInverted.slice(i, i + 5));
    return rows;
  }, [restInverted]);

  // OK pour TypeScript: ListRenderItem<VideoItem>
  const renderCard: ListRenderItem<VideoItem> = useCallback(
    ({ item }) => (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({ 
            pathname: '/video/[id]' as const, 
            params: { id: item.id, title: item.title, url: item.url } 
          })
        }
      >
        <Image
          source={{ uri: item.thumbUrl || item.url }}
          style={styles.cardVideo}
          resizeMode="cover"
        />
        <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
      </Pressable>
    ),
    [router]
  );

  const HSeparator = useCallback(() => <View style={{ width: GAP }} />, []);

  const chips = [
    { label: 'Séries', color: '#22C55E' },
    { label: 'Films', color: '#f59e0b' },
    { label: 'Infos', color: '#6366f1' },
    { label: 'Documentaires', color: ACCENT },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 24 }] }>
        <View style={styles.brandRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.brandIE, { color: ACCENT }]}>IE</Text>
            <Text style={[styles.brandTV, { color: colorScheme === 'dark' ? '#fbbf24' : '#d97706' }]}> TV</Text>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/settings' as any)}>
            <UserAvatar />
          </Pressable>
        </View>

        {hero && (
          <Pressable 
            onPress={() => router.push({ 
              pathname: '/video/[id]' as const, 
              params: { id: hero.id, title: hero.title, url: hero.url } 
            })} 
            style={{ marginTop: 8, marginBottom: 10 }}
          >
            <View style={{ borderRadius: 14, overflow: 'hidden' }}>
              <Image 
                source={{ uri: hero.thumbUrl || hero.url }} 
                style={{ width: '100%', height: 200 }} 
                resizeMode="cover" 
              />
              <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: 'rgba(0,0,0,0.35)' }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }} numberOfLines={1}>
                  {hero.title}
                </Text>
              </View>
            </View>
          </Pressable>
        )}

        <View style={styles.chipsRow}>
          {chips.map((c) => (
            <Pressable key={c.label} style={[styles.chip, { backgroundColor: c.color }] }>
              <Text style={[styles.chipText]}>{c.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: TEXT }]}>Dernières vidéos</Text>
          {(() => {
            if (loading) return <ActivityIndicator style={{ marginTop: 12 }} color={ACCENT} />;
            if (error) return <Text style={{ color: ACCENT, marginTop: 8 }}>Erreur: {error.message}</Text>;
            if (firstFiveInverted.length === 0) return <Text style={{ color: SUBTLE, marginTop: 8 }}>Aucune vidéo trouvée.</Text>;
            return (
              <FlatList
                data={firstFiveInverted}
                keyExtractor={(it) => it.id}
                horizontal
                inverted
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 8 }}
                ItemSeparatorComponent={HSeparator}
                renderItem={renderCard}
              />
            );
          })()}
        </View>

        {restRows.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: TEXT }]}>Plus de vidéos</Text>
            {restRows.map((row) => (
              <FlatList
                key={row.map((it) => it.id).join('_')}
                data={row}
                keyExtractor={(it) => it.id}
                horizontal
                inverted
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 8 }}
                ItemSeparatorComponent={HSeparator}
                renderItem={renderCard}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  brandIE: { fontSize: 28, fontWeight: '800' },
  brandTV: { fontSize: 28, fontWeight: '800' },
  searchBox: { display: 'none' },
  searchInput: { display: 'none' },
  chipsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24 },
  chipText: { color: '#fff', fontWeight: '700' },
  section: { marginTop: 8, gap: 8 },
  sectionTitle: { fontWeight: '700', fontSize: 16 },
  // Cartes larges (conservent la taille d'origine) dans les listes horizontales
  card: { width: 220, marginRight: 12, backgroundColor: 'transparent' },
  cardVideo: { width: 220, height: 120, borderRadius: 12 },
  cardTitle: { marginTop: 6, fontWeight: '600' },
});
