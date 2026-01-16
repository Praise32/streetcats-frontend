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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = new FormGroup({
      identifier: new FormControl('', [Validators.required]),
      password: new FormControl('', Validators.required)
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.toastr.success('Bentornato!', 'Login effettuato');
          this.router.navigate(['/cats']); 
        },
        error: () => {
          this.toastr.error('Controlla le credenziali', 'Errore di accesso');
        }
      });
    } else {
      this.toastr.warning('Compila tutti i campi richiesti', 'Attenzione');
      this.loginForm.markAllAsTouched();
    }
  }
}
