import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService 
  ) {
    this.registerForm = new FormGroup({
      // NOME: Minimo 3 caratteri, solo lettere e spazi
      name: new FormControl('', [
        Validators.required, 
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z ]*$') 
      ]),

      // EMAIL: Validatore standard Angular (già ottimo)
      email: new FormControl('', [Validators.required, Validators.email]),

      // TELEFONO: Esattamente 10 cifre numeriche (es. 3331234567)
      phone: new FormControl('', [
        Validators.required, 
        Validators.pattern('^[0-9]{10}$') 
      ]),

      // PASSWORD: Min 8 caratteri, almeno 1 Maiuscola, almeno 1 Numero
      password: new FormControl('', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9]).*$/) 
      ])
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.toastr.success('Account creato con successo!', 'Benvenuto');
          this.router.navigate(['/cats']);
        },
        error: (err) => {
          console.error('Registration error:', err);
          const errorMsg = err.error?.message || err.message || '';
          
          if (errorMsg.includes('users_email_unique') || errorMsg.includes('already exists')) {
             this.toastr.error('Questa email è già registrata. Prova ad accedere.', 'Email esistente');
          } else {
             this.toastr.error(errorMsg || 'Registrazione fallita. Riprova.', 'Errore');
          }
        }
      });
    } else {
      this.toastr.warning('Il modulo contiene errori. Controlla i campi in rosso.', 'Attenzione');
      this.registerForm.markAllAsTouched();
    }
  }
}