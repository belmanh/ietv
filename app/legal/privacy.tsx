import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ADDRESS, APP_NAME, COMPANY_NAME, CONTACT_EMAIL, COUNTRY, DPO_EMAIL } from '../../constants/legal';
import { useColorScheme } from '../../hooks/use-color-scheme';

const P = (props: any) => <Text style={{ color: '#d1d5db', marginBottom: 12, lineHeight: 20 }} {...props} />;
const H2 = ({ children }: any) => (
  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18, marginTop: 16, marginBottom: 8 }}>{children}</Text>
);

export default function Privacy() {
  const scheme = useColorScheme() ?? 'dark';
  const BG = scheme === 'dark' ? '#0b0b0b' : '#ffffff';
  const TEXT = scheme === 'dark' ? '#ffffff' : '#101010';
  const SUBTLE = scheme === 'dark' ? '#d1d5db' : '#374151';
  const today = new Date().toISOString().slice(0, 10);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <Stack.Screen options={{ title: 'Confidentialité' }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={{ color: TEXT, fontWeight: '900', fontSize: 22, marginBottom: 12 }}>Politique de confidentialité</Text>
        <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Dernière mise à jour: {today}</Text>
        <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Cette Politique de confidentialité explique comment {COMPANY_NAME} ("nous") collecte, utilise et partage vos données lorsque vous utilisez l'application {APP_NAME}.</Text>

  <H2>1. Responsable du traitement</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>{COMPANY_NAME}, {ADDRESS}, {COUNTRY}. Contact: {CONTACT_EMAIL}{DPO_EMAIL ? ` / DPO: ${DPO_EMAIL}` : ''}</Text>

  <H2>2. Données que nous collectons</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>• Identifiants: email, uid Firebase Auth, nom/alias, photo de profil si vous la fournissez.</Text>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>• Données d'usage: consultations, favoris, recherches, interactions (likes), journaux techniques et informations de l'appareil (modèle, OS, langue), données de diagnostics et crash.</Text>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>• Contenus et fichiers envoyés: uniquement si vous uploadez des médias via l'espace administrateur.</Text>

  <H2>3. Finalités et bases légales</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>• Fournir le service (exécution du contrat): lecture des vidéos, gestion du compte, favoris, formations.</Text>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>• Améliorer {APP_NAME} (intérêt légitime): statistiques d'usage, diagnostics, prévention des abus.</Text>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>• Respect des obligations légales et demandes des autorités.</Text>

  <H2>4. Services tiers utilisés</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Nous utilisons principalement Firebase (Google) et Expo:
  - Firebase Authentication (authentification)
  - Cloud Firestore (base de données)
  - Cloud Storage (hébergement médias)
  - Cloud Functions (traitements serveurs)
  - Expo (framework mobile) et éventuellement services de builds / OTA.</Text>

  <H2>5. Transferts internationaux</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Les données peuvent être traitées en dehors de l'UE/EEE par nos sous-traitants (ex: Google/Firebase). Des mesures contractuelles (Clauses Contractuelles Types) et organisationnelles sont mises en place.</Text>

  <H2>6. Durées de conservation</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>• Compte utilisateur: tant que le compte est actif, puis suppression à la clôture (délai technique raisonnable).
  • Journaux et métriques: généralement 13 mois, sauf obligations légales différentes.
  • Contenus administrateur: tant que publiés ou requis contractuellement.</Text>

  <H2>7. Vos droits</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Vous disposez des droits d'accès, rectification, suppression, limitation, opposition, portabilité et directives post-mortem (le cas échéant). Pour exercer ces droits, contactez-nous: {CONTACT_EMAIL}.
  Vous pouvez aussi supprimer votre compte via les paramètres ou nous demander de le faire.</Text>

  <H2>8. Sécurité</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Nous appliquons des mesures techniques et organisationnelles adaptées (authentification, règles de sécurité Firestore/Storage, contrôle des accès administrateurs). Aucun système n'est invulnérable.</Text>

  <H2>9. Mineurs</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>{APP_NAME} n'est pas destiné aux moins de 13 ans. Pour les utilisateurs entre 13 et 16 ans dans l'UE, l'inscription peut nécessiter l'autorisation d'un titulaire de l'autorité parentale selon la législation locale.</Text>

  <H2>10. Cookies et technologies similaires</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Sur mobile natif, {APP_NAME} n'emploie pas de cookies de navigateur. Nous pouvons utiliser un stockage local (AsyncStorage) strictement nécessaire au fonctionnement (ex: préférences). Sur le web (espace admin), des cookies techniques et, le cas échéant, des cookies analytiques peuvent être utilisés conformément à la politique Cookies.</Text>

  <H2>11. Partage des données</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>• Prestataires (sous-traitants) strictement nécessaires à la fourniture du service.
  • Autorités compétentes, lorsque la loi l'exige.
  • Jamais vendues.</Text>

  <H2>12. Contact</H2>
  <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Pour toute question ou demande relative à la confidentialité: {CONTACT_EMAIL}.</Text>

        <H2>13. Modifications</H2>
        <Text style={{ color: SUBTLE, marginBottom: 12, lineHeight: 20 }}>Nous pouvons modifier cette politique. Les mises à jour seront affichées ici avec la date de révision.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
