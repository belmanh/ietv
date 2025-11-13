import { Slot } from 'expo-router';
import React from 'react';
import { ThemeProvider } from '@/context/ThemeProvider';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}
