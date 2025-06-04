import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {Comment } from '../interfaces/modules';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private baseUrl = 'http://localhost:5003/comments';

  constructor(private http: HttpClient) { }

  addComment(postId: number, text: string): Observable<Comment> {
    // Il tuo backend aggiungerà userId in base al token JWT
    return this.http.post<Comment>(`${this.baseUrl}`, { text, postId }).pipe( 
    );
  }

    deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
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
