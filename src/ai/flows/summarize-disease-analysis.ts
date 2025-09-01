'use server';

/**
 * @fileOverview Summarizes the detailed disease analysis into key insights and recommended actions.
 *
 * - summarizeDiseaseAnalysis - A function that summarizes the disease analysis.
 * - SummarizeDiseaseAnalysisInput - The input type for the summarizeDiseaseAnalysis function.
 * - SummarizeDiseaseAnalysisOutput - The return type for the summarizeDiseaseAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDiseaseAnalysisInputSchema = z.object({
  plantSpecies: z.string().describe('The species of the plant.'),
  diseaseDetection: z.string().describe('The detected disease name and description.'),
  severityLevel: z.string().describe('The severity level of the disease.'),
  confidenceScore: z.number().describe('The confidence score of the disease detection.'),
  causeOfDisease: z.string().describe('The cause of the disease.'),
  treatmentRecommendations: z.string().describe('The treatment recommendations for the disease.'),
});
export type SummarizeDiseaseAnalysisInput = z.infer<typeof SummarizeDiseaseAnalysisInputSchema>;

const SummarizeDiseaseAnalysisOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the disease analysis, including key insights and recommended actions.'),
});
export type SummarizeDiseaseAnalysisOutput = z.infer<typeof SummarizeDiseaseAnalysisOutputSchema>;

const prompt = ai.definePrompt({
  name: 'summarizeDiseaseAnalysisPrompt',
  input: {schema: SummarizeDiseaseAnalysisInputSchema},
  output: {schema: SummarizeDiseaseAnalysisOutputSchema},
  prompt: `You are an AI assistant that summarizes disease analysis of plants.

  Summarize the following disease analysis into key insights and recommended actions. Be concise and clear.

  Plant Species: {{{plantSpecies}}}
  Disease Detection: {{{diseaseDetection}}}
  Severity Level: {{{severityLevel}}}
  Confidence Score: {{{confidenceScore}}}
  Cause of Disease: {{{causeOfDisease}}}
  Treatment Recommendations: {{{treatmentRecommendations}}}
  `,
});

const summarizeDiseaseAnalysisFlow = ai.defineFlow(
  {
    name: 'summarizeDiseaseAnalysisFlow',
    inputSchema: SummarizeDiseaseAnalysisInputSchema,
    outputSchema: SummarizeDiseaseAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function summarizeDiseaseAnalysis(input: SummarizeDiseaseAnalysisInput): Promise<SummarizeDiseaseAnalysisOutput> {
  return summarizeDiseaseAnalysisFlow(input);
}
