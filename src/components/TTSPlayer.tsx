import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Slider } from '@/components/ui/slider';

interface TTSPlayerProps {
  text: string;
  onClose: () => void;
  title?: string;
}

export function TTSPlayer({ text, onClose, title }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const newUtterance = new SpeechSynthesisUtterance(text);
    newUtterance.rate = rate;
    newUtterance.pitch = pitch;
    
    newUtterance.onend = () => {
      setIsPlaying(false);
    };

    setUtterance(newUtterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text]);

  useEffect(() => {
    if (utterance) {
      utterance.rate = rate;
      utterance.pitch = pitch;
    }
  }, [rate, pitch, utterance]);

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.cancel();
        if (utterance) {
          window.speechSynthesis.speak(utterance);
        }
      }
      setIsPlaying(true);
    }
  };

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    onClose();
  }, [onClose]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-background border border-border shadow-2xl p-6 flex flex-col gap-4 min-w-[320px] max-w-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-accent" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest opacity-40 font-medium">Audiobook Mode</span>
            {title && <span className="text-xs font-serif italic truncate max-w-[200px]">{title}</span>}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={stop} className="h-6 w-6 hover:bg-transparent hover:text-accent">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-6">
        <Button variant="ghost" size="icon" className="hover:bg-transparent hover:text-accent">
          <SkipBack className="w-5 h-5" />
        </Button>
        <Button 
          onClick={togglePlay}
          className="h-12 w-12 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-transform active:scale-95"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-transparent hover:text-accent">
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-50">
            <span>Tempo</span>
            <span>{rate}x</span>
          </div>
          <Slider 
            value={[rate]} 
            min={0.5} 
            max={2} 
            step={0.1} 
            onValueChange={(vals) => {
              const val = Array.isArray(vals) ? vals[0] : vals;
              setRate(val);
            }}
            className="cursor-pointer"
          />
        </div>
      </div>
    </motion.div>
  );
}
