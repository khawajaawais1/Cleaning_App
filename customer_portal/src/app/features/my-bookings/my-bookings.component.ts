import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { Booking } from '../../core/models/booking.model';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss'],
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = true;
  error = '';

  constructor(
    public auth: AuthService,
    private bookingSvc: BookingService,
    private router: Router,
  ) {}

  ngOnInit(): void { this.load(); }

  get firstName(): string {
    return this.auth.currentUser?.fullName?.split(' ')[0] ?? '';
  }

  load(): void {
    this.loading = true;
    this.bookingSvc.getMyBookings().subscribe({
      next: (data) => { this.bookings = data; this.loading = false; },
      error: () => { this.error = 'Failed to load bookings.'; this.loading = false; },
    });
  }

  viewDetails(b: Booking): void {
    this.router.navigate(['/booking', b.id]);
  }

  trackBooking(b: Booking): void {
    this.router.navigate(['/matching', b.id]);
  }

  reviewBooking(b: Booking): void {
    const s = b.status.toLowerCase();
    if (s === 'completed' && !b.customerRating) {
      this.router.navigate(['/completion', b.id]);
    } else {
      this.router.navigate(['/review', b.id]);
    }
  }

  // ── Formatters ────────────────────────────────────────────
  serviceIcon(s: string): string {
    const m: Record<string, string> = {
      DeepClean: 'deep-clean.svg', MoveInOut: 'move-out-clean.svg', OfficeClean: 'office-clean.svg',
      PostConstruction: 'construction.svg', StandardClean: 'standard-clean.svg',
    };
    return m[s] ?? 'standard-clean.svg';
  }

  serviceLabel(s: string): string {
    const m: Record<string, string> = {
      StandardClean: 'Standard Clean', DeepClean: 'Deep Clean',
      MoveInOut: 'Move In/Out', PostConstruction: 'Post Construction', OfficeClean: 'Office Clean',
    };
    return m[s] ?? s;
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      Scheduled: 'Scheduled', InProgress: 'In Progress',
      Completed: 'Completed', Cancelled: 'Cancelled',
    };
    return m[s] ?? s;
  }

  statusTone(s: string): string {
    const m: Record<string, string> = {
      Scheduled: 'badge-amber', InProgress: 'badge-green',
      Completed: 'badge-blue', Cancelled: 'badge-red',
    };
    return m[s] ?? 'badge-gray';
  }

  workerInitials(fullName: string): string {
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  durationLabel(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
}
