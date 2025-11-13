import { useColorScheme } from '@/hooks/use-color-scheme';

export type AppColors = {
  bg: string;
  card: string;
  text: string;
  subtle: string;
  separator: string;
  accent: string;
  danger: string;
  onAccent: string;
};

// Centralize color tokens so every screen can consume dynamic theme easily.
export function useThemeColors(): AppColors {
  const scheme = useColorScheme() ?? 'dark';
  const dark = scheme === 'dark';
  return {
    bg: dark ? '#0b0b0b' : '#ffffff',
    card: dark ? '#111827' : '#f3f4f6',
    text: dark ? '#ffffff' : '#101010',
    subtle: dark ? '#9ca3af' : '#6b7280',
    separator: dark ? '#1f2937' : '#e5e7eb',
    accent: '#e11d48',
    danger: '#dc2626',
    onAccent: '#ffffff',
  };
}
