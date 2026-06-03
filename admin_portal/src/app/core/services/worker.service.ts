import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Worker, WorkerApplication, CreateWorkerRequest } from '../models/worker.model';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {
  private apiUrl = `${environment.apiUrl}/workers`;

  constructor(private http: HttpClient) {}

  getWorkers(status?: string): Observable<Worker[]> {
    const url = status ? `${this.apiUrl}?status=${status}` : this.apiUrl;
    return this.http.get<Worker[]>(url);
  }

  getWorker(id: string): Observable<Worker> {
    return this.http.get<Worker>(`${this.apiUrl}/${id}`);
  }

  createWorker(dto: CreateWorkerRequest): Observable<Worker> {
    return this.http.post<Worker>(`${this.apiUrl}`, dto);
  }

  updateWorker(id: string, dto: Partial<CreateWorkerRequest>): Observable<Worker> {
    return this.http.put<Worker>(`${this.apiUrl}/${id}`, dto);
  }

  deleteWorker(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getApplications(status?: string): Observable<WorkerApplication[]> {
    const url = status ? `${this.apiUrl}/applications?status=${status}` : `${this.apiUrl}/applications`;
    return this.http.get<WorkerApplication[]>(url);
  }

  approveWorker(id: string): Observable<Worker> {
    return this.http.post<Worker>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectWorker(id: string, reason: string): Observable<Worker> {
    return this.http.post<Worker>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  suspendWorker(id: string): Observable<Worker> {
    return this.http.post<Worker>(`${this.apiUrl}/${id}/suspend`, {});
  }

  restoreWorker(id: string): Observable<Worker> {
    return this.http.post<Worker>(`${this.apiUrl}/${id}/restore`, {});
  }
}
