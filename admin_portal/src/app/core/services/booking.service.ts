import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Booking } from '../models/booking.model';

export interface CreateBookingDto {
  customerId: string;
  workerId?: string;
  serviceType: string;
  address: string;
  startTime: Date;
  endTime: Date;
  price: number;
  notes?: string;
}

export interface UpdateBookingDto {
  workerId?: string;
  startTime?: Date;
  endTime?: Date;
  status?: string;
  notes?: string;
}

@Injectable({ providedIn: "root" })
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  // API returns a plain Booking[] — wrap into paginated shape
  getBookings(page = 1, limit = 10, status?: string): Observable<{ data: Booking[]; total: number }> {
    let params = new HttpParams();
    if (status) params = params.set("status", status);
    return this.http.get<Booking[]>(this.apiUrl, { params }).pipe(
      map(bookings => {
        const total = bookings.length;
        const start = (page - 1) * limit;
        return { data: bookings.slice(start, start + limit), total };
      })
    );
  }

  getBooking(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  getBookingById(id: string): Observable<Booking> {
    return this.getBooking(id);
  }

  createBooking(dto: CreateBookingDto): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, dto);
  }

  updateBooking(id: string, dto: UpdateBookingDto): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}`, dto);
  }

  assignWorker(bookingId: string, workerId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${bookingId}/assign-worker`, { workerId: Number(workerId) });
  }

  cancelBooking(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: string, status: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status });
  }

  /** Permanently delete a cancelled booking from the database. */
  purgeBooking(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/purge`);
  }
}
