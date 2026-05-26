import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkerService } from '../../core/services/worker.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { Worker } from '../../core/models/worker.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-worker-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './worker-applications.component.html',
  styleUrls: ['./worker-applications.component.scss'],
})
export class WorkerApplicationsComponent implements OnInit, OnDestroy {
  workers: Worker[] = [];
  loading = true;
  error: string | null = null;
  selectedStatus = 'pending';
  rejectingId: string | null = null;
  rejectionReason = '';
  private destroy$ = new Subject<void>();

  statusTabs = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Active', value: 'active' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Suspended', value: 'suspended' },
  ];

  constructor(private workerService: WorkerService) {}

  ngOnInit(): void {
    this.loadWorkers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWorkers(): void {
    this.loading = true;
    this.error = null;
    const status = this.selectedStatus === '' ? undefined : this.selectedStatus;
    
    this.workerService
      .getWorkers(status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workers) => {
          this.workers = workers;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load workers';
          this.loading = false;
        },
      });
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.loadWorkers();
  }

  onApprove(id: string): void {
    if (!confirm('Approve this worker application?')) return;

    this.workerService
      .approveWorker(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadWorkers();
        },
        error: (err) => {
          alert('Failed to approve worker: ' + err.error?.message);
        },
      });
  }

  onReject(id: string): void {
    this.rejectingId = id;
  }

  confirmReject(id: string): void {
    if (!this.rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    this.workerService
      .rejectWorker(id, this.rejectionReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.rejectingId = null;
          this.rejectionReason = '';
          this.loadWorkers();
        },
        error: (err) => {
          alert('Failed to reject worker: ' + err.error?.message);
        },
      });
  }

  cancelReject(): void {
    this.rejectingId = null;
    this.rejectionReason = '';
  }

  onSuspend(id: string): void {
    if (!confirm('Suspend this worker?')) return;

    this.workerService
      .suspendWorker(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadWorkers();
        },
        error: (err) => {
          alert('Failed to suspend worker: ' + err.error?.message);
        },
      });
  }

  onRestore(id: string): void {
    if (!confirm('Restore this worker?')) return;

    this.workerService
      .restoreWorker(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadWorkers();
        },
        error: (err) => {
          alert('Failed to restore worker: ' + err.error?.message);
        },
      });
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName[0] + lastName[0]).toUpperCase();
  }
}
