import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChatButtonProps {
  onClick: () => void;
  hasUnreadMessages?: boolean;
  unreadCount?: number;
}

export function ChatButton({ onClick, hasUnreadMessages = false, unreadCount = 0 }: ChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
      size="sm"
    >
      <div className="relative">
        <MessageCircle className="h-6 w-6" />
        {hasUnreadMessages && unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </div>
    </Button>
  );
}
