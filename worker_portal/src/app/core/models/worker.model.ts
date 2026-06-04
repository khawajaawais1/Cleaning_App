export interface WorkerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  serviceType: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  rating: number;
  completedJobs: number;
  isOnline: boolean;
  initials?: string;
  avatar?: string;
  bio?: string;
  joinedDate: Date;
  approvedDate?: Date;
}

export interface WorkerSignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  serviceType: string;
}

export interface WorkerLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  worker: WorkerProfile;
}
