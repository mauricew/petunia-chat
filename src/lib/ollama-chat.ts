import ollama, { AbortableAsyncIterator, ChatResponse, Message } from "ollama";

const systemPrompt: Message = {
  role: 'system',
  content: `You are Petunia chat, a helpful chat bot.
  Only identify yourself if you're asked to`,
}

const threadTitlePrompt: Message = {
  role: 'system',
  content: `Generate a summary up to 5 words describing the input message being given.
  Use plain text only.
  Do not attempt to answer the question, and do not preface with any sort of text mentioning that this is a summary,
  only provide a summary of the input.`
}

export const chatStream = async (chatMessages: Array<Message>): Promise<AbortableAsyncIterator<ChatResponse>> =>
  ollama.chat({
    model: 'gemma3',
    messages: [systemPrompt, ...chatMessages],
    stream: true
  })

export const generateThreadTitle = async (userMessage: string): Promise<string> => {
  const result = await ollama.chat({
    model: 'llama3.2',
    messages: [threadTitlePrompt, { role: 'user', content: userMessage }]
  });

  return result.message.content;
}
