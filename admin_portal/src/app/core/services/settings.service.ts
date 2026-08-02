import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

const API_BASE = 'http://localhost:5000/api';

export interface SystemSettings {
  workerPortalEnabled: boolean;
  workerPortalEnabledAt?: string;
  workerPortalDisabledAt?: string;
  workerPortalDisabledReason?: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private settingsSubject = new BehaviorSubject<SystemSettings | null>(null);
  settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {}

  load(): Observable<SystemSettings> {
    return this.http.get<SystemSettings>(`${API_BASE}/settings/worker-portal`).pipe(
      tap(s => this.settingsSubject.next(s))
    );
  }

  toggleWorkerPortal(enabled: boolean, reason?: string): Observable<SystemSettings> {
    return this.http.patch<SystemSettings>(`${API_BASE}/settings/worker-portal`, { enabled, reason }).pipe(
      tap(s => this.settingsSubject.next(s))
    );
  }
}
