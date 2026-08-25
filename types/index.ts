export type UserRole = "CUSTOMER" | "WORKER" | "ADMIN";

export type TradeType = 
  | "CARPENTER" 
  | "PLUMBER" 
  | "MASON" 
  | "PAINTER" 
  | "UNSKILLED_LABOUR";

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type JobStatus = 
  | "RESERVATION_OPEN" 
  | "ACCEPTED" 
  | "IN_PROGRESS" 
  | "PENDING_MUTUAL_CONFIRMATION" 
  | "COMPLETED" 
  | "CANCELLED" 
  | "DISPUTED";

export type PaymentStatus = 
  | "PENDING" 
  | "HELD" 
  | "READY_FOR_RELEASE" 
  | "RELEASED" 
  | "REFUNDED";

export type Language = "en" | "hi" | "pa";

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  preferredLanguage: Language;
  verificationStatus: VerificationStatus;
  trade?: TradeType;
  hourlyRate?: number;
  totalJobsCompleted?: number;
  totalEarnings?: number;
  createdAt: any;
  updatedAt: any;
}

export interface Job {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  workerId?: string;
  workerName?: string;
  workerPhone?: string;
  category: TradeType;
  title: string;
  description?: string;
  startDate: any; // Timestamp or ISO string
  endDate: any;
  shiftStartTime: string; // e.g. "09:00"
  shiftEndTime: string;   // e.g. "14:00"
  hoursPerDay: number;
  totalDays: number;
  hourlyRate: number;
  baseLaborCost: number;
  platformCommission: number;
  totalCustomerPayment: number;
  workerEarnings: number;
  worksiteAddress: string;
  worksiteLat?: number;
  worksiteLng?: number;
  status: JobStatus;
  customerCompletionConfirmed: boolean;
  workerCompletionConfirmed: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Reservation {
  id: string;
  jobId: string;
  workerId: string;
  customerId: string;
  startDate: any;
  endDate: any;
  shiftStartTime: string;
  shiftEndTime: string;
  status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: any;
}

export interface Payment {
  id: string;
  jobId: string;
  customerPayment: number;
  workerAmount: number;
  platformCommission: number;
  status: PaymentStatus;
  createdAt: any;
  updatedAt: any;
}

export interface Dispute {
  id: string;
  jobId: string;
  raisedByUid: string;
  raisedByRole: UserRole;
  reason: string;
  status: "OPEN" | "RESOLVED_REFUND_CUSTOMER" | "RESOLVED_PAY_WORKER" | "RESOLVED_SPLIT";
  resolutionNotes?: string;
  resolvedByAdminUid?: string;
  createdAt: any;
  updatedAt: any;
}

export interface AuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  targetId: string;
  targetType: "JOB" | "USER" | "RESERVATION";
  details: Record<string, any>;
  timestamp: any;
}
