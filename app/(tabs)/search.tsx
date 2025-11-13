import UserAvatar from '@/components/UserAvatar';
import { useTheme } from '@/context/ThemeProvider';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useVideos } from '@/hooks/useVideos';
import type { VideoItem } from '@/lib/storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useState } from 'react';
import type { ListRenderItem } from 'react-native';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const { bg: BG, text: TEXT, subtle: SUBTLE, card: CARD } = useThemeColors();
  const { colorScheme } = useTheme();
  const { videos } = useVideos();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return videos;
    return videos.filter((v) => v.title.toLowerCase().includes(q));
  }, [videos, query]);

  const mostViewed = useMemo(() => {
    return [...filtered]
      .sort((a, b) => (b.views ?? b.likes ?? 0) - (a.views ?? a.likes ?? 0))
      .slice(0, 10);
  }, [filtered]);

  const latest = useMemo(() => {
    return [...filtered]
      .sort((a, b) => new Date(b.timeCreated || 0).getTime() - new Date(a.timeCreated || 0).getTime())
      .slice(0, 10);
  }, [filtered]);

  const GAP = 12;
  const renderCard: ListRenderItem<VideoItem> = useCallback(({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: '/video/[id]' as const, params: { id: item.id, title: item.title, url: item.url } })}
    >
      <Image source={{ uri: item.thumbUrl || item.url }} style={styles.cardVideo} resizeMode="cover" />
      <Text numberOfLines={2} style={[styles.cardTitle, { color: TEXT }]}>{item.title}</Text>
    </Pressable>
  ), [router, TEXT]);

  const HSeparator = useCallback(() => <View style={{ width: GAP }} />, []);

  const chips = [
    { label: 'Séries', color: '#22C55E' },
    { label: 'Films', color: '#3b82f6' },
    { label: 'Documentaires', color: '#ec4899' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={[styles.title, { color: TEXT }]}>Recherche</Text>
          <Pressable onPress={() => router.push('/(tabs)/settings' as any)}>
            <UserAvatar />
          </Pressable>
        </View>

        {/* Search bar */}
        <View style={{ backgroundColor: CARD, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: SUBTLE, fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher..."
            placeholderTextColor={SUBTLE}
            style={{ flex: 1, color: TEXT, fontSize: 16 }}
            returnKeyType="search"
          />
        </View>

        {/* Chips */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
          {chips.map((c) => (
            <View key={c.label} style={{ backgroundColor: c.color, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999 }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{c.label}</Text>
            </View>
          ))}
        </View>

        {/* Most viewed */}
        <View style={{ marginTop: 18 }}>
          <Text style={{ color: TEXT, fontWeight: '800', fontSize: 18, marginBottom: 6 }}>Les plus vus</Text>
          <FlatList
            data={mostViewed}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingVertical: 8 }}
            ItemSeparatorComponent={HSeparator}
            renderItem={renderCard}
          />
        </View>

        {/* Latest */}
        <View style={{ marginTop: 14, marginBottom: 12 }}>
          <Text style={{ color: TEXT, fontWeight: '800', fontSize: 18, marginBottom: 6 }}>Dernières vidéos</Text>
          <FlatList
            data={latest}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingVertical: 8 }}
            ItemSeparatorComponent={HSeparator}
            renderItem={renderCard}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: 'bold' },
  card: { width: 180 },
  cardVideo: { width: 180, height: 100, borderRadius: 12, backgroundColor: '#111' },
  cardTitle: { marginTop: 6, fontWeight: '600', fontSize: 13 },
});
