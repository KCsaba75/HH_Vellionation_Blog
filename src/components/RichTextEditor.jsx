import React, { useRef, useCallback, useEffect } from 'react';
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

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'align', 'link', 'image', 'width', 'height', 'style', 'alt'
];

const RichTextEditor = ({ value, onChange, placeholder, className }) => {
  const quillRef = useRef(null);
  const toolbarId = useRef(`toolbar-${Math.random().toString(36).substr(2, 9)}`);

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
      img.removeAttribute('height');
      img.style.width = parseInt(newWidth) + 'px';
      img.style.height = 'auto';
      
      quill.update();
    }
  }, []);

  const modules = React.useMemo(() => ({
    toolbar: {
      container: `#${toolbarId.current}`,
    },
    imageUploader: {
      upload: uploadImage
    }
  }), []);

  useEffect(() => {
    const resizeBtn = document.getElementById(`resize-btn-${toolbarId.current}`);
    if (resizeBtn) {
      resizeBtn.onclick = handleImageResize;
    }
  }, [handleImageResize]);

  return (
    <div className="rich-text-editor">
      <div id={toolbarId.current} className="ql-toolbar ql-snow">
        <span className="ql-formats">
          <select className="ql-header" defaultValue="">
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="">Normal</option>
          </select>
        </span>
        <span className="ql-formats">
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-strike" />
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
        </span>
        <span className="ql-formats">
          <select className="ql-align" />
        </span>
        <span className="ql-formats">
          <button className="ql-link" />
          <button className="ql-image" />
        </span>
        <span className="ql-formats">
          <button className="ql-clean" />
        </span>
        <span className="ql-formats">
          <button 
            id={`resize-btn-${toolbarId.current}`}
            type="button" 
            className="ql-resize-image"
            title="Képméret módosítása"
          >
            <svg viewBox="0 0 18 18" width="18" height="18">
              <rect x="2" y="2" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" rx="1"/>
              <path d="M8 14h6a2 2 0 002-2V6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M14 10l2 2-2 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 14l2 2 2-2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </span>
      </div>
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
  );
};

export default RichTextEditor;
