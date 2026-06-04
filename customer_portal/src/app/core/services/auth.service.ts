import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthToken } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/customer`;
  private readonly TOKEN_KEY = 'h2c_token';
  private readonly USER_KEY  = 'h2c_user';

  private _user$ = new BehaviorSubject<AuthToken | null>(this.loadUser());
  user$ = this._user$.asObservable();

  constructor(private http: HttpClient) {}

  get isLoggedIn(): boolean { return !!this._user$.value; }
  get currentUser(): any  { return this._user$.value; }

  register(payload: { fullName: string; email: string; phone: string; address: string; password: string }): Observable<AuthToken> {
    return this.http.post<AuthToken>(`${this.apiUrl}/register`, payload)
      .pipe(tap(r => this.persist(r)));
  }

  login(email: string, password: string): Observable<AuthToken> {
    return this.http.post<AuthToken>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(r => this.persist(r)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._user$.next(null);
  }

  getToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }

  private persist(r: AuthToken): void {
    localStorage.setItem(this.TOKEN_KEY, r.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(r));
    this._user$.next(r);
  }

  private loadUser(): AuthToken | null {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY) ?? 'null'); }
    catch { return null; }
  }
}
