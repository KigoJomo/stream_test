'use client';

import { useRef, useEffect } from 'react';
import { useClipBoard } from '@/hooks/useClipboard';
import { ChatInput } from '@/shared/componens/chat/ChatInput';
import { ChatMessage } from '@/shared/componens/chat/ChatMessage';
import { ScrollButton } from '@/shared/componens/chat/ScrollButton';
import { useChatState } from '@/hooks/chat/useChatState';
import { useChatScroll } from '@/hooks/chat/useChatScroll';

export default function Home() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { history, loading, sendMessage } = useChatState();
  const { copiedMessageIndex, copyToClipboard } = useClipBoard();
  const {
    showScrollButton,
    userScrolled,
    handleScroll,
    scrollToBottom,
    resetUserScrolled,
  } = useChatScroll({
    chatContainerRef,
    messagesEndRef,
  });

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (!userScrolled) {
      scrollToBottom();
    }
  }, [history, userScrolled, scrollToBottom]);

  const handleSendMessage = async (message: string) => {
    resetUserScrolled();
    await sendMessage(message);
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
            {history.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                index={index}
                copiedMessageIndex={copiedMessageIndex}
                onCopy={copyToClipboard}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <ScrollButton visible={showScrollButton} onClick={scrollToBottom} />

          <ChatInput onSubmit={handleSendMessage} loading={loading} />
        </div>
      </div>
    </section>
  );
}
