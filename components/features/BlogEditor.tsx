'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Undo,
  Redo,
  Eye,
  Edit3,
} from 'lucide-react';

interface BlogEditorProps {
  initialContent?: string;
  initialTitle?: string;
  onChange?: (data: { title: string; content: string }) => void;
  placeholder?: string;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, onClick, active, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      active
        ? 'bg-sage/20 text-sage'
        : 'text-stone hover:bg-sand/50 hover:text-bark'
    }`}
  >
    {icon}
  </button>
);

const ToolbarDivider = () => <div className="w-px h-6 bg-sand mx-1" />;

export function BlogEditor({
  initialContent = '',
  initialTitle = '',
  onChange,
  placeholder = 'Start writing your story...',
}: BlogEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isPreview, setIsPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(initialContent);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  }, []);

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange?.({ title, content: newContent });
    }
  }, [title, onChange]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onChange?.({ title: newTitle, content });
  }, [content, onChange]);

  const insertHeading = useCallback((level: 1 | 2 | 3) => {
    execCommand('formatBlock', `h${level}`);
  }, [execCommand]);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  }, [execCommand]);

  const insertHorizontalRule = useCallback(() => {
    execCommand('insertHorizontalRule');
  }, [execCommand]);

  const insertCodeBlock = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = selection.toString() || 'code here';
      pre.appendChild(code);
      range.deleteContents();
      range.insertNode(pre);
      handleContentChange();
    }
  }, [handleContentChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Keyboard shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            execCommand('redo');
          } else {
            e.preventDefault();
            execCommand('undo');
          }
          break;
      }
    }
  }, [execCommand]);

  return (
    <div className="bg-white rounded-2xl border border-sand/50 overflow-hidden shadow-soft">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-sand/50 bg-cream/30 flex-wrap">
        <ToolbarButton
          icon={<Heading1 size={18} />}
          onClick={() => insertHeading(1)}
          title="Heading 1"
        />
        <ToolbarButton
          icon={<Heading2 size={18} />}
          onClick={() => insertHeading(2)}
          title="Heading 2"
        />
        <ToolbarButton
          icon={<Heading3 size={18} />}
          onClick={() => insertHeading(3)}
          title="Heading 3"
        />
        
        <ToolbarDivider />
        
        <ToolbarButton
          icon={<Bold size={18} />}
          onClick={() => execCommand('bold')}
          title="Bold (⌘B)"
        />
        <ToolbarButton
          icon={<Italic size={18} />}
          onClick={() => execCommand('italic')}
          title="Italic (⌘I)"
        />
        <ToolbarButton
          icon={<Underline size={18} />}
          onClick={() => execCommand('underline')}
          title="Underline (⌘U)"
        />
        <ToolbarButton
          icon={<Strikethrough size={18} />}
          onClick={() => execCommand('strikeThrough')}
          title="Strikethrough"
        />
        
        <ToolbarDivider />
        
        <ToolbarButton
          icon={<List size={18} />}
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
        />
        <ToolbarButton
          icon={<ListOrdered size={18} />}
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
        />
        <ToolbarButton
          icon={<Quote size={18} />}
          onClick={() => execCommand('formatBlock', 'blockquote')}
          title="Quote"
        />
        
        <ToolbarDivider />
        
        <ToolbarButton
          icon={<Link size={18} />}
          onClick={insertLink}
          title="Insert Link"
        />
        <ToolbarButton
          icon={<Image size={18} />}
          onClick={insertImage}
          title="Insert Image"
        />
        <ToolbarButton
          icon={<Code size={18} />}
          onClick={insertCodeBlock}
          title="Code Block"
        />
        <ToolbarButton
          icon={<Minus size={18} />}
          onClick={insertHorizontalRule}
          title="Horizontal Rule"
        />
        
        <ToolbarDivider />
        
        <ToolbarButton
          icon={<Undo size={18} />}
          onClick={() => execCommand('undo')}
          title="Undo (⌘Z)"
        />
        <ToolbarButton
          icon={<Redo size={18} />}
          onClick={() => execCommand('redo')}
          title="Redo (⌘⇧Z)"
        />
        
        <div className="flex-1" />
        
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isPreview
              ? 'bg-sage text-white'
              : 'bg-sand/50 text-stone hover:bg-sand'
          }`}
        >
          {isPreview ? <Edit3 size={16} /> : <Eye size={16} />}
          {isPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Title Input */}
      <div className="px-6 pt-6">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="w-full text-3xl font-serif font-bold text-bark placeholder-stone/30 bg-transparent border-none outline-none"
        />
      </div>

      {/* Content Editor / Preview */}
      <div className="px-6 py-4 min-h-[400px]">
        {isPreview ? (
          <div
            className="prose prose-lg prose-bark max-w-none blog-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentChange}
            onKeyDown={handleKeyDown}
            data-placeholder={placeholder}
            className="min-h-[350px] outline-none text-bark prose prose-lg max-w-none 
              [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-stone/40
              [&_h1]:text-2xl [&_h1]:font-serif [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
              [&_h2]:text-xl [&_h2]:font-serif [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4
              [&_p]:mb-4 [&_p]:leading-relaxed
              [&_blockquote]:border-l-4 [&_blockquote]:border-sage [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-stone [&_blockquote]:my-4
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
              [&_li]:mb-1
              [&_pre]:bg-bark [&_pre]:text-cream [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-4
              [&_code]:font-mono [&_code]:text-sm
              [&_a]:text-sage [&_a]:underline [&_a]:hover:text-sage-dark
              [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-4
              [&_hr]:border-sand [&_hr]:my-6"
          />
        )}
      </div>

      {/* Word Count */}
      <div className="px-6 py-3 border-t border-sand/50 bg-cream/30 text-sm text-stone">
        {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} words
        {' · '}
        {Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length / 200))} min read
      </div>
    </div>
  );
}

export default BlogEditor;


