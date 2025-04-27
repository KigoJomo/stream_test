'use client';

import { useClipBoard } from '@/hooks/useClipboard';
import { useDeviceType } from '@/hooks/useDeviceType';
import { Message } from '@/lib/types/shared_types';
import MarkdownRenderer from '@/shared/componens/ui/MarkdownRenderer';
import { ArrowDown, ArrowUp, Check, CopyIcon } from 'lucide-react';
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);

  const deviceType = useDeviceType();
  const { copiedMessageIndex, copyToClipboard } = useClipBoard();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setUserScrolled(false);
  }, []);

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 100;

    setShowScrollButton(!atBottom);
    if (!atBottom) {
      setUserScrolled(true);
    }
  }, []);

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
    if (!userScrolled) {
      scrollToBottom();
    }
  }, [history, userScrolled, scrollToBottom]);

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

    setPrompt('');

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
    }
  };

  return (
    <section className="h-dvh lg:!px-64 lg:!py-4 flex justify-center relative">
      <div className="h-full w-full max-w-[80rem] overflow-hidden lg:rounded-3xl">
        <div
          className="
            h-full w-full max-w-[80rem]
            border border-background-light lg:rounded-3xl
            relative overflow-x-hidden overflow-y-auto custom-scrollbar
            p-4 flex flex-col
          "
          ref={chatContainerRef}
          onScroll={handleScroll}>
          <div className="w-full flex flex-col gap-6 py-4">
            {history.map((item, index) => (
              <div
                key={index}
                className={`
                  ${
                    item.role === 'user'
                      ? 'ml-auto max-w-128 bg-foreground/10 animate-fade-in-left py-3 px-6 rounded-3xl'
                      : 'w-fit max-w-full bg-background-light/0 animate-fade-in-right px-1'
                  }
                  group relative
                  animation-delay-${Math.min(index * 100, 800)}
                `}>
                <MarkdownRenderer
                  markdownContent={item.text}
                  className="max-w-full prose dark:prose-invert"
                />
                {/* button(s) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(item.text, index)}
                    className={`
                      ${
                        item.role === 'user'
                          ? 'absolute top-3 -left-10 opacity-0 group-hover:opacity-100'
                          : 'mt-4 opacity-0 group-hover:opacity-100'
                      }
                      transition-all duration-300 cursor-pointer hover:scale-110
                    `}
                    aria-label={
                      copiedMessageIndex === index
                        ? 'Copied to clipboard'
                        : 'Copy item'
                    }>
                    {copiedMessageIndex === index ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <CopyIcon
                        size={16}
                        className="stroke-foreground-light hover:stroke-foreground transition-all"
                      />
                    )}
                  </button>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="
                fixed bottom-32 right-8 lg:right-72
                p-2 rounded-full
                bg-foreground/10 hover:bg-foreground/20
                backdrop-blur-xl
                transition-all duration-300
                animate-fade-in-up
              "
              aria-label="Scroll to bottom">
              <ArrowDown size={20} className="text-foreground" />
            </button>
          )}
          <div
            className="
              input w-full h-fit
              flex items-center gap-2 p-2
              border-2 border-foreground-light/10 focus-within:border-foreground-light/60 rounded-3xl
              bg-background-light/5 backdrop-blur-3xl
              sticky bottom-0 mt-auto
              transition-all duration-300
            ">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything ..."
              name=""
              id=""
              className="
                w-full resize-none overflow-y-auto text-sm px-4
                bg-transparent focus:outline-none
                placeholder:text-foreground/40 py-2
                custom-scrollbar
              "
              rows={1}
            />
            <div className="flex items-end">
              <button
                onClick={handleSubmit}
                disabled={loading || !prompt.trim()}
                className={`
                  bg-foreground p-2.5 rounded-full
                  transition-all duration-300
                  ${
                    loading || !prompt.trim()
                      ? 'cursor-not-allowed opacity-30'
                      : 'cursor-pointer opacity-100 hover:scale-105'
                  }
                  `}>
                <ArrowUp size={18} className="stroke-background" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
