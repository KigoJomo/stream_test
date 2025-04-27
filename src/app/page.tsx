'use client';

import { useDeviceType } from '@/hooks/useDeviceType';
import { Message } from '@/lib/types/shared_types';
import MarkdownRenderer from '@/shared/componens/ui/MarkdownRenderer';
import { ArrowUp } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<Message[]>([]);

  const [loading, setLoading] = useState(false);

  const deviceType = useDeviceType();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
  };

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
    updateHeight();
  };

  useEffect(() => updateHeight(), [prompt]);
  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (deviceType === 'desktop' || e.ctrlKey || e.metaKey) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  // Simplified submission handler using consolidated store function with router
  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    setHistory((prev) => [
      ...prev,
      {
        // id: randomId(),
        text: prompt,
        role: 'user',
      },
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
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
      console.error('An error ocured: ', error);
    } finally {
      setLoading(false);
      setPrompt('');
    }
  };

  return (
    <section className="h-dvh md:!px-64 md:!py-4">
      <div className="h-full w-full border border-background-light rounded-3xl bg-transparent relative overflow-x-hidden overflow-y-scroll hide-scrollbar p-4 flex flex-col">
        <div className="inset-0 fixed neon-gradient opacity-25 pointer-events-none -z-10"></div>

        <div className="w-full flex flex-col gap-4 py-4">
          {history.map((item, index) => (
            <div
              key={index}
              className={`
                ${item.role === 'user' ? 'ml-auto max-w-128 bg-foreground/5 backdrop-blur-3xl' : 'w-fit bg-foreground/5 backdrop-blur-3xl'}
                p-4 rounded-3xl
              `}>
              <MarkdownRenderer
                markdownContent={item.text}
                className="max-w-full prose dark:prose-invert"
              />
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="input w-full h-fit flex items-center gap-2 py-3 px-4 border border-foreground-light/20 rounded-3xl bg-foreground/5 backdrop-blur-3xl sticky bottom-0 mt-auto">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything ..."
            name=""
            id=""
            className="
              w-full resize-none overflow-y-auto
              bg-transparent text-sm focus:outline-none
              placeholder:text-foreground/50
              custom-scrollbar
            "
            rows={1}
          />

          <div className="flex items-end mt-auto">
            <button
              onClick={handleSubmit}
              disabled={loading || !prompt.trim()}
              className={`
                bg-foreground p-2 rounded-full cursor-pointer
                hover:bg-foreground-light transition-all duration-300
                ${
                  loading || !prompt.trim()
                    ? 'cursor-wait opacity-30'
                    : 'cursor-pointer opacity-100'
                }
                `}>
              <ArrowUp size={16} className="stroke-background" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
