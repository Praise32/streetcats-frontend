// src/app/services/cat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CatPost, CatPostInsertData, CatPostUpdateData, Comment, Photos } from '../interfaces/modules';

@Injectable({
  providedIn: 'root'
})
export class CatService {
  private baseUrl = 'http://localhost:5003/posts';

  constructor(private http: HttpClient) { }

  getAllCats(): Observable<CatPost[]> {
    return this.http.get<CatPost[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }

  getCatById(id: number): Observable<CatPost> { // L'ID è un numero
    return this.http.get<CatPost>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createCat(catData: CatPostInsertData): Observable<CatPost> {
    return this.http.post<CatPost>(this.baseUrl, catData).pipe(
      catchError(this.handleError)
    );
  }

  updateCat(id: number, catData: CatPostUpdateData): Observable<CatPost> {
    return this.http.put<CatPost>(`${this.baseUrl}/${id}`, catData).pipe(
      catchError(this.handleError)
    );
  }

  deleteCat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // API per l'upload di foto al post
  uploadPhotos(postId: number, file: File): Observable<Photos> {
    const formData = new FormData();
    formData.append('imageFiles', file); // 'imageFiles' deve corrispondere al nome del campo Multer nel backend

    return this.http.post<Photos>(`${this.baseUrl}/${postId}/upload`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // API per aggiungere un commento (se hai un endpoint dedicato sul backend)
  // Dal tuo schema Drizzle, i commenti hanno userId e postId.
  // Assumo che il tuo backend abbia un endpoint dedicato per i commenti,
  // se non è così, dovrai crearlo. Ad esempio, /api/comments
  // Per ora, lo metto qui, ma considera un `CommentService` separato se la logica cresce.
  addComment(postId: number, text: string): Observable<Comment> {
    // Il tuo backend aggiungerà userId in base al token JWT
    return this.http.post<Comment>(`${this.baseUrl}/${postId}/comments`, { text }).pipe( // Assumendo /api/posts/:id/comments
      catchError(this.handleError)
    );
  }


  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred with cat data!';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 401 || error.status === 403) {
      errorMessage = 'Unauthorized or forbidden. Please log in.';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found.';
    }
    console.error('Cat Service error:', error);
    return throwError(() => new Error(errorMessage));
  }
}