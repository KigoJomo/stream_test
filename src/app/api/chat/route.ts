import { Role } from '@/lib/types/shared_types';
import { GoogleGenAI } from '@google/genai';
import { Message } from '../../../lib/types/shared_types';

const MODEL_NAME = 'gemini-2.0-flash';

export async function POST(request: Request) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const { prompt, history } = await request.json();

  let chatHistory: Message[] = [];

  if (history) {
    chatHistory = history;
  }

  const formattedHistory = chatHistory.map(
    (msg: { role: Role; text: string }) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    })
  );

  const chat = ai.chats.create({
    model: MODEL_NAME,
    history: formattedHistory,
  });

  const response = await chat.sendMessageStream({
    message: prompt,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of response) {
        controller.enqueue(encoder.encode(chunk.text));
      }
      controller.close();
    },
  });

  return new Response(stream);
}
