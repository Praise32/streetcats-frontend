import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

interface AuthResponse {
  token: string;
  userId: string;
  name?: string;
  email?: string;
}

interface UserCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = 'http://localhost:5003/login';
  private readonly _authToken = signal<string | null>(null);
  isLoggedIn = signal<boolean>(false);

  get authToken() {
    return this._authToken.asReadonly();
  }

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    this.loadAuthToken();
  }

  private saveAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
    this._authToken.set(token);
    this.isLoggedIn.set(true);
  }

  private loadAuthToken(): void {
    const token = localStorage.getItem('authToken');
    this._authToken.set(token);
    this.isLoggedIn.set(!!token);
  }

  private removeAuthToken(): void {
    localStorage.removeItem('authToken');
    this._authToken.set(null);
    this.isLoggedIn.set(false);
  }

  login(credentials: UserCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.baseUrl, credentials).pipe(
      tap(response => this.saveAuthToken(response.token)),
      catchError(this.handleError)
    );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data).pipe(
      tap(response => this.saveAuthToken(response.token)),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.removeAuthToken();
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): { id: number; name?: string; email?: string } | null {
    const token = this._authToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId || payload.id,
        name: payload.name,
        email: payload.email
      };
    } catch {
      return null;
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.message || error.message || 'Errore sconosciuto';
    return throwError(() => new Error(errorMessage));
  }
}
