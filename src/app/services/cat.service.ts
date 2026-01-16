import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CatPost, CatPostInsertData, CatPostUpdateData, PaginatedResponse, Photos } from '../interfaces/modules';

@Injectable({ providedIn: 'root' })
export class CatService {
  private readonly baseUrl = 'http://localhost:5003/posts';

  constructor(private http: HttpClient) { }

  getAllCats(page = 1, limit = 6): Observable<PaginatedResponse<CatPost>> {
    return this.http.get<PaginatedResponse<CatPost>>(`${this.baseUrl}?page=${page}&limit=${limit}`).pipe(
      catchError(this.handleError)
    );
  }

  getCatById(id: number): Observable<CatPost> {
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

  uploadPhotos(postId: number, formData: FormData): Observable<Photos[]> {
    return this.http.post<Photos[]>(`${this.baseUrl}/${postId}/upload`, formData).pipe(
      catchError(this.handleError)
    );
  }

  deletePhoto(photoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/photos/${photoId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Si è verificato un errore';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401 || error.status === 403) {
      errorMessage = 'Non autorizzato. Effettua il login.';
    } else if (error.status === 404) {
      errorMessage = 'Risorsa non trovata.';
    }
    return throwError(() => new Error(errorMessage));
  }
}
