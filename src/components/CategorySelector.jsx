import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/customSupabaseClient';

const CategorySelector = ({ 
  type, 
  categoryId, 
  subcategoryId, 
  onCategoryChange, 
  onSubcategoryChange,
  required = false
}) => {
  const [mainCategories, setMainCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMainCategories();
  }, [type]);

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories(categoryId);
    } else {
      setSubcategories([]);
      if (subcategoryId) {
        onSubcategoryChange(null);
      }
    }
  }, [categoryId]);

  const fetchMainCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('type', type)
      .is('parent_id', null)
      .order('position', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories:', error);
      setMainCategories([]);
    } else if (data) {
      setMainCategories(data);
    }
    setLoading(false);
  };

  const fetchSubcategories = async (parentId) => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('type', type)
      .eq('parent_id', parentId)
      .order('position', { ascending: true });
    
    if (!error && data) {
      setSubcategories(data);
    } else {
      setSubcategories([]);
    }
  };

  const handleCategoryChange = (e) => {
    const newCategoryId = e.target.value || null;
    onCategoryChange(newCategoryId);
    if (newCategoryId === null) {
      onSubcategoryChange(null);
    }
  };

  const handleSubcategoryChange = (e) => {
    const newSubcategoryId = e.target.value || null;
    onSubcategoryChange(newSubcategoryId);
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading categories...</div>;
  }

  if (mainCategories.length === 0) {
    return (
      <div className="p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">⚠️ No categories available</p>
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
          Please configure Supabase and create categories in Settings first, or follow the SETUP_GUIDE.md.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category">Main Category {required && <span className="text-destructive">*</span>}</Label>
        <select
          id="category"
          value={categoryId || ''}
          onChange={handleCategoryChange}
          className="w-full p-3 rounded-lg border bg-background mt-1"
          required={required}
        >
          <option value="">Select a category...</option>
          {mainCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {categoryId && subcategories.length > 0 && (
        <div>
          <Label htmlFor="subcategory">Subcategory (Optional)</Label>
          <select
            id="subcategory"
            value={subcategoryId || ''}
            onChange={handleSubcategoryChange}
            className="w-full p-3 rounded-lg border bg-background mt-1"
          >
            <option value="">No subcategory</option>
            {subcategories.map(subcat => (
              <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
