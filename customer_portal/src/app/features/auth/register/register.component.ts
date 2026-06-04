import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  fullName = ''; email = ''; phone = ''; address = ''; password = '';
  loading = false; error = '';

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn) this.router.navigate(['/my-bookings']);
  }

  submit() {
    if (!this.fullName || !this.email || !this.password) { this.error = 'Please fill in all required fields.'; return; }
    this.loading = true; this.error = '';
    this.auth.register({ fullName: this.fullName, email: this.email, phone: this.phone, address: this.address, password: this.password }).subscribe({
      next: () => this.router.navigate(['/book']),
      error: (e: any) => { this.error = e?.error?.message || 'Registration failed. Email may already be in use.'; this.loading = false; },
    });
  }
}
