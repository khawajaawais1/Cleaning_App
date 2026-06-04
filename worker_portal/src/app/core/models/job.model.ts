export type JobStatus =
  | 'assigned'
  | 'en_route'
  | 'in_progress'
  | 'extension_requested'
  | 'completed'
  | 'cancelled';

export interface JobLocation {
  address: string;
  city: string;
  postcode: string;
  lat?: number;
  lng?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  initials: string;
}

export interface Job {
  id: string;
  bookingRef: string;
  serviceType: string;
  status: JobStatus;
  customer: Customer;
  location: JobLocation;
  scheduledDate: Date;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: Date;
  actualEnd?: Date;
  durationMinutes: number;
  notes?: string;
  earnings: number;
  extensionRequest?: ExtensionRequest;
}

export interface ExtensionRequest {
  id: string;
  jobId: string;
  requestedMinutes: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  submittedAt: Date;
  reviewedAt?: Date;
  originalEnd: string;
  newEnd: string;
}

export interface JobInvite {
  id: string;
  job: Job;
  expiresAt: Date;
  distanceKm: number;
}
