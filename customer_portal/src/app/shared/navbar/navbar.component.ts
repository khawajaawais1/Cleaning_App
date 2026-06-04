import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  scrolled = false;
  menuOpen = false;

  constructor(public auth: AuthService) {}

  get firstName(): string {
    return this.auth.currentUser?.fullName?.split(' ')[0] ?? '';
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 20; }

  logout() { this.auth.logout(); }
  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu() { this.menuOpen = false; }
}
