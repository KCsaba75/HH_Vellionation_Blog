import React, { useRef, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import ImageUploader from 'quill-image-uploader';
import BlotFormatter from 'quill-blot-formatter';
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

if (!Quill.imports['formats/image']) {
  Quill.register(ImageFormat, true);
}
if (!Quill.imports['modules/imageUploader']) {
  Quill.register('modules/imageUploader', ImageUploader);
}
if (!Quill.imports['modules/blotFormatter']) {
  Quill.register('modules/blotFormatter', BlotFormatter);
}

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
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ],
  imageUploader: {
    upload: uploadImage
  },
  blotFormatter: {}
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'align', 'link', 'image', 'width', 'height', 'style', 'alt'
];

const RichTextEditor = ({ value, onChange, placeholder, className }) => {
  const quillRef = useRef(null);

  return (
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
  );
};

export default RichTextEditor;
