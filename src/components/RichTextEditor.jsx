import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import ImageResize from 'tiptap-extension-resize-image';
import { supabase } from '@/lib/customSupabaseClient';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, Image as ImageIcon, Undo, Redo, Heading1, Heading2, Heading3 } from 'lucide-react';

const uploadImageToSupabase = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `content-${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('post_images')
    .upload(fileName, file, {
      cacheControl: '31536000',
      upsert: false
    });
  
  if (uploadError) {
    console.error('Image upload failed:', uploadError.message);
    throw uploadError;
  }
  
  const { data } = supabase.storage.from('post_images').getPublicUrl(fileName);
  return data.publicUrl;
};

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const url = await uploadImageToSupabase(file);
          editor.chain().focus().setImage({ src: url }).run();
        } catch (err) {
          alert('Képfeltöltés sikertelen: ' + err.message);
        }
      }
    };
    input.click();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const buttonClass = (isActive) => 
    `p-2 rounded hover:bg-muted transition-colors ${isActive ? 'bg-muted text-primary' : 'text-muted-foreground'}`;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={buttonClass(editor.isActive('heading', { level: 1 }))} title="Heading 1">
        <Heading1 className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass(editor.isActive('heading', { level: 2 }))} title="Heading 2">
        <Heading2 className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={buttonClass(editor.isActive('heading', { level: 3 }))} title="Heading 3">
        <Heading3 className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-border mx-1 self-center" />
      
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={buttonClass(editor.isActive('bold'))} title="Bold">
        <Bold className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonClass(editor.isActive('italic'))} title="Italic">
        <Italic className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={buttonClass(editor.isActive('underline'))} title="Underline">
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={buttonClass(editor.isActive('strike'))} title="Strikethrough">
        <Strikethrough className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-border mx-1 self-center" />
      
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonClass(editor.isActive('bulletList'))} title="Bullet List">
        <List className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={buttonClass(editor.isActive('orderedList'))} title="Ordered List">
        <ListOrdered className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-border mx-1 self-center" />
      
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={buttonClass(editor.isActive({ textAlign: 'left' }))} title="Align Left">
        <AlignLeft className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={buttonClass(editor.isActive({ textAlign: 'center' }))} title="Align Center">
        <AlignCenter className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={buttonClass(editor.isActive({ textAlign: 'right' }))} title="Align Right">
        <AlignRight className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-border mx-1 self-center" />
      
      <button type="button" onClick={setLink} className={buttonClass(editor.isActive('link'))} title="Add Link">
        <LinkIcon className="w-4 h-4" />
      </button>
      <button type="button" onClick={addImage} className={buttonClass(false)} title="Add Image">
        <ImageIcon className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-border mx-1 self-center" />
      
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`${buttonClass(false)} disabled:opacity-30`} title="Undo">
        <Undo className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`${buttonClass(false)} disabled:opacity-30`} title="Redo">
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
};

const RichTextEditor = ({ value, onChange, placeholder, className, fullWidth = false }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      ImageResize.configure({
        inline: true,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose dark:prose-invert focus:outline-none min-h-[300px] p-6 mx-auto ${fullWidth ? 'max-w-4xl' : 'max-w-none'}`,
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            uploadImageToSupabase(file).then((url) => {
              editor.chain().focus().setImage({ src: url }).run();
            }).catch((err) => {
              alert('Képfeltöltés sikertelen: ' + err.message);
            });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                uploadImageToSupabase(file).then((url) => {
                  editor.chain().focus().setImage({ src: url }).run();
                }).catch((err) => {
                  alert('Képfeltöltés sikertelen: ' + err.message);
                });
              }
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  return (
    <div className={`rich-text-editor border rounded-lg overflow-hidden bg-background ${className || ''}`}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <div className="px-4 py-2 text-xs text-muted-foreground border-t bg-muted/30">
        Húzd a kép sarkait a méretezéshez | Drag & drop vagy Ctrl+V képek beillesztéséhez
      </div>
    </div>
  );
};

export default RichTextEditor;
