import { useThemeColors } from '@/hooks/useThemeColors';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';

type Props = Readonly<{
  size?: number; // If omitted, a consistent default size is used app-wide
}>;

export default function UserAvatar({ size = 48 }: Props) {
  const { separator: SEPARATOR, text: TEXT, accent: ACCENT } = useThemeColors();
  const [photoURL, setPhotoURL] = useState<string | null>(auth.currentUser?.photoURL || null);
  const [displayName, setDisplayName] = useState<string>(auth.currentUser?.displayName || '');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(!!auth.currentUser?.isAnonymous);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setPhotoURL(u?.photoURL || null);
      setDisplayName(u?.displayName || '');
      setIsAnonymous(!!u?.isAnonymous);
    });
    return () => unsub();
  }, []);

  if (photoURL) {
    return <Image source={{ uri: photoURL }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  // If logged in without photo, show initial in a soft circle
  if (auth.currentUser && !isAnonymous) {
    const letter = (displayName || auth.currentUser.email || 'U').trim().charAt(0).toUpperCase();
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: SEPARATOR,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: TEXT, fontWeight: '800' }}>{letter}</Text>
      </View>
    );
  }
  // Not logged in: reuse the same user icon asset as settings screen (ensures consistency)
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={require('@/assets/images/user.png')} style={{ width: size * 0.6, height: size * 0.6, tintColor: ACCENT }} resizeMode="contain" />
    </View>
  );
}
