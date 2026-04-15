import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { motion } from 'motion/react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/epub+zip' || file.type === 'application/pdf' || file.name.endsWith('.epub'))) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md w-full mx-auto"
    >
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="flex flex-col items-center justify-center w-full h-48 border border-dashed border-accent rounded-sm cursor-pointer bg-transparent hover:bg-zinc-50 transition-all group"
      >
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-xs uppercase tracking-[2px] text-accent font-semibold mb-2">
            Add to Collection
          </p>
          <p className="text-[13px] text-foreground/60 font-serif italic">
            Drop your EPUB or PDF here<br/>to add to library
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".epub,application/pdf"
          onChange={onFileChange}
        />
      </label>

      <div className="mt-12 grid grid-cols-1 gap-8">
        <div className="border-t border-border pt-6">
          <h3 className="section-label">Format Support</h3>
          <div className="flex justify-between items-baseline">
            <span className="font-serif italic text-lg">Manuscripts</span>
            <span className="text-[10px] uppercase tracking-widest opacity-50">EPUB</span>
          </div>
          <div className="flex justify-between items-baseline mt-2">
            <span className="font-serif italic text-lg">Documents</span>
            <span className="text-[10px] uppercase tracking-widest opacity-50">PDF</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
