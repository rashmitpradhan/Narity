import { useState } from 'react';
import { Sparkles, X, BookOpen, Search, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { summarizeText, explainConcept, textToSpeech } from '@/lib/gemini';
import { Separator } from '@/components/ui/separator';

interface AIAssistantProps {
  selectedText: string;
  onClose: () => void;
}

export function AIAssistant({ selectedText, onClose }: AIAssistantProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!selectedText) return;
    setLoading(true);
    setError(null);
    try {
      const res = await summarizeText(selectedText);
      setSummary(res || "Could not generate summary.");
    } catch (err) {
      setError("Failed to generate summary. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!selectedText) return;
    setLoading(true);
    setError(null);
    try {
      const res = await explainConcept(selectedText, selectedText);
      setExplanation(res || "Could not generate explanation.");
    } catch (err) {
      setError("Failed to generate explanation. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string) => {
    if (!text || isSpeaking) return;
    setIsSpeaking(true);
    try {
      const base64Audio = await textToSpeech(text);
      if (base64Audio) {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      }
    } catch (err) {
      console.error("TTS failed", err);
      setIsSpeaking(false);
    }
  };

  return (
    <motion.div
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-background border-l border-border z-50 shadow-2xl flex flex-col"
    >
      <div className="p-10 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="font-serif italic text-xl">AI Assistant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-transparent hover:text-accent">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-10">
        <div className="space-y-10">
          {selectedText ? (
            <div className="space-y-8">
              <div>
                <h4 className="section-label">Selected Passage</h4>
                <p className="font-serif italic text-base leading-relaxed opacity-70">
                  &ldquo;{selectedText}&rdquo;
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline"
                  className="w-full justify-between h-12 rounded-none border-foreground hover:bg-foreground hover:text-background transition-colors group"
                  onClick={handleSummarize} 
                  disabled={loading}
                >
                  <span className="text-[11px] uppercase tracking-[2px]">Summarize</span>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4 opacity-50 group-hover:opacity-100" />}
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-between h-12 rounded-none border-foreground hover:bg-foreground hover:text-background transition-colors group"
                  onClick={handleExplain} 
                  disabled={loading}
                >
                  <span className="text-[11px] uppercase tracking-[2px]">Explain</span>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 opacity-50 group-hover:opacity-100" />}
                </Button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-800 text-xs font-serif italic border border-red-100">
                  {error}
                </div>
              )}

              <AnimatePresence mode="wait">
                {summary && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <Separator className="bg-border/50" />
                    <div className="flex items-center justify-between">
                      <h4 className="section-label">Summary</h4>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 hover:bg-transparent hover:text-accent"
                        onClick={() => handleSpeak(summary)}
                        disabled={isSpeaking}
                      >
                        <Volume2 className={`w-3 h-3 ${isSpeaking ? 'animate-pulse text-accent' : 'opacity-50'}`} />
                      </Button>
                    </div>
                    <div className="font-serif text-[17px] leading-relaxed text-justify opacity-80">
                      {summary}
                    </div>
                  </motion.div>
                )}

                {explanation && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <Separator className="bg-border/50" />
                    <div className="flex items-center justify-between">
                      <h4 className="section-label">Explanation</h4>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 hover:bg-transparent hover:text-accent"
                        onClick={() => handleSpeak(explanation)}
                        disabled={isSpeaking}
                      >
                        <Volume2 className={`w-3 h-3 ${isSpeaking ? 'animate-pulse text-accent' : 'opacity-50'}`} />
                      </Button>
                    </div>
                    <div className="font-serif text-[17px] leading-relaxed text-justify opacity-80">
                      {explanation}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent opacity-30" />
              </div>
              <div className="space-y-2">
                <p className="font-serif italic text-lg">Awaiting Selection</p>
                <p className="text-[11px] uppercase tracking-widest opacity-40 max-w-[200px] mx-auto">
                  Highlight a passage to begin the analysis.
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-10 border-t border-border">
        <p className="text-[9px] uppercase tracking-[0.3em] text-accent text-center opacity-60">
          Lume &mdash; Intelligence Edition
        </p>
      </div>
    </motion.div>
  );
}
