import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';

interface StatusStep {
  label: string;
  desc: string;
  state: 'done' | 'active' | 'pending';
}

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.scss'],
})
export class BookingDetailComponent implements OnInit {
  booking: any = null;
  loading = true;

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

  get statusSteps(): StatusStep[] {
    const s = this.booking?.status ?? '';
    const hasWorker = !!this.booking?.worker;
    const scheduled  = true;
    const assigned   = hasWorker;
    const inProgress = s === 'InProgress' || s === 'Completed';
    const completed  = s === 'Completed';
    const cancelled  = s === 'Cancelled';

    if (cancelled) {
      return [
        { label: 'Booking placed',   desc: this.scheduledLabel,     state: 'done'    },
        { label: 'Cancelled',        desc: 'This booking was cancelled.', state: 'active' },
      ];
    }

    return [
      { label: 'Booking confirmed', desc: this.scheduledLabel,                                         state: 'done'                                              },
      { label: 'Worker assigned',   desc: assigned   ? this.booking.worker.fullName : 'Pending…',       state: assigned   ? 'done'   : 'active'                    },
      { label: 'Cleaner en route',  desc: inProgress ? 'Worker has left for your address'  : 'Waiting…', state: inProgress ? (completed ? 'done' : 'active') : 'pending' },
      { label: 'Job complete',      desc: completed  ? 'Cleaning finished ✓'               : 'Pending…', state: completed  ? 'done'   : 'pending'                    },
    ];
  }

  get scheduledLabel(): string {
    if (!this.booking?.scheduledAt) return '';
    const d = new Date(this.booking.scheduledAt);
    return d.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
         + ' at ' + d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  }

  get durationLabel(): string {
    const m = this.booking?.durationMinutes ?? 0;
    const h = Math.floor(m / 60); const min = m % 60;
    return min > 0 ? `${h}h ${min}m` : `${h}h`;
  }

  get serviceLabel(): string {
    const map: Record<string, string> = {
      StandardClean: 'Standard Clean', DeepClean: 'Deep Clean',
      MoveInOut: 'Move In/Out', PostConstruction: 'Post Construction', OfficeClean: 'Office Clean',
    };
    return map[this.booking?.serviceType] ?? this.booking?.serviceType ?? '';
  }

  get workerInitials(): string {
    return (this.booking?.worker?.fullName ?? '?').split(' ')
      .map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // ── Report issue ──────────────────────────────────────────
  showIssueForm = false;
  issueText = '';
  issueSent = false;

  submitIssue(): void {
    if (!this.issueText.trim()) return;
    // In a real app this would POST to an API endpoint.
    // For now we just mark it as sent and clear the form.
    this.issueSent = true;
    this.showIssueForm = false;
    this.issueText = '';
  }

  primaryAction(): void {
    const s = this.booking?.status ?? '';
    if (s === 'Scheduled' || s === 'InProgress')
      this.router.navigate(['/matching', this.booking.id]);
    else if (s === 'Completed' && !this.booking.customerRating)
      this.router.navigate(['/completion', this.booking.id]);
    else if (s === 'Completed')
      this.router.navigate(['/review', this.booking.id]);
  }

  get primaryLabel(): string {
    const s = this.booking?.status ?? '';
    if (s === 'Scheduled' || s === 'InProgress') return '📍 Track live status';
    if (s === 'Completed' && !this.booking?.customerRating) return '⭐ Rate & review';
    if (s === 'Completed') return '📄 View receipt';
    return '';
  }

  get showPrimary(): boolean {
    return this.booking?.status !== 'Cancelled';
  }
}
