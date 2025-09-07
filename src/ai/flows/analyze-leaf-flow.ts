'use server';
/**
 * @fileOverview This flow analyzes a leaf image for diseases and returns the analysis in the specified language.
 *
 * - analyzeLeaf - a function that takes an image and returns a disease analysis.
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
  targetLanguage: z.string().optional().describe('The target language for the analysis report (e.g., "English", "Hindi", "Gujarati"). Defaults to English.'),
});
export type AnalyzeLeafInput = z.infer<typeof AnalyzeLeafInputSchema>;

const AnalyzeLeafOutputSchema = z.object({
  isPlant: z.boolean().describe('Whether the image contains a plant or not.'),
  plantSpecies: z.string().describe('The identified species of the plant. This must be a specific name, not a generic term like "plant".'),
  diseaseDetection: z.object({
    name: z
      .string()
      .describe(
        'The name of the detected disease. Should be "Healthy" if no disease is detected.'
      ),
    description: z
      .string()
      .describe('A brief description of the detected disease.'),
  }),
  severity: z.object({
    level: z
      .enum(['Low', 'Medium', 'High', 'N/A'])
      .describe('The severity level of the disease. N/A if healthy.'),
    score: z
      .number()
      .describe('A numerical score for the severity from 0 to 100.'),
  }),
  confidenceScore: z
    .number()
    .describe('The confidence score (0-100) of the overall analysis.'),
  cause: z.string().describe('The probable cause of the disease.'),
  treatment: z
    .array(z.string())
    .describe('A list of treatment recommendations.'),
  summaryForChatbot: z.string().describe('A friendly, conversational summary of the analysis to be used as an initial message in a chatbot.'),
});
export type AnalyzeLeafOutput = z.infer<typeof AnalyzeLeafOutputSchema>;

const prompt = ai.definePrompt({
  name: 'analyzeLeafPrompt',
  input: { schema: AnalyzeLeafInputSchema },
  output: { schema: AnalyzeLeafOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a world-renowned botanist and plant pathologist. Your primary task is to analyze an image of a plant leaf and provide a detailed diagnosis.

  **CRITICAL INSTRUCTION:** You MUST generate the entire response (all text fields in the output schema) in the following language: {{{targetLanguage}}}. If no language is specified, default to English.

  **Critical Analysis Steps:**

  1.  **Image Validation:** First, determine if the image contains a plant leaf. If not, you must set 'isPlant' to false and provide sensible defaults for all other fields, clearly stating that no plant was detected.
  2.  **Species Identification (Priority):** If it is a plant, you **must** identify the specific plant species. It is crucial that you provide a specific common or Latin name. Do not use generic terms like "Plant".
  3.  **Disease Identification:** Identify any diseases present on the leaf. If the plant is healthy, the disease name must be 'Healthy'.
  4.  **Severity Assessment:** Determine the severity of the disease (Low, Medium, High). If healthy, set severity to 'N/A' and score to 0.
  5.  **Confidence Score:** Provide a confidence score (0-100) for your complete analysis.
  6.  **Cause Analysis:** Describe the probable cause of the disease. If the leaf is healthy, state that.
  7.  **Treatment Plan:** Provide a list of actionable treatment recommendations. If healthy, provide general care tips suitable for the identified plant species.
  8.  **Chatbot Summary:** Create a friendly, conversational summary of the key findings. This will be shown to the user in a chatbot. Start with a summary of the findings and end by asking "Do you have any other questions about this analysis?".

  Begin your analysis now on the following image: {{media url=photoDataUri}}`,
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

export async function analyzeLeaf(
  input: AnalyzeLeafInput
): Promise<AnalyzeLeafOutput> {
  return analyzeLeafFlow(input);
}
