'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={(content, delta, source, editor) => {
        if (source === 'user') {
          // Strip out non-breaking spaces that Quill often inserts automatically
          const parsed = content.replace(/&nbsp;/g, ' ');
          onChange(parsed);
        }
      }}
      modules={MODULES}
      placeholder={placeholder}
    />
  );
}
