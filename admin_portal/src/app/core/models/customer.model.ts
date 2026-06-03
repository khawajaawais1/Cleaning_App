export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  avatar?: string;
  createdAt: Date;
  totalSpent: number;
  bookingCount: number;
}
