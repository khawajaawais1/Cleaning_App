import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ServiceRate {
  id: number;
  serviceType: string;
  label: string;
  tagline: string;
  icon: string;
  ratePerHour: number;
  isActive: boolean;
  displayOrder: number;
  updatedAt: string;
}

export interface PlatformFee {
  fee: number;
  feeType: 'flat' | 'percent';
}

@Injectable({ providedIn: 'root' })
export class PricingService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRates(): Observable<ServiceRate[]> {
    return this.http.get<ServiceRate[]>(`${this.base}/service-rates`);
  }

  updateRate(id: number, dto: Partial<ServiceRate>): Observable<ServiceRate> {
    return this.http.put<ServiceRate>(`${this.base}/service-rates/${id}`, dto);
  }

  createRate(dto: Omit<ServiceRate, 'id' | 'updatedAt'>): Observable<ServiceRate> {
    return this.http.post<ServiceRate>(`${this.base}/service-rates`, dto);
  }

  deleteRate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/service-rates/${id}`);
  }

  getPlatformFee(): Observable<PlatformFee> {
    return this.http.get<PlatformFee>(`${this.base}/settings/platform-fee`);
  }

  updatePlatformFee(fee: number, feeType: 'flat' | 'percent'): Observable<PlatformFee> {
    return this.http.patch<PlatformFee>(`${this.base}/settings/platform-fee`, { fee, feeType });
  }
}
