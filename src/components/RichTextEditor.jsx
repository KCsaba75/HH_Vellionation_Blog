import React, { useMemo, forwardRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import ImageUploader from 'quill-image-uploader';
import BlotFormatter from 'quill-blot-formatter';
import 'react-quill/dist/quill.snow.css';
import 'quill-image-uploader/dist/quill.imageUploader.min.css';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

if (!Quill.imports['modules/imageUploader']) {
  Quill.register('modules/imageUploader', ImageUploader);
}
if (!Quill.imports['modules/blotFormatter']) {
  Quill.register('modules/blotFormatter', BlotFormatter);
}

const RichTextEditor = forwardRef(({ value, onChange, placeholder, className }, ref) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
    imageUploader: {
      upload: async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `content-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post_images')
          .upload(fileName, file);
        
        if (uploadError) {
          toast({ title: "Image Upload Failed", description: uploadError.message, variant: "destructive" });
          throw uploadError;
        }
        
        const { data } = supabase.storage.from('post_images').getPublicUrl(fileName);
        return data.publicUrl;
      }
    },
    blotFormatter: {}
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'align', 'link', 'image', 'width', 'height', 'style'
  ];

  return (
    <ReactQuill 
      ref={ref}
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      className={className}
      placeholder={placeholder}
    />
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
