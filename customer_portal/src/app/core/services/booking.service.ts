import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, CreateBookingDto } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = `${environment.apiUrl}/customer`;
  constructor(private http: HttpClient) {}

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings`);
  }

  getBookingById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/bookings/${id}`);
  }

  createBooking(dto: CreateBookingDto): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/bookings`, dto);
  }

  submitReview(id: number, rating: number, review: string, tags: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings/${id}/review`, { rating, review, tags });
  }

  getReceipt(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/bookings/${id}/receipt`);
  }
}
