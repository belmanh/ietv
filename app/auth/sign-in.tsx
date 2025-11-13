import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'expo-router';

export default function SignIn() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const submit = async () => {
    const addr = email.trim();
    if (!addr) { setErr('Veuillez saisir votre adresse e‑mail.'); return; }
    if (!password) { setErr('Veuillez saisir votre mot de passe.'); return; }
    try {
      setErr(null);
      await signInWithEmailAndPassword(auth, addr, password);
      router.back();
    } catch (e: any) {
      const code = e?.code || '';
      let msg = 'Connexion impossible.';
      switch (code) {
        case 'auth/invalid-email': msg = 'Adresse e‑mail invalide.'; break;
        case 'auth/user-disabled': msg = 'Ce compte est désactivé.'; break;
        case 'auth/user-not-found': msg = 'Aucun compte ne correspond à cet e‑mail.'; break;
        case 'auth/wrong-password': msg = 'Mot de passe incorrect.'; break;
        case 'auth/invalid-credential': msg = 'Identifiants invalides. Vérifiez e‑mail et mot de passe.'; break;
        default: if (e?.message) msg = e.message;
      }
      setErr(msg);
    }
  };

  const reset = async () => {
    try {
      setErr(null);
      const addr = email.trim();
      if (!addr) { setErr('Saisissez votre e‑mail pour recevoir un lien de réinitialisation.'); return; }
      await sendPasswordResetEmail(auth, addr);
      setErr("E‑mail de réinitialisation envoyé si le compte existe.");
    } catch (e: any) {
      const code = e?.code || '';
      if (code === 'auth/invalid-email') setErr('E‑mail invalide.');
      else setErr(e.message || 'Échec de la réinitialisation.');
    }
  };

  const colors = useThemeColors();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Image source={require('../../assets/images/back.png')} style={styles.backIcon} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Connexion</Text>
        <View style={{ width: 32 }} />
      </View>
      <TextInput style={[styles.input, { backgroundColor: colors.separator, color: colors.text }]} placeholder="Email" placeholderTextColor={colors.subtle} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <View style={styles.inputPwdWrap}>
        <TextInput
          style={[styles.input, { paddingRight: 40, backgroundColor: colors.separator, color: colors.text }]}
          placeholder="Mot de passe"
          placeholderTextColor={colors.subtle}
          secureTextEntry={!showPwd}
          onChangeText={setPassword}
        />
        <Pressable onPress={() => setShowPwd((v) => !v)} style={styles.eyeBtn} hitSlop={8}>
          <Ionicons name={showPwd ? 'eye' : 'eye-off'} size={18} color={colors.subtle} />
        </Pressable>
      </View>
      {err && (
        <View style={styles.errorWrap}>
          <FeebackIcon />
          <Text style={styles.errorText}>{err}</Text>
        </View>
      )}
      <Pressable style={[styles.btn, { backgroundColor: colors.accent }]} onPress={submit}><Text style={styles.btnTxt}>Se connecter</Text></Pressable>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        <Pressable onPress={() => router.push('/auth/sign-up')}><Text style={{ color: colors.subtle }}>Créer un compte</Text></Pressable>
        <Pressable onPress={reset}><Text style={{ color: colors.subtle }}>Mot de passe oublié ?</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}
function FeebackIcon() {
  return <Ionicons name="alert-circle" size={18} color="#f87171" style={{ marginRight: 6 }} />;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  backBtn: { padding: 4, borderRadius: 8 },
  backIcon: { width: 24, height: 24, tintColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '800', flex: 1 },
  input: { paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, marginTop: 10 },
  inputPwdWrap: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 12, top: 20 },
  btn: { marginTop: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '700' },
  errorWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3f1d20', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginTop: 12 },
  errorText: { color: '#fca5a5', flex: 1, fontSize: 14 },
});