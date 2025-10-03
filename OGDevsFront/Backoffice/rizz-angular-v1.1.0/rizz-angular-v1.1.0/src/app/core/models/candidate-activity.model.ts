export interface CandidateActivity {
  id?: number;
  title: string;
  description: string;
  time: string;
  icon: string;
  badges?: string[];
  action?: { label: string; url?: string; callback?: () => void }; // Ajouté pour le CV
}
