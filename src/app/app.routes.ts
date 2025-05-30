// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component'; // Assicurati sia standalone
import { authGuard } from './guards/authorization.guard';

export const routes: Routes = [
  // Rotta per la Home Page
  { path: '', component: HomeComponent },

  // Rotte per l'autenticazione (lazy loading)
  {
    path: 'auth',
    loadChildren: () => import('./components/auth/auth.routes').then(mod => mod.AUTH_ROUTES)
  },

  // Rotte per i gatti (lazy loading)
  {
    path: 'cats',
    loadChildren: () => import('./components/cats/cats.routes').then(mod => mod.CATS_ROUTES)
  },

  // Rotta Wildcard per gestire URL non validi
  { path: '**', redirectTo: '' } // Reindirizza qualsiasi cosa non riconosciuta alla Home
];