import { useTheme } from '@/context/ThemeProvider';

// Use the app ThemeProvider to resolve the active color scheme
export function useColorScheme(): 'light' | 'dark' | null {
	const { colorScheme } = useTheme();
	return colorScheme;
}
