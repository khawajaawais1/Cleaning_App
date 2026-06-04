import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  returnUrl = '/my-bookings';

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/my-bookings';
    if (this.auth.isLoggedIn) this.router.navigate([this.returnUrl]);
  }

  submit() {
    if (!this.email || !this.password) { this.error = 'Please enter your email and password.'; return; }
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate([this.returnUrl]),
      error: () => { this.error = 'Invalid email or password. Try sarah@demo.com / demo1234'; this.loading = false; },
    });
  }
}
