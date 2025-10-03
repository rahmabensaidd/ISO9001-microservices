// @core/models/survey.model.ts
export interface SurveyDTO {
  id?: number; // Long in Java, nullable
  title: string;
  type: SurveyType;
  questions: string; // JSON string
  responses?: string; // JSON string, nullable
  questionStats?: string; // JSON string, nullable
  score?: number; // Double in Java, nullable
  responseDate?: string; // Nullable
  status?: SurveyStatus; // Nullable
  feedback?: string; // Nullable
  contractClientId?: number; // Long, nullable
  projectId?: number; // Long, nullable
  meetingId?: number; // Long, nullable
  ticketId?: number; // Long, nullable
  filledById: string;
  filledByUsername: string;
}

export interface CreateSurveyRequest {
  title: string;
  type: SurveyType;
  contractClientId?: number; // Long, nullable
  projectId?: number; // Long, nullable
  meetingId?: number; // Long, nullable
  ticketId?: number; // Long, nullable
  responses: SurveyResponse[];
  feedback?: string;
}

export interface SurveyResponse {
  questionId: number; // Long in Java
  answer: string; // "1" to "5"
}

export interface Question {
  id: number;
  text: string;
}

export interface GamificationInfo {
  points: number; // int
  badges: string[]; // Set<String>
  rewards: string[]; // Set<String>
}

export interface SurveyStats {
  averageScore: number | null; // Double, nullable
  questionAverages: { [key: number]: number | null }; // Map<Long, Double>
  scoreDistribution: { [key: string]: number }; // Map<String, Integer>
}

export interface TrendData {
  date: string;
  averageScore: number | null; // Double, nullable
}

export interface SatisfactionAnalysis {
  overallSatisfaction: number | null; // Double, nullable
  satisfactionByType: { [key: string]: number | null }; // Map<String, Double>
  satisfactionTrends: TrendData[]; // List<TrendData>
  alerts: string[]; // List<String>
}

export interface ContractClientDTO {
  id: number; // Long
  contractNumber: string;
  title: string;
  value: number; // Double
  startDate: string;
  endDate: string;
  status: string;
  clientId: string;
  clientUsername: string;
}

export interface MeetingResponseDTO {
  meetingid: number; // Long
  meetingStatus: string;
  meetingDate: string;
  meetingTime: string;
  meetingDuration: number; // Long
  meetingLink: string;
  password: string;
}

export interface ProjectResponseDTO {
  idProjet: number; // Long
  name: string;
  projectType: string;
  requirements: string[];
  technologies: string[];
  description: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate: string;
  heuresRealisees: number; // Long
}

export interface TicketResponseDTO {
  id: number; // Long
  title: string;
  description: string;
  createdAt: string;
  status: string;
  type: string;
}

export enum SurveyType {
  CONTRACT = 'CONTRACT',
  PROJECT = 'PROJECT',
  MEETING = 'MEETING',
  TICKET = 'TICKET'
}

export enum SurveyStatus {
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED'
}
