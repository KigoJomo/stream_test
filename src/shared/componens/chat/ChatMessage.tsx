import { Message } from '@/lib/types/shared_types';
import MarkdownRenderer from '@/shared/componens/ui/MarkdownRenderer';
import { Check, CopyIcon } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  index: number;
  copiedMessageIndex: number | null;
  onCopy: (text: string, index: number) => void;
}

export const ChatMessage = ({
  message,
  index,
  copiedMessageIndex,
  onCopy,
}: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`
        ${
          isUser
            ? 'ml-auto max-w-128 bg-foreground/10 py-3 px-6 rounded-3xl'
            : 'w-fit max-w-full bg-background-light/0 px-1'
        }
        group relative
        animation-delay-${Math.min(index * 100, 800)}
      `}>
      <MarkdownRenderer
        markdownContent={message.text}
        className="max-w-full prose dark:prose-invert"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={() => onCopy(message.text, index)}
          className={`
            ${
              isUser
                ? 'absolute top-3 -left-10 opacity-0 group-hover:opacity-100'
                : 'mt-4 opacity-0 group-hover:opacity-100'
            }
            transition-all duration-300 cursor-pointer hover:scale-110
          `}
          aria-label={
            copiedMessageIndex === index ? 'Copied to clipboard' : 'Copy item'
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
  );
};
