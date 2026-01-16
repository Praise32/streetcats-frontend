import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Comment } from '../interfaces/modules';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly baseUrl = 'http://localhost:5003/comments';

  constructor(private http: HttpClient) { }

  addComment(postId: number, text: string): Observable<Comment> {
    return this.http.post<Comment>(this.baseUrl, { text, postId }).pipe(
      catchError(this.handleError)
    );
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateComment(id: number, text: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.baseUrl}/${id}`, { text }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Errore durante l operazione';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401 || error.status === 403) {
      errorMessage = 'Non autorizzato.';
    } else if (error.status === 404) {
      errorMessage = 'Commento non trovato.';
    }
    return throwError(() => new Error(errorMessage));
  }
}
