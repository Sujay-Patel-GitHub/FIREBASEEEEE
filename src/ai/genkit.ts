import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This function will be called by flows to get a configured Genkit instance.
export function configureGenkit() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable not set.');
  }

  return genkit({
    plugins: [
      googleAI({
        apiKey: process.env.GEMINI_API_KEY,
      }),
    ],
  });
}
