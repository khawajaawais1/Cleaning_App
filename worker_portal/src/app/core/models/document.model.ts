export type DocumentType =
  | 'id_passport'
  | 'id_driving_licence'
  | 'id_national'
  | 'dbs_check'
  | 'proof_of_address'
  | 'right_to_work'
  | 'insurance';

export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export interface WorkerDocument {
  id: string;
  type: DocumentType;
  label: string;
  status: DocumentStatus;
  uploadedAt?: Date;
  verifiedAt?: Date;
  expiresAt?: Date;
  fileUrl?: string;
  fileName?: string;
  rejectionReason?: string;
}

export const REQUIRED_DOCUMENTS: { type: DocumentType; label: string; description: string }[] = [
  { type: 'id_passport',       label: 'Passport / Photo ID',    description: 'Government-issued photo identification' },
  { type: 'dbs_check',         label: 'DBS Certificate',        description: 'Enhanced DBS check (within last 3 years)' },
  { type: 'proof_of_address',  label: 'Proof of Address',       description: 'Utility bill or bank statement (within 3 months)' },
  { type: 'right_to_work',     label: 'Right to Work',          description: 'Evidence of right to work in the UK' },
];
