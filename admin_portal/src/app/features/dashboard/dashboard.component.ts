import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { BookingService } from '../../core/services/booking.service';
import { ExtensionRequestService } from '../../core/services/extension-request.service';
import { Booking } from '../../core/models/booking.model';
import { ExtensionRequest } from '../../core/models/extension-request.model';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  stats: DashboardStats | null = null;
  recentBookings: Booking[] = [];
  pendingExtensions: ExtensionRequest[] = [];
  private destroy$ = new Subject<void>();

  today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  constructor(
    private dashboardSvc: DashboardService,
    private bookingSvc: BookingService,
    private extensionSvc: ExtensionRequestService,
  ) {}

  ngOnInit(): void { this.load(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    this.loading = true;

    forkJoin({
      stats:    this.dashboardSvc.getStats().pipe(catchError(() => of(null))),
      bookings: this.dashboardSvc.getRecentBookings().pipe(catchError(() => of([]))),
      exts:     this.extensionSvc.getExtensionRequests('pending').pipe(catchError(() => of([]))),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ stats, bookings, exts }) => {
      this.stats = stats;
      this.recentBookings = bookings ?? [];
      this.pendingExtensions = (exts ?? []).slice(0, 3);
      this.loading = false;
    });
  }

  getInitials(first: string, last: string): string {
    return ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase();
  }

  colorKey(first: string, last: string): string {
    const map: Record<string, string> = { MA: 'mk', JA: 'jr', PR: 'pn', SA: 'so', AN: 'al', EV: 'ev' };
    return map[(first?.[0] ?? 'M').toUpperCase() + (last?.[0] ?? 'K').toUpperCase()] ?? 'mk';
  }

  formatTime(d: Date): string {
    return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(d: Date): string {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  statusTone(status: string): string {
    const m: Record<string, string> = {
      in_progress: 'green', completed: 'blue', pending: 'gray',
      scheduled: 'gray', cancelled: 'red', en_route: 'orange',
    };
    return m[status] ?? 'gray';
  }

  formatStatus(status: string): string {
    const m: Record<string, string> = {
      in_progress: 'In Progress', en_route: 'En Route',
      scheduled: 'Scheduled', completed: 'Completed',
      cancelled: 'Cancelled', pending: 'Pending',
    };
    return m[status] ?? status;
  }
}
