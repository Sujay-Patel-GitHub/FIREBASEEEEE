'use server';

/**
 * @fileOverview This flow explains the severity of a plant disease in plain language.
 *
 * - explainDiseaseSeverity - A function that takes a disease severity level and returns an explanation.
 * - ExplainDiseaseSeverityInput - The input type for the explainDiseaseSeverity function.
 * - ExplainDiseaseSeverityOutput - The return type for the explainDiseaseSeverity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainDiseaseSeverityInputSchema = z.object({
  severityLevel: z
    .string()
    .describe("The severity level of the disease (e.g., 'low', 'medium', 'high')."),
});
export type ExplainDiseaseSeverityInput = z.infer<typeof ExplainDiseaseSeverityInputSchema>;

const ExplainDiseaseSeverityOutputSchema = z.object({
  explanation: z
    .string()
    .describe("A plain-language explanation of the disease's severity level."),
});
export type ExplainDiseaseSeverityOutput = z.infer<typeof ExplainDiseaseSeverityOutputSchema>;

export async function explainDiseaseSeverity(
  input: ExplainDiseaseSeverityInput
): Promise<ExplainDiseaseSeverityOutput> {
  return explainDiseaseSeverityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainDiseaseSeverityPrompt',
  input: {schema: ExplainDiseaseSeverityInputSchema},
  output: {schema: ExplainDiseaseSeverityOutputSchema},
  prompt: `You are an expert in plant diseases.

  Explain the severity level of the disease to the user in plain language.  Be concise and direct.

  Severity Level: {{{severityLevel}}}`,
});

const explainDiseaseSeverityFlow = ai.defineFlow(
  {
    name: 'explainDiseaseSeverityFlow',
    inputSchema: ExplainDiseaseSeverityInputSchema,
    outputSchema: ExplainDiseaseSeverityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
