import { Stack } from 'expo-router';
import React from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../hooks/use-color-scheme';

// Placeholder donation URLs – replace with your real endpoints
const PAYPAL_URL = 'https://www.paypal.com/donate/?hosted_button_id=VOTRE_ID';
const LYDIA_URL = 'https://lydia-app.com/collect/votre-lien';
const STRIPE_URL = 'https://votre-domaine.com/donate/stripe';

function DonationRow({ label, onPress, color, subtle }: Readonly<{ label: string; onPress: () => void; color: string; subtle: string }>) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: subtle,
      })}
    >
      <Text style={{ color, fontSize: 16, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export default function Don() {
  const scheme = useColorScheme() ?? 'dark';
  const BG = scheme === 'dark' ? '#0b0b0b' : '#ffffff';
  const CARD = scheme === 'dark' ? '#111827' : '#f3f4f6';
  const TEXT = scheme === 'dark' ? '#ffffff' : '#101010';
  const SUBTLE = scheme === 'dark' ? '#6b7280' : '#475569';
  const PRIMARY = '#e11d48';

  const open = async (url: string) => {
    try {
      const ok = await Linking.canOpenURL(url);
      if (!ok) {
        Alert.alert('Lien non supporté', 'Impossible d\'ouvrir ce lien sur cet appareil.');
        return;
      }
      await Linking.openURL(url);
    } catch (e) {
      console.error('open donation link failed', e);
      Alert.alert('Erreur', 'Ouverture du lien impossible.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <Stack.Screen options={{ title: 'Faire un don', headerShown: true }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ color: TEXT, fontSize: 22, fontWeight: '800', marginBottom: 12 }}>Soutenir IE TV</Text>
        <Text style={{ color: SUBTLE, lineHeight: 20, marginBottom: 18 }}>
          Votre soutien financier nous aide à maintenir l\'hébergement vidéo, développer de nouvelles fonctionnalités, et 
          soutenir les formations. Choisissez un moyen de paiement sécurisé ci-dessous.
        </Text>

        <View style={{ backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 16 }}>
          <DonationRow label="Don via PayPal" onPress={() => open(PAYPAL_URL)} color={TEXT} subtle={SUBTLE} />
          <DonationRow label="Don via Lydia" onPress={() => open(LYDIA_URL)} color={TEXT} subtle={SUBTLE} />
          <DonationRow label="Carte bancaire (Stripe)" onPress={() => open(STRIPE_URL)} color={TEXT} subtle={SUBTLE} />
          <DonationRow label="Autre moyen (virement, etc.)" onPress={() => Alert.alert('Informations', 'Ajoutez ici IBAN ou autres liens de paiement.')} color={TEXT} subtle={SUBTLE} />
        </View>

        <Text style={{ color: SUBTLE, fontSize: 12, marginTop: 16, lineHeight: 18 }}>
          Remarque: Les paiements sont traités par des prestataires tiers spécialisés (ex: PayPal, Lydia, Stripe). Nous ne stockons pas
          vos informations de carte sur nos serveurs.
        </Text>
        <Text style={{ color: SUBTLE, fontSize: 12, marginTop: 10, lineHeight: 18 }}>
          Pour un reçu fiscal (si applicable), contactez-nous après votre don avec la preuve de paiement.
        </Text>

        <View style={{ height: 20 }} />
        <Text style={{ color: PRIMARY, fontSize: 14, fontWeight: '700', textAlign: 'center' }}>Merci pour votre soutien ❤️</Text>
      </ScrollView>
    </SafeAreaView>
  );
}