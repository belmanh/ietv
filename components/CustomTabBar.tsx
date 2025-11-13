import { useThemeColors } from '@/hooks/useThemeColors';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';
import AdBanner from './AdBanner';

export default function CustomTabBar(props: BottomTabBarProps) {
  const { bg: BG, separator: SEPARATOR } = useThemeColors();
  return (
    <View style={{ backgroundColor: BG }}>
      {/* Ad space directly above the menu */}
      <AdBanner />
      {/* Default bottom tab bar below */}
      <BottomTabBar
        {...props}
        style={{
          backgroundColor: BG,
          borderTopColor: SEPARATOR,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 4,
          paddingBottom: 6,
        }}
      />
    </View>
  );
}
