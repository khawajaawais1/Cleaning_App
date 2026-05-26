import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  input?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-overlay" (click)="onCancel()">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <h2 class="dialog-title">{{ data.title }}</h2>
        <p class="dialog-message">{{ data.message }}</p>

        <textarea
          *ngIf="data.input"
          class="dialog-textarea"
          [(ngModel)]="inputValue"
          placeholder="Enter reason..."
        ></textarea>

        <div class="dialog-actions">
          <button class="btn btn-secondary" (click)="onCancel()">
            {{ data.cancelText || 'Cancel' }}
          </button>
          <button
            [ngClass]="data.isDangerous ? 'btn btn-danger' : 'btn btn-primary'"
            (click)="onConfirm()"
          >
            {{ data.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog-content {
      background: var(--card-bg);
      border-radius: 12px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .dialog-title {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .dialog-message {
      margin: 0 0 1.5rem 0;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .dialog-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
      resize: vertical;
      min-height: 100px;
    }

    .dialog-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.5rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-dark);
    }

    .btn-secondary {
      background: var(--border);
      color: var(--text-primary);
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }

    .btn-danger {
      background: var(--danger);
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
    }
  `]
})
export class ConfirmDialogComponent {
  inputValue = '';

  constructor(@Inject('data') public data: ConfirmDialogData) {}

  onConfirm(): void {
    // Callback would be handled by modal service
  }

  onCancel(): void {
    // Callback would be handled by modal service
  }
}
