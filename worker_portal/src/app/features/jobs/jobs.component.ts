import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Job } from '../../core/models/job.model';
import { JobService } from '../../core/services/job.service';
import { LocationService } from '../../core/services/location.service';

type TabType = 'active' | 'upcoming' | 'completed';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent implements OnInit, OnDestroy {
  allJobs: Job[] = [];
  activeTab: TabType = 'active';
  loading = true;

  extensionModalOpen = false;
  extensionJob: Job | null = null;
  extensionForm = this.fb.group({
    minutes: [30, [Validators.required, Validators.min(15), Validators.max(120)]],
    reason:  ['', [Validators.required, Validators.minLength(10)]],
  });
  extensionSubmitting = false;

  constructor(
    private jobService: JobService,
    private fb: FormBuilder,
    public locationService: LocationService,
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  ngOnDestroy(): void {
    // Stop GPS tracking when navigating away — tracking continues only on this screen
    // (dashboard restarts it if job is still active on next visit)
  }

  loadJobs(): void {
    this.jobService.getMyJobs().subscribe(jobs => {
      this.allJobs = jobs;
      this.loading = false;
      // Resume location tracking if there's an active job
      const active = jobs.find(j => j.status === 'in_progress');
      if (active && !this.locationService.isTracking) {
        this.locationService.startTracking(Number(active.id));
      }
    });
  }

  get tabJobs(): Job[] {
    if (this.activeTab === 'active') {
      return this.allJobs.filter(j =>
        ['in_progress', 'en_route', 'assigned', 'extension_requested'].includes(j.status) &&
        new Date(j.scheduledDate) >= new Date(new Date().toDateString())
      );
    }
    if (this.activeTab === 'upcoming') {
      return this.allJobs
        .filter(j => j.status === 'assigned' && new Date(j.scheduledDate) > new Date())
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
    }
    return this.allJobs
      .filter(j => j.status === 'completed')
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }

  markEnRoute(job: Job): void {
    // "En route" is a client-side UX state only — the DB has no such status.
    // The real DB transition (Scheduled → InProgress) happens at startJob().
    this.allJobs = this.allJobs.map(j =>
      j.id === job.id ? { ...j, status: 'en_route' as const } : j
    );
  }

  startJob(job: Job): void {
    this.jobService.startJob(job.id).subscribe({
      next: updated => {
        this.allJobs = this.allJobs.map(j => j.id === updated.id ? updated : j);
        this.locationService.startTracking(Number(job.id));
      },
      error: err => {
        this.allJobs = this.allJobs.map(j =>
          j.id === job.id ? { ...j, status: 'in_progress' as const } : j
        );
        this.locationService.startTracking(Number(job.id));
        console.warn('Start job API error (optimistic update applied):', err);
      },
    });
  }

  completeJob(job: Job): void {
    if (!confirm('Mark this job as complete?')) return;
    this.jobService.completeJob(job.id).subscribe({
      next: updated => {
        this.allJobs = this.allJobs.map(j => j.id === updated.id ? updated : j);
        this.locationService.stopTracking();
      },
      error: err => {
        this.allJobs = this.allJobs.map(j =>
          j.id === job.id ? { ...j, status: 'completed' as const } : j
        );
        this.locationService.stopTracking();
        console.warn('Complete job API error (optimistic update applied):', err);
      },
    });
  }

  openExtension(job: Job): void {
    this.extensionJob = job;
    this.extensionForm.reset({ minutes: 30, reason: '' });
    this.extensionModalOpen = true;
  }

  closeExtension(): void {
    this.extensionModalOpen = false;
    this.extensionJob = null;
  }

  submitExtension(): void {
    if (this.extensionForm.invalid) { this.extensionForm.markAllAsTouched(); return; }
    const { minutes, reason } = this.extensionForm.value;
    this.extensionSubmitting = true;
    this.jobService.requestExtension(this.extensionJob!.id, minutes!, reason!).subscribe({
      next: () => {
        this.extensionSubmitting = false;
        this.allJobs = this.allJobs.map(j =>
          j.id === this.extensionJob?.id ? { ...j, status: 'extension_requested' as const } : j
        );
        this.closeExtension();
      },
      error: () => { this.extensionSubmitting = false; },
    });
  }

  getElapsed(job: Job): string {
    if (!job.actualStart) return '';
    const mins = Math.floor((Date.now() - new Date(job.actualStart).getTime()) / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m elapsed` : `${m}m elapsed`;
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      assigned: 'Upcoming', en_route: 'En route', in_progress: 'In progress',
      extension_requested: 'Extension pending', completed: 'Completed',
    };
    return map[status] ?? status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      assigned: 'pill-teal', en_route: 'pill-blue', in_progress: 'pill-green',
      extension_requested: 'pill-amber', completed: 'pill-gray',
    };
    return map[status] ?? 'pill-gray';
  }
}
