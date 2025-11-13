import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ADDRESS, APP_NAME, COMPANY_NAME, CONTACT_EMAIL, COUNTRY } from '../../constants/legal';
import { useColorScheme } from '../../hooks/use-color-scheme';

const P = (props: any) => <Text style={{ color: '#d1d5db', marginBottom: 12, lineHeight: 20 }} {...props} />;
const H2 = ({ children }: any) => (
  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18, marginTop: 16, marginBottom: 8 }}>{children}</Text>
);

export default function Terms() {
  const scheme = useColorScheme() ?? 'dark';
  const BG = scheme === 'dark' ? '#0b0b0b' : '#ffffff';
  const TEXT = scheme === 'dark' ? '#ffffff' : '#101010';
  const SUBTLE = scheme === 'dark' ? '#d1d5db' : '#374151';
  const today = new Date().toISOString().slice(0, 10);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <Stack.Screen options={{ title: 'Conditions' }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={{ color: TEXT, fontWeight: '900', fontSize: 22, marginBottom: 12 }}>Conditions générales d'utilisation</Text>
        <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Dernière mise à jour: {today}</Text>
        <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Les présentes conditions régissent l'utilisation de l'application {APP_NAME} fournie par {COMPANY_NAME} ({ADDRESS}, {COUNTRY}). En utilisant {APP_NAME}, vous acceptez ces conditions.</Text>

  <H2>1. Accès au service</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>L'application est fournie "en l'état". Nous nous efforçons d'assurer une disponibilité raisonnable, sans garantie d'absence d'interruptions.</Text>

  <H2>2. Compte utilisateur</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Vous devez fournir des informations exactes. Vous êtes responsable de la confidentialité de vos identifiants et des activités sur votre compte.</Text>

  <H2>3. Contenus et droits</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Les contenus (vidéos, images, textes) diffusés sur {APP_NAME} sont protégés par le droit d'auteur et les lois applicables. Toute reproduction, distribution ou utilisation en dehors de l'application nécessite une autorisation.</Text>

  <H2>4. Utilisation acceptable</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Il est interdit d'utiliser {APP_NAME} pour des activités illicites, d'entraver son bon fonctionnement, d'extraire massivement des données, ou de porter atteinte aux droits d'autrui.</Text>

  <H2>5. Achats intégrés / Abonnements</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Le cas échéant, des achats intégrés ou abonnements peuvent être proposés via l'App Store/Google Play. Les conditions de l'Apple App Store et du Google Play s'appliquent (facturation, rétractation selon la loi applicable, gestion des abonnements via votre compte magasin).</Text>

  <H2>6. Données personnelles</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Le traitement des données est décrit dans la Politique de confidentialité. En utilisant {APP_NAME}, vous acceptez ces pratiques.</Text>

  <H2>7. Sécurité</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Nous mettons en œuvre des mesures visant à protéger l'application et les données. Aucun système n'est exempt de vulnérabilités.</Text>

  <H2>8. Résiliation</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Nous pouvons suspendre ou résilier l'accès en cas de violation des conditions. Vous pouvez supprimer votre compte à tout moment.</Text>

  <H2>9. Responsabilité</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Dans les limites autorisées par la loi, {COMPANY_NAME} ne saurait être tenue responsable des dommages indirects, pertes de données ou pertes d'exploitation résultant de l'utilisation de {APP_NAME}.</Text>

  <H2>10. Liens externes</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>{APP_NAME} peut contenir des liens vers des services tiers qui ne sont pas contrôlés par {COMPANY_NAME}. Nous ne sommes pas responsables de leur contenu ou de leurs pratiques.</Text>

  <H2>11. Droit applicable et juridiction</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Ces conditions sont régies par le droit de {COUNTRY}. En cas de litige, et faute de résolution amiable, les tribunaux compétents de votre ressort territorial pourront être saisis.</Text>

  <H2>12. Contact</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Pour toute question: {CONTACT_EMAIL}.</Text>

        <H2>13. Modifications</H2>
        <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Nous pouvons mettre à jour ces conditions. La version en vigueur est celle publiée dans l'application.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
