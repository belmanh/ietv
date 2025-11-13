import { useThemeColors } from '@/hooks/useThemeColors';
import React from 'react';
import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & { type?: 'default' | 'title' | 'link' | 'subtitle' };

export default function ThemedText({ type = 'default', style, ...rest }: ThemedTextProps) {
  const { text: TEXT, subtle: SUBTLE, accent: ACCENT } = useThemeColors();
  let color = TEXT;
  if (type === 'link') color = ACCENT;
  else if (type === 'subtitle') color = SUBTLE;
  const fontSize = type === 'title' ? 20 : 14;
  const fontWeight = type === 'title' ? '800' : '400';
  return <Text {...rest} style={[{ color, fontSize, fontWeight }, style]} />;
}
