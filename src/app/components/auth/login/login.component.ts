// Esempio per LoginComponent (stessa logica per RegisterComponent)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; // <-- Importa qui
import { AuthService } from '../../../services/auth.service'; // <-- Importa il servizio
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, RouterModule], // <-- Aggiungi ReactiveFormsModule
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.loginForm = new FormGroup({
      identifier: new FormControl('', [Validators.required]),
      password: new FormControl('', Validators.required)
    });
  }

  onSubmit(): void {
    this.errorMessage = null; // Resetta i messaggi di errore
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.router.navigate(['/cats']); // Reindirizza alla lista gatti dopo il login
        },
        error: (err) => {
          this.errorMessage = err.message || 'Login failed. Please check your credentials.';
          console.error('Login error:', err);
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }
}