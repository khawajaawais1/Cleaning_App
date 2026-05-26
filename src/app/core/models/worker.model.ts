export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  rating: number;
  completedJobs: number;
  city: string;
  isOnline: boolean;
  initials?: string;
  appliedDate: Date;
  approvedDate?: Date;
  rejectionReason?: string;
  avatar?: string;
  documents?: WorkerDocument[];
}

export interface WorkerDocument {
  id: string;
  type: string;
  url: string;
  verified: boolean;
}

export interface WorkerApplication {
  id: string;
  worker: Worker;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface CreateWorkerRequest {
  
  fullName?: string;
  email: string;
  password?: string;
  phone: string;
  city: string;
  serviceType: string;
  rating: number;
  completedJobs: number;
  isOnline: boolean;
}
