import type { Timestamp } from 'firebase/firestore';

export type AnalysisResult = {
  id: string;
  imageUrl: string;
  analyzedAt: Date | Timestamp;
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
