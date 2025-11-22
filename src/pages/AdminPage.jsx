
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit, CheckCircle, Eye, BarChart, User, Upload, Settings, Save, Package, MessageSquare, FileText, X } from 'lucide-react';
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
import HierarchicalCategoryManager from '@/components/HierarchicalCategoryManager';
import CategorySelector from '@/components/CategorySelector';

const AdminPage = () => {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [stats, setStats] = useState({ users: 0, posts: 0, solutions: 0, comments: 0 });
  const [posts, setPosts] = useState([]);
  const [solutions, setSolutions] = useState([]);
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
    const { count: solutionsCount } = await supabase.from('solutions').select('*', { count: 'exact', head: true });
    const { count: commentsCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
    setStats({ users: usersCount, posts: postsCount, solutions: solutionsCount, comments: commentsCount });

    const { data: postsData } = await supabase.from('posts').select('*, profiles!posts_user_id_fkey(name)').order('created_at', { ascending: false });
    setPosts(postsData || []);
    const { data: solutionsData } = await supabase.from('solutions').select('*').order('created_at', { ascending: false });
    setSolutions(solutionsData || []);
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
    } else if (type === 'solution') {
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
    const table = formType === 'post' ? 'posts' : 'solutions';
    
    let postData = { ...editingItem };
    
    delete postData.category;
    
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
    const bucket = formType === 'post' ? 'post_images' : 'solution_images';

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
      <div className="py-6 md:py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">Admin Dashboard</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
              <div className="overflow-x-auto">
                <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-5 gap-1">
                  <TabsTrigger value="dashboard" className="whitespace-nowrap">Dashboard</TabsTrigger>
                  <TabsTrigger value="posts" className="whitespace-nowrap">Blog</TabsTrigger>
                  <TabsTrigger value="solutions" className="whitespace-nowrap">Solutions</TabsTrigger>
                  <TabsTrigger value="users" className="whitespace-nowrap">Users</TabsTrigger>
                  <TabsTrigger value="settings" className="whitespace-nowrap">Settings</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="dashboard">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-card p-6 rounded-xl shadow-lg flex items-center gap-4">
                      <User className="h-8 w-8 text-primary flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold">{stats.users}</span>
                        <span className="text-sm text-muted-foreground">Users</span>
                      </div>
                    </div>
                    <div className="bg-card p-6 rounded-xl shadow-lg flex items-center gap-4">
                      <Edit className="h-8 w-8 text-primary flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold">{stats.posts}</span>
                        <span className="text-sm text-muted-foreground">Blog Posts</span>
                      </div>
                    </div>
                    <div className="bg-card p-6 rounded-xl shadow-lg flex items-center gap-4">
                      <Package className="h-8 w-8 text-primary flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold">{stats.solutions}</span>
                        <span className="text-sm text-muted-foreground">Solutions</span>
                      </div>
                    </div>
                    <div className="bg-card p-6 rounded-xl shadow-lg flex items-center gap-4">
                      <MessageSquare className="h-8 w-8 text-primary flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold">{stats.comments}</span>
                        <span className="text-sm text-muted-foreground">Comments</span>
                      </div>
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="posts">
                 <div className="bg-card p-4 md:p-6 rounded-xl shadow-lg">
                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                     <h2 className="text-xl font-semibold">Manage Blog Posts</h2>
                     <Button onClick={() => handleCreate('post')} className="w-full sm:w-auto">
                       <Plus className="mr-2 h-4 w-4" />Create Post
                     </Button>
                   </div>
                   
                   <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-muted-foreground uppercase">
                            <tr>
                              <th className="py-3 px-4">Title</th>
                              <th className="py-3 px-4">Author</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {posts.map(post => (
                              <tr key={post.id} className="border-b dark:border-gray-700">
                                <td className="py-3 px-4 font-semibold">{post.title}</td>
                                <td className="py-3 px-4">{post.profiles?.name || 'N/A'}</td>
                                <td className="py-3 px-4">
                                  <span className={`font-medium ${post.status === 'published' ? 'text-green-500' : 'text-yellow-500'}`}>
                                    {post.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => navigate(`/blog/${post.slug}`)}>
                                    <Eye className="h-4 w-4"/>
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleEdit(post, 'post')}>
                                    <Edit className="h-4 w-4"/>
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id, 'posts')}>
                                    <Trash2 className="h-4 w-4"/>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                   </div>

                   <div className="md:hidden space-y-3">
                     {posts.map(post => (
                       <div key={post.id} className="bg-background p-4 rounded-lg border space-y-3">
                         <div>
                           <h3 className="font-semibold text-base mb-1">{post.title}</h3>
                           <p className="text-sm text-muted-foreground">By {post.profiles?.name || 'N/A'}</p>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-xs">Status:</span>
                           <span className={`text-xs font-medium ${post.status === 'published' ? 'text-green-500' : 'text-yellow-500'}`}>
                             {post.status}
                           </span>
                         </div>
                         <div className="grid grid-cols-3 gap-2 pt-2">
                           <Button size="sm" variant="outline" onClick={() => navigate(`/blog/${post.slug}`)}>
                             <Eye className="h-4 w-4 mr-1"/>View
                           </Button>
                           <Button size="sm" variant="outline" onClick={() => handleEdit(post, 'post')}>
                             <Edit className="h-4 w-4 mr-1"/>Edit
                           </Button>
                           <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id, 'posts')}>
                             <Trash2 className="h-4 w-4 mr-1"/>Del
                           </Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
              </TabsContent>

              <TabsContent value="solutions">
                 <div className="bg-card p-4 md:p-6 rounded-xl shadow-lg">
                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                     <h2 className="text-xl font-semibold">Manage Solutions</h2>
                     <Button onClick={() => handleCreate('solution')} className="w-full sm:w-auto">
                       <Plus className="mr-2 h-4 w-4" />Create Solution
                     </Button>
                   </div>
                   
                   <div className="hidden md:block overflow-x-auto">
                       <table className="w-full text-sm text-left">
                         <thead className="text-xs text-muted-foreground uppercase">
                           <tr>
                             <th className="py-3 px-4">Name</th>
                             <th className="py-3 px-4">Status</th>
                             <th className="py-3 px-4">Actions</th>
                           </tr>
                         </thead>
                         <tbody>
                          {solutions.map(solution => (
                            <tr key={solution.id} className="border-b dark:border-gray-700">
                              <td className="py-3 px-4 font-semibold">{solution.name}</td>
                              <td className="py-3 px-4">
                                <span className={`font-medium ${solution.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                                  {solution.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(solution, 'solution')}>
                                  <Edit className="h-4 w-4"/>
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(solution.id, 'solutions')}>
                                  <Trash2 className="h-4 w-4"/>
                                </Button>
                              </td>
                            </tr>
                          ))}
                       </tbody>
                       </table>
                   </div>

                   <div className="md:hidden space-y-3">
                     {solutions.map(solution => (
                       <div key={solution.id} className="bg-background p-4 rounded-lg border space-y-3">
                         <div>
                           <h3 className="font-semibold text-base mb-1">{solution.name}</h3>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-xs">Status:</span>
                           <span className={`text-xs font-medium ${solution.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                             {solution.status}
                           </span>
                         </div>
                         <div className="grid grid-cols-2 gap-2 pt-2">
                           <Button size="sm" variant="outline" onClick={() => handleEdit(solution, 'solution')}>
                             <Edit className="h-4 w-4 mr-1"/>Edit
                           </Button>
                           <Button size="sm" variant="destructive" onClick={() => handleDelete(solution.id, 'solutions')}>
                             <Trash2 className="h-4 w-4 mr-1"/>Delete
                           </Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
              </TabsContent>

              <TabsContent value="users">
                <div className="bg-card p-4 md:p-6 rounded-xl shadow-lg">
                   <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
                   
                   <div className="hidden md:block overflow-x-auto">
                       <table className="w-full text-sm text-left">
                         <thead className="text-xs text-muted-foreground uppercase">
                           <tr>
                             <th className="py-3 px-4">Name</th>
                             <th className="py-3 px-4">Email</th>
                             <th className="py-3 px-4">Rank</th>
                             <th className="py-3 px-4">Role</th>
                           </tr>
                         </thead>
                         <tbody>
                          {users.map(userItem => (
                            <tr key={userItem.id} className="border-b dark:border-gray-700">
                              <td className="py-3 px-4 font-semibold">{userItem.name}</td>
                              <td className="py-3 px-4">{userItem.email}</td>
                              <td className="py-3 px-4">{userItem.rank}</td>
                              <td className="py-3 px-4">
                                <select 
                                  value={userItem.role} 
                                  onChange={(e) => handleUserRoleChange(userItem.id, e.target.value)} 
                                  disabled={userItem.id === profile.id} 
                                  className="p-2 rounded-lg border bg-background disabled:opacity-50"
                                >
                                  <option value="member">Member</option>
                                  <option value="blogger">Blogger</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                       </tbody>
                       </table>
                   </div>

                   <div className="md:hidden space-y-3">
                     {users.map(userItem => (
                       <div key={userItem.id} className="bg-background p-4 rounded-lg border space-y-3">
                         <div>
                           <h3 className="font-semibold text-base mb-1">{userItem.name}</h3>
                           <p className="text-sm text-muted-foreground">{userItem.email}</p>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-xs">Rank:</span>
                           <span className="text-xs font-medium">{userItem.rank}</span>
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor={`role-${userItem.id}`} className="text-xs">Role</Label>
                           <select 
                             id={`role-${userItem.id}`}
                             value={userItem.role} 
                             onChange={(e) => handleUserRoleChange(userItem.id, e.target.value)} 
                             disabled={userItem.id === profile.id} 
                             className="w-full p-2 rounded-lg border bg-background disabled:opacity-50 text-sm"
                           >
                             <option value="member">Member</option>
                             <option value="blogger">Blogger</option>
                             <option value="admin">Admin</option>
                           </select>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  <div className="bg-card p-4 md:p-6 rounded-xl shadow-lg space-y-4 md:space-y-6 lg:col-span-2">
                     <div className="flex items-center gap-2">
                       <Settings className="h-5 w-5 text-primary" />
                       <h2 className="text-xl font-semibold">General Settings</h2>
                     </div>
                     <div>
                       <Label htmlFor="facebook-url">Facebook URL</Label>
                       <input 
                         id="facebook-url" 
                         value={socialLinks.facebook} 
                         onChange={e => setSocialLinks({...socialLinks, facebook: e.target.value})} 
                         className="w-full mt-1 p-2 rounded-lg border bg-background" 
                       />
                     </div>
                     <div>
                       <Label htmlFor="instagram-url">Instagram URL</Label>
                       <input 
                         id="instagram-url" 
                         value={socialLinks.instagram} 
                         onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})} 
                         className="w-full mt-1 p-2 rounded-lg border bg-background" 
                       />
                     </div>
                     <Button onClick={() => handleSaveSettings('social_links', socialLinks)} className="w-full sm:w-auto">
                       <Save className="mr-2 h-4 w-4" />Save Social Links
                     </Button>
                  </div>

                  <HierarchicalCategoryManager type="blog" title="Blog Categories" />
                  <HierarchicalCategoryManager type="community" title="Community Categories" />
                  <HierarchicalCategoryManager type="solutions" title="Solutions Categories" />

                  <div className="lg:col-span-2 bg-card p-4 md:p-6 rounded-xl shadow-lg space-y-6 md:space-y-8">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">Page Content</h2>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <Label className="text-base md:text-lg font-medium">Help Center</Label>
                      <ReactQuill 
                        theme="snow" 
                        value={pageContents.help.content} 
                        onChange={(c) => handlePageContentChange('help', c)} 
                        className="mt-2 bg-background"
                      />
                      <Button className="mt-2 w-full sm:w-auto" onClick={() => handleSaveSettings('page_content_help', pageContents.help)}>
                        <Save className="mr-2 h-4 w-4"/>Save Help Page
                      </Button>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <Label className="text-base md:text-lg font-medium">Privacy Policy</Label>
                      <ReactQuill 
                        theme="snow" 
                        value={pageContents.privacy.content} 
                        onChange={(c) => handlePageContentChange('privacy', c)} 
                        className="mt-2 bg-background"
                      />
                      <Button className="mt-2 w-full sm:w-auto" onClick={() => handleSaveSettings('page_content_privacy', pageContents.privacy)}>
                        <Save className="mr-2 h-4 w-4"/>Save Privacy Page
                      </Button>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <Label className="text-base md:text-lg font-medium">Terms of Service</Label>
                      <ReactQuill 
                        theme="snow" 
                        value={pageContents.terms.content} 
                        onChange={(c) => handlePageContentChange('terms', c)} 
                        className="mt-2 bg-background"
                      />
                      <Button className="mt-2 w-full sm:w-auto" onClick={() => handleSaveSettings('page_content_terms', pageContents.terms)}>
                        <Save className="mr-2 h-4 w-4"/>Save Terms Page
                      </Button>
                    </div>
                  </div>

                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingItem?.id ? 'Edit' : 'Create'} {formType}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              {formType === 'post' && (
                <>
                  <div>
                    <Label htmlFor="post-title">Title</Label>
                    <input 
                      id="post-title" 
                      value={editingItem.title || ''} 
                      onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} 
                      className="w-full mt-1 p-2 rounded-lg border bg-background text-sm sm:text-base" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="post-excerpt">Excerpt</Label>
                    <textarea 
                      id="post-excerpt" 
                      value={editingItem.excerpt || ''} 
                      onChange={e => setEditingItem({ ...editingItem, excerpt: e.target.value })} 
                      className="w-full mt-1 p-2 rounded-lg border bg-background text-sm sm:text-base" 
                      rows={2} 
                    />
                  </div>
                  <CategorySelector 
                    type="blog" 
                    value={{ category_id: editingItem.category_id, subcategory_id: editingItem.subcategory_id }} 
                    onChange={(cat) => setEditingItem({ ...editingItem, category_id: cat.category_id, subcategory_id: cat.subcategory_id })} 
                    required 
                  />
                  <div className="prose dark:prose-invert max-w-none">
                    <Label htmlFor="post-content">Content</Label>
                    <ReactQuill 
                      theme="snow" 
                      value={editingItem.content || ''} 
                      onChange={c => setEditingItem({...editingItem, content: c})} 
                      className="mt-1 bg-background" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="post-seo-title">SEO Title</Label>
                    <input 
                      id="post-seo-title" 
                      value={editingItem.seo_title || ''} 
                      onChange={e => setEditingItem({ ...editingItem, seo_title: e.target.value })} 
                      className="w-full mt-1 p-2 rounded-lg border bg-background text-sm sm:text-base" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="post-seo-desc">SEO Description</Label>
                    <textarea 
                      id="post-seo-desc" 
                      value={editingItem.seo_description || ''} 
                      onChange={e => setEditingItem({ ...editingItem, seo_description: e.target.value })} 
                      className="w-full mt-1 p-2 rounded-lg border bg-background text-sm sm:text-base" 
                      rows={2} 
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="post-status" 
                      checked={editingItem.status === 'published'} 
                      onCheckedChange={(checked) => setEditingItem({ ...editingItem, status: checked ? 'published' : 'draft' })} 
                    />
                    <Label htmlFor="post-status">
                      {editingItem.status === 'published' ? 'Published' : 'Draft'}
                    </Label>
                  </div>
                </>
              )}
              {formType === 'solution' && (
                <>
                  <div>
                    <Label htmlFor="solution-name">Name</Label>
                    <input 
                      id="solution-name" 
                      value={editingItem.name || ''} 
                      onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} 
                      className="w-full mt-1 p-2 rounded-lg border bg-background text-sm sm:text-base" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="solution-desc">Description</Label>
                    <textarea 
                      id="solution-desc" 
                      value={editingItem.description || ''} 
                      onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} 
                      className="w-full mt-1 p-2 rounded-lg border bg-background text-sm sm:text-base" 
                      rows={3}
                    />
                  </div>
                  <CategorySelector 
                    type="solutions" 
                    value={{ category_id: editingItem.category_id, subcategory_id: editingItem.subcategory_id }} 
                    onChange={(cat) => setEditingItem({ ...editingItem, category_id: cat.category_id, subcategory_id: cat.subcategory_id })} 
                    required 
                  />
                  <div>
                    <Label htmlFor="solution-affiliate">Affiliate URL</Label>
                    <input 
                      id="solution-affiliate" 
                      value={editingItem.affiliate_url || ''} 
                      onChange={e => setEditingItem({ ...editingItem, affiliate_url: e.target.value })} 
                      className="w-full mt-1 p-2 rounded-lg border bg-background text-sm sm:text-base" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="solution-rating">Rating (1-5)</Label>
                    <input 
                      id="solution-rating" 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={editingItem.rating || 5} 
                      onChange={e => setEditingItem({ ...editingItem, rating: Number(e.target.value) })} 
                      className="w-full mt-1 p-2 rounded-lg border bg-background text-sm sm:text-base" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="solution-seo-title">SEO Title</Label>
                    <input 
                      id="solution-seo-title" 
                      value={editingItem.seo_title || ''} 
                      onChange={e => setEditingItem({ ...editingItem, seo_title: e.target.value })} 
                      className="w-full mt-1 p-2 rounded-lg border bg-background text-sm sm:text-base" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="solution-seo-desc">SEO Description</Label>
                    <textarea 
                      id="solution-seo-desc" 
                      value={editingItem.seo_description || ''} 
                      onChange={e => setEditingItem({ ...editingItem, seo_description: e.target.value })} 
                      className="w-full mt-1 p-2 rounded-lg border bg-background text-sm sm:text-base" 
                      rows={2} 
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="solution-status" 
                      checked={editingItem.status === 'active'} 
                      onCheckedChange={(checked) => setEditingItem({ ...editingItem, status: checked ? 'active' : 'inactive' })} 
                    />
                    <Label htmlFor="solution-status">
                      {editingItem.status === 'active' ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </>
              )}
              
              <div>
                <Label>Image</Label>
                <div className="mt-2 space-y-3">
                  {editingItem.image_url && (
                    <div className="relative inline-block">
                      <img 
                        src={editingItem.image_url} 
                        alt="Preview" 
                        className="w-full max-w-xs rounded-lg object-cover border-2 border-primary" 
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setEditingItem({ ...editingItem, image_url: '' })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button type="submit" className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  {editingItem.id ? 'Update' : 'Create'}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPage;
