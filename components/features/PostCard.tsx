'use client';

import React, { useState } from 'react';
import { MessageCircle, Sparkles, Send, ThumbsUp, ChevronDown, ChevronUp, MoreVertical, Edit2, Trash2, X, HandHeart } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { BlurredContent } from '@/components/ui/BlurredContent';
import { Button } from '@/components/ui/Button';
import { MarkdownView } from './MarkdownView';
import type { IPost, IComment } from '@/lib/types';

interface PostCardProps {
  post: IPost;
  currentUserTag?: string;
  onReact?: (postId: string, action: 'hug' | 'unhug' | 'highFive' | 'unhighFive') => void;
  onComment?: (postId: string, content: string) => void;
  onLikeComment?: (postId: string, commentId: string, hasLiked: boolean) => void;
  onEdit?: (postId: string, content: string, tags: string[]) => void;
  onDelete?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserTag,
  onReact,
  onComment,
  onLikeComment,
  onEdit,
  onDelete,
}) => {
  const [showComments, setShowComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAuthor = currentUserTag === post.authorTag;
  const isVent = post.postType === 'vent';
  
  // Reactions
  const hasHugged = currentUserTag ? post.reactions?.huggedBy?.includes(currentUserTag) : false;
  const hasHighFived = currentUserTag ? post.reactions?.highFivedBy?.includes(currentUserTag) : false;
  const reactionCount = isVent ? (post.reactions?.hugs || 0) : (post.reactions?.highFives || 0);
  const hasReacted = isVent ? hasHugged : hasHighFived;

  const formatDate = (timestamp: Date | string | number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting || !onComment) return;
    
    setIsSubmitting(true);
    await onComment(post._id.toString(), commentText);
    setCommentText('');
    setIsSubmitting(false);
  };

  const handleReaction = () => {
    if (!onReact) return;
    if (isVent) {
      onReact(post._id.toString(), hasHugged ? 'unhug' : 'hug');
    } else {
      onReact(post._id.toString(), hasHighFived ? 'unhighFive' : 'highFive');
    }
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(post._id.toString(), editContent.trim(), post.tags);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post._id.toString());
    }
    setShowDeleteConfirm(false);
  };

  const MAX_LENGTH = 500;
  const shouldTruncate = post.content.length > MAX_LENGTH && !isEditing;
  const contentToRender = !isExpanded && shouldTruncate
    ? post.content.slice(0, MAX_LENGTH).trim() + '...'
    : post.content;

  const sortedComments = [...(post.comments || [])].sort((a, b) => b.likes - a.likes);

  const athenaStyles = isVent
    ? 'bg-indigo-50 border-indigo-100'
    : 'bg-amber-50 border-amber-100';

  const reactionColor = isVent
    ? hasReacted ? 'text-indigo-500' : 'text-stone/60 hover:text-indigo-500'
    : hasReacted ? 'text-amber-500' : 'text-stone/60 hover:text-amber-500';

  const reactionBg = isVent
    ? hasReacted ? 'bg-indigo-50' : 'group-hover:bg-indigo-50'
    : hasReacted ? 'bg-amber-50' : 'group-hover:bg-amber-50';

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-32 bg-cream border border-sand rounded-xl p-3 text-bark resize-none focus:outline-none focus:ring-2 focus:ring-earth/20"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditContent(post.content); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit}>
              Save
            </Button>
          </div>
        </div>
      );
    }

    const content = (
      <p className="text-bark leading-relaxed whitespace-pre-wrap text-[17px]">
        {contentToRender}
      </p>
    );

    if (post.moderation?.isBlurred) {
      return (
        <BlurredContent reason={post.moderation.reason} severity={post.moderation.severity as 'low' | 'medium' | 'high'}>
          {content}
        </BlurredContent>
      );
    }

    return content;
  };

  const renderComment = (comment: IComment, idx: number) => {
    const commentHasLiked = currentUserTag ? comment.likedBy?.includes(currentUserTag) : false;
    const isTopComment = idx === 0 && comment.likes > 0;

    const commentContent = (
      <div className={`flex-1 rounded-2xl rounded-tl-none p-3 px-4 ${isTopComment ? 'bg-gold/10 border border-gold/20' : 'bg-sand/30'}`}>
        <div className="flex justify-between items-baseline mb-1">
          <span className={`text-xs font-bold ${isTopComment ? 'text-gold-dark' : 'text-stone'}`}>
            {comment.authorTag}
            {isTopComment && (
              <span className="ml-2 text-[10px] font-normal px-1.5 py-0.5 bg-gold/20 text-gold-dark rounded-full">
                Top
              </span>
            )}
          </span>
          <span className="text-[10px] text-stone/60">{formatDate(comment.createdAt)}</span>
        </div>
        <p className={`text-sm mb-2 ${isTopComment ? 'text-bark' : 'text-stone'}`}>
          {comment.content}
        </p>
        <button
          onClick={() => onLikeComment?.(post._id.toString(), comment._id.toString(), commentHasLiked)}
          className={`text-xs flex items-center gap-1 transition-colors ${
            commentHasLiked ? 'text-earth' : 'text-stone/60 hover:text-earth'
          }`}
          disabled={!onLikeComment}
        >
          <ThumbsUp size={12} className={commentHasLiked ? 'fill-earth' : ''} />
          {comment.likes > 0 && <span>{comment.likes}</span>}
        </button>
      </div>
    );

    return (
      <div key={comment._id.toString()} className="flex gap-3">
        <Avatar name={comment.authorTag} size="sm" />
        {comment.moderation?.isBlurred ? (
          <BlurredContent reason={comment.moderation.reason} severity={comment.moderation.severity as 'low' | 'medium' | 'high'}>
            {commentContent}
          </BlurredContent>
        ) : (
          commentContent
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft hover:shadow-warm transition-shadow duration-300 border border-sand/50 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar name={post.authorTag} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-bark font-bold tracking-tight">{post.authorTag}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isVent ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {isVent ? '🌧️ Vent' : '✨ Flex'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-stone/60 text-xs font-medium">{formatDate(post.createdAt)}</span>
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs text-stone/50">#{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Author menu - right aligned */}
        {isAuthor && (
          <div className="relative ml-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-stone/40 hover:text-stone hover:bg-sand/50 rounded-lg transition-colors"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-warm border border-sand/50 py-1 z-50 min-w-[120px] animate-scale-in">
                  <button
                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-bark hover:bg-sand/30 transition-colors"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-2">
        {renderContent()}
      </div>

      {shouldTruncate && !isEditing && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-earth font-medium text-sm hover:underline mb-4 flex items-center gap-1"
        >
          {isExpanded ? (
            <>Show less <ChevronUp size={14} /></>
          ) : (
            <>Read more <ChevronDown size={14} /></>
          )}
        </button>
      )}

      {!shouldTruncate && !isEditing && <div className="mb-4" />}

      {/* Space Response */}
      {(post.isSpaceThinking || post.spaceResponse) && !isEditing && (
        <div className="mb-4">
          {post.isSpaceThinking ? (
            <div className={`flex items-center gap-3 animate-pulse p-4 rounded-2xl border ${athenaStyles}`}>
              <Sparkles size={20} className={isVent ? 'text-indigo-400' : 'text-amber-400'} style={{ animation: 'spin 3s linear infinite' }} />
              <span className="text-sm font-medium italic text-stone">Athena is preparing thoughtful guidance...</span>
            </div>
          ) : (
            <div className={`rounded-2xl p-5 border ${athenaStyles}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-full ${isVent ? 'bg-indigo-100' : 'bg-amber-100'}`}>
                  <Sparkles className={isVent ? 'text-indigo-500' : 'text-amber-500'} size={14} />
                </div>
                <span className={`font-bold text-sm ${isVent ? 'text-indigo-700' : 'text-amber-700'}`}>Athena</span>
              </div>
              <MarkdownView content={post.spaceResponse || ''} />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {!isEditing && (
        <div className="flex items-center justify-between pt-3 border-t border-sand/30">
          <div className="flex items-center gap-4">
            {/* Reaction Button */}
            <button
              onClick={handleReaction}
              className={`flex items-center gap-2 transition-colors group ${reactionColor}`}
            >
              <div className={`p-2 rounded-full transition-colors ${reactionBg}`}>
                {isVent ? (
                  <HandHeart size={20} className={hasHugged ? 'fill-indigo-200' : ''} />
                ) : (
                  <span className="text-lg leading-none">🙌</span>
                )}
              </div>
              <span className="font-medium">{reactionCount}</span>
              <span className="text-xs text-stone/50">{isVent ? 'hugs' : 'high fives'}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 transition-colors group ${
                showComments ? 'text-earth' : 'text-stone/60 hover:text-earth'
              }`}
            >
              <div className={`p-2 rounded-full transition-colors ${showComments ? 'bg-earth/10' : 'group-hover:bg-earth/10'}`}>
                <MessageCircle size={20} />
              </div>
              <span className="font-medium">{post.comments?.length || 0}</span>
            </button>
          </div>
        </div>
      )}

      {/* Comments */}
      {showComments && !isEditing && (
        <div className="mt-4 animate-fade-in">
          <form onSubmit={handleSubmitComment} className="flex gap-3 mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share a supportive thought..."
              className="flex-1 bg-cream border border-sand rounded-full px-4 py-3 text-bark focus:outline-none focus:ring-2 focus:ring-earth/20 placeholder-stone/40"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="p-3 bg-earth text-white rounded-full hover:bg-earth-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send size={16} />
            </button>
          </form>

          <div className="space-y-3">
            {sortedComments.map((comment, idx) => renderComment(comment, idx))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-scale-in">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-bark">Delete Post?</h3>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-stone hover:text-bark">
                <X size={20} />
              </button>
            </div>
            <p className="text-stone mb-6">This action cannot be undone. Your post and all its comments will be permanently deleted.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
