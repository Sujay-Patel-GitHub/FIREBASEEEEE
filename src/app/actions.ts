'use server';

import { ai } from '@/ai/genkit';
import { generate } from 'genkit';
import { z } from 'zod';

// Define the message structure for a consistent chat history
export interface CoreMessage {
  role: 'user' | 'assistant';
  content: string;
}

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: z.array(z.custom<CoreMessage>()),
    outputSchema: z.string(),
  },
  async (history) => {
    const systemPrompt = "You are HARITRAKSHAK, an expert botanist and AI assistant. Your goal is to provide helpful, accurate, and concise information about plant care, disease identification, and general botany. Be friendly and accessible to users of all knowledge levels.";
    
    // Convert history to a format suitable for the prompt
    const promptHistory = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `${systemPrompt}\n\n${promptHistory}`,
    });

    return response.text;
  }
);

export async function getChatbotResponse(history: CoreMessage[]): Promise<string> {
    return await chatbotFlow(history);
}
