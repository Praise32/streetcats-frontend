// Interfaccia per l'utente 
export interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

// Interfaccia per i commenti
export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  postId: number;
  author?: { id: number; name?: string | null; email?: string | null; } | null;
}

// Interfaccia per le foto
export interface Photos {
  id: number;
  url: string; // URL della foto caricata (da S3)
  filename: string; // Nome del file in S3 (per delete)
  createdAt: string;
  updatedAt: string;
  userId: number;
  postsId: number;
  author?: { id: number; name?: string | null; email?: string | null; } | null;
}

export interface CatPost {
  id: number;
  title: string;
  description: string | null; // La tua descrizione markdown
  latitude: string | null;
  longitude: string | null;
  address: string;
  city: string;
  cap: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  author?: User; // Chi ha inserito il post
  photos?: Photos[]; // Array di foto 
  comments?: Comment[]; // Array di commenti
}

// Dati che il frontend invierà per creare un CatPost
export type CatPostInsertData = Omit<CatPost, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'author' | 'photo' | 'comments'>;
export type CatPostUpdateData = Partial<CatPostInsertData>;