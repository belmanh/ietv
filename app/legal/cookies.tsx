import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_NAME, COMPANY_NAME, WEBSITE_URL } from '../../constants/legal';
import { useColorScheme } from '../../hooks/use-color-scheme';

const P = (props: any) => <Text style={{ color: '#d1d5db', marginBottom: 12, lineHeight: 20 }} {...props} />;
const H2 = ({ children }: any) => (
  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18, marginTop: 16, marginBottom: 8 }}>{children}</Text>
);

export default function Cookies() {
  const scheme = useColorScheme() ?? 'dark';
  const BG = scheme === 'dark' ? '#0b0b0b' : '#ffffff';
  const TEXT = scheme === 'dark' ? '#ffffff' : '#101010';
  const SUBTLE = scheme === 'dark' ? '#d1d5db' : '#374151';
  const today = new Date().toISOString().slice(0, 10);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <Stack.Screen options={{ title: 'Politique Cookies' }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={{ color: TEXT, fontWeight: '900', fontSize: 22, marginBottom: 12 }}>Politique Cookies</Text>
        <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Dernière mise à jour: {today}</Text>
        <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Cette politique explique comment {COMPANY_NAME} utilise des cookies et technologies similaires sur {APP_NAME} et sur notre site {WEBSITE_URL} (si applicable).</Text>

  <H2>1. Qu'est-ce qu'un cookie ?</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, mobile) par les sites ou applications que vous visitez. Des technologies similaires (stockage local, SDK) peuvent avoir des fonctions équivalentes.</Text>

  <H2>2. Utilisation dans l'application mobile</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Dans l'application {APP_NAME}, nous n'utilisons pas de cookies de navigateur. Nous pouvons employer un stockage local (ex: AsyncStorage) strictement nécessaire au fonctionnement: préférences (thème), gestion de session, cache.</Text>

  <H2>3. Utilisation sur l'espace web (administration)</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Sur l'interface web, des cookies techniques peuvent être utilisés pour: maintenir la session, sécuriser l'accès, mémoriser des options. Avec votre consentement, des cookies analytiques de mesure d'audience peuvent être déposés pour améliorer nos services.</Text>

        <H2>4. Types de cookies</H2>
        <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>
          • Strictement nécessaires (exigés pour le service).{"\n"}
          • Fonctionnels (préférences).{"\n"}
          • Mesure d'audience/analytique (statistiques agrégées).{"\n"}
          • Cookies de tiers intégrés (si des contenus externes sont embarqués).
        </Text>

  <H2>5. Gestion de vos préférences</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Sur le web, vous pouvez accepter/refuser les cookies non essentiels via un bandeau de consentement et les paramètres du navigateur. Sur mobile, vous pouvez réinitialiser les identifiants de publicité (si utilisés) et gérer les autorisations (ex: notifications) depuis les réglages du système.</Text>

  <H2>6. Durées de vie</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Les cookies ont une durée limitée (ex: 13 mois pour la mesure d'audience), puis expirent automatiquement.</Text>

        <H2>7. Contact</H2>
        <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Pour toute question, consultez la Politique de confidentialité et contactez-nous.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
