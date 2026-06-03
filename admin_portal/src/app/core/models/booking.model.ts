export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  workerId?: string;
  worker?: {
    firstName: string;
    lastName: string;
    rating: number;
  };
  serviceType: string;
  address: string;
  latitude?: number;
  longitude?: number;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  price: number;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingStats {
  totalBookings: number;
  todaysBookings: number;
  completedThisMonth: number;
  cancelledThisMonth: number;
  totalRevenue: number;
}
