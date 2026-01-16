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
    private readonly authService: AuthService, 
    private readonly router: Router,
    private readonly toastr: ToastrService 
  ) {
    this.registerForm = new FormGroup({
      name: new FormControl('', [
        Validators.required, 
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z ]*$') 
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [
        Validators.required, 
        Validators.pattern(/^\d{10}$/) 
      ]),
      password: new FormControl('', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).*$/) 
      ])
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.toastr.success('Account creato con successo!', 'Benvenuto');
          this.router.navigate(['/cats']);
        },
        error: (err) => {
          const errorMsg = (err.error?.message || err.message || '').toLowerCase();
          
          if (errorMsg.includes('phone') || errorMsg.includes('telefono')) {
            this.toastr.error('Questo numero di telefono è già registrato', 'Telefono esistente');
          } else if (errorMsg.includes('name') || errorMsg.includes('nome') || errorMsg.includes('username')) {
            this.toastr.error('Questo nome utente è già in uso', 'Nome utente esistente');
          } else if (errorMsg.includes('email') || errorMsg.includes('already')) {
            this.toastr.error('Questa email è già registrata', 'Email esistente');
          } else {
            this.toastr.error('Registrazione fallita. Riprova.', 'Errore');
          }
        }
      });
    } else {
      this.toastr.warning('Controlla i campi in rosso', 'Attenzione');
      this.registerForm.markAllAsTouched();
    }
  }
}
