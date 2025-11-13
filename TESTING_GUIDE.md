# Guide de test - Page d'accueil myIETV

## ✅ Modifications apportées

### 1. Vidéo Hero - La plus récente
- La vidéo la plus récente de la base de données s'affiche maintenant en grand en haut de la page
- Le titre de cette vidéo est affiché dynamiquement (au lieu de "Un monde nouveau")
- Cette vidéo est exclue de la liste "Notre sélection du jour" pour éviter la duplication

### 2. Catégories colorées
Ajout d'un bandeau horizontal de catégories avec des couleurs distinctives :
- **Tous** - Rouge (#e50914)
- **Séries** - Rouge corail (#ff6b6b)
- **Films** - Turquoise (#4ecdc4)
- **Documentaires** - Bleu ciel (#45b7d1)
- **Formation** - Jaune (#f9ca24)
- **Sport** - Violet (#6c5ce7)
- **Culture** - Lavande (#a29bfe)

Les catégories sont :
- Scrollables horizontalement
- Avec effet de sélection (couleur pleine quand sélectionné)
- Avec fond semi-transparent quand non sélectionné

### 3. Liste des vidéos
- Les vidéos sont affichées par groupes de 5 par ligne
- Scroll horizontal pour naviguer de gauche à droite
- La première vidéo (hero) est exclue de cette liste

## 🧪 Pour tester l'application

### 1. Vérifiez votre configuration Firebase
```bash
# Ouvrez le fichier config/firebaseConfig.ts
# Assurez-vous que vos credentials Firebase sont corrects
```

### 2. Lancez l'application
```bash
npm start
```

### 3. Vérifiez que vos vidéos s'affichent
Si vous voyez "Chargement..." qui persiste :
- Vérifiez la console pour les erreurs Firebase
- Assurez-vous que la collection "videos" existe dans Firestore
- Vérifiez que les règles de sécurité permettent la lecture publique

### 4. Ajoutez des vidéos de test
Si vous n'avez pas encore de vidéos, utilisez la console Firebase :

```
Firestore Database > videos > Ajouter un document

Exemple de document :
{
  title: "Ma première vidéo",
  description: "Description de ma vidéo",
  thumbnailUrl: "https://picsum.photos/400/225",
  videoUrl: "https://example.com/video.mp4",
  duration: 600,
  category: "Formation",
  tags: ["test", "demo"],
  createdAt: [Date actuelle],
  updatedAt: [Date actuelle],
  viewCount: 0,
  likesCount: 0,
  dislikesCount: 0,
  commentsCount: 0
}
```

## 📱 Comportement attendu

### Au chargement :
1. Affichage de "Chargement..."
2. Récupération des vidéos depuis Firebase (triées par date décroissante)
3. Affichage de la page avec :
   - Header "Accueil" + photo de profil
   - **Section Hero** : Vidéo la plus récente en grand
   - **Boutons de catégories** : Séries, Films, Infos, Docume
   - **Barre de catégories colorées** : Défilant horizontalement
   - **Notre sélection du jour** : Autres vidéos par groupes de 5
   - **Navigation inférieure** : 5 onglets

### Interactions disponibles :
- Scroll vertical pour voir tout le contenu
- Scroll horizontal sur les catégories
- Clic sur une catégorie (change la couleur)
- Scroll horizontal sur chaque ligne de vidéos
- Clic sur une vidéo (affiche le titre dans la console)

## 🐛 Dépannage

### Les vidéos ne s'affichent pas
```bash
# Vérifiez la console
npx expo start

# Dans la console Metro, cherchez les erreurs Firebase
```

### Erreur "Error fetching videos"
- Vérifiez que Firebase est correctement configuré
- Vérifiez les règles de sécurité Firestore
- Assurez-vous que la collection "videos" existe

### Les images ne s'affichent pas
- Vérifiez que `thumbnailUrl` contient une URL valide
- Utilisez des URLs publiques (ex: https://picsum.photos pour des tests)

## 🎨 Personnalisation

### Modifier les couleurs des catégories
Dans `app/index.tsx`, ligne ~23 :
```typescript
const categories = [
  { name: 'Tous', color: '#VOTRE_COULEUR' },
  // ...
];
```

### Ajouter/Retirer des catégories
Modifiez le tableau `categories` dans le composant Index.

### Changer le nombre de vidéos par ligne
Dans `app/index.tsx`, ligne ~34, changez le `5` :
```typescript
for (let i = 0; i < videosToDisplay.length; i += 5) {
  //                                             ^ Nombre de vidéos par ligne
```

Et dans `components/VideoCard.tsx`, ligne ~13 :
```typescript
const CARD_WIDTH = width / 5 - 16;
  //                       ^ Nombre de vidéos par ligne
```
