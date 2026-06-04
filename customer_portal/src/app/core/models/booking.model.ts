export type ServiceType = 'StandardClean' | 'DeepClean' | 'MoveInOut' | 'PostConstruction' | 'OfficeClean';
export type BookingStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';

export interface Booking {
  id: number;
  bookingNumber: string;
  serviceType: string;
  address: string;
  scheduledAt: string;        // ISO date string from API
  durationMinutes: number;
  price: number;
  status: string;             // Scheduled | InProgress | Completed | Cancelled
  notes?: string;
  createdAt: string;
  paymentStatus?: string;
  customerRating?: number;
  customerReview?: string;
  reviewedAt?: string;
  worker?: {
    id: number;
    fullName: string;
    phone?: string;
    rating?: number;
    completedJobs?: number;
    serviceType?: string;
    initials?: string;
  };
}

export interface CreateBookingDto {
  serviceType: string;
  address: string;
  scheduledAt: string;
  durationMinutes: number;
  price: number;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface ServiceOption {
  type: string;
  label: string;
  tagline: string;
  icon: string;
  ratePerHour: number;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  { type: 'StandardClean', label: 'Standard clean',  tagline: 'Regular tidy — surfaces, floors, bathrooms',        icon: '🧹', ratePerHour: 25 },
  { type: 'DeepClean',     label: 'Deep clean',      tagline: 'Top to bottom — inside appliances, every corner',   icon: '✨', ratePerHour: 35 },
  { type: 'OfficeClean',   label: 'Office clean',    tagline: 'Commercial spaces and shared areas',                 icon: '🏢', ratePerHour: 30 },
  { type: 'MoveInOut',     label: 'Move-out clean',  tagline: 'End of tenancy — deposit-back standard',            icon: '📦', ratePerHour: 30 },
];
