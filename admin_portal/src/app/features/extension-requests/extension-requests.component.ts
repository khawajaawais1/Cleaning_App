import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtensionRequestService } from '../../core/services/extension-request.service';
import { ExtensionRequest } from '../../core/models/extension-request.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const COLOR_MAP: Record<string, string> = {
  MA: 'mk', JA: 'jr', PR: 'pn', SA: 'so', AN: 'al', EV: 'ev',
};

@Component({
  selector: 'app-extension-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './extension-requests.component.html',
  styleUrls: ['./extension-requests.component.scss'],
})
export class ExtensionRequestsComponent implements OnInit, OnDestroy {
  requests: ExtensionRequest[] = [];
  loading = true;
  error: string | null = null;
  pendingCount = 0;
  actioningId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private svc: ExtensionRequestService) {}

  ngOnInit(): void { this.loadRequests(); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadRequests(): void {
    this.loading = true;
    this.error = null;
    this.svc.getExtensionRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.requests = res;
          this.pendingCount = res.filter(r => r.status === 'pending').length;
          this.loading = false;
        },
        error: () => { this.error = 'Failed to load requests'; this.loading = false; },
      });
  }

  onAllow(r: ExtensionRequest): void {
    this.actioningId = r.id;
    this.svc.approveRequest(r.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.actioningId = null; this.loadRequests(); },
      error: () => { this.actioningId = null; },
    });
  }

  onDeny(r: ExtensionRequest): void {
    const note = prompt('Reason for denying (sent to worker):');
    if (!note) return;
    this.actioningId = r.id;
    this.svc.denyRequest(r.id, note).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.actioningId = null; this.loadRequests(); },
      error: () => { this.actioningId = null; },
    });
  }

  onAskWorker(r: ExtensionRequest): void {
    this.actioningId = r.id;
    this.svc.askWorker(r.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.actioningId = null; this.loadRequests(); },
      error: () => { this.actioningId = null; },
    });
  }

  initials(firstName: string, lastName: string): string {
    return (firstName[0] + lastName[0]).toUpperCase();
  }

  colorKey(firstName: string, lastName: string): string {
    const key = (firstName[0] + (lastName[0] ?? '')).toUpperCase();
    return COLOR_MAP[key] ?? 'mk';
  }

  statusLabel(status: string): string {
    const m: Record<string, string> = {
      pending: 'Awaiting decision',
      approved: 'Approved',
      denied: 'Denied',
      asked_worker: 'Awaiting worker',
    };
    return m[status] ?? status;
  }

  formatTime(date: Date | string | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  progressPct(r: any): number {
    if (!r.jobProgress?.totalMinutes) return 0;
    return Math.min(100, (r.jobProgress.completedMinutes / r.jobProgress.totalMinutes) * 100);
  }
}
