# Migration vers lib/firebase.ts et lib/storage.ts ✅

## Changements effectués

### 1. ✅ Hook `useVideos` mis à jour
**Fichier**: `hooks/useVideos.ts`

**Avant**:
```typescript
import { db } from '../config/firebaseConfig';
import { Video } from '../types';
// Requête Firestore manuelle
```

**Après**:
```typescript
import { fetchVideosFromStorage, VideoItem } from '../lib/storage';
// Utilise la fonction optimisée avec cache
```

**Avantages**:
- Cache de 60 secondes pour éviter les requêtes répétées
- Fallback automatique sur Storage si Firestore échoue
- Résolution intelligente des URLs (thumbnails, vidéos)
- Support HLS et formats multiples

### 2. ✅ Page d'accueil (`app/(tabs)/index.tsx`)

**Changements**:
- Import de `VideoItem` au lieu de `Video`
- Utilisation de `item.url` au lieu de `item.videoUrl`
- Utilisation de `item.thumbUrl` au lieu de `item.thumbnailUrl`
- Utilisation de `item.timeCreated` au lieu de `item.createdAt`
- Utilisation de `item.likes` au lieu de `item.likesCount`

### 3. ✅ AsyncStorage installé
Package `@react-native-async-storage/async-storage` ajouté pour la persistence Firebase Auth.

### 4. ✅ Documentation mise à jour
- `data/sampleVideos.ts` : Import mis à jour vers `@/lib/firebase`

## Configuration Firebase

Votre configuration Firebase est maintenant dans `lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAe-MntIwayT0lTwdMJykNW8HU8jkWPJkQ",
  authDomain: "ie-tv-9bd19.firebaseapp.com",
  projectId: "ie-tv-9bd19",
  storageBucket: "ie-tv-9bd19.firebasestorage.app",
  messagingSenderId: "884851692041",
  appId: "1:884851692041:web:95aace57fa78369db2ded8"
};
```

### Services disponibles:
- `auth` - Firebase Authentication (avec connexion anonyme automatique)
- `db` - Firestore Database
- `storage` - Firebase Storage

## Structure des données

### Type `VideoItem` (lib/storage.ts)
```typescript
{
  id: string;
  title: string;
  url: string;           // URL de la vidéo
  timeCreated?: string;  // Date ISO
  thumbUrl?: string;     // URL de la miniature
  likes?: number;
  views?: number;
}
```

### Ancien type `Video` (types/index.ts)
```typescript
{
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  createdAt: Date;
  likesCount?: number;
  // ... autres champs
}
```

## Fonctionnalités de `lib/storage.ts`

### `fetchVideosFromStorage()`
1. **Cache intelligent**: 60s de TTL pour éviter les requêtes répétées
2. **Source prioritaire**: Firestore
3. **Fallback**: Firebase Storage si Firestore est vide
4. **Résolution d'URL**:
   - Cherche dans multiples champs (url, videoUrl, storagePath, etc.)
   - Supporte HLS (m3u8), MP4, MOV, WebM, etc.
   - Résout automatiquement les chemins Storage
5. **Miniatures automatiques**:
   - Cherche les thumbnails associés
   - Supporte jpg, jpeg, png, webp
   - Multiples emplacements de recherche

### `clearVideosCache()`
Fonction pour invalider le cache manuellement si nécessaire.

## Structure Firestore attendue

### Collection `videos`
Champs possibles (flexibles):
```javascript
{
  // Titre
  title: "Ma vidéo",
  
  // URL directe (option 1)
  url: "https://...",
  videoUrl: "https://...",
  
  // Chemin Storage (option 2)
  storagePath: "videos/video-id/video.mp4",
  path: "videos/video-id/video.mp4",
  
  // Miniature
  thumbnailUrl: "https://...",
  thumbUrl: "https://...",
  
  // Métadonnées
  timeCreated: Timestamp,
  createdAt: Timestamp,
  likes: 0,
  views: 0,
}
```

## Structure Firebase Storage

### Dossiers recommandés
```
videos/
  ├── video-id-1/
  │   ├── video.mp4          # ou .m3u8, .mov, etc.
  │   └── (optionnel)
  ├── video-id-2/
  │   └── ...
  
thumbnails/
  ├── video-id-1.jpg
  ├── video-id-2.png
  └── ...
```

Le système cherchera automatiquement les miniatures dans:
- `thumbnails/video-id.{jpg,jpeg,png,webp}`
- `videos/video-id/thumb.{jpg,jpeg,png,webp}`
- `videos/video-id/thumbnail.{jpg,jpeg,png,webp}`

## Tester l'application

```bash
npm start
```

L'application devrait maintenant:
1. ✅ Se connecter à Firebase automatiquement
2. ✅ Récupérer les vidéos depuis Firestore
3. ✅ Afficher les miniatures
4. ✅ Utiliser le cache pour améliorer les performances
5. ✅ Gérer les erreurs gracieusement

## Dépendances installées

- ✅ `firebase` (déjà présent)
- ✅ `@react-native-async-storage/async-storage` (nouveau)

## Prochaines étapes

Pour ajouter des vidéos à votre base de données:

1. **Via la console Firebase**:
   - Firestore > videos > Ajouter un document
   - Remplir les champs (au minimum: title et url)

2. **Via Storage**:
   - Upload vidéos dans `videos/video-id/`
   - Le système les détectera automatiquement

3. **Tester**:
   - Ouvrir l'app
   - Voir les vidéos s'afficher sur la page d'accueil
   - Le hero affichera la vidéo la plus likée ou la plus récente

## Résolution de problèmes

### Les vidéos ne s'affichent pas
1. Vérifiez la console: `console.warn('[videos] ...')`
2. Vérifiez que les documents Firestore ont un champ `url` ou `storagePath`
3. Vérifiez les règles de sécurité Firestore/Storage

### Erreur AsyncStorage
- Package installé ✅
- Redémarrez l'app si nécessaire: `npm start -- --clear`

### Erreur de type
- Le type est maintenant `VideoItem` (pas `Video`)
- Utilisez `thumbUrl` (pas `thumbnailUrl`)
- Utilisez `url` (pas `videoUrl`)
