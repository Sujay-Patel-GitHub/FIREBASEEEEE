'use server';
/**
 * @fileOverview This flow analyzes an image and returns a score based on edge detection.
 *
 * - getEdgeDetectionScore - A function that takes an image and returns an edge detection score.
 * - EdgeDetectionScoreInput - The input type for the getEdgeDetectionScore function.
 * - EdgeDetectionScoreOutput - The return type for the getEdgeDetectionScore function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EdgeDetectionScoreInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EdgeDetectionScoreInput = z.infer<typeof EdgeDetectionScoreInputSchema>;

const EdgeDetectionScoreOutputSchema = z.object({
  score: z.number().describe('A score from 0 to 100 representing the complexity and clarity of edges in the image. Higher scores indicate more complex or numerous edges.'),
});
export type EdgeDetectionScoreOutput = z.infer<typeof EdgeDetectionScoreOutputSchema>;

const prompt = ai.definePrompt({
  name: 'edgeDetectionScorePrompt',
  input: { schema: EdgeDetectionScoreInputSchema },
  output: { schema: EdgeDetectionScoreOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an expert image analysis AI. Your task is to analyze the edges in the provided image of a plant leaf.

  Evaluate the complexity and clarity of the edges. A simple, smooth-edged leaf should have a low score. A leaf with many intricate edges, serrations, or damage should have a high score. Return a single numerical score from 0 to 100.

  Image to analyze: {{media url=photoDataUri}}`,
});

const edgeDetectionScoreFlow = ai.defineFlow(
  {
    name: 'edgeDetectionScoreFlow',
    inputSchema: EdgeDetectionScoreInputSchema,
    outputSchema: EdgeDetectionScoreOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function getEdgeDetectionScore(
  input: EdgeDetectionScoreInput
): Promise<EdgeDetectionScoreOutput> {
  return edgeDetectionScoreFlow(input);
}
