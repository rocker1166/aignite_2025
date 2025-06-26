'use client';

import { FC, useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface IntelligenceAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supplyChainId: string | null;
}

type Status = 'idle' | 'streaming' | 'completed' | 'error';

const IntelligenceAnalysisDialog: FC<IntelligenceAnalysisDialogProps> = ({
  isOpen,
  onClose,
  supplyChainId,
}) => {
  const [analysisContent, setAnalysisContent] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && supplyChainId) {
      const performAnalysis = async () => {
        setStatus('streaming');
        setAnalysisContent('## 🚀 Starting Supply Chain Intelligence Analysis...\n\nPreparing to analyze your supply chain configuration. This may take a few moments.\n\n');

        try {
          const response = await fetch('/api/agent/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              supply_chain_id: supplyChainId,
              stream: true,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
          }

          if (!response.body) {
            throw new Error('Response body is null');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          setAnalysisContent(''); // Clear initial message before showing stream

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              setStatus('completed');
              break;
            }
            const chunk = decoder.decode(value);
            setAnalysisContent((prev) => prev + chunk);
          }
        } catch (error) {
          console.error('Streaming failed:', error);
          setAnalysisContent(
            (prev) => prev + `\n\n### ❌ Analysis Failed\n\nAn error occurred while analyzing the supply chain. Please try again later.\n\n**Error:**\n\`\`\`\n${error instanceof Error ? error.message : 'Unknown error'}\n\`\`\``
          );
          setStatus('error');
        }
      };

      performAnalysis();
    } else {
        // Reset state when closed
        setAnalysisContent('');
        setStatus('idle');
    }
  }, [isOpen, supplyChainId]);

  useEffect(() => {
    // Auto-scroll to the bottom
    if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [analysisContent]);

  const handleClose = () => {
    if (status !== 'streaming') {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl w-full mx-4 p-8 rounded-xl shadow-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Supply Chain Intelligence Analysis
          </DialogTitle>
          <DialogDescription className="text-base text-gray-500 dark:text-gray-400">
            {status === 'streaming' && 'The AI agent is analyzing your supply chain in real-time...'}
            {status === 'completed' && 'Analysis complete. Review the report below.'}
            {status === 'error' && 'An error occurred during the analysis.'}
            {status === 'idle' && 'Preparing for analysis...'}
          </DialogDescription>
        </DialogHeader>

        <div 
          ref={contentRef}
          className="prose dark:prose-invert prose-sm max-w-none h-96 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700 my-4"
          style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
        >
            {analysisContent}
            {status === 'streaming' && <Loader2 className="w-6 h-6 animate-spin mt-4" />}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={status === 'streaming'}
            className="w-full sm:w-auto text-base py-3 px-5 rounded-lg"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IntelligenceAnalysisDialog; 