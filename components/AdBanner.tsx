import { useThemeColors } from '@/hooks/useThemeColors';
import React from 'react';
import { Pressable, Text } from 'react-native';

// Placeholder publicité: remplacer plus tard par SDK (AdMob, etc.)
export default function AdBanner() {
  const { card: CARD, accent: ACCENT, text: TEXT, subtle: SUBTLE } = useThemeColors();
  return (
    <Pressable
      onPress={() => console.log('AdBanner clicked (placeholder)')}
      style={({ pressed }) => ([
        {
          height: 72,
          width: '100%',
          backgroundColor: CARD,
          justifyContent: 'center',
          alignItems: 'center',
          borderTopWidth: 1,
          borderTopColor: SUBTLE,
          opacity: pressed ? 0.85 : 1,
        },
      ])}
    >
      <Text style={{ color: TEXT, fontSize: 14 }}>
        <Text style={{ color: ACCENT, fontWeight: '800' }}>Espace Publicité</Text> – Votre annonce ici
      </Text>
    </Pressable>
  );
}
