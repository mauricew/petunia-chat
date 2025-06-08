import ollama, { AbortableAsyncIterator, ChatResponse, Message } from "ollama";

const systemPrompt: Message = {
  role: 'system',
  content: `You are Petunia chat, a helpful chat bot.`,
}

export const chatStream = async (chatMessage: string): Promise<AbortableAsyncIterator<ChatResponse>> =>
  ollama.chat({
    model: 'gemma3',
    messages: [systemPrompt, { role: 'user', content: chatMessage }],
    stream: true
  })