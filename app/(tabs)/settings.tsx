import { useTheme } from '@/context/ThemeProvider';
import { useThemeColors } from '@/hooks/useThemeColors';
import { auth, db, storage } from '@/lib/firebase';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { onAuthStateChanged, sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
  const openUrlInBrowser = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (e) {
      console.error('WebBrowser.openBrowserAsync failed', e);
      try {
        const ok = await Linking.canOpenURL(url);
        if (ok) await Linking.openURL(url);
        else Alert.alert('Erreur', "Impossible d'ouvrir le lien.");
      } catch (error_) {
        console.error('openUrlInBrowser fallback failed', error_);
        Alert.alert('Erreur', "Impossible d'ouvrir le lien.");
      }
    }
  };

// PRIMARY will come from theme colors

function getThemeIcon(key: 'system' | 'dark' | 'light', color: string) {
  if (key === 'system') return <Feather name="smartphone" size={20} color={color} />;
  if (key === 'dark') return <Feather name="moon" size={20} color={color} />;
  return <Feather name="sun" size={20} color={color} />;
}

function SectionTitle({ children, color }: Readonly<{ children: React.ReactNode; color: string }>) {
  return (
    <Text style={{ color, fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 22 }}>
      {children}
    </Text>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onPress,
  textColor,
  subtleColor,
  separatorColor,
}: Readonly<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  textColor: string;
  subtleColor: string;
  separatorColor: string;
}>) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          gap: 12,
          borderBottomColor: separatorColor,
          borderBottomWidth: 1,
        }}
      >
        <View style={{ width: 28, alignItems: 'center' }}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>{title}</Text>
          {!!subtitle && <Text style={{ color: subtleColor, marginTop: 2 }}>{subtitle}</Text>}
        </View>
        <MaterialIcons name="chevron-right" size={22} color={subtleColor} />
      </View>
    </Pressable>
  );
}

function EditAvatarTop({ pickedPhoto, photoURL, separatorColor, subtleColor }: Readonly<{ pickedPhoto: string | null; photoURL: string | null; separatorColor: string; subtleColor: string }>) {
  if (pickedPhoto) {
    return <Image source={{ uri: pickedPhoto }} style={{ width: 72, height: 72, borderRadius: 36 }} />;
  }
  if (photoURL) {
    return <Image source={{ uri: photoURL }} style={{ width: 72, height: 72, borderRadius: 36 }} />;
  }
  return (
    <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: separatorColor, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name="camera" size={22} color={subtleColor} />
    </View>
  );
}

