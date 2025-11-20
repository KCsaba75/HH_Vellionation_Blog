import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from '@/lib/customSupabaseClient';

const HierarchicalCategoryManager = ({ type, title }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', parentId: null });
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('position', { ascending: true });
    
    if (error) {
      toast({ title: 'Error loading categories', description: error.message, variant: 'destructive' });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (category = null, parentId = null) => {
    setEditingCategory(category);
    setFormData({ 
      name: category?.name || '', 
      parentId: parentId || category?.parent_id || null 
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', parentId: null });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const categoryData = {
      name: formData.name,
      slug,
      type,
      parent_id: formData.parentId || null,
      position: 0
    };

    let response;
    if (editingCategory) {
      response = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id);
    } else {
      response = await supabase
        .from('categories')
        .insert(categoryData);
    }

    if (response.error) {
      toast({ 
        title: `Error ${editingCategory ? 'updating' : 'creating'} category`, 
        description: response.error.message, 
        variant: 'destructive' 
      });
    } else {
      toast({ title: `Category ${editingCategory ? 'updated' : 'created'} successfully!` });
      handleCloseDialog();
      fetchCategories();
    }
  };

  const handleDelete = async (categoryId) => {
    const hasChildren = categories.some(c => c.parent_id === categoryId);
    if (hasChildren) {
      toast({ 
        title: 'Cannot delete category', 
        description: 'Please delete all subcategories first.', 
        variant: 'destructive' 
      });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this category?')) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      toast({ title: 'Error deleting category', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Category deleted successfully!' });
      fetchCategories();
    }
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const mainCategories = categories.filter(c => !c.parent_id);
  const getSubcategories = (parentId) => categories.filter(c => c.parent_id === parentId);

  if (loading) {
    return <div className="text-center py-4">Loading categories...</div>;
  }

  return (
    <div className="bg-card p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Main Category
        </Button>
      </div>

      <div className="space-y-2">
        {mainCategories.length === 0 ? (
          <p className="text-muted-foreground text-sm">No categories yet. Create one to get started.</p>
        ) : (
          mainCategories.map(mainCat => {
            const subcategories = getSubcategories(mainCat.id);
            const isExpanded = expandedCategories.has(mainCat.id);

            return (
              <div key={mainCat.id} className="border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between bg-secondary/30 p-3">
                  <div className="flex items-center gap-2">
                    {subcategories.length > 0 && (
                      <button onClick={() => toggleExpand(mainCat.id)} className="hover:bg-secondary p-1 rounded">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    )}
                    <span className="font-semibold">{mainCat.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({subcategories.length} sub{subcategories.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleOpenDialog(null, mainCat.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Sub
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8" 
                      onClick={() => handleOpenDialog(mainCat)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" 
                      onClick={() => handleDelete(mainCat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {isExpanded && subcategories.length > 0 && (
                  <div className="p-3 space-y-2 bg-background">
                    {subcategories.map(subCat => (
                      <div key={subCat.id} className="flex items-center justify-between pl-8 py-2 border-l-2 border-primary/20">
                        <span className="text-sm">{subCat.name}</span>
                        <div className="flex gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7" 
                            onClick={() => handleOpenDialog(subCat)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive" 
                            onClick={() => handleDelete(subCat.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit' : 'Create'} {formData.parentId ? 'Subcategory' : 'Main Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
                className="mt-1"
              />
            </div>
            {formData.parentId && (
              <div className="text-sm text-muted-foreground">
                Parent: {categories.find(c => c.id === formData.parentId)?.name}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HierarchicalCategoryManager;
