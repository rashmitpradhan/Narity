/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { EpubReader } from './components/EpubReader';
import { PdfReader } from './components/PdfReader';
import { AIAssistant } from './components/AIAssistant';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showAI, setShowAI] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    const buffer = await selectedFile.arrayBuffer();
    setFileData(buffer);
  };

  const resetFile = () => {
    setFile(null);
    setFileData(null);
    setSelectedText('');
    setShowAI(false);
  };

  const handleTextSelect = (text: string) => {
    if (text.trim().length > 5) {
      setSelectedText(text);
      setShowAI(true);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/20">
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.main
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-screen p-6"
            >
              <div className="text-center mb-16 space-y-2">
                <h1 className="text-6xl font-serif italic tracking-tighter">Lume.</h1>
                <p className="section-label !mb-0">The Personal Library</p>
              </div>

              <FileUpload onFileSelect={handleFileSelect} />

              <footer className="mt-24 flex items-center gap-6 text-accent/60">
                <div className="text-[10px] uppercase tracking-[0.2em] font-medium">
                  AI Enhanced
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div className="text-[10px] uppercase tracking-[0.2em] font-medium">
                  Editorial Edition
                </div>
              </footer>
            </motion.main>
          ) : (
            <motion.main
              key="reader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-screen grid grid-cols-[320px_1fr] overflow-hidden"
            >
              {/* Sidebar */}
              <aside className="border-r border-border p-10 flex flex-col bg-background z-20">
                <div className="font-serif italic text-3xl tracking-tighter mb-16">Lume.</div>
                
                <div className="section-label">Current Manuscript</div>
                <div className="mb-12">
                  <h2 className="font-serif text-xl leading-tight mb-2 underline decoration-accent underline-offset-4">{file.name}</h2>
                  <p className="text-xs opacity-60 uppercase tracking-widest">
                    {file.type === 'application/pdf' ? 'PDF Document' : 'EPUB Manuscript'}
                  </p>
                </div>

                <div className="mt-auto">
                  <Button 
                    variant="ghost" 
                    onClick={resetFile}
                    className="w-full justify-start gap-3 px-0 hover:bg-transparent hover:text-accent group"
                  >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-[11px] uppercase tracking-[2px] border-b border-foreground pb-0.5">Library</span>
                  </Button>
                </div>
              </aside>

              {/* Reader Area */}
              <div className="relative flex min-w-0 bg-background">
                <div className="flex-1 flex flex-col min-w-0">
                  {fileData && (
                    file.type === 'application/pdf' ? (
                      <PdfReader 
                        data={fileData} 
                        title={file.name} 
                        onTextSelect={handleTextSelect}
                      />
                    ) : (
                      <EpubReader 
                        data={fileData} 
                        title={file.name} 
                        onTextSelect={handleTextSelect}
                      />
                    )
                  )}
                </div>

                <AnimatePresence>
                  {showAI && (
                    <AIAssistant 
                      selectedText={selectedText} 
                      onClose={() => setShowAI(false)} 
                    />
                  )}
                </AnimatePresence>

                {!showAI && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute bottom-10 right-10 z-20"
                  >
                    <Button
                      size="lg"
                      onClick={() => setShowAI(true)}
                      className="rounded-full h-12 w-12 shadow-xl bg-accent hover:bg-accent/90 text-white p-0"
                    >
                      <Sparkles className="w-5 h-5" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
