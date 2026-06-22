import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EarningRecord, EarningsSummary } from '../models/earnings.model';

/* const API_BASE = 'http://localhost:5000/api'; */
const API_BASE = 'https://h2c-backend-hke4dgfyfrbpavee.polandcentral-01.azurewebsites.net/api';

@Injectable({ providedIn: 'root' })
export class EarningsService {
  constructor(private http: HttpClient) {}

  getSummary(): Observable<EarningsSummary> {
    // Derived from the worker's completed bookings
    return this.http.get<any[]>(`${API_BASE}/worker/jobs`).pipe(
      map(jobs => {
        const completed = jobs.filter((j: any) => j.status === 'completed');
        const now = new Date();
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const thisWeek = completed.filter((j: any) => new Date(j.scheduledDate) >= weekStart);
        const thisMonth = completed.filter((j: any) => new Date(j.scheduledDate) >= monthStart);

        const totalAllTime = completed.reduce((s: number, j: any) => s + (j.earnings ?? 0), 0);
        const totalThisMonth = thisMonth.reduce((s: number, j: any) => s + (j.earnings ?? 0), 0);
        const totalThisWeek = thisWeek.reduce((s: number, j: any) => s + (j.earnings ?? 0), 0);

        return {
          totalThisWeek,
          totalThisMonth,
          totalAllTime,
          pendingPayout: totalThisWeek,
          jobsThisWeek: thisWeek.length,
          jobsThisMonth: thisMonth.length,
          averagePerJob: completed.length > 0 ? totalAllTime / completed.length : 0,
        } as EarningsSummary;
      })
    );
  }

  getHistory(): Observable<EarningRecord[]> {
    return this.http.get<any[]>(`${API_BASE}/worker/jobs`).pipe(
      map(jobs =>
        jobs
          .filter((j: any) => j.status === 'completed' || j.status === 'in_progress')
          .map((j: any) => ({
            id: String(j.id),
            jobId: String(j.id),
            bookingRef: j.bookingRef,
            serviceType: j.serviceType,
            customerName: j.customer.name,
            date: new Date(j.scheduledDate),
            amount: j.earnings,
            status: j.status === 'completed' ? 'paid' : 'pending',
          } as EarningRecord))
          .sort((a, b) => b.date.getTime() - a.date.getTime())
      )
    );
  }
}
