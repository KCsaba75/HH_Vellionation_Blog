import React, { useRef, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import ImageUploader from 'quill-image-uploader';
import 'react-quill/dist/quill.snow.css';
import 'quill-image-uploader/dist/quill.imageUploader.min.css';
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
Quill.register('modules/imageUploader', ImageUploader);

const uploadImage = async (file) => {
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

const modules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean'],
      ['imageResize']
    ]
  },
  imageUploader: {
    upload: uploadImage
  }
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'align', 'link', 'image', 'width', 'height', 'style', 'alt'
];

const RichTextEditor = ({ value, onChange, placeholder, className }) => {
  const quillRef = useRef(null);

  const handleImageResize = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

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
      img.setAttribute('height', 'auto');
      img.style.width = parseInt(newWidth) + 'px';
      img.style.height = 'auto';
      
      quill.update();
    }
  }, []);

  const handleEditorMount = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const toolbar = quill.getModule('toolbar');
    if (toolbar) {
      toolbar.addHandler('imageResize', handleImageResize);
    }
  }, [handleImageResize]);

  return (
    <div className="rich-text-editor">
      <ReactQuill 
        ref={(el) => {
          quillRef.current = el;
          if (el) {
            setTimeout(handleEditorMount, 100);
          }
        }}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        className={className}
        placeholder={placeholder}
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={handleImageResize}
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Képméret módosítása
        </button>
        <span className="text-xs text-muted-foreground self-center">
          Kattints a képre, majd erre a gombra a méretezéshez
        </span>
      </div>
    </div>
  );
};

export default RichTextEditor;
