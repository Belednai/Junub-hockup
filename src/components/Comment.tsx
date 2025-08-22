import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentReply {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles?: { full_name?: string };
}

interface CommentProps {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles?: { full_name?: string };
  comment_reactions?: { id: string; reaction_type: string; user_id: string }[];
  comment_replies?: CommentReply[];
  currentUserId: string;
  onLike: (commentId: string) => void;
  onReply: (commentId: string, content: string) => void;
}

export const Comment: React.FC<CommentProps> = ({
  id,
  content,
  user_id,
  created_at,
  profiles,
  comment_reactions = [],
  comment_replies = [],
  currentUserId,
  onLike,
  onReply
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);

  const isLiked = comment_reactions.some(r => r.user_id === currentUserId && r.reaction_type === 'like');
  const likesCount = comment_reactions.length;
  const repliesCount = comment_replies.length;

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(id, replyText);
      setReplyText('');
      setShowReplyInput(false);
      setShowReplies(true);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {profiles?.full_name || `User ${user_id.slice(0, 8)}`}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm mt-1">{content}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(id)}
            className={`flex items-center gap-1 h-6 px-2 text-xs ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
            {likesCount > 0 && likesCount}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="flex items-center gap-1 h-6 px-2 text-xs text-muted-foreground"
          >
            <MessageCircle className="h-3 w-3" />
            Reply
          </Button>

          {repliesCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className="h-6 px-2 text-xs text-muted-foreground"
            >
              {showReplies ? 'Hide' : 'View'} {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
            </Button>
          )}
        </div>

        {showReplyInput && (
          <div className="flex gap-2 ml-4">
            <input
              type="text"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 px-3 py-1 text-sm border rounded-md"
              onKeyPress={(e) => e.key === 'Enter' && handleReply()}
            />
            <Button size="sm" onClick={handleReply} className="h-8">
              Reply
            </Button>
          </div>
        )}

        {showReplies && comment_replies.length > 0 && (
          <div className="ml-6 space-y-2 border-l-2 border-muted pl-4">
            {comment_replies.map((reply) => (
              <div key={reply.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {reply.profiles?.full_name || `User ${reply.user_id.slice(0, 8)}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{reply.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
