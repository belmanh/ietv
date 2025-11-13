import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function LegalLayout() {
  const scheme = useColorScheme() ?? 'dark'; // fallback dark if null
  const BG = scheme === 'dark' ? '#0b0b0b' : '#ffffff';
  const TEXT = scheme === 'dark' ? '#ffffff' : '#101010';

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: BG },
        headerTintColor: TEXT,
        headerTitleStyle: { color: TEXT, fontWeight: '800' },
        headerBackTitle: 'Retour',
      }}
    />
  );
}
