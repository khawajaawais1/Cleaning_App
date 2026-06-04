import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-completion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './completion.component.html',
  styleUrls: ['./completion.component.scss'],
})
export class CompletionComponent implements OnInit {
  booking: any = null;
  loading = true;
  confirmed1 = false;
  confirmed2 = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingSvc: BookingService,
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.bookingSvc.getBookingById(id).subscribe({
      next: (b) => { this.booking = b; this.loading = false; },
      error: ()  => { this.loading = false; },
    });
  }

  get durationLabel(): string {
    const m = this.booking?.durationMinutes ?? 0;
    const h = Math.floor(m / 60);
    const min = m % 60;
    return min > 0 ? `${h}h ${min}m` : `${h}h`;
  }

  get startLabel(): string {
    if (!this.booking?.scheduledAt) return '';
    return new Date(this.booking.scheduledAt)
      .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  get finishLabel(): string {
    if (!this.booking?.scheduledAt) return '';
    const end = new Date(new Date(this.booking.scheduledAt).getTime() + (this.booking.durationMinutes ?? 0) * 60000);
    return end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  get canConfirm(): boolean { return this.confirmed1 && this.confirmed2; }

  confirm(): void {
    this.router.navigate(['/review', this.booking.id]);
  }
}
