"use client";

import { FC, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { MemoizedMarkdown } from "@/components/copilot/memoized-markdown";

interface IntelligenceAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supplyChainId: string | null;
}

type Status = "idle" | "streaming" | "completed" | "error";

const IntelligenceAnalysisDialog: FC<IntelligenceAnalysisDialogProps> = ({
  isOpen,
  onClose,
  supplyChainId,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // --- useChat integration --------------------------------------------------
  const {
    messages,
    append,
    setMessages,
    isLoading,
    error,
    status: chatStatus,
  } = useChat({
    api: "/api/agent/info",
    body: supplyChainId
      ? {
          supply_chain_id: supplyChainId,
          stream: true,
        }
      : undefined,
    // Use a deterministic chat id per supply chain so the state resets between different analyses
    id: supplyChainId ? `intel-${supplyChainId}` : undefined,
  });

  // Track high-level status for UI copy / button disable logic
  const [status, setStatus] = useState<Status>("idle");

  // Trigger the analysis when the dialog is opened
  useEffect(() => {
    if (isOpen && supplyChainId) {
      // Reset any previous messages
      setMessages([]);

      // Send a user message to kick off the analysis
      append({
        role: "user",
        content: `Please provide a comprehensive intelligence analysis for supply chain ID ${supplyChainId}.`,
      }).catch((err) => console.error("Failed to send analysis request:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, supplyChainId]);

  // Derive UI status from chatStatus / error
  useEffect(() => {
    if (error) {
      setStatus("error");
    } else if (chatStatus === "streaming" || chatStatus === "submitted" || isLoading) {
      setStatus("streaming");
    } else if (messages.some((m) => m.role === "assistant")) {
      setStatus("completed");
    } else {
      setStatus("idle");
    }
  }, [chatStatus, error, isLoading, messages]);

  // Auto-scroll when messages update
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleClose = () => {
    // Prevent closing while streaming unless error
    if (status !== "streaming") {
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
            {status === "streaming" &&
              "The AI agent is analyzing your supply chain in real-time..."}
            {status === "completed" && "Analysis complete. Review the report below."}
            {status === "error" && "An error occurred during the analysis."}
            {status === "idle" && "Preparing for analysis..."}
          </DialogDescription>
        </DialogHeader>

        <div
          ref={contentRef}
          className="prose dark:prose-invert prose-sm max-w-none h-96 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700 my-4"
        >
          {/* Render all assistant messages using memoized markdown */}
          {messages
            .filter((m) => m.role === "assistant")
            .map((m) => (
              <MemoizedMarkdown key={m.id} content={m.content} id={m.id} />
            ))}

          {status === "streaming" && (
            <Loader2 className="w-6 h-6 animate-spin mt-4" />
          )}

          {status === "error" && (
            <div className="text-red-600 text-sm mt-4">
              {error?.message || "Unknown error"}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={status === "streaming"}
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