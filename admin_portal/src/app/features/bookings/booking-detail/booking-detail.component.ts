import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { WorkerService } from '../../../core/services/worker.service';
import { Booking } from '../../../core/models/booking.model';
import { Worker } from '../../../core/models/worker.model';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface TimelineEvent {
  label: string;
  time: string;
  done: boolean;
  active?: boolean;
}

@Component({
  selector: "app-booking-detail",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./booking-detail.component.html",
  styleUrls: ["./booking-detail.component.scss"],
})
export class BookingDetailComponent implements OnInit, OnDestroy {
  booking: Booking | null = null;
  workers: Worker[] = [];
  loading = true;
  error: string | null = null;
  timeline: TimelineEvent[] = [];

  // Assign worker modal
  showAssignModal = false;
  selectedWorkerId = "";
  assigning = false;
  assignError: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private workerService: WorkerService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      forkJoin({
        booking: this.bookingService.getBookingById(id).pipe(catchError(() => of(null))),
        workers: this.workerService.getWorkers("active").pipe(catchError(() => of([]))),
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ booking, workers }) => {
        this.booking = booking;
        this.workers = workers ?? [];
        if (booking) { this.timeline = this.buildTimeline(booking); }
        else { this.error = "Booking not found"; }
        this.loading = false;
      });
    } else {
      this.error = "No booking ID provided";
      this.loading = false;
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Timeline ──────────────────────────────────────────────
  buildTimeline(b: Booking): TimelineEvent[] {
    const isInProgress = b.status === "in_progress";
    const isCompleted  = b.status === "completed";
    const isCancelled  = b.status === "cancelled";
    const workerSet    = !!b.workerId;

    // Midpoint expected time
    const midMs = (new Date(b.startTime).getTime() + new Date(b.endTime).getTime()) / 2;
    const midTime = new Date(midMs);

    return [
      {
        label: "Booking created",
        time: this.fmtShort(b.createdAt),
        done: true,
      },
      {
        label: "Worker assigned",
        time: workerSet ? this.fmtShort(b.createdAt) : (isCancelled ? "N/A" : "Pending"),
        done: workerSet,
      },
      {
        label: "Job started",
        time: isInProgress || isCompleted
          ? this.fmtShort(b.startTime)
          : "Expected " + this.formatTime(b.startTime),
        done: isInProgress || isCompleted,
        active: isInProgress,
      },
      {
        label: "Halfway checkpoint",
        time: (isInProgress || isCompleted)
          ? "Expected " + this.formatTime(midTime)
          : "Expected " + this.formatTime(midTime),
        done: isCompleted,
      },
      {
        label: "Job completed",
        time: isCompleted
          ? this.fmtShort(b.endTime)
          : "Expected " + this.formatTime(b.endTime),
        done: isCompleted,
      },
    ];
  }

  fmtShort(d: Date): string {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
           + ", " + dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  // ── Assign worker modal ────────────────────────────────────
  openAssignModal(): void {
    this.selectedWorkerId = this.booking?.workerId ?? "";
    this.assignError = null;
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.assignError = null;
  }

  confirmAssign(): void {
    if (!this.selectedWorkerId || !this.booking) return;
    this.assigning = true;
    this.assignError = null;

    this.bookingService
      .assignWorker(this.booking.id, this.selectedWorkerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.assigning = false;
          this.showAssignModal = false;
          // Reload booking to reflect change
          this.bookingService.getBookingById(this.booking!.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(b => {
              this.booking = b;
              this.timeline = this.buildTimeline(b);
            });
        },
        error: (err) => {
          this.assigning = false;
          this.assignError = err?.error?.message ?? "Failed to assign worker";
        },
      });
  }

  // ── Helpers ───────────────────────────────────────────────
  goBack(): void { this.router.navigate(["/bookings"]); }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: "Pending", scheduled: "Scheduled",
      in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled",
    };
    return map[status] ?? status;
  }

  getWorkerInitials(): string {
    if (!this.booking?.worker) return "?";
    return (this.booking.worker.firstName[0] + this.booking.worker.lastName[0]).toUpperCase();
  }

  getCustomerInitials(): string {
    if (!this.booking?.customer) return "?";
    return (this.booking.customer.firstName[0] + this.booking.customer.lastName[0]).toUpperCase();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (m === 0) return h + " hour" + (h !== 1 ? "s" : "");
    return h + "h " + m + "m";
  }

  get serviceCharge(): number { return this.booking ? this.booking.price * 0.95 : 0; }
  get platformFee(): number   { return this.booking ? this.booking.price * 0.05 : 0; }

  cancelBooking(): void {
    if (!this.booking) return;
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    this.bookingService.cancelBooking(this.booking.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.router.navigate(["/bookings"]),
        error: (err) => alert(err?.error?.message ?? "Failed to cancel booking"),
      });
  }

  // ── Status transitions ────────────────────────────────────
  markWorkerLeft(): void {
    if (!this.booking || !confirm('Mark worker as left for the job? This sets status to In Progress.')) return;
    this.bookingService.updateStatus(this.booking.id, 'InProgress')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.reloadBooking(),
        error: (err) => alert(err?.error?.message ?? 'Failed to update status'),
      });
  }

  markJobComplete(): void {
    if (!this.booking || !confirm('Mark this job as complete? The customer will be prompted to confirm and review.')) return;
    this.bookingService.updateStatus(this.booking.id, 'Completed')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.reloadBooking(),
        error: (err) => alert(err?.error?.message ?? 'Failed to update status'),
      });
  }

  purgeBooking(): void {
    if (!this.booking) return;
    if (this.booking.status !== 'cancelled') {
      alert('The booking must be cancelled before it can be deleted.');
      return;
    }
    if (!confirm(`Permanently delete booking ${this.booking.bookingNumber}? This cannot be undone.`)) return;

    this.bookingService.purgeBooking(this.booking.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.router.navigate(['/bookings']),
        error: (err) => alert(err?.error?.message ?? 'Failed to delete booking'),
      });
  }

  private reloadBooking(): void {
    if (!this.booking) return;
    this.bookingService.getBookingById(this.booking.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(b => { this.booking = b; this.timeline = this.buildTimeline(b); });
  }

  get customerPortalUrl(): string {
    return `http://localhost:4300/matching/${this.booking?.id}`;
  }
}
