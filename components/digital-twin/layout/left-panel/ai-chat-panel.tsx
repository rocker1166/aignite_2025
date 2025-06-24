"use client"
import { useState, useRef, useEffect, useMemo } from 'react';
import { MessageSquare, Minimize2, Loader2, Send, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AIInputWithLoading } from '@/components/copilot/ai-input-with-loading';
import { MemoizedMarkdown } from '@/components/copilot/memoized-markdown';
import { useCopilotAction, useCopilotReadable, useCopilotChat } from "@copilotkit/react-core";
import { TextMessage, Role } from "@copilotkit/runtime-client-gql";
import { Node, Edge } from 'reactflow';
import { toast } from "sonner";

interface AIChatPanelProps {
  simulationMode?: boolean;
  onImmersiveModeChange?: (isImmersive: boolean) => void;
  isImmersiveMode?: boolean;
  // CopilotKit integration props
  nodes?: Node[];
  edges?: Edge[];
  onAddNode?: (nodeType: string) => void;
  onAddMultipleNodes?: (nodes: Partial<Node>[]) => void;
  onAddEdges?: (edges: Partial<Edge>[]) => void;
  onLoadTemplate?: (templateId: string) => void;
  onClearCanvas?: () => void;
  onUpdateNode?: (nodeId: string, updates: Partial<Node>) => void;
  onUpdateEdge?: (edgeId: string, updates: Partial<Edge>) => void;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ 
  simulationMode = false, 
  onImmersiveModeChange,
  isImmersiveMode = false,
  nodes = [],
  edges = [],
  onAddNode,
  onAddMultipleNodes,
  onAddEdges,
  onLoadTemplate,
  onClearCanvas,
  onUpdateNode,
  onUpdateEdge
}) => {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Local input state
  const [input, setInput] = useState("");
  
  // CopilotKit chat integration - use proper API
  const {
    visibleMessages, // An array of messages that are currently visible in the chat.
    appendMessage, // A function to append a message to the chat.
    setMessages, // A function to set the messages in the chat.
    deleteMessage, // A function to delete a message from the chat.
    reloadMessages, // A function to reload the messages from the API.
    stopGeneration, // A function to stop the generation of the next message.
    reset, // A function to reset the chat.
    isLoading, // A boolean indicating if the chat is loading.
  } = useCopilotChat();
  
  // Use CopilotKit messages as the source of truth
  const messages = visibleMessages;

  // CopilotKit Context - Make canvas state available to AI
  useCopilotReadable({
    description: "Current supply chain canvas nodes and their configurations",
    value: {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        label: node.data?.label || 'Untitled',
        position: node.position,
        data: {
          description: node.data?.description,
          capacity: node.data?.capacity,
          leadTime: node.data?.leadTime,
          riskScore: node.data?.riskScore,
          location: node.data?.location,
          address: node.data?.address
        }
      })),
      totalNodes: nodes.length,
      nodeTypes: [...new Set(nodes.map(n => n.type))],
      hasConnections: edges.length > 0
    }
  });

  // Make edge/connection information available to AI
  useCopilotReadable({
    description: "Current supply chain connections and transportation routes",
    value: {
      connections: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        transportMode: edge.data?.mode || 'road',
        cost: edge.data?.cost || 0,
        transitTime: edge.data?.transitTime || 0,
        riskMultiplier: edge.data?.riskMultiplier || 1
      })),
      totalConnections: edges.length
    }
  });

  // Generate unique action names to prevent conflicts
  const panelId = useMemo(() => Math.random().toString(36).substr(2, 9), []);

  // CopilotKit Actions - Define what the AI can do
  useCopilotAction({
    name: `addSupplyChainNode_${panelId}`,
    description: "Add a single node to the supply chain canvas",
    parameters: [
      {
        name: "nodeType",
        type: "string",
        description: "Type of node to add (supplier, manufacturer, warehouse, distributor, retailer, customer, 3pl, port)",
        required: true
      },
      {
        name: "label",
        type: "string", 
        description: "Display name/label for the node",
        required: true
      }
    ],
    handler: ({ nodeType, label }) => {
      if (onAddNode) {
        onAddNode(nodeType);
        toast.success(`✅ Added ${label} (${nodeType}) to your supply chain canvas.`);
      }
    }
  });

  useCopilotAction({
    name: `buildCompleteSupplyChain_${panelId}`,
    description: "Build a complete supply chain with multiple nodes and connections",
    parameters: [
      {
        name: "nodes",
        type: "object[]",
        description: "Array of nodes to create",
        attributes: [
          { name: "type", type: "string", description: "Node type (supplier, manufacturer, etc.)" },
          { name: "label", type: "string", description: "Display name" }
        ]
      }
    ],
    handler: ({ nodes: nodesList }) => {
      if (onAddMultipleNodes && nodesList) {
        onAddMultipleNodes(nodesList);
        toast.success(`🏗️ Built a complete supply chain with ${nodesList.length} nodes: ${nodesList.map((n: any) => n.label).join(', ')}`);
      }
    }
  });

  useCopilotAction({
    name: `loadSupplyChainTemplate_${panelId}`,
    description: "Load a predefined supply chain template",
    parameters: [
      {
        name: "templateName",
        type: "string",
        description: "Name of template to load (automotive, electronics, food-beverage, pharma, fashion)",
        required: true
      }
    ],
    handler: ({ templateName }) => {
      if (onLoadTemplate) {
        const templateMap: Record<string, string> = {
          'automotive': 'industry-automotive',
          'electronics': 'industry-electronics', 
          'food-beverage': 'industry-food-beverage',
          'pharma': 'industry-pharma',
          'fashion': 'industry-fashion'
        };

        const templateId = templateMap[templateName.toLowerCase()];
        if (templateId) {
          onLoadTemplate(templateId);
          toast.success(`📋 Loaded ${templateName} supply chain template successfully!`);
        } else {
          toast.error(`❌ Template "${templateName}" not found. Available templates: automotive, electronics, food-beverage, pharma, fashion`);
        }
      }
    }
  });

  useCopilotAction({
    name: `clearCanvas_${panelId}`,
    description: "Clear all nodes and edges from the canvas",
    parameters: [],
    handler: () => {
      if (onClearCanvas) {
        onClearCanvas();
        toast.success("🧹 Cleared the canvas. You can now start building a new supply chain.");
      }
    }
  });

  useCopilotAction({
    name: `analyzeSupplyChain_${panelId}`,
    description: "Analyze the current supply chain and provide insights",
    parameters: [],
    handler: () => {
      const analysis = {
        nodeCount: nodes.length,
        connectionCount: edges.length,
        nodeTypes: [...new Set(nodes.map(n => n.type))],
        hasRisks: nodes.some(n => n.data?.riskScore > 0.5),
        avgRiskScore: nodes.length > 0 ? 
          nodes.reduce((sum, n) => sum + (n.data?.riskScore || 0), 0) / nodes.length : 0
      };
      
      toast.success(`📊 Supply Chain Analysis: ${analysis.nodeCount} nodes, ${analysis.connectionCount} connections, Average risk: ${(analysis.avgRiskScore * 100).toFixed(1)}%`);
    }
  });

  // Calculate dynamic height based on message content length
  const calculateMessagesHeight = () => {
    if (isImmersiveMode) {
      // In immersive mode, use most of the available space
      return 'calc(100vh - 200px)'; // Leave space for header and input
    }
    
    if (messages.length === 0) return 120; // Minimum height for empty state
    
    let totalHeight = 40; // Base padding and spacing
    
    messages.forEach((message) => {
      // For markdown content, estimate slightly more space as it might have formatting
      // Estimate characters per line based on chat bubble width (85% of container)
      // Container is ~280px, bubble is ~85% = ~238px
      // At text-xs (12px), roughly 30-35 characters per line for formatted text
      const charsPerLine = 30;
      const messageLength = message.content.length;
      const estimatedLines = Math.max(1, Math.ceil(messageLength / charsPerLine));
      
      // Height per line: 12px font + 4px line-height + spacing, plus extra for markdown formatting
      const lineHeight = 18; // Increased from 16 to account for markdown elements
      const messageHeight = estimatedLines * lineHeight + 20; // +20 for padding and markdown spacing
      
      totalHeight += messageHeight + 8; // +8 for margin between messages
    });
    
    // Add extra space if loading
    if (isLoading) {
      totalHeight += 40; // Space for loading indicator
    }
    
    // Ensure minimum and maximum bounds
    const minHeight = 120;
    const maxHeight = 400;
    
    return Math.max(minHeight, Math.min(maxHeight, totalHeight));
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleAISubmit = async (message: string) => {
    setIsChatExpanded(true);
    
    try {
      // Use CopilotKit's appendMessage with proper TextMessage format
      await appendMessage(new TextMessage({ 
        content: message, 
        role: Role.User 
      }));
      console.log("Message sent to CopilotKit successfully");
    } catch (error) {
      console.error("Error sending message to CopilotKit:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const onSubmitChat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleAISubmit(input);
    setInput("");
  };

  const handleImmersiveMode = () => {
    onImmersiveModeChange?.(true);
  };

  const handleExitImmersiveMode = () => {
    onImmersiveModeChange?.(false);
  };

  const messagesHeight = calculateMessagesHeight();

  // If in immersive mode, render full-screen chat interface
  if (isImmersiveMode) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Immersive Mode Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              CopilotKit Enabled
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExitImmersiveMode}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages Area - Full Height */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10"
          style={{ height: messagesHeight }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Welcome to AI Assistant</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  I'm here to help you with your supply chain analysis, optimization strategies, 
                  and answer any questions about your network. I can also take actions like adding nodes,
                  loading templates, and analyzing your current setup.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground max-w-[75%]" 
                        : "bg-background border border-border text-foreground shadow-sm max-w-[95%]"
                    }`}
                  >
                    <MemoizedMarkdown content={message.content} id={message.id} />
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-background border border-border rounded-lg p-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse delay-75"></div>
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area - Fixed at Bottom */}
        <div className="p-4 border-t border-border bg-background">
          <form onSubmit={onSubmitChat} className="flex items-center gap-3">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message... (CopilotKit actions available)"
              className="flex-1 text-sm px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="default"
              disabled={isLoading || !input.trim()}
              className="px-4 py-3"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Normal mode rendering
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-muted-foreground px-1 flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          AI Assistant
          <span className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded text-xs">
            CopilotKit
          </span>
        </div>
        {isChatExpanded && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImmersiveMode}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              title="Open in immersive mode"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatExpanded(false)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              title="Minimize chat"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {!isChatExpanded ? (
        // Compact input when not expanded
        <AIInputWithLoading
          placeholder="Ask about your supply chain... (Actions enabled)"
          minHeight={40}
          maxHeight={120}
          onSubmit={handleAISubmit}
          className="py-0"
        />
      ) : (
        // Expanded chat view with dynamic height
        <Card className="border border-border">
          <CardContent className="p-0">
            {/* Messages Area with dynamic height */}
            <div 
              ref={messagesContainerRef}
              className="overflow-y-auto p-3 space-y-2 bg-muted/20 transition-all duration-300 ease-in-out"
              style={{ height: `${messagesHeight}px` }}
            >
              {messages.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4">
                  Start a conversation with your AI assistant.<br/>
                  <span className="text-primary">CopilotKit actions enabled!</span>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`rounded-lg p-2 text-xs ${
                          message.role === "user" 
                            ? "bg-primary text-primary-foreground max-w-[80%]" 
                            : "bg-background border border-border text-foreground max-w-[90%]"
                        }`}
                      >
                        <MemoizedMarkdown content={message.content} id={message.id} />
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-background border border-border rounded-lg p-2">
                    <div className="flex space-x-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse"></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse delay-75"></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="p-2 border-t border-border">
              <form onSubmit={onSubmitChat} className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-1 text-xs px-2 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || !input.trim()}
                  className="h-6 w-6 p-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIChatPanel; 