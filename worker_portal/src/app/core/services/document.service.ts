import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkerDocument, REQUIRED_DOCUMENTS } from '../models/document.model';

/* const API_BASE = 'http://localhost:5000/api'; */
const API_BASE = 'https://h2c-backend-hke4dgfyfrbpavee.polandcentral-01.azurewebsites.net/api';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  constructor(private http: HttpClient) {}

  getDocuments(): Observable<WorkerDocument[]> {
    return this.http.get<any[]>(`${API_BASE}/worker/documents`).pipe(
      map(docs => docs.map(this.mapDoc))
    );
  }

  uploadDocument(type: string, file: File): Observable<WorkerDocument> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('documentType', type);
    return this.http.post<any>(`${API_BASE}/worker/documents`, fd).pipe(
      map(this.mapDoc)
    );
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/worker/documents/${id}`);
  }

  private mapDoc(raw: any): WorkerDocument {
    return {
      id: String(raw.id),
      type: raw.type as WorkerDocument['type'],
      label: raw.label ?? REQUIRED_DOCUMENTS.find(d => d.type === raw.type)?.label ?? raw.type,
      status: raw.status,
      uploadedAt: raw.uploadedAt ? new Date(raw.uploadedAt) : undefined,
      verifiedAt: raw.verifiedAt ? new Date(raw.verifiedAt) : undefined,
      expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : undefined,
      fileUrl: raw.blobUrl,
      fileName: raw.fileName,
      rejectionReason: raw.rejectionReason,
    };
  }
}
