import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core'; // Importa inject
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) { // Controlla lo stato del signal
    return true; // Permetti l'accesso
  } else {
    router.navigate(['/auth/login']); // Reindirizza al login
    return false; // Blocca l'accesso
  }
};