import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, BookingStats } from '../models/booking.model';

export interface DashboardStats {
  totalWorkers: number;
  todaysBookings: number;
  activeJobs: number;
  pendingExtensions: number;
  totalRevenue: number;
  pendingApplications: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getRecentBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/recent-bookings?limit=5`);
  }
}
