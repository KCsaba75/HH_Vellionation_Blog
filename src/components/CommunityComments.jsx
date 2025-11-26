
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Send, User, Trash2 } from 'lucide-react';
import { awardPoints, checkAndAwardBadges } from '@/lib/gamificationService';

const CommunityComments = ({ postId }) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('community_comments')
      .select('*, profiles!community_comments_user_id_fkey(name, role)')
      .eq('community_post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching comments:', error);
      toast({ title: 'Error fetching comments', variant: 'destructive' });
    } else {
      setComments(data);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async () => {
    if (!user) {
      toast({ title: "Login required to comment", variant: 'destructive' });
      return;
    }
    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from('community_comments')
      .insert({ community_post_id: postId, user_id: user.id, content: newComment })
      .select('*, profiles!community_comments_user_id_fkey(name, role)')
      .single();
    
    if (error) {
      toast({ title: 'Error posting comment', description: error.message, variant: 'destructive' });
    } else {
      setComments(prev => [...prev, data]);
      setNewComment('');
      toast({ title: 'Comment posted!' });
      
      const pointResult = await awardPoints(user.id, 'COMMENT_ADDED');
      if (pointResult.success) {
        toast({ title: `+${pointResult.pointsAwarded} points earned!`, description: pointResult.rankChanged ? `You've reached ${pointResult.newRank}! 🎉` : undefined });
      }
      await checkAndAwardBadges(user.id);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const { error } = await supabase
      .from('community_comments')
      .delete()
      .eq('id', commentId);
    
    if (error) {
      toast({ title: 'Error deleting comment', description: error.message, variant: 'destructive' });
    } else {
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast({ title: 'Comment deleted' });
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
        {loading && <p>Loading comments...</p>}
        {!loading && comments.length === 0 && <p className="text-muted-foreground text-center py-4">No comments yet.</p>}
        {comments.map(comment => (
          <div key={comment.id} className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-sm">{comment.profiles?.name || 'Anonymous'}</span>
                <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              {(comment.user_id === user?.id || profile?.role === 'admin') && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteComment(comment.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
            <p className="text-sm text-foreground/90 pl-6">{comment.content}</p>
          </div>
        ))}
      </div>
      {user && (
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 pr-12 rounded-lg border bg-background resize-none text-sm"
            rows="2"
          />
          <Button onClick={handlePostComment} size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommunityComments;
