# Configuration Firebase pour myIETV

## Étapes de configuration

### 1. Créer un projet Firebase
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet ou utilisez un projet existant
3. Ajoutez une application Web à votre projet

### 2. Récupérer les credentials Firebase
Dans les paramètres du projet, copiez la configuration Firebase qui ressemble à ceci:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 3. Configurer le projet
Ouvrez le fichier `config/firebaseConfig.ts` et remplacez les valeurs par vos propres credentials Firebase.

### 4. Activer les services Firebase

#### Firestore Database
1. Dans Firebase Console > Firestore Database
2. Créez la base de données en mode test
3. Importez les règles de sécurité depuis `_cloud firestore.txt`

#### Firebase Storage
1. Dans Firebase Console > Storage
2. Activez le service
3. Importez les règles de sécurité depuis `_firebase storage.txt`

#### Firebase Authentication
1. Dans Firebase Console > Authentication
2. Activez les méthodes de connexion souhaitées (Email/Password, Google, etc.)

### 5. Structure de la base de données

#### Collection `videos`
```typescript
{
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  duration: number (en secondes)
  category: string
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
  viewCount: number
  likesCount: number
  dislikesCount: number
  commentsCount: number
}
```

#### Collection `users`
```typescript
{
  email: string
  displayName: string
  photoURL: string
  role: 'user' | 'admin' | 'superadmin'
  createdAt: Timestamp
}
```

#### Collection `formations`
```typescript
{
  title: string
  description: string
  thumbnailUrl: string
  category: string
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## Démarrer l'application

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start

# Pour Android
npm run android

# Pour iOS
npm run ios

# Pour Web
npm run web
```

## Fonctionnalités implémentées

### Page d'accueil
- ✅ Affichage de 5 vidéos par ligne
- ✅ Navigation horizontale (gauche à droite)
- ✅ Section hero avec la vidéo mise en avant
- ✅ Miniatures des vidéos avec durée
- ✅ Barre de navigation en bas
- ✅ Connexion à Firebase Firestore

### Prochaines étapes
- [ ] Page de détail vidéo
- [ ] Page de recherche
- [ ] Page formations
- [ ] Page favoris
- [ ] Page paramètres
- [ ] Authentification utilisateur
- [ ] Système de likes/dislikes
- [ ] Commentaires
- [ ] Partage de vidéos
