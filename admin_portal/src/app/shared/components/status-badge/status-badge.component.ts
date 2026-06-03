import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type StatusType =
  | 'pending'
  | 'scheduled'
  | 'active'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'completed'
  | 'cancelled'
  | 'in_progress'
  | 'on_break'
  | 'awaiting'
  | 'asked_worker'
  | 'denied';

const statusClasses: Record<StatusType, { label: string; class: string }> = {
  pending: { label: 'Pending', class: 'badge-warning' },
  scheduled: { label: 'Scheduled', class: 'badge-info' },
  active: { label: 'Active', class: 'badge-success' },
  approved: { label: 'Approved', class: 'badge-success' },
  rejected: { label: 'Rejected', class: 'badge-danger' },
  suspended: { label: 'Suspended', class: 'badge-danger' },
  completed: { label: 'Completed', class: 'badge-success' },
  cancelled: { label: 'Cancelled', class: 'badge-danger' },
  in_progress: { label: 'In Progress', class: 'badge-info' },
  on_break: { label: 'On Break', class: 'badge-warning' },
  awaiting: { label: 'Awaiting Decision', class: 'badge-warning' },
  asked_worker: { label: 'Asked Worker', class: 'badge-warning' },
  denied: { label: 'Denied', class: 'badge-danger' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span [ngClass]="badgeClass" class="badge">{{ badgeLabel }}</span>`,
  styles: [`
    .badge {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .badge-success {
      background-color: var(--primary-light);
      color: var(--primary-dark);
    }

    .badge-warning {
      background-color: #fef3c7;
      color: #92400e;
    }

    .badge-danger {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .badge-info {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .badge-neutral {
      background-color: #f3f4f6;
      color: #374151;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: StatusType = 'pending';

  get badgeLabel(): string {
    return statusClasses[this.status]?.label || 'Unknown';
  }

  get badgeClass(): string {
    return statusClasses[this.status]?.class || 'badge-neutral';
  }
}
