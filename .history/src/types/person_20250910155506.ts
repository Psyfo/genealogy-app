export interface Person {
  id: string;
  // Basic Information
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  suffix?: string; // Jr., Sr., III, etc.
  
  // Personal Details
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string; // ISO date string (YYYY-MM-DD)
  birthPlace?: string;
  deathDate?: string; // ISO date string (YYYY-MM-DD)
  deathPlace?: string;
  causeOfDeath?: string;
  
  // Physical Description
  height?: string;
  weight?: string;
  eyeColor?: string;
  hairColor?: string;
  distinguishingMarks?: string;
  
  // Family Information
  fatherId?: string;
  motherId?: string;
  spouseIds?: string[];
  childrenIds?: string[];
  siblingIds?: string[];
  
  // Professional & Education
  occupation?: string;
  employer?: string;
  education?: string;
  militaryService?: string;
  
  // Contact & Location
  currentAddress?: string;
  phoneNumber?: string;
  email?: string;
  
  // Additional Details
  nationality?: string;
  ethnicity?: string;
  religion?: string;
  politicalAffiliation?: string;
  
  // Life Events
  baptismDate?: string;
  confirmationDate?: string;
  marriageDate?: string;
  marriagePlace?: string;
  divorceDate?: string;
  
  // Medical Information
  bloodType?: string;
  medicalConditions?: string[];
  allergies?: string[];
  
  // Notes & Research
  notes?: string;
  researchNotes?: string;
  sources?: string[];
  lastUpdated?: string;
  createdBy?: string;
  
  // Legacy Fields (for backward compatibility)
  name?: string; // Computed from firstName + lastName
  birthYear?: number; // Computed from birthDate
  deathYear?: number; // Computed from deathDate
}
