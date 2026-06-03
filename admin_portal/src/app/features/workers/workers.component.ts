import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WorkerService } from '../../core/services/worker.service';
import { Worker, CreateWorkerRequest } from '../../core/models/worker.model';



@Component({
  selector: 'app-workers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.scss'],
})
export class WorkersComponent implements OnInit {
  workers: Worker[] = [];
  filteredWorkers: Worker[] = [];
  searchTerm = '';
  drawerOpen = false;
  editingWorker: Worker | null = null;
  form: FormGroup;
  submitting = false;
  submitError = '';

  constructor(private fb: FormBuilder, private workerService: WorkerService) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      phone: [''],
      city: [''],
      serviceType: [''],
      rating: [5.0, [Validators.min(0), Validators.max(5)]],
      completedJobs: [0, Validators.min(0)],
      isOnline: [true],
    });
  }

  ngOnInit(): void {
    this.loadWorkers();
  }

  loadWorkers(): void {
    this.workerService.getWorkers().subscribe({
      next: (data) => {
        this.workers = data;
        this.applyFilter();
      },
      error: () => {
        this.applyFilter();
      },
    });
  }

  get totalOnline(): number {
    return this.workers.filter(w => w.isOnline).length;
  }

  onSearch(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredWorkers = [...this.workers];
      return;
    }
    this.filteredWorkers = this.workers.filter(w =>
      `${w.firstName} ${w.lastName}`.toLowerCase().includes(term) ||
      w.email.toLowerCase().includes(term) ||
      (w.city || '').toLowerCase().includes(term)
    );
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0]?.substring(0, 2).toUpperCase() ?? '??';
  }

  getColorClass(initials: string): string {
    const map: Record<string, string> = {
      MK: 'av-mk', JR: 'av-jr', PN: 'av-pn',
      SO: 'av-so', AL: 'av-al', EV: 'av-ev',
    };
    return map[initials] ?? 'av-default';
  }

  openDrawer(worker?: Worker): void {
    this.editingWorker = worker ?? null;
    this.submitError = '';
    if (worker) {
      const fullName = `${worker.firstName} ${worker.lastName}`;
      this.form.patchValue({
        fullName,
        email: worker.email,
        password: '',
        phone: worker.phone ?? '',
        city: worker.city ?? '',
        serviceType: worker.serviceType ?? '',
        rating: worker.rating ?? 5.0,
        completedJobs: worker.completedJobs ?? 0,
        isOnline: worker.isOnline ?? true,
      });
    } else {
      this.form.reset({
        fullName: '', email: '', password: '', phone: '',
        city: '', serviceType: '', rating: 5.0, completedJobs: 0, isOnline: true,
      });
    }
    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.editingWorker = null;
    this.submitError = '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
   

    const dto: CreateWorkerRequest = {
      fullName: v.fullName,
      email: v.email,
      password: v.password || undefined,
      phone: v.phone,
      city: v.city,
      serviceType: v.serviceType,
      rating: v.rating,
      completedJobs: v.completedJobs,
      isOnline: v.isOnline,
    };

    this.submitting = true;
    this.submitError = '';

    if (this.editingWorker) {
      this.workerService.updateWorker(this.editingWorker.id, dto).subscribe({
        next: (updated) => {
          const idx = this.workers.findIndex(w => w.id === this.editingWorker!.id);
          if (idx !== -1) this.workers[idx] = updated;
          else this.workers = this.workers.map(w => w.id === this.editingWorker!.id ? updated : w);
          this.applyFilter();
          this.submitting = false;
          this.closeDrawer();
        },
        error: () => {
          // Optimistic update on error (API not available)
          const idx = this.workers.findIndex(w => w.id === this.editingWorker!.id);
          if (idx !== -1) {
            this.workers[idx] = {
              ...this.workers[idx], ...dto
            };
          }
          this.applyFilter();
          this.submitting = false;
          this.closeDrawer();
        },
      });
    } else {
      this.workerService.createWorker(dto).subscribe({
        next: (created) => {
          this.workers = [...this.workers, created];
          this.applyFilter();
          this.submitting = false;
          this.closeDrawer();
        },
        error: () => {
          
          this.workers = [...this.workers];
          this.applyFilter();
          this.submitting = false;
          this.closeDrawer();
        },
      });
    }
  }

  deleteWorker(id: string): void {
    if (!confirm('Are you sure you want to delete this worker?')) return;
    this.workerService.deleteWorker(id).subscribe({
      next: () => {
        this.workers = this.workers.filter(w => w.id !== id);
        this.applyFilter();
      },
      error: () => {
        // Optimistic delete on error (API not available)
        this.workers = this.workers.filter(w => w.id !== id);
        this.applyFilter();
      },
    });
  }
}
