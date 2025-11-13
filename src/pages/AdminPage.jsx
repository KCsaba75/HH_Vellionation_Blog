
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit, CheckCircle, Eye, BarChart, User, Upload, Settings, Save, Package, MessageSquare, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { supabase } from '@/lib/customSupabaseClient';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '@/index.css';

const AdminPage = () => {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [stats, setStats] = useState({ users: 0, posts: 0, products: 0, comments: 0 });
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [socialLinks, setSocialLinks] = useState({ facebook: '', instagram: '' });
  const [blogCategories, setBlogCategories] = useState([]);
  const [communityCategories, setCommunityCategories] = useState([]);
  const [pageContents, setPageContents] = useState({
    help: { content: '' },
    privacy: { content: '' },
    terms: { content: '' },
  });

  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
    const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: commentsCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
    setStats({ users: usersCount, posts: postsCount, products: productsCount, comments: commentsCount });

    const { data: postsData } = await supabase.from('posts').select('*, profiles!posts_user_id_fkey(name)').order('created_at', { ascending: false });
    setPosts(postsData || []);
    const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(productsData || []);
    const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(usersData || []);
    
    const { data: settingsData } = await supabase.from('settings').select('key, value');
    if (settingsData) {
      setSocialLinks(settingsData.find(s => s.key === 'social_links')?.value || { facebook: '', instagram: '' });
      setBlogCategories(settingsData.find(s => s.key === 'blog_categories')?.value || []);
      setCommunityCategories(settingsData.find(s => s.key === 'community_categories')?.value || []);
      setPageContents({
        help: settingsData.find(s => s.key === 'page_content_help')?.value || { content: '' },
        privacy: settingsData.find(s => s.key === 'page_content_privacy')?.value || { content: '' },
        terms: settingsData.find(s => s.key === 'page_content_terms')?.value || { content: '' },
      });
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!profile || profile.role !== 'admin') {
        navigate('/');
        return;
      }
      fetchData();
    }
  }, [profile, authLoading, navigate, fetchData]);

  const handleCreate = (type) => {
    if (type === 'post') {
      setEditingItem({
        title: '',
        content: '',
        excerpt: '',
        category: blogCategories[0] || 'General',
        status: 'draft',
        image_url: '',
        seo_title: '',
        seo_description: '',
        user_id: profile.id
      });
    } else if (type === 'product') {
      setEditingItem({
        name: '',
        description: '',
        status: 'active',
        image_url: '',
        affiliate_url: '',
        features: [],
        rating: 5,
        seo_title: '',
        seo_description: ''
      });
    }
    setFormType(type);
    setIsFormOpen(true);
  };

  const handleEdit = (item, type) => {
    setEditingItem(item);
    setFormType(type);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (id, table) => {
    if (!window.confirm(`Are you sure you want to delete this item from ${table}? This cannot be undone.`)) return;
    
    const { error } = await supabase.from(table).delete().eq('id', id);
    if(error){
      toast({title: `Error deleting item from ${table}`, description: error.message, variant: 'destructive'});
    } else {
      toast({title: 'Item deleted!'});
      fetchData();
    }
  };
  
  const handleUserRoleChange = async (userId, newRole) => {
    if (userId === profile.id) {
      toast({ title: 'Cannot change your own role', variant: 'destructive' });
      return;
    }
    
    let newRank;
    if (newRole === 'admin') {
      newRank = 'Vellio Ambassador';
    } else if (newRole === 'blogger') {
      newRank = 'Health Hero';
    }
    
    const updateData = newRank ? { role: newRole, rank: newRank } : { role: newRole };
    const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);
    
    if(error) {
       toast({ title: 'Error updating user role', description: error.message, variant: 'destructive' });
    } else {
       toast({ title: `User role updated to ${newRole}${newRank ? ' with rank ' + newRank : ''}!` });
       fetchData();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const table = formType === 'post' ? 'posts' : 'products';
    
    let postData = { ...editingItem };
    
    if (formType === 'post' && !editingItem.id) {
      const slug = editingItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      postData = { ...postData, slug, user_id: profile.id };
    }
    
    let response;
    if (editingItem.id) {
      response = await supabase.from(table).update(postData).eq('id', editingItem.id);
    } else {
      response = await supabase.from(table).insert(postData);
    }
    
    if (response.error) {
      toast({ title: `Error ${editingItem.id ? 'updating' : 'creating'} ${formType}`, description: response.error.message, variant: 'destructive' });
    } else {
      toast({ title: `${formType} ${editingItem.id ? 'updated' : 'created'} successfully!` });
      setIsFormOpen(false);
      setEditingItem(null);
      fetchData();
    }
  };

  const handleImageUpload = async (event) => {
    if (!event.target.files || event.target.files.length === 0 || !editingItem) return;
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    const bucket = formType === 'post' ? 'post_images' : 'product_images';

    setUploading(true);
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);

    if (uploadError) {
      toast({ title: "Image Upload Failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    setEditingItem({ ...editingItem, image_url: data.publicUrl });
    setUploading(false);
    toast({ title: "Image uploaded successfully!" });
  };
  
  const handleSaveSettings = async (key, value) => {
    const { error } = await supabase.from('settings').update({ value }).eq('key', key);
    if (error) {
      toast({ title: `Error saving ${key}`, description: error.message, variant: 'destructive' });
    } else {
      toast({ title: "Settings updated!" });
    }
  };

  const handleCategoryAction = async (type, action, category) => {
    let currentCategories = type === 'blog' ? [...blogCategories] : [...communityCategories];
    
    if (action === 'add') {
      const newCategory = window.prompt(`Enter new ${type} category name:`);
      if (newCategory && !currentCategories.includes(newCategory)) {
        currentCategories.push(newCategory);
      } else if (newCategory) {
        toast({ title: 'Category already exists', variant: 'destructive' });
        return;
      } else {
        return;
      }
    } else if (action === 'rename') {
      const updatedName = window.prompt(`Rename category "${category}" to:`, category);
      if (updatedName && !currentCategories.includes(updatedName)) {
        const index = currentCategories.indexOf(category);
        if (index > -1) currentCategories[index] = updatedName;
      } else if (updatedName) {
         toast({ title: 'Category name already exists', variant: 'destructive' });
         return;
      } else {
        return;
      }
    } else if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete the category "${category}"?`)) return;
      currentCategories = currentCategories.filter(c => c !== category);
    }
    
    const key = type === 'blog' ? 'blog_categories' : 'community_categories';
    await handleSaveSettings(key, currentCategories);
    fetchData();
  };
  
  const handlePageContentChange = (page, content) => {
    setPageContents(prev => ({...prev, [page]: {content}}));
  };
  
  if (authLoading || !profile || profile.role !== 'admin') {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Helmet><title>Admin Dashboard - Vellio Nation</title></Helmet>
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="posts">Blog</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-card p-6 rounded-xl shadow-lg flex items-center gap-4"><User className="h-8 w-8 text-primary" /><div className="flex flex-col"><span className="text-2xl font-bold">{stats.users}</span><span className="text-muted-foreground">Users</span></div></div>
                    <div className="bg-card p-6 rounded-xl shadow-lg flex items-center gap-4"><Edit className="h-8 w-8 text-primary" /><div className="flex flex-col"><span className="text-2xl font-bold">{stats.posts}</span><span className="text-muted-foreground">Blog Posts</span></div></div>
                    <div className="bg-card p-6 rounded-xl shadow-lg flex items-center gap-4"><Package className="h-8 w-8 text-primary" /><div className="flex flex-col"><span className="text-2xl font-bold">{stats.products}</span><span className="text-muted-foreground">Products</span></div></div>
                    <div className="bg-card p-6 rounded-xl shadow-lg flex items-center gap-4"><MessageSquare className="h-8 w-8 text-primary" /><div className="flex flex-col"><span className="text-2xl font-bold">{stats.comments}</span><span className="text-muted-foreground">Comments</span></div></div>
                 </div>
              </TabsContent>

              <TabsContent value="posts">
                 <div className="bg-card p-6 rounded-xl shadow-lg">
                   <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-semibold">Manage Blog Posts</h2>
                     <Button onClick={() => handleCreate('post')}><Plus className="mr-2 h-4 w-4" />Create Post</Button>
                   </div>
                   <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left"><thead className="text-xs text-muted-foreground uppercase"><tr><th className="py-3 px-4">Title</th><th className="py-3 px-4">Author</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Actions</th></tr></thead>
                        <tbody>
                            {posts.map(post => (<tr key={post.id} className="border-b dark:border-gray-700">
                                <td className="py-3 px-4 font-semibold">{post.title}</td><td className="py-3 px-4">{post.profiles?.name || 'N/A'}</td>
                                <td className="py-3 px-4"><span className={`font-medium ${post.status === 'published' ? 'text-green-500' : 'text-yellow-500'}`}>{post.status}</span></td>
                                <td className="py-3 px-4 flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => navigate(`/blog/${post.slug}`)}><Eye className="h-4 w-4"/></Button>
                                  <Button size="sm" variant="outline" onClick={() => handleEdit(post, 'post')}><Edit className="h-4 w-4"/></Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id, 'posts')}><Trash2 className="h-4 w-4"/></Button>
                                </td>
                            </tr>))}
                        </tbody></table>
                   </div>
                 </div>
              </TabsContent>

              <TabsContent value="products">
                 <div className="bg-card p-6 rounded-xl shadow-lg">
                   <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-semibold">Manage Products</h2>
                     <Button onClick={() => handleCreate('product')}><Plus className="mr-2 h-4 w-4" />Create Product</Button>
                   </div>
                   <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left"><thead className="text-xs text-muted-foreground uppercase"><tr><th className="py-3 px-4">Name</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Actions</th></tr></thead>
                       <tbody>
                          {products.map(product => (<tr key={product.id} className="border-b dark:border-gray-700">
                              <td className="py-3 px-4 font-semibold">{product.name}</td>
                              <td className="py-3 px-4"><span className={`font-medium ${product.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>{product.status}</span></td>
                              <td className="py-3 px-4 flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(product, 'product')}><Edit className="h-4 w-4"/></Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id, 'products')}><Trash2 className="h-4 w-4"/></Button>
                              </td>
                          </tr>))}
                       </tbody></table>
                   </div>
                 </div>
              </TabsContent>

              <TabsContent value="users">
                <div className="bg-card p-6 rounded-xl shadow-lg">
                   <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
                   <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left"><thead className="text-xs text-muted-foreground uppercase"><tr><th className="py-3 px-4">Name</th><th className="py-3 px-4">Email</th><th className="py-3 px-4">Rank</th><th className="py-3 px-4">Role</th></tr></thead>
                       <tbody>
                          {users.map(userItem => (<tr key={userItem.id} className="border-b dark:border-gray-700">
                              <td className="py-3 px-4 font-semibold">{userItem.name}</td>
                              <td className="py-3 px-4">{userItem.email}</td>
                              <td className="py-3 px-4">{userItem.rank}</td>
                              <td className="py-3 px-4">
                                <select value={userItem.role} onChange={(e) => handleUserRoleChange(userItem.id, e.target.value)} disabled={userItem.id === profile.id} className="p-2 rounded-lg border bg-background disabled:opacity-50">
                                  <option value="member">Member</option>
                                  <option value="blogger">Blogger</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                          </tr>))}
                       </tbody></table>
                   </div>
                 </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* General Settings */}
                  <div className="bg-card p-6 rounded-xl shadow-lg space-y-6 lg:col-span-2">
                     <div className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">General Settings</h2></div>
                     <div><Label htmlFor="facebook-url">Facebook URL</Label><input id="facebook-url" value={socialLinks.facebook} onChange={e => setSocialLinks({...socialLinks, facebook: e.target.value})} className="w-full mt-1 p-2 rounded-lg border bg-background" /></div>
                     <div><Label htmlFor="instagram-url">Instagram URL</Label><input id="instagram-url" value={socialLinks.instagram} onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})} className="w-full mt-1 p-2 rounded-lg border bg-background" /></div>
                     <Button onClick={() => handleSaveSettings('social_links', socialLinks)}><Save className="mr-2 h-4 w-4" />Save Social Links</Button>
                  </div>

                  {/* Categories */}
                  <div className="bg-card p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Blog Categories</h2></div><Button size="sm" onClick={() => handleCategoryAction('blog', 'add')}><Plus className="h-4 w-4" /></Button></div>
                    <ul className="space-y-2">
                      {blogCategories.map(cat => (<li key={cat} className="flex items-center justify-between bg-secondary p-2 rounded-md"><span>{cat}</span><div className="flex gap-2"><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCategoryAction('blog', 'rename', cat)}><Edit className="h-4 w-4"/></Button><Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleCategoryAction('blog', 'delete', cat)}><Trash2 className="h-4 w-4"/></Button></div></li>))}
                    </ul>
                  </div>
                  <div className="bg-card p-6 rounded-xl shadow-lg">
                     <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Community Categories</h2></div><Button size="sm" onClick={() => handleCategoryAction('community', 'add')}><Plus className="h-4 w-4" /></Button></div>
                     <ul className="space-y-2">
                      {communityCategories.map(cat => (<li key={cat} className="flex items-center justify-between bg-secondary p-2 rounded-md"><span>{cat}</span><div className="flex gap-2"><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCategoryAction('community', 'rename', cat)}><Edit className="h-4 w-4"/></Button><Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleCategoryAction('community', 'delete', cat)}><Trash2 className="h-4 w-4"/></Button></div></li>))}
                    </ul>
                  </div>

                  {/* Page Content */}
                  <div className="lg:col-span-2 bg-card p-6 rounded-xl shadow-lg space-y-8">
                    <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Page Content</h2></div>
                    <div className="prose dark:prose-invert">
                      <Label className="text-lg font-medium">Help Center</Label>
                      <ReactQuill theme="snow" value={pageContents.help.content} onChange={(c) => handlePageContentChange('help', c)} className="mt-2 bg-background"/>
                      <Button className="mt-2" onClick={() => handleSaveSettings('page_content_help', pageContents.help)}><Save className="mr-2 h-4 w-4"/>Save Help Page</Button>
                    </div>
                    <div className="prose dark:prose-invert">
                      <Label className="text-lg font-medium">Privacy Policy</Label>
                      <ReactQuill theme="snow" value={pageContents.privacy.content} onChange={(c) => handlePageContentChange('privacy', c)} className="mt-2 bg-background"/>
                      <Button className="mt-2" onClick={() => handleSaveSettings('page_content_privacy', pageContents.privacy)}><Save className="mr-2 h-4 w-4"/>Save Privacy Page</Button>
                    </div>
                    <div className="prose dark:prose-invert">
                      <Label className="text-lg font-medium">Terms of Service</Label>
                      <ReactQuill theme="snow" value={pageContents.terms.content} onChange={(c) => handlePageContentChange('terms', c)} className="mt-2 bg-background"/>
                      <Button className="mt-2" onClick={() => handleSaveSettings('page_content_terms', pageContents.terms)}><Save className="mr-2 h-4 w-4"/>Save Terms Page</Button>
                    </div>
                  </div>

                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingItem?.id ? 'Edit' : 'Create'} {formType}</DialogTitle></DialogHeader>
          {editingItem && (
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              {formType === 'post' && (
                <>
                  <div><Label htmlFor="post-title">Title</Label><input id="post-title" value={editingItem.title || ''} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className="w-full mt-1 p-2 rounded-lg border bg-background" required /></div>
                  <div><Label htmlFor="post-excerpt">Excerpt</Label><textarea id="post-excerpt" value={editingItem.excerpt || ''} onChange={e => setEditingItem({ ...editingItem, excerpt: e.target.value })} className="w-full mt-1 p-2 rounded-lg border bg-background" rows={2} /></div>
                  <div><Label htmlFor="post-category">Category</Label><select id="post-category" value={editingItem.category || ''} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className="w-full mt-1 p-2 rounded-lg border bg-background">{blogCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                  <div className="prose dark:prose-invert"><Label htmlFor="post-content">Content</Label><ReactQuill theme="snow" value={editingItem.content || ''} onChange={c => setEditingItem({...editingItem, content: c})} className="mt-1 bg-background" /></div>
                  <div><Label htmlFor="post-seo-title">SEO Title</Label><input id="post-seo-title" value={editingItem.seo_title || ''} onChange={e => setEditingItem({ ...editingItem, seo_title: e.target.value })} className="w-full mt-1 p-2 rounded-lg border bg-background" /></div>
                  <div><Label htmlFor="post-seo-desc">SEO Description</Label><textarea id="post-seo-desc" value={editingItem.seo_description || ''} onChange={e => setEditingItem({ ...editingItem, seo_description: e.target.value })} className="w-full mt-1 p-2 rounded-lg border bg-background" rows={2} /></div>
                  <div className="flex items-center space-x-2"><Switch id="post-status" checked={editingItem.status === 'published'} onCheckedChange={(checked) => setEditingItem({ ...editingItem, status: checked ? 'published' : 'draft' })} /><Label htmlFor="post-status">{editingItem.status === 'published' ? 'Published' : 'Draft'}</Label></div>
                </>
              )}
              {formType === 'product' && (
                <>
                  <div><Label htmlFor="product-name">Name</Label><input id="product-name" value={editingItem.name || ''} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} className="w-full mt-1 p-2 rounded-lg border bg-background" required /></div>
                  <div><Label htmlFor="product-desc">Description</Label><textarea id="product-desc" value={editingItem.description || ''} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full mt-1 p-2 rounded-lg border bg-background" rows={3}/></div>
                  <div><Label htmlFor="product-affiliate">Affiliate URL</Label><input id="product-affiliate" value={editingItem.affiliate_url || ''} onChange={e => setEditingItem({ ...editingItem, affiliate_url: e.target.value })} className="w-full mt-1 p-2 rounded-lg border bg-background" /></div>
                  <div><Label htmlFor="product-rating">Rating (1-5)</Label><input id="product-rating" type="number" min="1" max="5" value={editingItem.rating || 5} onChange={e => setEditingItem({ ...editingItem, rating: Number(e.target.value) })} className="w-full mt-1 p-2 rounded-lg border bg-background" /></div>
                  <div><Label htmlFor="product-seo-title">SEO Title</Label><input id="product-seo-title" value={editingItem.seo_title || ''} onChange={e => setEditingItem({ ...editingItem, seo_title: e.target.value })} className="w-full mt-1 p-2 rounded-lg border bg-background" /></div>
                  <div><Label htmlFor="product-seo-desc">SEO Description</Label><textarea id="product-seo-desc" value={editingItem.seo_description || ''} onChange={e => setEditingItem({ ...editingItem, seo_description: e.target.value })} className="w-full mt-1 p-2 rounded-lg border bg-background" rows={2} /></div>
                  <div className="flex items-center space-x-2"><Switch id="product-status" checked={editingItem.status === 'active'} onCheckedChange={(checked) => setEditingItem({ ...editingItem, status: checked ? 'active' : 'inactive' })} /><Label htmlFor="product-status">{editingItem.status === 'active' ? 'Active' : 'Inactive'}</Label></div>
                </>
              )}
               <div className="flex items-center gap-4">
                    {editingItem.image_url && <img src={editingItem.image_url} alt="Current" className="w-20 h-20 rounded-lg object-cover" />}
                    <Button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading}><Upload className="mr-2 h-4 w-4" />{uploading ? "Uploading..." : "Upload Image"}</Button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
               </div>
              <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose><Button type="submit"><Save className="mr-2 h-4 w-4"/>Save changes</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPage;
