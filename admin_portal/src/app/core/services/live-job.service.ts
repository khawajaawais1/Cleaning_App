import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LiveJob, LiveJobStats } from '../models/live-job.model';

@Injectable({
  providedIn: 'root'
})
export class LiveJobService {
  private apiUrl = `${environment.apiUrl}/live-jobs`;

  constructor(private http: HttpClient) {}

  getLiveJobs(): Observable<LiveJob[]> {
    return this.http.get<LiveJob[]>(this.apiUrl);
  }

  getLiveJobsWithAutoRefresh(intervalMs: number = 30000): Observable<LiveJob[]> {
    return interval(0).pipe(
      switchMap(() => this.getLiveJobs())
    );
  }

  getLiveJob(id: string): Observable<LiveJob> {
    return this.http.get<LiveJob>(`${this.apiUrl}/${id}`);
  }

  getLiveJobStats(): Observable<LiveJobStats> {
    return this.http.get<LiveJobStats>(`${this.apiUrl}/stats`);
  }

  startJob(id: string): Observable<LiveJob> {
    return this.http.post<LiveJob>(`${this.apiUrl}/${id}/start`, {});
  }

  completeJob(id: string): Observable<LiveJob> {
    return this.http.post<LiveJob>(`${this.apiUrl}/${id}/complete`, {});
  }

  pauseJob(id: string): Observable<LiveJob> {
    return this.http.post<LiveJob>(`${this.apiUrl}/${id}/pause`, {});
  }

  resumeJob(id: string): Observable<LiveJob> {
    return this.http.post<LiveJob>(`${this.apiUrl}/${id}/resume`, {});
  }
}
