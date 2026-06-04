import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';
import { EarningsService } from '../../core/services/earnings.service';
import { WorkerProfile } from '../../core/models/worker.model';
import { Job, JobInvite } from '../../core/models/job.model';
import { EarningsSummary } from '../../core/models/earnings.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  profile: WorkerProfile | null = null;
  todayJobs: Job[] = [];
  activeJob: Job | null = null;
  invites: JobInvite[] = [];
  summary: EarningsSummary | null = null;
  loading = true;

  constructor(
    private auth: AuthService,
    private jobService: JobService,
    private earningsService: EarningsService,
  ) {}

  ngOnInit(): void {
    this.auth.getProfile().subscribe(p => this.profile = p);

    this.jobService.getMyJobs().subscribe(jobs => {
      const today = new Date().toDateString();
      this.todayJobs = jobs.filter(j =>
        new Date(j.scheduledDate).toDateString() === today && j.status !== 'cancelled'
      );
      this.activeJob = jobs.find(j => j.status === 'in_progress' || j.status === 'en_route') ?? null;
      this.loading = false;
    });

    this.jobService.getJobInvites().subscribe(inv => this.invites = inv);
    this.earningsService.getSummary().subscribe(s => this.summary = s);
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  get todayDate(): string {
    return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      assigned: 'Upcoming',
      en_route: 'En route',
      in_progress: 'In progress',
      extension_requested: 'Extension pending',
      completed: 'Completed',
    };
    return map[status] ?? status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      assigned: 'pill-teal',
      en_route: 'pill-blue',
      in_progress: 'pill-green',
      extension_requested: 'pill-amber',
      completed: 'pill-gray',
    };
    return map[status] ?? 'pill-gray';
  }

  getElapsedTime(startDate: Date | undefined): string {
    if (!startDate) return '';
    const mins = Math.floor((Date.now() - new Date(startDate).getTime()) / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase() : parts[0].substring(0,2).toUpperCase();
  }

  acceptInvite(invite: JobInvite): void {
    this.jobService.acceptInvite(invite.id).subscribe(() => {
      this.invites = this.invites.filter(i => i.id !== invite.id);
      this.ngOnInit();
    });
  }

  declineInvite(invite: JobInvite): void {
    this.jobService.declineInvite(invite.id).subscribe(() => {
      this.invites = this.invites.filter(i => i.id !== invite.id);
    });
  }
}
