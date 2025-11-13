export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: Date;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration?: number;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  viewCount?: number;
  likesCount?: number;
  dislikesCount?: number;
  commentsCount?: number;
}

export interface Formation {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  category?: string;
  duration?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  price?: number; // prix en centimes ou unité choisie
  trainer?: string; // nom du formateur
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  videoId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  videoId: string;
  createdAt: Date;
}
