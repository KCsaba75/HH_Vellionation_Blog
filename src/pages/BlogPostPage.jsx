
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Clock, User, ArrowLeft, Heart, MessageCircle, Share2, Copy, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  
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
        profiles!posts_user_id_fkey ( name, avatar_url, bio ),
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

    // Fetch latest 4 posts (excluding current post)
    const { data: latestData } = await supabase
      .from('posts')
      .select(`
        id, title, slug, excerpt, image_url, read_time, created_at,
        categories!posts_category_id_fkey ( name )
      `)
      .neq('id', postData.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(4);

    setLatestPosts(latestData || []);
    
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

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${post.title} - Vellio Nation</title>
          <style>
            body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
            h1 { font-size: 2em; margin-bottom: 0.5em; }
            .meta { color: #666; margin-bottom: 2em; font-size: 0.9em; }
            .excerpt { font-size: 1.1em; color: #444; margin-bottom: 2em; font-style: italic; }
            .content { font-size: 1em; }
            .content img { max-width: 100%; height: auto; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <h1>${post.title}</h1>
          <div class="meta">
            By ${post.profiles?.name || 'Vellio Team'} | ${post.read_time || '5 min read'} | ${post.categories?.name || 'Uncategorized'}
          </div>
          <div class="excerpt">${post.excerpt || ''}</div>
          <div class="content">${post.content}</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
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
        <link rel="canonical" href={`https://www.vellionation.com/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.vellionation.com/blog/${post.slug}`} />
        <meta property="og:title" content={post.seo_title || post.title} />
        <meta property="og:description" content={post.seo_description || post.excerpt} />
        <meta property="og:image" content={post.image_url || "https://www.vellionation.com/images/og-image.jpg"} />
        <meta property="article:published_time" content={post.created_at} />
        <meta property="article:author" content={post.profiles?.name || 'Vellio Team'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seo_title || post.title} />
        <meta name="twitter:description" content={post.seo_description || post.excerpt} />
        <meta name="twitter:image" content={post.image_url || "https://www.vellionation.com/images/og-image.jpg"} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "image": post.image_url || "https://www.vellionation.com/images/og-image.jpg",
            "author": {
              "@type": "Person",
              "name": post.profiles?.name || "Vellio Team"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Vellio Nation",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.vellionation.com/images/logo.png"
              }
            },
            "datePublished": post.created_at,
            "dateModified": post.updated_at || post.created_at,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://www.vellionation.com/blog/${post.slug}`
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.vellionation.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://www.vellionation.com/blog"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": post.categories?.name || "Article",
                "item": `https://www.vellionation.com/blog?category=${post.category_id || ''}`
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": post.title
              }
            ]
          })}
        </script>
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
              <img alt={post.title} className="w-full h-full object-cover" src={post.image_url || "https://images.unsplash.com/photo-1601941707251-5a887e9db2e1"} loading="lazy" />
            </div>
            <div className="mb-12">
              <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
              <div className="prose prose-lg dark:prose-invert max-w-none rich-content" dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
            
            <div className="flex items-center gap-4 py-6 border-y">
              <Button variant="outline" className="gap-2" onClick={toggleLike} aria-label={userHasLiked ? 'Unlike this article' : 'Like this article'}>
                <Heart className={`h-5 w-5 ${userHasLiked ? 'text-red-500 fill-current' : ''}`} />
                {likes.length}
              </Button>
              <span className="text-muted-foreground">{comments.length} comments</span>
              <div className="flex-grow" />
              {user && (
                <>
                  <Button variant="outline" className="gap-2" onClick={handlePrintPdf} aria-label="Download as PDF">
                    <FileText className="h-5 w-5" /> PDF
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="outline" className="gap-2" aria-label="Share this article"><Share2 className="h-5 w-5" /> Share</Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleShare('facebook')}><Facebook className="mr-2 h-4 w-4 text-[#1877F2]" />Facebook</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare('messenger')}><MessageSquare className="mr-2 h-4 w-4 text-[#00B2FF]" />Messenger</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({title: "Instagram sharing from web is not directly supported."})}><Instagram className="mr-2 h-4 w-4 text-[#E4405F]" />Instagram</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare('copy')}><Copy className="mr-2 h-4 w-4" />Copy Link</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>

            {/* Author Section */}
            <section className="mt-10 mb-10">
              <div className="bg-card border rounded-xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="flex-shrink-0">
                    {post.profiles?.avatar_url ? (
                      <img 
                        src={post.profiles.avatar_url} 
                        alt={post.profiles?.name || 'Author'} 
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/20">
                        <User className="w-12 h-12 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm text-muted-foreground mb-1">Written by</p>
                    <h3 className="text-xl font-bold mb-2">{post.profiles?.name || 'Vellio Team'}</h3>
                    {post.profiles?.bio ? (
                      <p className="text-muted-foreground leading-relaxed">{post.profiles.bio}</p>
                    ) : (
                      <p className="text-muted-foreground italic">Passionate about wellness and healthy living.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Comments</h2>
              {user && (<div className="mb-8"><textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Share your thoughts..." className="w-full p-4 rounded-lg border bg-background resize-none" rows="4" aria-label="Write a comment" /><Button onClick={handleComment} className="mt-2" aria-label="Post comment"><MessageCircle className="mr-2 h-4 w-4" />Post Comment</Button></div>)}
              <div className="space-y-6">
                {comments.map(comment => (<div key={comment.id} className="bg-card p-6 rounded-lg"><div className="flex items-center gap-2 mb-2"><User className="h-5 w-5 text-muted-foreground" /><span className="font-semibold">{comment.profiles?.name || 'Anonymous'}</span><span className="text-sm text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span></div><p className="text-muted-foreground">{comment.content}</p></div>))}
                {comments.length === 0 && (<p className="text-center text-muted-foreground py-8">No comments yet. Be the first to share your thoughts!</p>)}
              </div>
            </section>
          </motion.div>
        </div>
      </article>

      {latestPosts.length > 0 && (
        <section className="pt-4 pb-8 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Latest Articles</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/blog">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestPosts.map((latestPost, index) => (
                <motion.article
                  key={latestPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-black dark:border-white"
                >
                  <Link to={`/blog/${latestPost.slug}`}>
                    <div className="aspect-video bg-secondary/50">
                      <img
                        alt={latestPost.title}
                        className="w-full h-full object-cover"
                        src={latestPost.image_url || "https://images.unsplash.com/photo-1601941707251-5a887e9db2e1"}
                      />
                    </div>
                    <div className="p-3">
                      {latestPost.categories?.name && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {latestPost.categories.name}
                        </span>
                      )}
                      <h3 className="font-semibold text-sm mt-2 line-clamp-2 hover:text-primary transition-colors">
                        {latestPost.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {latestPost.excerpt}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{latestPost.read_time || '5 min read'}</span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default BlogPostPage;
