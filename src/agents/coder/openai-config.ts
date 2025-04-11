import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

if (!process.env.OPENAI_BASE_URL) {
  throw new Error('OPENAI_BASE_URL is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export const defaultModel = process.env.OPENAI_MODEL || 'google/gemini-2.0-flash-exp:free';

export interface OpenAIConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export const defaultConfig: OpenAIConfig = {
  model: defaultModel,
  temperature: 0.7,
  maxTokens: 8000,
};