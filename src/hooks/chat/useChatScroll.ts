import { RefObject, useCallback, useState } from 'react';

interface UseChatScrollProps {
  chatContainerRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

interface UseChatScrollReturn {
  showScrollButton: boolean;
  userScrolled: boolean;
  handleScroll: () => void;
  scrollToBottom: () => void;
  resetUserScrolled: () => void;
}

export const useChatScroll = ({
  chatContainerRef,
  messagesEndRef,
}: UseChatScrollProps): UseChatScrollReturn => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);

  const resetUserScrolled = useCallback(() => {
    setUserScrolled(false);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setUserScrolled(false);
  }, [messagesEndRef]);

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 100;

    setShowScrollButton(!atBottom);
    if (!atBottom) {
      setUserScrolled(true);
    }
  }, [chatContainerRef]);

  return {
    showScrollButton,
    userScrolled,
    handleScroll,
    scrollToBottom,
    resetUserScrolled,
  };
};
