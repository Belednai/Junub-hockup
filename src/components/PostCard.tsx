import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, Play, Pause } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  comments?: { id: string; content: string; user_id: string; profiles?: { full_name?: string } }[];
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
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  currentUserId, 
  onLike, 
  onComment, 
  onShare 
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [shareCaption, setShareCaption] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);

  const isLiked = post.reactions?.some(r => r.user_id === currentUserId && r.reaction_type === 'like');
  const likesCount = post._count?.reactions || post.reactions?.length || 0;
  const commentsCount = post._count?.comments || post.comments?.length || 0;
  const sharesCount = post._count?.shares || 0;

  const handlePlay = () => {
    if (post.audio_url) {
      const audio = new Audio(post.audio_url);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
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
              {post.profiles?.full_name || 'Anonymous'}
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
              onClick={handlePlay}
              disabled={isPlaying}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Playing...' : 'Play Voice Note'}
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
              <div key={comment.id} className="flex gap-2 text-sm">
                <span className="font-semibold">
                  {comment.profiles?.full_name || 'Anonymous'}:
                </span>
                <span>{comment.content}</span>
              </div>
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