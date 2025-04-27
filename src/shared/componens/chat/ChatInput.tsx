import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ArrowUp } from 'lucide-react';
import { useDeviceType } from '@/hooks/useDeviceType';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  loading: boolean;
}

export const ChatInput = ({ onSubmit, loading }: ChatInputProps) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const deviceType = useDeviceType();

  const updateHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
  }, []);

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
    updateHeight();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (deviceType === 'desktop' || e.ctrlKey || e.metaKey) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    onSubmit(prompt);
    setPrompt('');
  };

  useEffect(() => updateHeight(), [prompt, updateHeight]);

  return (
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
  );
};
