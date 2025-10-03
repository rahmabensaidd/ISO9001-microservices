export interface Candidate {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  resume: string; // Base64 string for PDF
  gender: string;
  jobOffers?: { id: number; title: string }[]; // Updated to match backend response
  status?: 'Pending' | 'Accepted' | 'Rejected'; // Nouveau champ : statut
  applicationDate?: string; // ISO string (ex. "2025-03-27T12:00:00")
  acceptDate?: string | null; // ISO string ou null
  score?: number; // Champ ajouté pour le scoring
}
