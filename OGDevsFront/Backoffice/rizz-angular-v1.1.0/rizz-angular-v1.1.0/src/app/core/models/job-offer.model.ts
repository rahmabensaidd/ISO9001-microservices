export interface JobOffer {
  id?: number;
  title: string;
  description: string;
  location: string;
  requirements: string;
  contractType: 'CDI' | 'CDD' | 'CVP' | 'FREELANCE' | 'INTERIM';
  salary: number;
  skillsAndExpertise: string;
  workType: 'PRESENTIAL' | 'REMOTE' | 'HYBRID';
}
