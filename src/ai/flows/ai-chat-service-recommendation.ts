'use server';
/**
 * @fileOverview An AI-powered concierge that provides tailored safety advice
 * and recommends SafeRwanda services based on user queries.
 *
 * - aiChatServiceRecommendation - A function that handles the safety advice and service recommendation process.
 * - AIChatServiceRecommendationInput - The input type for the aiChatServiceRecommendation function.
 * - AIChatServiceRecommendationOutput - The return type for the aiChatServiceRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatServiceRecommendationInputSchema = z.object({
  query: z
    .string()
    .describe('The user\u0027s safety-related question or security concern.'),
});
export type AIChatServiceRecommendationInput = z.infer<
  typeof AIChatServiceRecommendationInputSchema
>;

const AIChatServiceRecommendationOutputSchema = z.object({
  advice: z
    .string()
    .describe('Tailored safety advice based on the user\u0027s query.'),
  recommendedServices: z
    .array(z.string())
    .describe('A list of SafeRwanda services recommended for the user\u0027s needs.'),
});
export type AIChatServiceRecommendationOutput = z.infer<
  typeof AIChatServiceRecommendationOutputSchema
>;

const prompt = ai.definePrompt({
  name: 'aiChatServiceRecommendationPrompt',
  input: {schema: AIChatServiceRecommendationInputSchema},
  output: {schema: AIChatServiceRecommendationOutputSchema},
  prompt: `You are the SafeRwanda AI Concierge, an expert in safety and security solutions.
Your role is to provide tailored advice and recommend the most suitable SafeRwanda services based on the user's query.

Here are the available SafeRwanda services:
- Child Protection
- Elderly Care
- Fire Prevention
- Property Security
- Asset Protection
- Neighborhood Surveillance
- Smart Community integration

Analyze the user's query carefully. First, provide clear, concise, and helpful advice. Second, select the services from the list above that are most relevant to their needs. If no service is directly applicable, you may recommend 'General Security Consulting' if it makes sense, but primarily focus on the listed services.

User Query: {{{query}}}`,
});

const aiChatServiceRecommendationFlow = ai.defineFlow(
  {
    name: 'aiChatServiceRecommendationFlow',
    inputSchema: AIChatServiceRecommendationInputSchema,
    outputSchema: AIChatServiceRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function aiChatServiceRecommendation(
  input: AIChatServiceRecommendationInput
): Promise<AIChatServiceRecommendationOutput> {
  return aiChatServiceRecommendationFlow(input);
}
