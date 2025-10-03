// src/app/core/models/contract-client.model.ts
export interface ContractClient {
  id: number;
  contractNumber: string;
  title: string;
  value: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  clientId: string;
  clientUsername: string;
  signature?: string | null;
}

export enum ContractStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED'
}
