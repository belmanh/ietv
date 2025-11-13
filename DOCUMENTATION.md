# Page d'accueil myIETV - Documentation

## Vue d'ensemble

La page d'accueil de l'application myIETV a été créée avec les fonctionnalités suivantes :

### ✅ Fonctionnalités implémentées

1. **Affichage des vidéos en grille**
   - 5 vidéos par ligne (navigation horizontale)
   - Défilement de gauche à droite pour chaque ligne
   - Miniatures des vidéos avec durée affichée
   - Titre des vidéos (limité à 2 lignes)

2. **Section Hero**
   - Image de mise en avant de la première vidéo
   - Titre "Un monde nouveau"
   - Boutons de catégories : Séries, Films, Infos, Docume

3. **Barre de navigation inférieure**
   - 5 onglets : Accueil, Recherche, Formation, Favoris, Paramètres
   - Icônes avec labels
   - Indicateur visuel de l'onglet actif (couleur rouge #e50914)

4. **Connexion Firebase**
   - Hook personnalisé `useVideos` pour récupérer les vidéos depuis Firestore
   - Gestion des états de chargement et d'erreur
   - Types TypeScript pour la sécurité du code

## Structure des fichiers créés

```
myIETV/
├── app/
│   └── index.tsx                    # Page d'accueil principale
├── components/
│   ├── VideoCard.tsx                # Composant carte vidéo
│   └── BottomNavigation.tsx         # Navigation inférieure
├── config/
│   └── firebaseConfig.ts            # Configuration Firebase
├── hooks/
│   └── useVideos.ts                 # Hook pour récupérer les vidéos
├── types/
│   └── index.ts                     # Définitions TypeScript
├── data/
│   └── sampleVideos.ts              # Données de test
└── FIREBASE_SETUP.md                # Guide de configuration
```

## Design

### Couleurs
- Fond principal : Noir (`#000`)
- Texte principal : Blanc (`#fff`)
- Accent (actif) : Rouge Netflix (`#e50914`)
- Texte secondaire : Gris (`#8c8c8c`)
- Fond overlay : `rgba(0, 0, 0, 0.8)`

### Dimensions
- Largeur des cartes : 1/5 de la largeur d'écran
- Ratio miniatures : 16:9
- Height section hero : 400px

## Configuration requise

### 1. Configurer Firebase
Ouvrez `config/firebaseConfig.ts` et remplacez les valeurs par vos credentials Firebase :

```typescript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

### 2. Créer la base de données Firestore
1. Allez dans Firebase Console > Firestore Database
2. Créez une collection `videos`
3. Importez les règles de sécurité depuis `_cloud firestore.txt`

### 3. Ajouter des données de test
Utilisez le fichier `data/sampleVideos.ts` pour ajouter des vidéos de test :

```typescript
import { db } from './config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import sampleVideos from './data/sampleVideos';

async function addSampleVideos() {
  for (const video of sampleVideos) {
    await addDoc(collection(db, 'videos'), video);
  }
}
```

## Lancement de l'application

```bash
# Installer les dépendances (si pas déjà fait)
npm install

# Démarrer le serveur de développement
npm start

# Alternatives
npm run android  # Pour Android
npm run ios      # Pour iOS
npm run web      # Pour Web
```

## Prochaines étapes suggérées

### Pages à créer
1. **Page de détail vidéo**
   - Lecteur vidéo
   - Description complète
   - Système de likes/dislikes
   - Section commentaires
   - Vidéos recommandées

2. **Page Recherche**
   - Barre de recherche
   - Filtres par catégorie
   - Historique de recherche

3. **Page Formation**
   - Liste des formations disponibles
   - Progression des formations
   - Certificats

4. **Page Favoris**
   - Liste des vidéos favorites
   - Possibilité de retirer des favoris
   - Tri et filtres

5. **Page Paramètres**
   - Profil utilisateur
   - Préférences de lecture
   - Gestion du compte
   - Déconnexion

### Fonctionnalités additionnelles
- [ ] Authentification (email/password, Google, etc.)
- [ ] Système de likes/dislikes/favoris
- [ ] Commentaires sur les vidéos
- [ ] Partage de vidéos
- [ ] Notifications
- [ ] Mode hors ligne
- [ ] Historique de visionnage
- [ ] Recommandations personnalisées
- [ ] Interface admin (gestion des vidéos)

## Notes techniques

### Optimisations possibles
- Implémenter la pagination pour les vidéos (ne charger que 20-30 vidéos à la fois)
- Ajouter un cache pour les miniatures
- Utiliser React.memo pour les composants VideoCard
- Implémenter un système de lazy loading pour les images

### Accessibilité
- Ajouter des labels d'accessibilité
- Supporter la navigation au clavier (pour web)
- Ajouter des descriptions alternatives pour les images

### Performance
- Utiliser FlatList au lieu de ScrollView pour de grandes listes
- Implémenter le virtual scrolling
- Optimiser les images (WebP, compression)
