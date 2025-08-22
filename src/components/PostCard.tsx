import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, Play, Pause } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from './Comment';

interface CommentReply {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles?: { full_name?: string };
}

interface CommentData {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles?: { full_name?: string };
  comment_reactions?: { id: string; reaction_type: string; user_id: string }[];
  comment_replies?: CommentReply[];
}

interface Post {
  id: string;
  caption: string;
  audio_url?: string;
  audio_duration?: number;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
  reactions?: { id: string; reaction_type: string; user_id: string }[];
  comments?: CommentData[];
  _count?: {
    reactions: number;
    comments: number;
    shares: number;
  };
}

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onShare: (postId: string, caption?: string) => void;
  onCommentLike?: (commentId: string) => void;
  onCommentReply?: (commentId: string, content: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  currentUserId, 
  onLike, 
  onComment, 
  onShare,
  onCommentLike,
  onCommentReply
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [shareCaption, setShareCaption] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const isLiked = post.reactions?.some(r => r.user_id === currentUserId && r.reaction_type === 'like');
  const likesCount = post._count?.reactions || post.reactions?.length || 0;
  const commentsCount = post._count?.comments || post.comments?.length || 0;
  const sharesCount = post._count?.shares || 0;

  const handlePlay = () => {
    if (post.audio_url) {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      
      const newAudio = new Audio(post.audio_url);
      newAudio.crossOrigin = "anonymous";
      
      newAudio.onloadstart = () => {
        console.log('Audio loading started');
      };
      
      newAudio.oncanplay = () => {
        console.log('Audio can play');
        newAudio.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      };
      
      newAudio.onended = () => {
        setIsPlaying(false);
        setAudio(null);
      };
      
      newAudio.onerror = (error) => {
        console.error('Audio error:', error);
        setIsPlaying(false);
        setAudio(null);
      };
      
      setAudio(newAudio);
    }
  };

  const handlePause = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  const handleShare = () => {
    onShare(post.id, shareCaption);
    setShareCaption('');
    setShowShareDialog(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.profiles?.avatar_url} />
            <AvatarFallback>
              {post.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">
              {post.profiles?.full_name || `User ${post.user_id.slice(0, 8)}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm">{post.caption}</p>
        
        {post.audio_url && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={isPlaying ? handlePause : handlePlay}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Play Voice Note'}
            </Button>
            {post.audio_duration && (
              <span className="text-sm text-muted-foreground">
                {formatDuration(post.audio_duration)}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              {commentsCount}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareDialog(true)}
              className="flex items-center gap-1"
            >
              <Share className="h-4 w-4" />
              {sharesCount}
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              />
              <Button size="sm" onClick={handleComment}>
                Post
              </Button>
            </div>
            
            {post.comments?.map((comment) => (
              <Comment
                key={comment.id}
                id={comment.id}
                content={comment.content}
                user_id={comment.user_id}
                created_at={comment.created_at}
                profiles={comment.profiles}
                comment_reactions={comment.comment_reactions}
                comment_replies={comment.comment_replies}
                currentUserId={currentUserId}
                onLike={onCommentLike || (() => {})}
                onReply={onCommentReply || (() => {})}
              />
            ))}
          </div>
        )}

        {showShareDialog && (
          <div className="space-y-3 pt-3 border-t">
            <textarea
              placeholder="Add a caption to your share..."
              value={shareCaption}
              onChange={(e) => setShareCaption(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleShare}>
                Share
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
