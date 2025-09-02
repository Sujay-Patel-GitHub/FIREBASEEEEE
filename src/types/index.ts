import type { Timestamp } from 'firebase/firestore';

export type AnalysisResult = {
  id: string;
  userId: string;
  imageUrl: string;
  analyzedAt: Date | Timestamp;
  isPlant: boolean;
  plantSpecies: string;
  diseaseDetection: {
    name: string;
    description: string;
  };
  severity: {
    level: 'Low' | 'Medium' | 'High' | 'N/A';
    score: number;
  };
  confidenceScore: number;
  cause: string;
  treatment: string[];
};
