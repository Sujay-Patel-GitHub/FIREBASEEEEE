'use server';
/**
 * @fileOverview This flow takes an image and returns an edge-detected version of it.
 *
 * - generateEdgeDetections - A function that takes an image and returns an edge-detected image.
 * - EdgeDetectionInput - The input type for the generateEdgeDetections function.
 * - EdgeDetectionOutput - The return type for the generateEdgeDetections function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EdgeDetectionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EdgeDetectionInput = z.infer<typeof EdgeDetectionInputSchema>;

const EdgeDetectionOutputSchema = z.object({
  edgeDetectedPhotoDataUri: z
    .string()
    .describe('The edge-detected image as a data URI.'),
});
export type EdgeDetectionOutput = z.infer<typeof EdgeDetectionOutputSchema>;

const prompt = ai.definePrompt({
  name: 'edgeDetectionPrompt',
  input: { schema: EdgeDetectionInputSchema },
  output: { schema: EdgeDetectionOutputSchema },
  prompt: `You are an expert image processing AI. Your task is to perform edge detection on the provided image.

  Generate an image that represents the Canny edge detection of the original image. The resulting image should have a black background with white edges outlining the shapes in the original photo.

  Image to process: {{media url=photoDataUri}}`,
});


const edgeDetectionFlow = ai.defineFlow(
  {
    name: 'edgeDetectionFlow',
    inputSchema: EdgeDetectionInputSchema,
    outputSchema: EdgeDetectionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateEdgeDetections(
  input: EdgeDetectionInput
): Promise<EdgeDetectionOutput> {
  return edgeDetectionFlow(input);
}
