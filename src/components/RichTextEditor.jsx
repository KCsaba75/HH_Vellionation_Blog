import React, { useRef, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '@/lib/customSupabaseClient';

const BaseImageFormat = Quill.import('formats/image');
const ImageFormatAttributesList = ['alt', 'height', 'width', 'style'];

class ImageFormat extends BaseImageFormat {
  static formats(domNode) {
    return ImageFormatAttributesList.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  format(name, value) {
    if (ImageFormatAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

Quill.register(ImageFormat, true);

const uploadImageToSupabase = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `content-${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('post_images')
    .upload(fileName, file);
  
  if (uploadError) {
    console.error('Image upload failed:', uploadError.message);
    throw uploadError;
  }
  
  const { data } = supabase.storage.from('post_images').getPublicUrl(fileName);
  return data.publicUrl;
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'align', 'link', 'image', 'width', 'height', 'style', 'alt'
];

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ]
};

const RichTextEditor = ({ value, onChange, placeholder, className }) => {
  const quillRef = useRef(null);

  const handleImageResize = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) {
      alert('Szerkesztő nem elérhető!');
      return;
    }

    const range = quill.getSelection();
    if (!range) {
      alert('Kérlek először kattints a képre a szerkesztőben!');
      return;
    }

    const [leaf] = quill.getLeaf(range.index);
    if (!leaf || !leaf.domNode || leaf.domNode.tagName !== 'IMG') {
      alert('Kérlek először kattints a képre a szerkesztőben!');
      return;
    }

    const img = leaf.domNode;
    const currentWidth = img.getAttribute('width') || img.naturalWidth || 400;
    
    const newWidth = prompt('Add meg a kép szélességét pixelben:', currentWidth);
    
    if (newWidth && !isNaN(newWidth) && parseInt(newWidth) > 0) {
      img.setAttribute('width', parseInt(newWidth));
      img.removeAttribute('height');
      img.style.width = parseInt(newWidth) + 'px';
      img.style.height = 'auto';
      
      quill.update();
    }
  }, []);

  const handlePaste = useCallback(async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          try {
            const url = await uploadImageToSupabase(file);
            const quill = quillRef.current?.getEditor();
            if (quill) {
              const range = quill.getSelection() || { index: quill.getLength() };
              quill.insertEmbed(range.index, 'image', url);
            }
          } catch (err) {
            alert('Képfeltöltés sikertelen: ' + err.message);
          }
        }
        break;
      }
    }
  }, []);

  const handleDrop = useCallback(async (e) => {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type.startsWith('image/')) {
      e.preventDefault();
      try {
        const url = await uploadImageToSupabase(file);
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection() || { index: quill.getLength() };
          quill.insertEmbed(range.index, 'image', url);
        }
      } catch (err) {
        alert('Képfeltöltés sikertelen: ' + err.message);
      }
    }
  }, []);

  return (
    <div className="rich-text-editor">
      <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800 flex items-center gap-3">
        <button
          type="button"
          onClick={handleImageResize}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="10" height="10" rx="1"/>
            <path d="M8 14h6a2 2 0 002-2V6"/>
            <path d="M14 10l2 2-2 2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 14l2 2 2-2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Képméret módosítása
        </button>
        <span className="text-sm text-blue-700 dark:text-blue-300">
          Kattints a képre a szerkesztőben, majd erre a gombra
        </span>
      </div>
      <div onPaste={handlePaste} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        <ReactQuill 
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          className={className}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
