import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../core/services/document.service';
import { WorkerDocument, REQUIRED_DOCUMENTS, DocumentType } from '../../core/models/document.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent implements OnInit {
  docs: WorkerDocument[] = [];
  loading = true;
  uploading: DocumentType | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  pendingUploadType: DocumentType | null = null;

  requiredDocs = REQUIRED_DOCUMENTS;

  constructor(private docService: DocumentService) {}

  ngOnInit(): void {
    this.docService.getDocuments().subscribe(docs => {
      this.docs = docs;
      this.loading = false;
    });
  }

  getDoc(type: DocumentType): WorkerDocument | undefined {
    return this.docs.find(d => d.type === type);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      verified: 'pill-green', pending: 'pill-amber', rejected: 'pill-red', expired: 'pill-red',
    };
    return map[status] ?? 'pill-gray';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      verified: 'Verified', pending: 'Under review', rejected: 'Rejected', expired: 'Expired',
    };
    return map[status] ?? status;
  }

  triggerUpload(type: DocumentType): void {
    this.pendingUploadType = type;
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.pendingUploadType) return;
    this.uploading = this.pendingUploadType;
    this.docService.uploadDocument(this.pendingUploadType, file).subscribe(doc => {
      const idx = this.docs.findIndex(d => d.type === doc.type);
      if (idx >= 0) this.docs[idx] = doc;
      else this.docs = [...this.docs, doc];
      this.uploading = null;
      this.pendingUploadType = null;
    });
  }

  get verifiedCount(): number {
    return this.requiredDocs.filter(rd => this.getDoc(rd.type)?.status === 'verified').length;
  }
}
