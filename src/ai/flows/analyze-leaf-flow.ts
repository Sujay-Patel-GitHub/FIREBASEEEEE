'use server';
/**
 * @fileOverview This flow analyzes a leaf image for diseases.
 *
 * - analyzeLeaf - A function that takes an image and returns a disease analysis.
 * - AnalyzeLeafInput - The input type for the analyzeLeaf function.
 * - AnalyzeLeafOutput - The return type for the analyzeLeaf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeLeafInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeLeafInput = z.infer<typeof AnalyzeLeafInputSchema>;

const AnalyzeLeafOutputSchema = z.object({
  isPlant: z.boolean().describe('Whether the image contains a plant or not.'),
  plantSpecies: z.string().describe('The identified species of the plant.'),
  diseaseDetection: z.object({
    name: z.string().describe('The name of the detected disease. Should be "Healthy" if no disease is detected.'),
    description: z
      .string()
      .describe('A brief description of the detected disease.'),
  }),
  severity: z.object({
    level: z.enum(['Low', 'Medium', 'High', 'N/A']).describe('The severity level of the disease. N/A if healthy.'),
    score: z.number().describe('A numerical score for the severity from 0 to 100.'),
  }),
  confidenceScore: z
    .number()
    .describe('The confidence score (0-100) of the overall analysis.'),
  cause: z.string().describe('The probable cause of the disease.'),
  treatment: z.array(z.string()).describe('A list of treatment recommendations.'),
});
export type AnalyzeLeafOutput = z.infer<typeof AnalyzeLeafOutputSchema>;

export async function analyzeLeaf(input: AnalyzeLeafInput): Promise<AnalyzeLeafOutput> {
  return analyzeLeafFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLeafPrompt',
  input: { schema: AnalyzeLeafInputSchema },
  output: { schema: AnalyzeLeafOutputSchema },
  prompt: `You are a world-renowned botanist and plant pathologist. Your task is to analyze an image of a plant leaf.

  1.  First, determine if the image actually contains a plant leaf. If not, set 'isPlant' to false and provide reasonable defaults for other fields, stating that no plant was detected.
  2.  If it is a plant, identify the plant species.
  3.  Identify any diseases present on the leaf. If the plant is healthy, the disease name should be 'Healthy'.
  4.  Determine the severity of the disease (Low, Medium, High). If healthy, set severity to 'N/A' and score to 0.
  5.  Provide a confidence score for your analysis.
  6.  Describe the probable cause of the disease. If healthy, state that.
  7.  Provide a list of treatment recommendations. If healthy, provide general care tips for the plant.

  Image to analyze: {{media url=photoDataUri}}`,
});

const analyzeLeafFlow = ai.defineFlow(
  {
    name: 'analyzeLeafFlow',
    inputSchema: AnalyzeLeafInputSchema,
    outputSchema: AnalyzeLeafOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
