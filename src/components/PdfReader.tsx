import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Headphones } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TTSPlayer } from './TTSPlayer';
import { AnimatePresence } from 'motion/react';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfReaderProps {
  data: ArrayBuffer;
  title: string;
  onTextSelect?: (text: string) => void;
}

export function PdfReader({ data, title, onTextSelect }: PdfReaderProps) {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [showTTS, setShowTTS] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadingTask = pdfjsLib.getDocument({ data });
    loadingTask.promise.then((loadedPdf) => {
      setPdf(loadedPdf);
      setNumPages(loadedPdf.numPages);
    });
  }, [data]);

  const renderPage = async (pageNumber: number, canvas: HTMLCanvasElement) => {
    if (!pdf) return;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
  };

  const handleListenPage = async (pageNumber: number) => {
    if (!pdf) return;
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item: any) => item.str).join(' ');
    setCurrentText(text);
    setShowTTS(true);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <header className="h-16 border-b border-border flex items-center justify-between px-10 z-10 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="text-[11px] uppercase tracking-[2px] opacity-50 font-medium">
            Document &mdash; {title}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setScale(prev => Math.max(prev - 0.2, 0.5))} className="hover:bg-transparent hover:text-accent">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-[10px] font-mono w-12 text-center opacity-50">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={() => setScale(prev => Math.min(prev + 0.2, 3))} className="hover:bg-transparent hover:text-accent">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1 p-10">
        <div className="flex flex-col items-center gap-12 max-w-4xl mx-auto" ref={containerRef}>
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNumber) => (
            <PdfPage 
              key={pageNumber} 
              pageNumber={pageNumber} 
              renderPage={renderPage} 
              onTextSelect={onTextSelect}
              onListen={() => handleListenPage(pageNumber)}
            />
          ))}
        </div>
      </ScrollArea>

      <AnimatePresence>
        {showTTS && (
          <TTSPlayer 
            text={currentText} 
            title={`${title} - Page ${currentText.slice(0, 20)}...`} 
            onClose={() => setShowTTS(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface PdfPageProps {
  key?: number | string;
  pageNumber: number;
  renderPage: (num: number, canvas: HTMLCanvasElement) => Promise<void>;
  onTextSelect?: (text: string) => void;
  onListen?: () => void;
}

function PdfPage({ pageNumber, renderPage, onTextSelect, onListen }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && canvasRef.current) {
      renderPage(pageNumber, canvasRef.current);
    }
  }, [isVisible, renderPage, pageNumber]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString();
    if (text && onTextSelect) {
      onTextSelect(text);
    }
  };

  return (
    <div className="relative shadow-sm border border-border bg-white group" onMouseUp={handleMouseUp}>
      <canvas ref={canvasRef} className="max-w-full h-auto" />
      
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onListen}
          className="h-7 px-2 gap-1.5 text-[10px] uppercase tracking-widest bg-background/80 backdrop-blur-md border border-border"
        >
          <Headphones className="w-3 h-3" />
          Listen
        </Button>
        <div className="bg-background/50 text-foreground text-[10px] px-1.5 py-0.5 rounded font-mono backdrop-blur-sm border border-border flex items-center">
          {pageNumber}
        </div>
      </div>
    </div>
  );
}
