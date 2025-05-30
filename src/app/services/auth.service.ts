// src/app/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

// Definisci le interfacce per i tuoi dati (si basano sulle risposte del tuo backend)
interface AuthResponse {
  token: string;
  userId: string; // O qualsiasi altro dato utile che il tuo backend restituisce
  // ... altri campi come username, ruoli, ecc.
}

interface UserCredentials {
  email: string;
  password: string;
}

interface RegisterData extends UserCredentials {
  username: string; // O qualsiasi altro campo di registrazione
  // ...
}

@Injectable({
  providedIn: 'root' // Rende il servizio un singleton disponibile ovunque
})
export class AuthService {
  private baseUrl = 'http://localhost:5003/login';

  // Useremo un signal per lo stato di autenticazione, come raccomandato da Angular 20
  // Sarà un signal di stringa (il token) o null se non loggato
  private _authToken = signal<string | null>(null);

  // Espone un getter pubblico per il token
  get authToken() {
    return this._authToken.asReadonly(); // Rende il signal di sola lettura all'esterno
  }

  // Puoi anche esporre un signal booleano per sapere se l'utente è loggato
  isLoggedIn = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    this.loadAuthToken(); // Carica il token all'avvio del servizio
  }

  private saveAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
    this._authToken.set(token);
    this.isLoggedIn.set(true);
  }

  private loadAuthToken(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      this._authToken.set(token);
      this.isLoggedIn.set(true);
      // TODO: Valuta se il token è ancora valido (es. decodificandolo o chiamando un'API /verify)
    } else {
      this._authToken.set(null);
      this.isLoggedIn.set(false);
    }
  }

  private removeAuthToken(): void {
    localStorage.removeItem('authToken');
    this._authToken.set(null);
    this.isLoggedIn.set(false);
  }

  login(credentials: UserCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}`, credentials).pipe(
      tap(response => {
        this.saveAuthToken(response.token);
        console.log('Login successful, token saved:', response.token);
      }),
      catchError(this.handleError)
    );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data).pipe(
      tap(response => {
        this.saveAuthToken(response.token);
        console.log('Registration successful, token saved:', response.token);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.removeAuthToken();
    this.router.navigate(['/auth/login']); // Reindirizza al login dopo il logout
    console.log('User logged out.');
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    console.error('An error occurred:', error);
    return throwError(() => new Error(errorMessage));
  }
}