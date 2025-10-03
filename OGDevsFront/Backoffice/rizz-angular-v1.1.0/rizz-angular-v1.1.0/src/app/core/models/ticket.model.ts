// src/app/core/models/ticket.model.ts
export interface UserEntity {
  id: string;
  username: string;
  email?: string;
  roles?: string[];
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED'
}

export enum TicketType {
  REQUEST = 'REQUEST',
  INCIDENT = 'INCIDENT',
  QUESTION = 'QUESTION'
}

export interface Ticket {
  id?: number;
  title: string;
  description: string;
  createdAt?: string; // ISO string pour LocalDateTime
  status: TicketStatus;
  type: TicketType;
  client?: UserEntity;
}
