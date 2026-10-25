import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  step: 'form' | 'verify' = 'form';

  fullName = '';
  email    = '';
  phone    = '';
  address  = '';
  password = '';

  codeDigits     = ['', '', '', '', '', ''];
  resendCountdown = 0;
  private resendTimer: any;

  loading     = false;
  sendingCode = false;
  error       = '';
  successMsg  = '';

  googleLoading = false;

  constructor(private auth: AuthService, private router: Router, private ngZone: NgZone) {
    if (this.auth.isLoggedIn) this.router.navigate(['/my-bookings']);
  }

  ngOnInit(): void { this.renderGoogleButton(); }

  // Same Google Identity Services flow as the login page; a Google account
  // is created on first sign-in, so this doubles as sign-up.
  private renderGoogleButton(): void {
    const init = () => {
      const host = document.getElementById('google-btn-register');
      if (typeof google === 'undefined' || !host) { setTimeout(init, 300); return; }
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.ngZone.run(() => this.onGoogleCredential(response)),
      });
      google.accounts.id.renderButton(host, { theme: 'outline', size: 'large', width: 240, text: 'signup_with', locale: 'en' });
    };
    setTimeout(init, 300);
  }

  onGoogleCredential(response: { credential: string }): void {
    this.googleLoading = true;
    this.error = '';
    this.auth.loginWithGoogle(response.credential).subscribe({
      next: () => this.router.navigate(['/book']),
      error: () => { this.error = 'Google sign-up failed. Please try again.'; this.googleLoading = false; },
    });
  }

  sendCode() {
    if (!this.fullName || !this.email || !this.password) {
      this.error = 'Please fill in your name, email and password first.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }
    this.sendingCode = true;
    this.error = '';
    this.auth.sendVerificationCode(this.email, this.fullName).subscribe({
      next: () => {
        this.sendingCode = false;
        this.step = 'verify';
        this.successMsg = `We sent a 6-digit code to ${this.email}`;
        this.startResendCountdown();
      },
      error: (e: any) => {
        this.error = e?.error?.message || 'Failed to send code. Check your email and try again.';
        this.sendingCode = false;
      },
    });
  }

  submit() {
    const code = this.codeDigits.join('');
    if (code.length !== 6) { this.error = 'Please enter the full 6-digit code.'; return; }
    this.loading = true;
    this.error = '';
    this.auth.register({
      fullName: this.fullName, email: this.email,
      phone: this.phone, address: this.address,
      password: this.password, verificationCode: code,
    }).subscribe({
      next: () => this.router.navigate(['/book']),
      error: (e: any) => {
        this.error = e?.error?.message || 'Verification failed. Check the code and try again.';
        this.loading = false;
      },
    });
  }

  resend() {
    if (this.resendCountdown > 0) return;
    this.sendingCode = true;
    this.error = '';
    this.auth.sendVerificationCode(this.email, this.fullName).subscribe({
      next: () => { this.sendingCode = false; this.successMsg = 'New code sent!'; this.startResendCountdown(); },
      error: (e: any) => { this.error = e?.error?.message || 'Failed to resend.'; this.sendingCode = false; },
    });
  }

  onDigitInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    this.codeDigits[index] = val;
    input.value = val;
    if (val && index < 5) (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
  }

  onDigitKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.codeDigits[index] && index > 0)
      (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
  }

  onDigitPaste(event: ClipboardEvent) {
    const text = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) ?? '';
    if (text.length === 6) {
      this.codeDigits = text.split('');
      event.preventDefault();
      (document.getElementById('otp-5') as HTMLInputElement)?.focus();
    }
  }

  back() {
    this.step = 'form';
    this.error = '';
    this.codeDigits = ['', '', '', '', '', ''];
    clearInterval(this.resendTimer);
    this.resendCountdown = 0;
    this.renderGoogleButton(); // the form (and its button host) is re-created
  }

  private startResendCountdown() {
    this.resendCountdown = 60;
    clearInterval(this.resendTimer);
    this.resendTimer = setInterval(() => {
      if (--this.resendCountdown <= 0) clearInterval(this.resendTimer);
    }, 1000);
  }
}
