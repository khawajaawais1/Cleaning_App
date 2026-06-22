import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Job, JobInvite, ExtensionRequest } from '../models/job.model';

/* const API_BASE = 'http://localhost:5000/api'; */
const API_BASE = 'https://h2c-backend-hke4dgfyfrbpavee.polandcentral-01.azurewebsites.net/api';

@Injectable({ providedIn: 'root' })
export class JobService {
  constructor(private http: HttpClient) {}

  getMyJobs(): Observable<Job[]> {
    return this.http.get<any[]>(`${API_BASE}/worker/jobs`).pipe(map(jobs => jobs.map(this.mapJob)));
  }

  getJobInvites(): Observable<JobInvite[]> {
    return this.http.get<JobInvite[]>(`${API_BASE}/worker/jobs/invites`);
  }

  acceptInvite(inviteId: string): Observable<Job> {
    return this.http.post<any>(`${API_BASE}/worker/jobs/invites/${inviteId}/accept`, {}).pipe(map(this.mapJob));
  }

  declineInvite(inviteId: string): Observable<void> {
    return this.http.post<void>(`${API_BASE}/worker/jobs/invites/${inviteId}/decline`, {});
  }

  markEnRoute(jobId: string): Observable<Job> {
    return this.http.post<any>(`${API_BASE}/worker/jobs/${jobId}/en-route`, {}).pipe(map(this.mapJob));
  }

  startJob(jobId: string): Observable<Job> {
    return this.http.post<any>(`${API_BASE}/worker/jobs/${jobId}/start`, {}).pipe(map(this.mapJob));
  }

  completeJob(jobId: string): Observable<Job> {
    return this.http.post<any>(`${API_BASE}/worker/jobs/${jobId}/complete`, {}).pipe(map(this.mapJob));
  }

  requestExtension(jobId: string, minutes: number, reason: string): Observable<ExtensionRequest> {
    return this.http.post<any>(`${API_BASE}/worker/jobs/${jobId}/extension`, { minutes, reason }).pipe(
      map(r => ({
        id: String(r.id),
        jobId,
        requestedMinutes: r.requestedMinutes,
        reason: r.reason,
        status: r.status,
        submittedAt: new Date(r.submittedAt),
        originalEnd: r.originalEnd,
        newEnd: r.newEnd,
      } as ExtensionRequest))
    );
  }

  private mapJob(raw: any): Job {
    return {
      id: String(raw.id),
      bookingRef: raw.bookingRef,
      serviceType: raw.serviceType,
      status: raw.status,
      customer: {
        id: String(raw.customer.id),
        name: raw.customer.name,
        phone: raw.customer.phone,
        initials: raw.customer.initials,
      },
      location: {
        address: raw.location.address,
        city: raw.location.city ?? '',
        postcode: raw.location.postcode ?? '',
        lat: raw.location.lat,
        lng: raw.location.lng,
      },
      scheduledDate: new Date(raw.scheduledDate),
      scheduledStart: raw.scheduledStart,
      scheduledEnd: raw.scheduledEnd,
      durationMinutes: raw.durationMinutes,
      notes: raw.notes,
      earnings: raw.earnings,
      extensionRequest: raw.extensionRequest ? {
        id: String(raw.extensionRequest.id),
        jobId: String(raw.id),
        requestedMinutes: raw.extensionRequest.requestedMinutes,
        reason: raw.extensionRequest.reason,
        status: raw.extensionRequest.status,
        submittedAt: new Date(raw.extensionRequest.submittedAt),
        originalEnd: raw.extensionRequest.originalEnd,
        newEnd: raw.extensionRequest.newEnd,
      } : undefined,
    };
  }
}
