import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/customSupabaseClient';

const CategorySelector = ({ type, value, onChange, required = false }) => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [type]);

  useEffect(() => {
    // Set initial values from props
    if (value?.category_id) {
      setCategoryId(value.category_id);
      setSubcategoryId(value.subcategory_id || '');
    } else {
      setCategoryId('');
      setSubcategoryId('');
    }
  }, [value]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('position', { ascending: true });
    
    if (!error && data) {
      setCategories(data);
    }
  };

  const mainCategories = categories.filter(c => !c.parent_id);
  const subcategories = categoryId 
    ? categories.filter(c => c.parent_id === categoryId)
    : [];

  const handleMainChange = (e) => {
    const newCategoryId = e.target.value;
    setCategoryId(newCategoryId);
    setSubcategoryId(''); // Reset subcategory when main changes
    onChange({ category_id: newCategoryId, subcategory_id: null });
  };

  const handleSubChange = (e) => {
    const newSubcategoryId = e.target.value;
    setSubcategoryId(newSubcategoryId);
    onChange({ category_id: categoryId, subcategory_id: newSubcategoryId || null });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="main-category">Main Category {required && <span className="text-destructive">*</span>}</Label>
        <select
          id="main-category"
          value={categoryId}
          onChange={handleMainChange}
          className="w-full mt-1 p-2 rounded-lg border bg-background"
          required={required}
        >
          <option value="">Select a category</option>
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
            value={subcategoryId}
            onChange={handleSubChange}
            className="w-full mt-1 p-2 rounded-lg border bg-background"
          >
            <option value="">None</option>
            {subcategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
