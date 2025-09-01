import { config } from 'dotenv';
config();

import '@/ai/flows/explain-disease-severity.ts';
import '@/ai/flows/summarize-disease-analysis.ts';
import '@/ai/flows/analyze-leaf-flow.ts';
import '@/ai/flows/edge-detection-flow.ts';
