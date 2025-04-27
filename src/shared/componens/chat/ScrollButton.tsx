import { ArrowDown } from 'lucide-react';

interface ScrollButtonProps {
  onClick: () => void;
  visible: boolean;
}

export const ScrollButton = ({ onClick, visible }: ScrollButtonProps) => {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-24 right-8 lg:right-72
        p-2 rounded-full
        bg-foreground/10 hover:bg-foreground/20
        backdrop-blur-xl
        transition-all duration-300
        animate-fade-in-up
      "
      aria-label="Scroll to bottom">
      <ArrowDown size={20} className="text-foreground" />
    </button>
  );
};
