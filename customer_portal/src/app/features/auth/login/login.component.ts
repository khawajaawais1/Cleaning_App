import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  googleLoading = false;
  error = '';
  returnUrl = '/my-bookings';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone,
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/my-bookings';
    if (this.auth.isLoggedIn) this.router.navigate([this.returnUrl]);
  }

  ngOnInit(): void {
    // Wait for GSI script to load then initialise
    const init = () => {
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: any) => this.ngZone.run(() => this.onGoogleCredential(response)),
        });
        google.accounts.id.renderButton(
          document.getElementById('google-btn-login'),
          { theme: 'outline', size: 'large', width: 240, text: 'signin_with' }
        );
      } else {
        setTimeout(init, 300);
      }
    };
    setTimeout(init, 300);
  }

  onGoogleCredential(response: { credential: string }): void {
    this.googleLoading = true;
    this.error = '';
    this.auth.loginWithGoogle(response.credential).subscribe({
      next: () => this.router.navigate([this.returnUrl]),
      error: () => { this.error = 'Google sign-in failed. Please try again.'; this.googleLoading = false; },
    });
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
