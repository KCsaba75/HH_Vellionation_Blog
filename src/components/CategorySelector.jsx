import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/customSupabaseClient';

const CategorySelector = ({ type, value, onChange, required = false }) => {
  const [categories, setCategories] = useState([]);
  const [mainCategory, setMainCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [type]);

  useEffect(() => {
    // Parse incoming value (could be "main" or "main > subcategory")
    if (value) {
      const parts = value.split(' > ');
      setMainCategory(parts[0] || '');
      setSubcategory(parts[1] || '');
    } else {
      setMainCategory('');
      setSubcategory('');
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
  const subcategories = mainCategory 
    ? categories.filter(c => {
        const parentCat = mainCategories.find(mc => mc.name === mainCategory);
        return parentCat && c.parent_id === parentCat.id;
      })
    : [];

  const handleMainChange = (e) => {
    const newMain = e.target.value;
    setMainCategory(newMain);
    setSubcategory(''); // Reset subcategory when main changes
    onChange(newMain); // Pass only main category initially
  };

  const handleSubChange = (e) => {
    const newSub = e.target.value;
    setSubcategory(newSub);
    if (newSub) {
      onChange(`${mainCategory} > ${newSub}`);
    } else {
      onChange(mainCategory);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="main-category">Main Category {required && <span className="text-destructive">*</span>}</Label>
        <select
          id="main-category"
          value={mainCategory}
          onChange={handleMainChange}
          className="w-full mt-1 p-2 rounded-lg border bg-background"
          required={required}
        >
          <option value="">Select a category</option>
          {mainCategories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {mainCategory && subcategories.length > 0 && (
        <div>
          <Label htmlFor="subcategory">Subcategory (Optional)</Label>
          <select
            id="subcategory"
            value={subcategory}
            onChange={handleSubChange}
            className="w-full mt-1 p-2 rounded-lg border bg-background"
          >
            <option value="">None</option>
            {subcategories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
