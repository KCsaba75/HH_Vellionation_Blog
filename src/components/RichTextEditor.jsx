import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { supabase } from '@/lib/customSupabaseClient';

const RichTextEditor = ({ value, onChange, placeholder, className }) => {
  const editorRef = useRef(null);

  const handleImageUpload = async (blobInfo, progress) => {
    const file = blobInfo.blob();
    const fileExt = blobInfo.filename().split('.').pop() || 'png';
    const fileName = `content-${Date.now()}.${fileExt}`;
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('post_images')
        .upload(fileName, file);
      
      if (uploadError) {
        console.error('Image upload failed:', uploadError.message);
        throw new Error('Képfeltöltés sikertelen: ' + uploadError.message);
      }
      
      const { data } = supabase.storage.from('post_images').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  return (
    <div className={`rich-text-editor ${className || ''}`}>
      <Editor
        tinymceScriptSrc="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js"
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height: 400,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'image link | removeformat | help',
          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 16px; }',
          placeholder: placeholder || 'Írj ide...',
          image_advtab: true,
          image_caption: true,
          automatic_uploads: true,
          images_upload_handler: handleImageUpload,
          file_picker_types: 'image',
          paste_data_images: true,
          object_resizing: true,
          resize_img_proportional: true,
          skin: document.documentElement.classList.contains('dark') ? 'oxide-dark' : 'oxide',
          content_css: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
          promotion: false,
          branding: false
        }}
      />
    </div>
  );
};

export default RichTextEditor;
