import {Objective} from "@/app/core/models/process.model";

export interface Indicator {
  idIndicateur: number; // Change from id to idIndicateur if required
  name:string;
  code: string;
  libelle: string;
  description: string;
  unit: string;
  actualValue: number;
  targetValue: number;
}
export interface IndicatorDTO {
  idIndicateur: number;
  code: string;
  libelle: string;
  description: string;
  type: string;
  frequence: string;
  unite: string;
  cible: number;
  currentValue: number;
  status: string;
  lastCalculated: string; // Will be null or derived
  actif: boolean;
  nonConformitiesCount: number;
}

export enum IndicatorType {
  PERCENTAGE = 'PERCENTAGE',
  COUNT = 'COUNT',
  TIME = 'TIME',
  RATING = 'RATING'
}

export enum Frequency {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}
