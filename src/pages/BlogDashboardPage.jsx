
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Upload, Save, Eye, Plus, Edit, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '@/index.css';
import CategorySelector from '@/components/CategorySelector';

const BlogDashboardPage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !['admin', 'blogger'].includes(profile?.role)) {
        toast({ title: 'Access Denied', description: 'You do not have permission to view this page.', variant: 'destructive' });
        navigate('/');
        return;
      }
      fetchUserPosts();
    }
  }, [user, profile, authLoading, navigate]);

  const fetchUserPosts = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('posts')
      .select('*, categories!posts_category_id_fkey(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Error fetching posts", description: error.message, variant: 'destructive' });
    } else {
      setPosts(data);
    }
  };

  const createNewPost = () => {
    setEditingPost({
      title: '',
      content: '',
      excerpt: '',
      category_id: null,
      subcategory_id: null,
      status: 'draft',
      image_url: '',
      seo_title: '',
      seo_description: '',
    });
    setIsFormVisible(true);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setIsFormVisible(true);
  };
  
  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post? This cannot be undone.")) return;

    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if(error){
      toast({title: 'Error deleting post', description: error.message, variant: 'destructive'});
    } else {
      toast({title: 'Post deleted!'});
      fetchUserPosts();
    }
  }

  const handleImageUpload = async (event) => {
    if (!event.target.files || event.target.files.length === 0 || !editingPost) return;
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);
    const { error: uploadError } = await supabase.storage.from('post_images').upload(filePath, file);

    if (uploadError) {
      toast({ title: "Image Upload Failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('post_images').getPublicUrl(filePath);

    setEditingPost({ ...editingPost, image_url: data.publicUrl });
    setUploading(false);
    toast({ title: "Image uploaded successfully!" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingPost.title) {
        toast({ title: "Title is required", variant: "destructive" });
        return;
    }
    const slug = editingPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const { categories, profiles, ...postData } = editingPost;
    const finalPostData = { ...postData, user_id: user.id, slug };
    
    let response;
    if (editingPost.id) { // Update
        response = await supabase.from('posts').update(finalPostData).eq('id', editingPost.id).select().single();
    } else { // Insert
        response = await supabase.from('posts').insert(finalPostData).select().single();
    }

    if (response.error) {
        toast({ title: "Error saving post", description: response.error.message, variant: "destructive" });
    } else {
        toast({ title: "Post saved successfully!" });
        setIsFormVisible(false);
        setEditingPost(null);
        fetchUserPosts();
    }
  };

  if (authLoading || !profile) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <>
      <Helmet>
        <title>Blog Dashboard - Vellio Nation</title>
        <meta name="description" content="Write and manage your blog posts for Vellio Nation." />
      </Helmet>
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold">Blog Dashboard</h1>
              {!isFormVisible && <Button onClick={createNewPost}><Plus className="mr-2 h-4 w-4" />Create Post</Button>}
            </div>

            {isFormVisible && editingPost ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card p-8 rounded-xl shadow-lg mb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-2xl font-bold">{editingPost.id ? 'Edit Post' : 'Create New Post'}</h2>
                  
                  {/* Main Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <input placeholder="Post Title" value={editingPost.title} onChange={e => setEditingPost({ ...editingPost, title: e.target.value })} className="w-full text-2xl font-bold p-3 rounded-lg border bg-background" required />
                      <textarea placeholder="Excerpt (A short summary of your post)" value={editingPost.excerpt || ''} onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })} className="w-full p-3 rounded-lg border bg-background" rows="3" />
                       <div className="prose dark:prose-invert">
                        <ReactQuill 
                          theme="snow"
                          value={editingPost.content}
                          onChange={(content) => setEditingPost({ ...editingPost, content: content })}
                          className="bg-background"
                        />
                       </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                      <div className="bg-muted p-4 rounded-lg space-y-4">
                        <h3 className="font-semibold">Publish Settings</h3>
                        <div className="flex items-center space-x-2">
                          <Switch id="post-status" checked={editingPost.status === 'published'} onCheckedChange={(checked) => setEditingPost({ ...editingPost, status: checked ? 'published' : 'draft' })} />
                          <Label htmlFor="post-status">{editingPost.status === 'published' ? 'Published' : 'Draft'}</Label>
                        </div>
                        <CategorySelector
                          type="blog"
                          categoryId={editingPost.category_id}
                          subcategoryId={editingPost.subcategory_id}
                          onCategoryChange={(id) => setEditingPost({ ...editingPost, category_id: id })}
                          onSubcategoryChange={(id) => setEditingPost({ ...editingPost, subcategory_id: id })}
                          required
                        />
                      </div>
                      <div className="bg-muted p-4 rounded-lg space-y-4">
                        <h3 className="font-semibold">Featured Image</h3>
                        <div className="flex items-center gap-4">
                            {editingPost.image_url && <img src={editingPost.image_url} alt="Featured" className="w-20 h-20 rounded-lg object-cover" />}
                            <Button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                                <Upload className="mr-2 h-4 w-4" />
                                {uploading ? "Uploading..." : "Upload"}
                            </Button>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        </div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg space-y-4">
                        <h3 className="font-semibold">SEO</h3>
                        <input placeholder="SEO Title" value={editingPost.seo_title || ''} onChange={e => setEditingPost({ ...editingPost, seo_title: e.target.value })} className="w-full p-3 rounded-lg border bg-background" />
                        <textarea placeholder="SEO Description" value={editingPost.seo_description || ''} onChange={e => setEditingPost({ ...editingPost, seo_description: e.target.value })} className="w-full p-3 rounded-lg border bg-background" rows="3" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => { setIsFormVisible(false); setEditingPost(null); }}>Cancel</Button>
                    <Button type="submit"><Save className="mr-2 h-4 w-4" />Save Post</Button>
                  </div>
                </form>
              </motion.div>
            ) : (
                <div className="bg-card p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left"><thead className="text-xs text-muted-foreground uppercase"><tr><th className="py-3 px-4">Title</th><th className="py-3 px-4">Category</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Actions</th></tr></thead>
                        <tbody>
                            {posts.map(post => (
                            <tr key={post.id} className="border-b dark:border-gray-700">
                                <td className="py-3 px-4 font-semibold">{post.title}</td>
                                <td className="py-3 px-4"><span className="bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-full text-xs">{post.categories?.name || 'Uncategorized'}</span></td>
                                <td className="py-3 px-4"><span className={`font-medium ${post.status === 'published' ? 'text-green-500' : 'text-yellow-500'}`}>{post.status}</span></td>
                                <td className="py-3 px-4 flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => navigate(`/blog/${post.slug}`)} disabled={post.status !== 'published'}><Eye className="h-4 w-4"/></Button>
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(post)}><Edit className="h-4 w-4"/></Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)}><Trash2 className="h-4 w-4"/></Button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default BlogDashboardPage;
