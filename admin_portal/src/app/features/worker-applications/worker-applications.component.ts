import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkerService } from '../../core/services/worker.service';
import { Worker } from '../../core/models/worker.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-worker-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './worker-applications.component.html',
  styleUrls: ['./worker-applications.component.scss'],
})
export class WorkerApplicationsComponent implements OnInit, OnDestroy {
  workers: Worker[]  = [];
  filtered: Worker[] = [];
  loading    = true;
  error: string | null = null;
  selectedStatus = 'pending';
  searchTerm = '';
  rejectingId: string | null = null;
  rejectionReason = '';
  private destroy$ = new Subject<void>();

  statusTabs = [
    { label: 'All',       value: '' },
    { label: 'Pending',   value: 'pending' },
    { label: 'Active',    value: 'active' },
    { label: 'Rejected',  value: 'rejected' },
    { label: 'Suspended', value: 'suspended' },
  ];

  private readonly COLORS: Record<string, string> = {
    A:'av-teal',  B:'av-blue',   C:'av-green',  D:'av-purple',
    E:'av-orange', F:'av-rose',  G:'av-cyan',   H:'av-teal',
    I:'av-blue',  J:'av-green',  K:'av-purple', L:'av-orange',
    M:'av-rose',  N:'av-cyan',   O:'av-teal',   P:'av-blue',
    Q:'av-green', R:'av-purple', S:'av-orange', T:'av-rose',
    U:'av-cyan',  V:'av-teal',   W:'av-blue',   X:'av-green',
    Y:'av-purple',Z:'av-orange',
  };

  constructor(private workerService: WorkerService) {}

  ngOnInit(): void   { this.loadWorkers(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  get pendingCount(): number {
    return this.workers.filter(w => w.status === 'pending').length;
  }

  loadWorkers(): void {
    this.loading = true;
    this.error = null;
    const status = this.selectedStatus || undefined;

    this.workerService.getWorkers(status).pipe(takeUntil(this.destroy$)).subscribe({
      next: (workers) => {
        this.workers = workers;
        this.applySearch();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load workers. Please try again.';
        this.loading = false;
      },
    });
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.searchTerm = '';
    this.loadWorkers();
  }

  applySearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) { this.filtered = [...this.workers]; return; }
    this.filtered = this.workers.filter(w =>
      `${w.firstName} ${w.lastName}`.toLowerCase().includes(term) ||
      w.email.toLowerCase().includes(term)
    );
  }

  onApprove(id: string): void {
    if (!confirm('Approve this worker application?')) return;
    this.workerService.approveWorker(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadWorkers(),
      error: (err) => alert('Failed to approve: ' + (err.error?.message ?? 'Unknown error')),
    });
  }

  onReject(id: string): void {
    this.rejectingId = id;
    this.rejectionReason = '';
  }

  confirmReject(id: string): void {
    if (!this.rejectionReason.trim()) return;
    this.workerService.rejectWorker(id, this.rejectionReason).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.cancelReject(); this.loadWorkers(); },
      error: (err) => alert('Failed to reject: ' + (err.error?.message ?? 'Unknown error')),
    });
  }

  cancelReject(): void { this.rejectingId = null; this.rejectionReason = ''; }

  onSuspend(id: string): void {
    if (!confirm('Suspend this worker?')) return;
    this.workerService.suspendWorker(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadWorkers(),
      error: (err) => alert('Failed to suspend: ' + (err.error?.message ?? 'Unknown error')),
    });
  }

  onRestore(id: string): void {
    if (!confirm('Restore this worker?')) return;
    this.workerService.restoreWorker(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadWorkers(),
      error: (err) => alert('Failed to restore: ' + (err.error?.message ?? 'Unknown error')),
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return ((firstName?.[0] ?? '') + (lastName?.[0] ?? '')).toUpperCase();
  }

  getColorClass(initials: string): string {
    return this.COLORS[initials[0]] ?? 'av-default';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pending', active: 'Active', rejected: 'Rejected', suspended: 'Suspended',
    };
    return map[status] ?? status;
  }
}
