import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/cats', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./components/auth/auth.routes').then(mod => mod.AUTH_ROUTES)
  },
  {
    path: 'cats',
    loadChildren: () => import('./components/cats/cats.routes').then(mod => mod.CATS_ROUTES)
  },
  { path: '**', redirectTo: '/cats' }
];
