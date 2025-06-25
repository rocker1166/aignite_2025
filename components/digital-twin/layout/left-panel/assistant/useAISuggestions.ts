"use client"

import { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { toast } from "sonner";
import { AISuggestion, AutocompleteSuggestion } from './types';

interface UseAISuggestionsProps {
  nodes: Node[];
  edges: Edge[];
  messages: any[];
}

export const useAISuggestions = ({ nodes, edges, messages }: UseAISuggestionsProps) => {
  // AI Suggestions state
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Autocomplete state
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  
  const suggestionTimeout = useRef<NodeJS.Timeout | null>(null);
  const autocompleteTimeout = useRef<NodeJS.Timeout | null>(null);

  // Generate contextual AI suggestions based on supply chain state
  const generateContextualSuggestions = useCallback(async () => {
    if (nodes.length === 0) return;

    setIsSuggestionsLoading(true);
    try {
      // Use the same rich context as CopilotKit and autocomplete
      const fullNodesContext = {
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
        hasConnections: edges.length > 0,
        hasRisks: nodes.some(n => n.data?.riskScore > 0.5),
        avgRiskScore: nodes.length > 0 ? 
          nodes.reduce((sum, n) => sum + (n.data?.riskScore || 0), 0) / nodes.length : 0
      };

      const fullEdgesContext = {
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
      };

      const fullContext = {
        supply_chain: fullNodesContext,
        connections: fullEdgesContext
      };

      const prompt = `Based on this detailed supply chain context: ${JSON.stringify(fullContext)}, 
        provide 3-5 actionable suggestions to improve efficiency, reduce risks, or optimize operations. Consider the specific nodes, their properties, connections, risk scores, and relationships.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.suggestions) {
          console.log('✅ AI Chat Panel: Received suggestions:', data.suggestions);
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        } else if (data.message) {
          try {
            let jsonText = data.message;
            const markdownJsonMatch = data.message.match(/```json\s*([\s\S]*?)\s*```/);
            if (markdownJsonMatch) {
              jsonText = markdownJsonMatch[1];
            }
            
            const parsedData = JSON.parse(jsonText);
            setSuggestions(parsedData.suggestions || []);
            setShowSuggestions(true);
          } catch (parseError) {
            console.error('Error parsing suggestions JSON:', parseError);
            toast.error('Failed to parse AI suggestions');
          }
        }
      } else {
        const errorData = await response.json();
        // console.error('API Error:', errorData);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate AI suggestions');
    } finally {
      setIsSuggestionsLoading(false);
    }
  }, [nodes, edges]);

  // Generate context-based autocomplete suggestions
  const generateContextualAutocompleteSuggestions = useCallback(async () => {
    setIsAutocompleteLoading(true);
    try {
      const fullNodesContext = {
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
      };

      const fullEdgesContext = {
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
      };

      // Include recent conversation context
      const recentMessages = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content ? msg.content.substring(0, 200) : ''
      }));

      const fullContext = {
        supply_chain: fullNodesContext,
        connections: fullEdgesContext,
        recent_conversation: recentMessages
      };

      const prompt = `Based on the supply chain context and recent conversation: ${JSON.stringify(fullContext)}, 
        provide 4-6 intelligent query suggestions that would be most relevant for the user to ask next. Focus on actionable questions about optimization, analysis, and improvements.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.suggestions) {
          console.log('✅ AI Chat Panel: Received contextual autocomplete suggestions:', data.suggestions);
          const autocompleteSugs = data.suggestions.map((suggestion: any, index: number) => ({
            id: suggestion.id || `contextual-${index}`,
            text: suggestion.title || suggestion.text || suggestion.action,
            description: suggestion.description,
            action: suggestion.action,
            type: 'suggestion' as const,
            confidence: suggestion.confidence || 75
          }));
          setAutocompleteSuggestions(autocompleteSugs);
        } else if (data.message) {
          try {
            let jsonText = data.message;
            const markdownJsonMatch = data.message.match(/```json\s*([\s\S]*?)\s*```/);
            if (markdownJsonMatch) {
              jsonText = markdownJsonMatch[1];
            }
            
            const parsedData = JSON.parse(jsonText);
            const transformedSuggestions = (parsedData.suggestions || []).map((suggestion: any, index: number) => ({
              ...suggestion,
              id: suggestion.id || `parsed-${index}`,
              text: suggestion.title || suggestion.text || suggestion.action,
              action: suggestion.action,
              type: suggestion.type || 'suggestion' as const,
            }));
            setAutocompleteSuggestions(transformedSuggestions);
          } catch (parseError) {
            console.error('Error parsing contextual autocomplete JSON:', parseError);
            const defaultSuggestions = [];
            if (nodes.length > 0) {
              defaultSuggestions.push({
                id: 'default-1',
                text: 'Analyze my supply chain risks',
                description: 'Get insights on potential risks',
                action: 'analyze my supply chain risks',
                type: 'suggestion' as const,
                confidence: 90
              });
              defaultSuggestions.push({
                id: 'default-2',
                text: 'Optimize transportation routes',
                description: 'Find cost-effective routing options',
                action: 'optimize transportation routes',
                type: 'suggestion' as const,
                confidence: 85
              });
            }
            setAutocompleteSuggestions(defaultSuggestions);
          }
        }
      } else {
        // console.error('Contextual autocomplete API error');  
      }
    } catch (error) {
      console.error('Error generating contextual autocomplete:', error);
    } finally {
      setIsAutocompleteLoading(false);
    }
  }, [nodes, edges, messages]);

  // Debounced AI suggestions generator
  const debouncedGenerateSuggestions = useCallback(() => {
    if (suggestionTimeout.current) {
      clearTimeout(suggestionTimeout.current);
    }
    suggestionTimeout.current = setTimeout(() => {
      if (nodes.length > 0) {
        console.log('🔄 Auto-generating debounced suggestions for nodes:', nodes.length);
        generateContextualSuggestions();
      }
    }, 2000); // Debounce for 2 seconds
  }, [nodes, edges, generateContextualSuggestions]);

  // Debounced autocomplete suggestions generator
  const debouncedContextualSuggestions = useCallback(() => {
    if (autocompleteTimeout.current) {
      clearTimeout(autocompleteTimeout.current);
    }
    autocompleteTimeout.current = setTimeout(() => {
      console.log('🔄 Auto-generating debounced contextual autocomplete suggestions');
      generateContextualAutocompleteSuggestions();
    }, 1000); // Debounce for 1 second
  }, [generateContextualAutocompleteSuggestions]);

  // Auto-generate contextual suggestions when canvas changes (debounced)
  useEffect(() => {
    debouncedGenerateSuggestions();
    
    // Cleanup function to clear timeout if component unmounts
    return () => {
      if (suggestionTimeout.current) {
        clearTimeout(suggestionTimeout.current);
      }
    };
  }, [nodes, edges, debouncedGenerateSuggestions]);

  // Auto-generate contextual autocomplete suggestions when context changes (debounced)
  useEffect(() => {
    debouncedContextualSuggestions();
    
    // Cleanup function to clear timeout if component unmounts
    return () => {
      if (autocompleteTimeout.current) {
        clearTimeout(autocompleteTimeout.current);
      }
    };
  }, [nodes, edges, messages, debouncedContextualSuggestions]);

  return {
    suggestions,
    setSuggestions,
    isSuggestionsLoading,
    showSuggestions,
    setShowSuggestions,
    autocompleteSuggestions,
    setAutocompleteSuggestions,
    isAutocompleteLoading,
    generateContextualSuggestions,
    debouncedContextualSuggestions
  };
}; 