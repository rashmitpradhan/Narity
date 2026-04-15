import { useState, useRef } from 'react';
import { ReactReader } from 'react-reader';
import { Button } from '@/components/ui/button';
import { Type, Sidebar, Headphones } from 'lucide-react';
import { TTSPlayer } from './TTSPlayer';
import { AnimatePresence } from 'motion/react';

interface EpubReaderProps {
  data: ArrayBuffer;
  title: string;
  onTextSelect?: (text: string) => void;
}

export function EpubReader({ data, title, onTextSelect }: EpubReaderProps) {
  const [location, setLocation] = useState<string | number>(0);
  const [fontSize, setFontSize] = useState(100);
  const [showToc, setShowToc] = useState(false);
  const [showTTS, setShowTTS] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const renditionRef = useRef<any>(null);

  const locationChanged = (epubcifi: string) => {
    setLocation(epubcifi);
  };

  const handleTextSelection = (rendition: any) => {
    rendition.on('selected', (cfiRange: string, contents: any) => {
      const text = rendition.getRange(cfiRange).toString();
      if (text && onTextSelect) {
        onTextSelect(text);
      }
      contents.window.getSelection().removeAllRanges();
    });
  };

  const startAudiobook = async () => {
    if (renditionRef.current) {
      const { rendition } = renditionRef.current;
      // Extract text from current view
      const contents = rendition.getContents();
      if (contents && contents.length > 0) {
        const text = contents[0].document.body.innerText;
        setCurrentText(text);
        setShowTTS(true);
      }
    }
  };

  return (
    <div className="relative h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-10 z-10 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => setShowToc(!showToc)} className="h-8 w-8 hover:bg-transparent hover:text-accent">
            <Sidebar className="w-4 h-4" />
          </Button>
          <div className="text-[11px] uppercase tracking-[2px] opacity-50 font-medium">
            Manuscript &mdash; {title}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={startAudiobook}
            className="gap-2 hover:bg-transparent hover:text-accent group"
          >
            <Headphones className="w-4 h-4 opacity-50 group-hover:opacity-100" />
            <span className="text-[10px] uppercase tracking-widest">Listen</span>
          </Button>

          <div className="w-px h-4 bg-border mx-2" />

          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-transparent hover:text-accent"
              onClick={() => setFontSize(prev => Math.max(prev - 10, 50))}
            >
              <Type className="w-3 h-3" />
            </Button>
            <span className="text-[10px] font-mono opacity-50">{fontSize}%</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-transparent hover:text-accent"
              onClick={() => setFontSize(prev => Math.min(prev + 10, 200))}
            >
              <Type className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Reader Area */}
      <div className="flex-1 relative px-10 py-6">
        <ReactReader
          url={data}
          location={location}
          locationChanged={locationChanged}
          getRendition={(rendition) => {
            renditionRef.current = { rendition };
            rendition.themes.fontSize(`${fontSize}%`);
            handleTextSelection(rendition);
            
            rendition.themes.register('editorial', {
              body: { 
                background: '#FDFCFB', 
                color: '#1A1A1A',
                fontFamily: 'Georgia, serif !important',
                lineHeight: '1.7 !important',
                textAlign: 'justify !important'
              },
              'p': {
                marginBottom: '1.5em !important'
              }
            });
            rendition.themes.select('editorial');
          }}
          epubOptions={{
            flow: 'paginated',
            manager: 'default'
          }}
          swipeable
          showToc={showToc}
        />
      </div>

      <AnimatePresence>
        {showTTS && (
          <TTSPlayer 
            text={currentText} 
            title={title} 
            onClose={() => setShowTTS(false)} 
          />
        )}
      </AnimatePresence>

      {/* Custom Styles for ReactReader */}
      <style dangerouslySetInnerHTML={{ __html: `
        .epub-container {
          background-color: #FDFCFB !important;
        }
        .epub-view {
          background-color: #FDFCFB !important;
        }
        .react-reader-toc {
          background-color: #FDFCFB !important;
          color: #1A1A1A !important;
          border-right: 1px solid rgba(26, 26, 26, 0.1) !important;
          font-family: Georgia, serif !important;
        }
        .react-reader-toc-item {
          color: rgba(26, 26, 26, 0.6) !important;
          font-size: 14px !important;
        }
        .react-reader-toc-item:hover {
          color: #9A8478 !important;
          text-decoration: underline !important;
        }
      `}} />
    </div>
  );
}
