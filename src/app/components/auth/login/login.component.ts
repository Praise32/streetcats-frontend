import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; 
import { AuthService } from '../../../services/auth.service'; 
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, RouterModule], 
  templateUrl: './login.component.html', // Assicurati di avere questa riga per collegare l'HTML
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  // errorMessage rimosso perché usiamo i Toast

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService // Iniezione del servizio Toastr
  ) {
    this.loginForm = new FormGroup({
      identifier: new FormControl('', [Validators.required]),
      password: new FormControl('', Validators.required)
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          // SUCCESSO: Notifica verde
          this.toastr.success('Bentornato!', 'Login effettuato');
          this.router.navigate(['/cats']); 
        },
        error: (err) => {
          console.error('Login error:', err);
          // ERRORE: Notifica rossa
          // Cerca il messaggio nell'errore del backend, o usa un fallback
          const message = 'Login fallito. Controlla le credenziali.';
          this.toastr.error(message, 'Errore di accesso');
        }
      });
    } else {
      // FORM NON VALIDO: Notifica arancione
      this.toastr.warning('Compila tutti i campi richiesti.', 'Attenzione');
      this.loginForm.markAllAsTouched(); // Evidenzia i campi in rosso se l'utente clicca senza scrivere
    }
  }
}