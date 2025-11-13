# Structure de l'application myIETV - Mise à jour

## 📁 Nouvelle structure

```
app/
├── (tabs)/                    # Groupe de navigation avec tabs
│   ├── _layout.tsx           # Configuration des tabs (5 onglets)
│   ├── index.tsx             # Page d'accueil (Accueil)
│   ├── search.tsx            # Page de recherche
│   ├── formation.tsx         # Page formations
│   ├── favorites.tsx         # Page favoris
│   └── settings.tsx          # Page paramètres
├── video/
│   └── [id].tsx              # Page de détail d'une vidéo
└── _layout.tsx               # Layout racine (Stack)
```

## 🎨 Page d'accueil (index.tsx)

### Nouvelle apparence
- **Marque** : "IE" (rouge) + "TV" (orange) en haut
- **Hero** : La vidéo la plus likée (ou la plus récente si égalité)
- **Chips colorés** : Séries (vert), Films (jaune), Infos (rose), Documentaires (rouge)
- **Sections** :
  - "Dernières vidéos" : 5 premières vidéos en scroll horizontal inversé
  - "Plus de vidéos" : Reste des vidéos par lignes de 5

### Fonctionnalités
- Auto-refresh à chaque retour sur l'onglet
- Cartes de 220px de large avec miniature 220x120
- Scroll horizontal par ligne (FlatList inversée pour effet RTL naturel)
- Navigation vers la page de détail au clic

## 🧭 Navigation

### Tabs (Barre du bas)
1. **Accueil** - Flux principal des vidéos
2. **Recherche** - Recherche de vidéos (à implémenter)
3. **Formation** - Formations (à implémenter)
4. **Favoris** - Vidéos favorites (à implémenter)
5. **Paramètres** - Paramètres de l'app (à implémenter)

Style :
- Fond noir (#000)
- Couleur active : Rouge (#e50914)
- Couleur inactive : Gris (#8c8c8c)

## 📹 Page vidéo ([id].tsx)

Contenu :
- Bouton retour
- Placeholder vidéo (miniature)
- Titre et ID de la vidéo
- Actions : J'aime, Je n'aime pas, Partager, Favoris
- Description

## 🔥 Connexion Firebase

Le système utilise toujours :
- `hooks/useVideos.ts` pour récupérer les vidéos depuis Firestore
- Tri par `createdAt` descendant
- Types définis dans `types/index.ts`

### Différences avec l'ancienne version
- Pas de composant `BottomNavigation` séparé (utilise `Tabs` d'expo-router)
- Pas de catégories filtrables (juste des chips décoratifs pour l'instant)
- Design plus épuré avec la marque IE TV
- Cartes plus larges (220px vs ~170px avant)

## 🚀 Lancer l'application

```bash
npm start
```

Puis :
- Appuyez sur `a` pour Android
- Appuyez sur `i` pour iOS
- Appuyez sur `w` pour Web

## ⚠️ Configuration Firebase requise

N'oubliez pas de configurer Firebase dans `config/firebaseConfig.ts` :

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

## 📝 Prochaines étapes

### Pages à compléter
1. **Recherche** (`search.tsx`)
   - Barre de recherche
   - Filtres par catégorie
   - Résultats en temps réel

2. **Formation** (`formation.tsx`)
   - Liste des formations depuis Firestore
   - Progression
   - Détails des formations

3. **Favoris** (`favorites.tsx`)
   - Récupérer les favoris de l'utilisateur
   - Synchronisation avec Firebase
   - Gestion des favoris

4. **Paramètres** (`settings.tsx`)
   - Profil utilisateur
   - Authentification Firebase
   - Préférences
   - Déconnexion

### Fonctionnalités à ajouter
- [ ] Lecteur vidéo (expo-av ou react-native-video)
- [ ] Authentification Firebase Auth
- [ ] Système de likes/dislikes fonctionnel
- [ ] Commentaires sur les vidéos
- [ ] Partage via expo-sharing
- [ ] Notifications push
- [ ] Téléchargement hors ligne
- [ ] Historique de visionnage
- [ ] Recommandations personnalisées

## 🎨 Personnalisation

### Modifier les couleurs des chips
Dans `app/(tabs)/index.tsx`, ligne ~76 :
```typescript
const chips = [
  { label: 'Séries', color: '#22C55E' },  // Vert
  { label: 'Films', color: '#f3e34f' },   // Jaune
  // ...
];
```

### Modifier la taille des cartes
Dans `app/(tabs)/index.tsx`, ligne ~183 :
```typescript
card: { width: 220, ... },
cardVideo: { width: 220, height: 120, ... },
```

### Modifier le nombre de vidéos par ligne
Dans `app/(tabs)/index.tsx`, ligne ~46 :
```typescript
for (let i = 0; i < restInverted.length; i += 5) // Changer le 5
```