export default function Settings() {
  const router = useRouter();
  const { preference, setPreference, colorScheme } = useTheme();
  const { bg: BG, card: CARD, separator: SEPARATOR, text: TEXT, subtle: SUBTLE, accent: PRIMARY } = useThemeColors();

  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [autoplay, setAutoplay] = useState<boolean>(true);
  const [themeModal, setThemeModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingName, setEditingName] = useState('');
  // Email is read-only per requirement
  const [uploading, setUploading] = useState(false);
  const [pickedPhoto, setPickedPhoto] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid ?? null);
      setIsAnonymous(!!u?.isAnonymous);
      setUserName(u?.displayName || '');
      setUserEmail(u?.email || '');
      setPhotoURL(u?.photoURL || null);
    });
    return () => unsub();
  }, []);

  // Also reflect Firestore profile changes if present
  useEffect(() => {
    if (!uid) return;
    const refDoc = doc(db, 'users', uid);
    const unsub = onSnapshot(refDoc, (snap) => {
      const d = snap.data();
      if (!d) return;
      if (typeof d.name === 'string' && !userName) setUserName(d.name);
      if (typeof d.displayName === 'string' && !userName) setUserName(d.displayName);
      if (typeof d.email === 'string' && !userEmail) setUserEmail(d.email);
      if (typeof d.photoURL === 'string' && !photoURL) setPhotoURL(d.photoURL);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // Load saved toggles
  useEffect(() => {
    (async () => {
      try {
        const n = await AsyncStorage.getItem('settings.notifications');
        const a = await AsyncStorage.getItem('settings.autoplay');
        if (n !== null) setNotifications(n === '1');
        if (a !== null) setAutoplay(a === '1');
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('settings.notifications', notifications ? '1' : '0').catch(() => {});
  }, [notifications]);

  useEffect(() => {
    AsyncStorage.setItem('settings.autoplay', autoplay ? '1' : '0').catch(() => {});
  }, [autoplay]);

  const version = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const app = require('../../app.json');
      return app?.expo?.version ?? '1.0.0';
    } catch {
      return '1.0.0';
    }
  }, []);

  const avatarLetter = (userName || userEmail || 'U').trim().charAt(0).toUpperCase();
  const loggedIn = !!uid && !isAnonymous;

  const openEdit = () => {
    const loggedIn = !!uid && !isAnonymous;
    if (!loggedIn) {
      router.push('/auth/sign-in');
      return;
    }
    setEditingName(userName);
    setPickedPhoto(null);
    setEditModal(true);
  };

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
      if (!res.canceled) setPickedPhoto(res.assets[0].uri);
    } catch (e) {
      console.error('pickImage failed', e);
      Alert.alert('Erreur', "Impossible d'ouvrir la galerie.");
    }
  };

  // Helpers to keep complexity low
  const uploadPhotoIfNeeded = async (userUid: string, localUri: string | null, fallback: string | null) => {
    if (!localUri) return fallback;
    const path = `users/${userUid}/profile.jpg`;
    const r = ref(storage, path);
    const blob = await (await fetch(localUri)).blob();
    await uploadBytes(r, blob, { contentType: 'image/jpeg' });
    return await getDownloadURL(r);
  };

  const patchAuthProfile = async (displayName?: string, newPhoto?: string | null) => {
    const u = auth.currentUser;
    if (!u) return;
    const patch: { displayName?: string; photoURL?: string } = {};
    if (displayName && displayName !== (u.displayName || '')) patch.displayName = displayName;
    if (newPhoto && newPhoto !== (u.photoURL || '')) patch.photoURL = newPhoto;
    if (Object.keys(patch).length) await updateProfile(u, patch);
  };

  const saveProfile = async () => {
    const u = auth.currentUser;
    if (!u) {
      Alert.alert('Non connecté', 'Veuillez vous reconnecter.');
      return;
    }
    try {
      setUploading(true);
      const newPhotoURL = await uploadPhotoIfNeeded(u.uid, pickedPhoto, photoURL);
      await patchAuthProfile(editingName, newPhotoURL);

      // Mirror to Firestore users/{uid}
      try {
        await setDoc(doc(db, 'users', u.uid), {
          name: editingName || null,
          displayName: editingName || null,
          email: u.email || null,
          photoURL: newPhotoURL || null,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch {}

      // Reflect in local state
      setUserName(editingName);
      setUserEmail(u.email || '');
      setPhotoURL(newPhotoURL);
      setEditModal(false);
      Alert.alert('Profil mis à jour', 'Vos informations ont été enregistrées.');
    } catch (e) {
      console.error('saveProfile failed', e);
      Alert.alert('Erreur', 'La mise à jour du profil a échoué.');
    } finally {
      setUploading(false);
    }
  };

  const openMail = async () => {
    try {
      const url = 'mailto:contact@belmanhdubien.com';
      const ok = await Linking.canOpenURL(url);
      if (!ok) {
        Alert.alert("Non pris en charge", "Aucune application de messagerie n'est disponible sur cet appareil.");
        return;
      }
      await Linking.openURL(url);
    } catch (e) {
      console.error('openMail failed', e);
      Alert.alert('Erreur', "Impossible d'ouvrir l'e-mail.");
    }
  };
  const openSite = async () => openUrlInBrowser('https://belmanhdubien.com');
  const openDonation = () => router.push('/don');
  const openPrivacy = () => router.push('/legal/privacy' as any);
  // Cookies route intégrée à la page Confidentialité pour simplifier le menu
  const openTerms = () => router.push('/legal/terms' as any);
  const openFeedback = () => openMail();

  // (EditAvatar moved to top-level)

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign out failed', e);
      Alert.alert('Erreur', "La déconnexion a échoué. Veuillez réessayer.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <Text style={{ color: TEXT, fontSize: 22, fontWeight: '800', marginBottom: 18 }}>Profil</Text>

        {/* Profile card */}
        <View
          style={{
            backgroundColor: CARD,
            borderRadius: 12,
            padding: 14,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {(() => {
              if (photoURL) return <Image source={{ uri: photoURL }} style={{ width: 56, height: 56, borderRadius: 28 }} />;
              if (loggedIn) {
                return (
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: SEPARATOR,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: TEXT, fontSize: 20, fontWeight: '700' }}>{avatarLetter}</Text>
                  </View>
                );
              }
              return (
                <View
                  style={{
                    width: 56,
                    height: 56,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image source={require('@/assets/images/user.png')} style={{ width: 30, height: 30, tintColor: PRIMARY }} resizeMode="contain" />
                </View>
              );
            })()}
            <View style={{ flex: 1 }}>
              <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700' }}>{userName || 'Invité'}</Text>
            </View>
            {(() => { const loggedIn = !!uid && !isAnonymous; return loggedIn; })() ? (
              <Pressable
                onPress={openEdit}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                  backgroundColor: PRIMARY,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                })}
              >
                <Text style={{ color: BG, fontWeight: '700' }}>Mettre à jour</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push('/auth/sign-in')}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                  backgroundColor: PRIMARY,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                })}
              >
                <Text style={{ color: BG, fontWeight: '700' }}>Se connecter</Text>
              </Pressable>
            )}
          </View>
          {/* Statut sous l'entête du profil */}
          <Text style={{ color: SUBTLE, textAlign: 'center', marginTop: 2 }}>{userEmail || 'Non connecté'}</Text>
        </View>

        {/* Compte section removed as requested; Mettre à jour handles edits and password reset */}

        {/* Theme & Language */}
        <View style={{ marginTop: 18 }}>
          <SectionTitle color={SUBTLE}>Thème & Langue</SectionTitle>
          <View style={{ backgroundColor: BG, borderRadius: 12 }}>
            <Row
              icon={<Ionicons name="language" size={22} color={PRIMARY} />}
              title="Langue"
              subtitle="Français"
              onPress={() => Alert.alert('Langue', 'Changement de langue bientôt disponible')}
              textColor={TEXT}
              subtleColor={SUBTLE}
              separatorColor={SEPARATOR}
            />
            <Row
              icon={<Feather name="moon" size={22} color={PRIMARY} />}
              title="Thème"
              subtitle={(() => { const map: any = { system: 'Système', dark: 'Sombre', light: 'Clair' }; return map[preference] as string; })()}
              onPress={() => setThemeModal(true)}
              textColor={TEXT}
              subtleColor={SUBTLE}
              separatorColor={SEPARATOR}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12, borderBottomColor: SEPARATOR, borderBottomWidth: 1 }}>
              <View style={{ width: 28, alignItems: 'center' }}>
                <Feather name="bell" size={22} color={PRIMARY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: '600' }}>Notifications</Text>
              </View>
              <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: PRIMARY, false: SEPARATOR }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 }}>
              <View style={{ width: 28, alignItems: 'center' }}>
                <Feather name="play-circle" size={22} color={PRIMARY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: '600' }}>Lecture automatique</Text>
              </View>
              <Switch value={autoplay} onValueChange={setAutoplay} trackColor={{ true: PRIMARY, false: SEPARATOR }} />
            </View>
          </View>
        </View>

        {/* Donation */}
        <View style={{ marginTop: 18 }}>
          <SectionTitle color={SUBTLE}>Faire un don</SectionTitle>
          <View style={{ backgroundColor: BG, borderRadius: 12 }}>
            <Row
              icon={<MaterialIcons name="favorite" size={22} color={PRIMARY} />}
              title="Soutenir notre association"
              onPress={openDonation}
              textColor={TEXT}
              subtleColor={SUBTLE}
              separatorColor={SEPARATOR}
            />
          </View>
        </View>

        {/* Legal */}
        <View style={{ marginTop: 18 }}>
          <SectionTitle color={SUBTLE}>Legal</SectionTitle>
          <View style={{ backgroundColor: BG, borderRadius: 12 }}>
            <Row
              icon={<MaterialIcons name="cookie" size={22} color={PRIMARY} />}
              title="Confidentialité et cookies"
              onPress={openPrivacy}
              textColor={TEXT}
              subtleColor={SUBTLE}
              separatorColor={SEPARATOR}
            />
            <Row icon={<Feather name="shield" size={22} color={PRIMARY} />} title="Conditions générales" onPress={openTerms} textColor={TEXT} subtleColor={SUBTLE} separatorColor={SEPARATOR} />
            <Row icon={<Feather name="message-square" size={22} color={PRIMARY} />} title="Envoi de remarques" onPress={openFeedback} textColor={TEXT} subtleColor={SUBTLE} separatorColor={SEPARATOR} />
          </View>
        </View>

        {/* Developer */}
        <View style={{ marginTop: 18 }}>
          <SectionTitle color={SUBTLE}>Développeur</SectionTitle>
          <View style={{ backgroundColor: BG, borderRadius: 12 }}>
            <Row icon={<Feather name="user" size={22} color={PRIMARY} />} title="Belmanh Dubien" onPress={openSite} textColor={TEXT} subtleColor={SUBTLE} separatorColor={SEPARATOR} />
            <Row icon={<Feather name="mail" size={22} color={PRIMARY} />} title="contact@belmanhdubien.com" onPress={openMail} textColor={TEXT} subtleColor={SUBTLE} separatorColor={SEPARATOR} />
            <Row icon={<Feather name="globe" size={22} color={PRIMARY} />} title="belmanhdubien.com" onPress={openSite} textColor={TEXT} subtleColor={SUBTLE} separatorColor={SEPARATOR} />
          </View>
        </View>

        {/* Version */}
        <Text style={{ color: SUBTLE, textAlign: 'center', marginTop: 22 }}>Version {version}</Text>

        {/* Auth CTA / Logout */}
        {(() => { const loggedIn = !!uid && !isAnonymous; return loggedIn; })() ? (
          <Pressable
            onPress={logout}
            style={({ pressed }) => ({
              marginTop: 14,
              backgroundColor: PRIMARY,
              borderRadius: 10,
              paddingVertical: 12,
              alignItems: 'center',
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#101010', fontWeight: '800' }}>Se déconnecter</Text>
          </Pressable>
        ) : (
          <View style={{ marginTop: 14, gap: 10 }}>
            <Pressable
              onPress={() => router.push('/auth/sign-in')}
              style={({ pressed }) => ({
                backgroundColor: PRIMARY,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#101010', fontWeight: '800' }}>Se connecter</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/auth/sign-up')}
              style={({ pressed }) => ({
                borderColor: PRIMARY,
                borderWidth: 2,
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#101010', fontWeight: '800' }}>Créer un compte</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Theme Picker Modal */}
      <Modal transparent visible={themeModal} animationType="fade" onRequestClose={() => setThemeModal(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setThemeModal(false)} />
        <View
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 24,
            backgroundColor: CARD,
            borderRadius: 12,
            padding: 12,
          }}
        >
          {[{key:'system',label:'Système'},{key:'dark',label:'Sombre'},{key:'light',label:'Clair'}].map((opt, idx) => (
            <Pressable
              key={opt.key}
              onPress={() => { setPreference(opt.key as any); setThemeModal(false); }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: idx < 2 ? 1 : 0,
                borderBottomColor: SEPARATOR,
              })}
            >
              <View style={{ width: 28, alignItems: 'center' }}>{getThemeIcon(opt.key as any, PRIMARY)}</View>
              <Text style={{ color: TEXT, fontSize: 16, fontWeight: '600', flex: 1 }}>{opt.label}</Text>
              {preference === (opt.key as any) && <MaterialIcons name="check" size={20} color={PRIMARY} />}
            </Pressable>
          ))}
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal transparent visible={editModal} animationType="slide" onRequestClose={() => setEditModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: CARD, padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <Text style={{ color: TEXT, fontSize: 18, fontWeight: '800', marginBottom: 12 }}>Modifier mon profil</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable onPress={pickImage} style={{ borderRadius: 36, overflow: 'hidden' }}>
                <EditAvatarTop pickedPhoto={pickedPhoto} photoURL={photoURL} separatorColor={SEPARATOR} subtleColor={SUBTLE} />
              </Pressable>
              <Text style={{ color: SUBTLE }}>Changer la photo</Text>
            </View>
            <TextInput
              value={editingName}
              onChangeText={setEditingName}
              placeholder="Nom"
              placeholderTextColor={SUBTLE}
              style={{ marginTop: 12, backgroundColor: BG, color: TEXT, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10 }}
            />
            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Text style={{ color: SUBTLE }}>Adresse e‑mail</Text>
                <Feather name="lock" size={14} color={SUBTLE} />
              </View>
              <View style={{ backgroundColor: SEPARATOR, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 }}>
                <Text style={{ color: SUBTLE }}>{userEmail || '—'}</Text>
              </View>
              <Text style={{ color: SUBTLE, marginTop: 4, fontSize: 12 }}>L'e‑mail est verrouillé et ne peut pas être modifié.</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <Pressable
                onPress={async () => {
                  try {
                    const email = auth.currentUser?.email || userEmail;
                    if (!email) { Alert.alert('Email manquant', "Aucune adresse e‑mail n'est associée à ce compte."); return; }
                    await sendPasswordResetEmail(auth, email);
                    Alert.alert('Email envoyé', 'Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.');
                  } catch (e: any) {
                    if (e?.code === 'auth/invalid-email') Alert.alert('Email invalide', "L'adresse e‑mail est invalide.");
                    else Alert.alert('Erreur', 'Impossible d’envoyer l’e‑mail de réinitialisation.');
                  }
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, paddingVertical: 10, paddingHorizontal: 0 })}
              >
                <Text style={{ color: PRIMARY, fontWeight: '700' }}>Réinitialiser le mot de passe</Text>
              </Pressable>
              <Pressable onPress={() => setEditModal(false)} style={{ paddingVertical: 10, paddingHorizontal: 14 }}>
                <Text style={{ color: SUBTLE, fontWeight: '700' }}>Annuler</Text>
              </Pressable>
              <Pressable
                disabled={uploading}
                onPress={saveProfile}
                style={({ pressed }) => ({
                  opacity: pressed || uploading ? 0.8 : 1,
                  backgroundColor: PRIMARY,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                })}
              >
                <Text style={{ color: BG, fontWeight: '800' }}>{uploading ? 'Enregistrement…' : 'Enregistrer'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}