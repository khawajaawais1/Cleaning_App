export interface ExtensionRequest {
  id: string;
  bookingId: string;
  bookingNumber: string;
  workerId: string;
  worker: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  customerId: string;
  customer: {
    firstName: string;
    lastName: string;
    address?: string;
  };
  jobType: string;
  originalEndTime: Date;
  newEndTime: Date;
  requestedMinutes: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied' | 'asked_worker';
  jobProgress: {
    completedMinutes: number;
    totalMinutes: number;
  };
  requestedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  denialNote?: string;
}

export interface ExtensionStats {
  pendingCount: number;
  todayCount: number;
}
