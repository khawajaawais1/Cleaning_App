import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { BookingService } from '../../core/services/booking.service';

interface MatchStep {
  label: string;
  sub: string;
  status: 'done' | 'active' | 'pending';
}

const MOCK_NEARBY: any[] = [
  { initials: 'AV', fullName: 'Anna V.', rating: 4.8, completedJobs: 98,  distance: '0.8 km', availability: 'Accepting', serviceType: 'Standard Clean' },
  { initials: 'JR', fullName: 'James R.', rating: 4.7, completedJobs: 164, distance: '3.4 km', availability: 'Busy',      serviceType: 'Deep Clean'     },
];

@Component({
  selector: 'app-matching',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './matching.component.html',
  styleUrls: ['./matching.component.scss'],
})
export class MatchingComponent implements OnInit, OnDestroy {

  booking: any = null;
  bookingId!: number;
  loading = true;
  private poll$: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private bookingSvc: BookingService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.bookingId = +this.route.snapshot.paramMap.get('id')!;
    this.poll$ = interval(4000).pipe(
      startWith(0),
      switchMap(() => this.bookingSvc.getBookingById(this.bookingId)),
    ).subscribe({
      next: (b) => {
        this.booking = b;
        this.loading = false;
        if (b.status === 'Completed') {
          this.poll$?.unsubscribe();
          this.router.navigate(['/completion', this.bookingId]);
        }
      },
      error: () => { this.loading = false; },
    });
  }

  ngOnDestroy(): void { this.poll$?.unsubscribe(); }

  get workerAssigned(): boolean { return !!this.booking?.worker; }
  get isInProgress(): boolean   { return this.booking?.status === 'InProgress'; }

  get steps(): MatchStep[] {
    const assigned  = this.workerAssigned;
    const progress  = this.isInProgress;
    return [
      { label: 'Booking confirmed',   sub: this.booking?.serviceType + ' · ' + this.scheduledLabel,    status: 'done' },
      { label: 'Matching workers',    sub: assigned ? 'Match found!'       : 'Checking availability…', status: assigned ? 'done'   : 'active'  },
      { label: 'Worker assigned',     sub: assigned ? this.booking.worker.fullName : 'Pending…',        status: assigned && !progress ? 'active' : assigned && progress ? 'done' : 'pending' },
      { label: 'Cleaner on the way',  sub: progress  ? 'En route to you'   : 'Waiting…',               status: progress ? 'active' : 'pending' },
    ];
  }

  get scheduledLabel(): string {
    if (!this.booking?.scheduledAt) return '';
    const d = new Date(this.booking.scheduledAt);
    return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) + ' · ' +
           d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  }

  get nearbyWorkers(): any[] {
    if (!this.workerAssigned) return MOCK_NEARBY;
    const assigned = {
      initials:     this.booking.worker.initials ?? this.booking.worker.fullName.split(' ').map((n: string) => n[0]).join(''),
      fullName:     this.booking.worker.fullName,
      rating:       this.booking.worker.rating ?? 4.9,
      completedJobs:this.booking.worker.completedJobs ?? 132,
      distance:     '1.2 km',
      availability: 'Accepting',
      serviceType:  this.booking.worker.serviceType ?? this.booking.serviceType,
      matched:      true,
    };
    return [assigned, ...MOCK_NEARBY.slice(1)];
  }
}
