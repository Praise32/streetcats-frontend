export interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  postId: number;
  author?: { id: number; name?: string | null; email?: string | null; } | null;
}

export interface Photos {
  id: number;
  url: string;
  filename: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  postsId: number;
  author?: { id: number; name?: string | null; email?: string | null; } | null;
}

export interface CatPost {
  id: number;
  title: string;
  description: string | null;
  latitude: string | null;
  longitude: string | null;
  address: string;
  city: string;
  cap: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  author?: User;
  photos?: Photos[];
  comments?: Comment[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type CatPostInsertData = Omit<CatPost, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'author' | 'photo' | 'comments'>;
export type CatPostUpdateData = Partial<CatPostInsertData>;