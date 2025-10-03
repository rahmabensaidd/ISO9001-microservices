
// src/app/services/nonconformance.model.ts
// nonconformance.model.ts
import {IndicatorDTO} from "@/app/services/indicator.model";

export interface NonConformityDTO {
  idNonConformity?: number;
  source: string;
  description: string;
  dateCreated: string;
  type?: string;
  status?: string;
  actionTaken?: string;
  fixDate?: string;
  detectedBy?: string;
  dateDetected?: string;
  fixedBy?: string;
  isEffective?: boolean;
  attachments?: string[];
  indicatorId?: number;
  indicator?: IndicatorDTO; // For display purposes
}
