export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
}

export interface AuthToken {
  token: string;
  fullName: string;
  email: string;
  customerId: number;
}
