import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { WorkerProfile, WorkerLoginRequest, WorkerSignupRequest, AuthResponse } from '../models/worker.model';

/* const API_BASE = 'http://localhost:5000/api'; */
const API_BASE = 'https://h2c-backend-hke4dgfyfrbpavee.polandcentral-01.azurewebsites.net/api';
const TOKEN_KEY = 'worker_token';
const PROFILE_KEY = 'worker_profile';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private profileSubject = new BehaviorSubject<WorkerProfile | null>(this.loadProfile());
  profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  getProfile(): Observable<WorkerProfile | null> {
    return this.profile$;
  }

  login(req: WorkerLoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/worker/auth/login`, req).pipe(
      tap(res => this.persist(res)),
      catchError(err => {
        if (err.status === 503 && err.error?.code === 'PORTAL_DISABLED') {
          this.router.navigate(['/portal-inactive']);
          return throwError(() => new Error('PORTAL_DISABLED'));
        }
        return throwError(() => new Error(err.error?.message ?? 'Login failed'));
      })
    );
  }

  signup(req: WorkerSignupRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_BASE}/worker/auth/signup`, req);
  }

  setOnline(isOnline: boolean): Observable<{ isOnline: boolean }> {
    return this.http.patch<{ isOnline: boolean }>(`${API_BASE}/worker/me/online`, { isOnline }).pipe(
      tap(() => {
        const current = this.profileSubject.value;
        if (current) {
          const updated = { ...current, isOnline };
          localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
          this.profileSubject.next(updated);
        }
      })
    );
  }

  refreshProfile(): Observable<WorkerProfile> {
    return this.http.get<WorkerProfile>(`${API_BASE}/worker/me`).pipe(
      tap(p => {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
        this.profileSubject.next(p);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    this.profileSubject.next(null);
    this.router.navigate(['/login']);
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    const profile = this.mapApiProfile(res.worker);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    this.profileSubject.next(profile);
  }

  private mapApiProfile(raw: any): WorkerProfile {
    return {
      id: String(raw.id),
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: raw.phone,
      city: raw.city,
      serviceType: raw.serviceType,
      status: raw.status,
      rating: raw.rating,
      completedJobs: raw.completedJobs,
      isOnline: raw.isOnline,
      initials: raw.initials,
      joinedDate: new Date(raw.joinedDate),
      approvedDate: raw.approvedDate ? new Date(raw.approvedDate) : undefined,
    };
  }

  private loadProfile(): WorkerProfile | null {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
