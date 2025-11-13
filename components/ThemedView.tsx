import { useThemeColors } from '@/hooks/useThemeColors';
import React from 'react';
import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & { background?: 'bg' | 'card' };

export default function ThemedView({ background = 'bg', style, ...rest }: ThemedViewProps) {
  const { bg: BG, card: CARD } = useThemeColors();
  const backgroundColor = background === 'card' ? CARD : BG;
  return <View {...rest} style={[{ backgroundColor }, style]} />;
}
