import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ServiceOption, SERVICE_OPTIONS } from '../models/booking.model';

const API_BASE = 'http://localhost:5000/api';

export interface PlatformFee {
  fee: number;
  feeType: 'flat' | 'percent';
}

@Injectable({ providedIn: 'root' })
export class PricingService {
  private ratesSubject = new BehaviorSubject<ServiceOption[]>(SERVICE_OPTIONS);
  private feeSubject   = new BehaviorSubject<PlatformFee>({ fee: 5, feeType: 'flat' });

  rates$  = this.ratesSubject.asObservable();
  fee$    = this.feeSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  get rates(): ServiceOption[]  { return this.ratesSubject.value; }
  get fee():   PlatformFee      { return this.feeSubject.value; }

  loadAll(): void {
    this.http.get<any[]>(`${API_BASE}/service-rates`).pipe(
      catchError(() => of(null))
    ).subscribe(data => {
      if (data) {
        const options: ServiceOption[] = data
          .filter(r => r.isActive)
          .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
          .map((r: any) => {
            // Map service type to local image asset
            const imageMap: Record<string, string> = {
              StandardClean: 'assets/images/clean-1.png',
              DeepClean:     'assets/images/clean-2.png',
              OfficeClean:   'assets/images/clean-3.png',
              MoveInOut:     'assets/images/clean-4.png',
            };
            return {
              type:        r.serviceType,
              label:       r.label,
              tagline:     r.tagline,
              icon:        r.icon,
              image:       imageMap[r.serviceType] ?? 'assets/images/clean-1.png',
              ratePerHour: r.ratePerHour,
            };
          });
        this.ratesSubject.next(options);
      }
    });

    this.http.get<PlatformFee>(`${API_BASE}/settings/platform-fee`).pipe(
      catchError(() => of(null))
    ).subscribe(data => {
      if (data) this.feeSubject.next(data);
    });
  }

  calcPlatformFee(subtotal: number): number {
    const f = this.fee;
    if (f.feeType === 'percent') return +(subtotal * f.fee / 100).toFixed(2);
    return f.fee;
  }
}
