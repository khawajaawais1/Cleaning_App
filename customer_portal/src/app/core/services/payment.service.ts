import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SavedCard {
  hasCard: boolean;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  paymentMethodId?: string;
}

export interface SetupIntentResponse {
  clientSecret: string;
  publishableKey: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amountCents: number;
  publishableKey: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private base = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getSavedCard(): Observable<SavedCard> {
    return this.http.get<SavedCard>(`${this.base}/card`);
  }

  createSetupIntent(): Observable<SetupIntentResponse> {
    return this.http.post<SetupIntentResponse>(`${this.base}/setup-intent`, {});
  }

  saveCard(paymentMethodId: string): Observable<SavedCard> {
    return this.http.post<SavedCard>(`${this.base}/save-card`, { paymentMethodId });
  }

  createIntent(amount: number, currency = 'eur'): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(`${this.base}/create-intent`, { amount, currency });
  }

  confirmPayment(bookingId: number, paymentIntentId: string): Observable<void> {
    return this.http.post<void>(`${this.base}/confirm`, { bookingId, paymentIntentId });
  }
}
