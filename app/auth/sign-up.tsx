import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function SignUp() {
  const { bg: BG, text: TEXT, subtle: SUBTLE, card: CARD, accent: ACCENT, danger: DANGER } = useThemeColors();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [helper, setHelper] = useState<string | null>(null);
  const router = useRouter();

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!res.canceled) setPhoto(res.assets[0].uri);
  };

  const submit = async () => {
    try {
      setErr(null);
      setHelper(null);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      let photoURL: string | undefined;
      if (photo) {
        const path = `users/${encodeURIComponent(name)}/profile_${cred.user.uid}.jpg`;
        const r = ref(storage, path);
        const blob = await (await fetch(photo)).blob();
        await uploadBytes(r, blob, { contentType: 'image/jpeg' });
        photoURL = await getDownloadURL(r);
      }
      await updateProfile(cred.user, { displayName: name, photoURL });
      await setDoc(doc(db, 'users', cred.user.uid), {
        name,
        email: cred.user.email,
        role: 'user',
        photoURL: photoURL || null,
        createdAt: new Date().toISOString(),
      }, { merge: true });
      router.back();
    } catch (e: any) {
      const code = e?.code || '';
      if (code === 'auth/email-already-in-use') {
        setErr("Un compte existe déjà avec cet e‑mail.");
        setHelper("Connectez‑vous ou réinitialisez votre mot de passe.");
      } else if (code === 'auth/invalid-email') {
        setErr("Adresse e‑mail invalide.");
      } else if (code === 'auth/weak-password') {
        setErr("Mot de passe trop faible (6 caractères minimum).");
      } else {
        setErr(e.message || 'Inscription impossible.');
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG, padding: 16 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[styles.backTxt, { color: TEXT }]}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: TEXT }]}>Créer un compte</Text>
        <View style={{ width: 24 }} />
      </View>
      <Pressable onPress={pick} style={{ alignSelf: 'flex-start' }}>
        {photo ? <Image source={{ uri: photo }} style={{ width: 72, height: 72, borderRadius: 36 }} /> :
          <View style={[styles.avatar, { backgroundColor: CARD }]}><Text style={{ color: SUBTLE }}>Photo</Text></View>}
      </Pressable>
      <TextInput style={[styles.input, { backgroundColor: CARD, color: TEXT }]} placeholder="Nom" placeholderTextColor={SUBTLE} onChangeText={setName} />
      <TextInput style={[styles.input, { backgroundColor: CARD, color: TEXT }]} placeholder="Email" placeholderTextColor={SUBTLE} autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail} />
      <View style={styles.inputPwdWrap}>
        <TextInput
          style={[styles.input, { paddingRight: 40, backgroundColor: CARD, color: TEXT }]}
          placeholder="Mot de passe"
          placeholderTextColor={SUBTLE}
          secureTextEntry={!showPwd}
          onChangeText={setPassword}
        />
        <Pressable onPress={() => setShowPwd((v) => !v)} style={styles.eyeBtn} hitSlop={8}>
          <Ionicons name={showPwd ? 'eye' : 'eye-off'} size={18} color={SUBTLE} />
        </Pressable>
      </View>
      {err && <Text style={{ color: DANGER }}>{err}</Text>}
      {helper && (
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
          <Pressable onPress={() => router.push('/auth/sign-in')}>
            <Text style={{ color: SUBTLE }}>Se connecter</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/auth/sign-in?reset=1')}>
            <Text style={{ color: SUBTLE }}>Mot de passe oublié ?</Text>
          </Pressable>
        </View>
      )}
      <Pressable style={[styles.btn, { backgroundColor: ACCENT }]} onPress={submit}><Text style={styles.btnTxt}>S’inscrire</Text></Pressable>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  backTxt: { fontSize: 22 },
  headerTitle: { fontSize: 18, fontWeight: '800', flex: 1 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  input: { paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, marginTop: 10 },
  inputPwdWrap: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 12, top: 20 },
  btn: { marginTop: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '700' },
});