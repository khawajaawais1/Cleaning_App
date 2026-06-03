export interface LiveJob {
  id: string;
  bookingId: string;
  bookingNumber: string;
  workerId: string;
  worker: {
    firstName: string;
    lastName: string;
    phone: string;
    avatar?: string;
    rating: number;
  };
  customerId: string;
  customer: {
    firstName: string;
    lastName: string;
    address: string;
  };
  jobType: string;
  status: 'in_progress' | 'on_break' | 'completing_soon';
  startTime: Date;
  estimatedEndTime: Date;
  actualEndTime?: Date;
  progressPercentage: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  lastUpdateTime: Date;
}

export interface LiveJobStats {
  activeJobs: number;
  onBreak: number;
  completingSoon: number;
}
