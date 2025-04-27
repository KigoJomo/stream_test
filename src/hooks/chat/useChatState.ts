import { useState } from 'react';
import { Message } from '@/lib/types/shared_types';

export const useChatState = () => {
  const [history, setHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string) => {
    setLoading(true);

    setHistory((prev) => [
      ...prev,
      {
        text: message,
        role: 'user',
      },
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          history: history,
        }),
      });

      setHistory((prev) => [
        ...prev,
        {
          text: '',
          role: 'model',
        },
      ]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        setHistory((prev) => {
          const newArr = [...prev];
          const lastIndex = newArr.length - 1;
          newArr[lastIndex] = {
            ...newArr[lastIndex],
            text: newArr[lastIndex].text + decoder.decode(value),
          };
          return newArr;
        });
      }
    } catch (error) {
      console.error('An error occurred: ', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    history,
    loading,
    sendMessage,
  };
};
