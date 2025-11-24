
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Clock, User, ArrowLeft, Heart, MessageCircle, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Facebook, Instagram, MessageSquare } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import '@/index.css';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState([]);
  
  const postUrl = window.location.href;

  const userHasLiked = user && likes.some(like => like.user_id === user.id);

  const fetchPostData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    
    // Fetch post details
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey ( name ),
        categories!posts_category_id_fkey ( name ),
        subcategories:categories!posts_subcategory_id_fkey ( name )
      `)
      .eq('slug', slug)
      .single();
    
    if (postError || !postData) {
      console.error('Error fetching post:', postError);
      setPost(null);
      setLoading(false);
      return;
    }
    
    setPost(postData);

    // Fetch comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*, profiles!comments_user_id_fkey ( name )')
      .eq('post_id', postData.id)
      .order('created_at', { ascending: true });
    
    if (commentsError) console.error('Error fetching comments:', commentsError);
    else setComments(commentsData || []);

    // Fetch likes
    const { data: likesData, error: likesError } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postData.id);

    if (likesError) console.error('Error fetching likes:', likesError);
    else setLikes(likesData || []);
    
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  const handleShare = (platform) => {
    let url = '';
    const encodedUrl = encodeURIComponent(postUrl);
    const text = encodeURIComponent(post.title);

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'messenger':
        url = `fb-messenger://share?link=${encodedUrl}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(postUrl);
        toast({ title: "Link Copied!", description: "URL copied to your clipboard." });
        return;
      default:
        toast({ title: "Sharing not available for this platform", variant: "destructive" });
        return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleComment = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to comment" });
      return;
    }
    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: post.id, user_id: user.id, content: newComment })
      .select('*, profiles!comments_user_id_fkey ( name )')
      .single();

    if (error) {
      toast({ title: 'Error posting comment', description: error.message, variant: 'destructive' });
    } else {
      setComments([...comments, data]);
      setNewComment('');
      toast({ title: "Comment posted!" });
    }
  };
  
  const toggleLike = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to like this post.", variant: "destructive" });
      return;
    }

    if (userHasLiked) {
      // Unlike
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .match({ post_id: post.id, user_id: user.id });

      if (error) {
        toast({ title: "Error unliking post", description: error.message, variant: 'destructive' });
      } else {
        setLikes(likes.filter(like => like.user_id !== user.id));
      }
    } else {
      // Like
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: post.id, user_id: user.id });

      if (error) {
        toast({ title: "Error liking post", description: error.message, variant: 'destructive' });
      } else {
        setLikes([...likes, { post_id: post.id, user_id: user.id }]);
      }
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-12 text-center"><p className="text-muted-foreground">Loading Post...</p></div>;
  if (!post) return <div className="container mx-auto px-4 py-12 text-center"><p className="text-muted-foreground">Post not found</p><Button onClick={() => navigate('/blog')} className="mt-4">Back to Blog</Button></div>;

  return (
    <>
      <Helmet>
        <title>{post.seo_title || post.title} - Vellio Nation</title>
        <meta name="description" content={post.seo_description || post.excerpt} />
      </Helmet>

      <article className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                {post.categories?.name || 'Uncategorized'}
                {post.subcategories?.name && ` → ${post.subcategories.name}`}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>
            <div className="flex items-center gap-6 text-muted-foreground mb-8">
              <div className="flex items-center gap-2"><User className="h-5 w-5" /><span>{post.profiles?.name || 'Vellio Team'}</span></div>
              <div className="flex items-center gap-2"><Clock className="h-5 w-5" /><span>{post.read_time || '5 min read'}</span></div>
            </div>
            <div className="aspect-video bg-secondary/50 rounded-xl mb-8 overflow-hidden">
              <img alt={post.title} className="w-full h-full object-cover" src={post.image_url || "https://images.unsplash.com/photo-1601941707251-5a887e9db2e1"} />
            </div>
            <div className="mb-12">
              <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="ql-snow">
                  <div className="ql-editor" dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 py-6 border-y">
              <Button variant="outline" className="gap-2" onClick={toggleLike}>
                <Heart className={`h-5 w-5 ${userHasLiked ? 'text-red-500 fill-current' : ''}`} />
                {likes.length}
              </Button>
              <span className="text-muted-foreground">{comments.length} comments</span>
              <div className="flex-grow" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" className="gap-2"><Share2 className="h-5 w-5" /> Share</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare('facebook')}><Facebook className="mr-2 h-4 w-4 text-[#1877F2]" />Facebook</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('messenger')}><MessageSquare className="mr-2 h-4 w-4 text-[#00B2FF]" />Messenger</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast({title: "Instagram sharing from web is not directly supported."})}><Instagram className="mr-2 h-4 w-4 text-[#E4405F]" />Instagram</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('copy')}><Copy className="mr-2 h-4 w-4" />Copy Link</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Comments</h2>
              {user && (<div className="mb-8"><textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Share your thoughts..." className="w-full p-4 rounded-lg border bg-background resize-none" rows="4" /><Button onClick={handleComment} className="mt-2"><MessageCircle className="mr-2 h-4 w-4" />Post Comment</Button></div>)}
              <div className="space-y-6">
                {comments.map(comment => (<div key={comment.id} className="bg-card p-6 rounded-lg"><div className="flex items-center gap-2 mb-2"><User className="h-5 w-5 text-muted-foreground" /><span className="font-semibold">{comment.profiles?.name || 'Anonymous'}</span><span className="text-sm text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span></div><p className="text-muted-foreground">{comment.content}</p></div>))}
                {comments.length === 0 && (<p className="text-center text-muted-foreground py-8">No comments yet. Be the first to share your thoughts!</p>)}
              </div>
            </section>
          </motion.div>
        </div>
      </article>
    </>
  );
};

export default BlogPostPage;
