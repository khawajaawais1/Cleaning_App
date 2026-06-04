export interface EarningRecord {
  id: string;
  jobId: string;
  bookingRef: string;
  serviceType: string;
  customerName: string;
  date: Date;
  amount: number;
  status: 'pending' | 'paid';
  paidAt?: Date;
}

export interface EarningsSummary {
  totalThisWeek: number;
  totalThisMonth: number;
  totalAllTime: number;
  pendingPayout: number;
  jobsThisWeek: number;
  jobsThisMonth: number;
  averagePerJob: number;
}
