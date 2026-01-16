import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(
    public authService: AuthService,
    private readonly toastr: ToastrService
  ) { }

  logout() {
    this.authService.logout();
    this.toastr.info('Logout effettuato', 'Arrivederci!');
  }
}
