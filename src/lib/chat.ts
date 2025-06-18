import OpenAI from 'openai';
import { Stream } from 'openai/core/streaming';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

const client = new OpenAI({ 
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const systemPrompt: ChatCompletionMessageParam = {
  role: 'system',
  content: `You are Petunia chat, a helpful chat bot.
  Only identify yourself if you're asked to.`,
}

const threadTitlePrompt: ChatCompletionMessageParam = {
  role: 'system',
  content: `Generate a summary up to 5 words describing the input message being given.
  Use plain text only. Do not exceed 5 words. Use sentence casing but do not end the sentence with a period
  Do not attempt to answer the question, and do not preface with any sort of text mentioning that this is a summary,
  only provide a summary of the input.`
}

export const chatStream = async (chatMessages: Array<ChatCompletionMessageParam>, model: string): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & { _request_id?: string | null; }> => {
  return client.chat.completions.create({
    messages: [systemPrompt, ...chatMessages],
    model,
    stream: true,
  })
}

export const generateThreadTitle = async (userMessage: string): Promise<string | null> => {
  const result = await client.chat.completions.create({
    model: 'google/gemini-2.5-flash-preview-05-20',
    messages: [threadTitlePrompt, { role: 'user', content: userMessage }]
  });

  return result.choices[0].message.content;  
}
