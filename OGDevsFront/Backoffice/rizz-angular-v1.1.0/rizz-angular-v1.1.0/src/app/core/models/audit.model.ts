export interface Audit {
  id?: number;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  process?: { id?: number; procName?: string } | null;
  operation?: { id?: number; operationName?: string } | null;
}

export interface AuditNotification {
  id: number;
  message: string;
  timestamp: Date;
}
