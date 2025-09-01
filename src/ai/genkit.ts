import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// IMPORTANT: The API key is hardcoded here as requested for personal use.
// For production applications, it is strongly recommended to use environment variables.
const GEMINI_API_KEY = "AIzaSyAHeOv8AfWeJIrugZO4kmiqyhm60Dz3Gk4";

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in src/ai/genkit.ts');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: GEMINI_API_KEY,
    }),
  ],
});
