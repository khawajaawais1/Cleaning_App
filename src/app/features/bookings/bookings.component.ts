import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { WorkerService } from '../../core/services/worker.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { Booking } from '../../core/models/booking.model';
import { Worker } from '../../core/models/worker.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, StatusBadgeComponent],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss'],
})
export class BookingsComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  workers: Worker[] = [];
  loading = true;
  error: string | null = null;
  selectedStatus = '';
  page = 1;
  limit = 10;
  total = 0;
  searchTerm = '';
  showNewBookingForm = false;
  form!: FormGroup;
  submitting = false;
  private destroy$ = new Subject<void>();

  statusOptions = ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'];

  constructor(
    private bookingService: BookingService,
    private workerService: WorkerService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadBookings();
    this.loadWorkers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.form = this.fb.group({
      customerId: ['', Validators.required],
      workerId: [''],
      serviceType: ['', Validators.required],
      address: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      notes: [''],
    });
  }

  loadBookings(): void {
    this.loading = true;
    this.error = null;
    const status = this.selectedStatus || undefined;

    this.bookingService
      .getBookings(this.page, this.limit, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.bookings = result.data;
          this.total = result.total;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load bookings';
          this.loading = false;
        },
      });
  }

  loadWorkers(): void {
    this.workerService
      .getWorkers('active')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workers) => {
          this.workers = workers;
        },
      });
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.page = 1;
    this.loadBookings();
  }

  onSearch(): void {
    this.page = 1;
    this.loadBookings();
  }

  openNewBookingForm(): void {
    this.showNewBookingForm = true;
    this.form.reset();
  }

  closeForm(): void {
    this.showNewBookingForm = false;
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    const formValue = this.form.value;

    this.bookingService
      .createBooking(formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.closeForm();
          this.loadBookings();
        },
        error: (err) => {
          alert('Failed to create booking: ' + err.error?.message);
          this.submitting = false;
        },
      });
  }

  onCancel(id: string): void {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    this.bookingService
      .cancelBooking(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (err) => {
          alert('Failed to cancel booking: ' + err.error?.message);
        },
      });
  }

  get totalPages(): number { return Math.ceil(this.total / this.limit); }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      pending: 'Pending', scheduled: 'Scheduled',
      in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled',
    };
    return m[s] ?? s;
  }

  formatServiceType(s: string): string {
    const m: Record<string, string> = {
      StandardClean: 'Standard Clean', DeepClean: 'Deep Clean',
      MoveInOut: 'Move In/Out', OfficeClean: 'Office Clean', PostConstruction: 'Post Construction',
    };
    return m[s] ?? s.replace(/([A-Z])/g, ' $1').trim();
  }

  customerInitials(b: any): string {
    const f = b.customer?.firstName?.[0] ?? '';
    const l = b.customer?.lastName?.[0] ?? '';
    return (f + l).toUpperCase() || '?';
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCurrency(value: number): string {
    return '€' + (value ?? 0).toFixed(2);
  }

  getPaginatedItems(): Booking[] {
    const start = (this.page - 1) * this.limit;
    return this.bookings.slice(start, start + this.limit);
  }

  nextPage(): void {
    if (this.page * this.limit < this.total) {
      this.page++;
      this.loadBookings();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadBookings();
    }
  }
}
