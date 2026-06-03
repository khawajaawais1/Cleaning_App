import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExtensionRequest, ExtensionStats } from '../models/extension-request.model';

@Injectable({
  providedIn: 'root'
})
export class ExtensionRequestService {
  private apiUrl = `${environment.apiUrl}/extension-requests`;

  constructor(private http: HttpClient) {}

  getExtensionRequests(status?: string): Observable<ExtensionRequest[]> {
    const url = status ? `${this.apiUrl}?status=${status}` : this.apiUrl;
    return this.http.get<ExtensionRequest[]>(url);
  }

  getExtensionRequest(id: string): Observable<ExtensionRequest> {
    return this.http.get<ExtensionRequest>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<ExtensionStats> {
    return this.http.get<ExtensionStats>(`${this.apiUrl}/stats`);
  }

  approveRequest(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/approve`, {});
  }

  denyRequest(id: string, note: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/deny`, { adminNote: note });
  }

  askWorker(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/ask-worker`, {});
  }
}
