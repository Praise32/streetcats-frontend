// src/app/interfaces/models.ts (puoi creare questo file per centralizzare le interfacce)

// Interfaccia per l'utente (solo le info che ti servono sul frontend)
export interface User {
  id: number; // Drizzle serial() è un intero
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

// Interfaccia per i commenti (nota userId e postId sono numeri, e include l'autore)
export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  postId: number;
  // Assumendo che il backend possa popolare l'autore per i commenti
  author?: { id: number; name?: string | null; email?: string | null; } | null;
}

// Interfaccia per le foto
export interface Photo {
  id: number;
  url: string; // URL della foto caricata (da S3)
  filename: string; // Nome del file in S3 (per delete)
  createdAt: string;
  updatedAt: string;
  userId: number;
  postsId: number; // postsId nel backend, ma è il post a cui appartiene
  // Assumendo che il backend possa popolare l'autore
  author?: { id: number; name?: string | null; email?: string | null; } | null;
}

// Interfaccia per l'avvistamento del gatto (il "post")
export interface CatPost {
  id: number;
  title: string;
  description: string | null; // La tua descrizione markdown
  latitude: string | null; // Mantienilo stringa come nel backend
  longitude: string | null; // Mantienilo stringa come nel backend
  address: string;
  city: string;
  cap: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  // Relazioni popolate dal backend (se le API lo fanno)
  author?: User; // Chi ha inserito il post
  photo?: Photo[]; // Array di foto (il tuo backend gestisce 1 foto per ora, ma lo schema è `many`)
  comments?: Comment[]; // Array di commenti
}

// Dati che il frontend invierà per creare un CatPost
export type CatPostInsertData = Omit<CatPost, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'author' | 'photo' | 'comments'>;
export type CatPostUpdateData = Partial<CatPostInsertData>;