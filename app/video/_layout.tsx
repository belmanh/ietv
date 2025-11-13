import { Stack } from 'expo-router';

// Minimal layout for the video route segment. Expo Router auto-registers [id].
export default function VideoLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
