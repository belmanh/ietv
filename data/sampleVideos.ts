// Script pour ajouter des vidéos de test dans Firebase Firestore
// Exécutez ce script dans la console Firebase ou créez un script Node.js

const sampleVideos = [
  {
    title: "La musique classique expliquée",
    description: "Découvrez les bases de la musique classique",
    thumbnailUrl: "https://picsum.photos/400/225?random=1",
    videoUrl: "https://example.com/video1.mp4",
    duration: 3600, // 60 minutes
    category: "Formation",
    tags: ["musique", "classique", "éducation"],
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 1250,
    likesCount: 45,
    dislikesCount: 2,
    commentsCount: 8
  },
  {
    title: "Comprendre la crise climatique en 10 min",
    description: "Un aperçu rapide des enjeux climatiques",
    thumbnailUrl: "https://picsum.photos/400/225?random=2",
    videoUrl: "https://example.com/video2.mp4",
    duration: 600, // 10 minutes
    category: "Documentaire",
    tags: ["environnement", "climat", "science"],
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 3420,
    likesCount: 156,
    dislikesCount: 8,
    commentsCount: 34
  },
  {
    title: "L'intelligence artificielle expliquée",
    description: "Introduction à l'IA et au machine learning",
    thumbnailUrl: "https://picsum.photos/400/225?random=3",
    videoUrl: "https://example.com/video3.mp4",
    duration: 1800, // 30 minutes
    category: "Formation",
    tags: ["technologie", "IA", "programmation"],
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 5670,
    likesCount: 234,
    dislikesCount: 12,
    commentsCount: 67
  },
  {
    title: "Histoire de l'art moderne",
    description: "Un voyage à travers l'art du XXe siècle",
    thumbnailUrl: "https://picsum.photos/400/225?random=4",
    videoUrl: "https://example.com/video4.mp4",
    duration: 2700, // 45 minutes
    category: "Culture",
    tags: ["art", "histoire", "culture"],
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 890,
    likesCount: 67,
    dislikesCount: 3,
    commentsCount: 12
  },
  {
    title: "Cuisine française traditionnelle",
    description: "Apprenez à cuisiner comme un chef français",
    thumbnailUrl: "https://picsum.photos/400/225?random=5",
    videoUrl: "https://example.com/video5.mp4",
    duration: 2100, // 35 minutes
    category: "Lifestyle",
    tags: ["cuisine", "gastronomie", "français"],
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 2340,
    likesCount: 189,
    dislikesCount: 5,
    commentsCount: 45
  },
  {
    title: "Introduction à la photographie",
    description: "Les bases pour devenir un bon photographe",
    thumbnailUrl: "https://picsum.photos/400/225?random=6",
    videoUrl: "https://example.com/video6.mp4",
    duration: 1500, // 25 minutes
    category: "Formation",
    tags: ["photographie", "créativité", "technique"],
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 4560,
    likesCount: 278,
    dislikesCount: 9,
    commentsCount: 56
  },
  {
    title: "Le yoga pour débutants",
    description: "Commencez votre parcours bien-être avec le yoga",
    thumbnailUrl: "https://picsum.photos/400/225?random=7",
    videoUrl: "https://example.com/video7.mp4",
    duration: 1200, // 20 minutes
    category: "Sport",
    tags: ["yoga", "bien-être", "santé"],
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 6780,
    likesCount: 456,
    dislikesCount: 15,
    commentsCount: 89
  },
  {
    title: "Programmation React Native",
    description: "Créez votre première application mobile",
    thumbnailUrl: "https://picsum.photos/400/225?random=8",
    videoUrl: "https://example.com/video8.mp4",
    duration: 4200, // 70 minutes
    category: "Formation",
    tags: ["programmation", "react", "mobile"],
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 8920,
    likesCount: 567,
    dislikesCount: 23,
    commentsCount: 134
  },
  {
    title: "La méditation guidée",
    description: "10 minutes de méditation pour se relaxer",
    thumbnailUrl: "https://picsum.photos/400/225?random=9",
    videoUrl: "https://example.com/video9.mp4",
    duration: 600, // 10 minutes
    category: "Bien-être",
    tags: ["méditation", "relaxation", "mindfulness"],
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 12450,
    likesCount: 890,
    dislikesCount: 18,
    commentsCount: 156
  },
  {
    title: "Les secrets de la pâtisserie",
    description: "Maîtrisez l'art de la pâtisserie française",
    thumbnailUrl: "https://picsum.photos/400/225?random=10",
    videoUrl: "https://example.com/video10.mp4",
    duration: 3000, // 50 minutes
    category: "Cuisine",
    tags: ["pâtisserie", "dessert", "cuisine"],
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 5430,
    likesCount: 345,
    dislikesCount: 11,
    commentsCount: 78
  }
];

/* 
POUR AJOUTER CES DONNÉES À FIREBASE:

1. Via la console Firebase:
   - Allez dans Firestore Database
   - Créez la collection "videos"
   - Ajoutez ces documents manuellement

2. Via un script Node.js:
   
   import { db } from '@/lib/firebase';
   import { collection, addDoc } from 'firebase/firestore';
   
   async function addSampleVideos() {
     for (const video of sampleVideos) {
       await addDoc(collection(db, 'videos'), video);
       console.log('Video added:', video.title);
     }
   }
   
   addSampleVideos();

3. Via l'interface admin (à créer plus tard):
   - Créez une page admin pour ajouter des vidéos
*/

export default sampleVideos;
