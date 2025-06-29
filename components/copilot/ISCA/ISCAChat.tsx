"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useCopilotChat, useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { TextMessage, Role } from "@copilotkit/runtime-client-gql";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/lib/stores/user";
import { getUserSupplyChains } from "@/lib/api/supply-chain";
import { toast } from "sonner";
import { ISCAChatWindow } from '@/components/copilot/ISCA/ISCAChatWindow';
import { ISCAChatToggle } from '@/components/copilot/ISCA/ISCAChatToggle';

interface UserData {
  id: string;
  email: string;
  organisation_name?: string;
  location?: string;
  industry?: string;
  sub_industry?: string;
  description?: string;
}

interface SupplyChainSummary {
  supply_chain_id: string;
  name: string;
  description?: string;
  industry?: string;
  nodeCount: number;
  edgeCount: number;
  avgRiskScore: number;
  lastModified: string;
}

interface SupplyChainData {
  supply_chain_id: string;
  name: string;
  description?: string;
  form_data?: {
    industry?: string;
    [key: string]: any;
  };
  organisation?: {
    industry?: string;
    [key: string]: any;
  };
  nodes?: any[];
  edges?: any[];
  timestamp?: string;
}

interface NavigationPage {
  name: string;
  path: string;
  description: string;
}

export function ISCAChat() {
  const router = useRouter();
  const pathname = usePathname();
  const { userData, userLoading } = useUser();
  const [supplyChains, setSupplyChains] = useState<SupplyChainSummary[]>([]);
  const [loadingSupplyChains, setLoadingSupplyChains] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if CopilotKit is enabled
  const copilotKitEnabled = process.env.NEXT_PUBLIC_COPILOTKIT_ENABLED !== 'false';
  
  // If CopilotKit is not enabled, don't render anything
  if (!copilotKitEnabled) {
    return null;
  }

  // Available navigation pages
  const navigationPages: NavigationPage[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      description: "Main dashboard with overview of all activities and metrics"
    },
    {
      name: "Digital Twin",
      path: "/digital-twin",
      description: "Manage and create supply chain digital twins"
    },
    {
      name: "Strategy",
      path: "/strategy", 
      description: "Strategic planning and analysis tools"
    },
    {
      name: "Simulation",
      path: "/simulation",
      description: "Run supply chain simulations and scenarios"
    },
    {
      name: "Profile",
      path: "/profile",
      description: "User profile and account settings"
    }
  ];

  // Use CopilotKit chat
  const {
    visibleMessages,
    isLoading: isChatLoading,
    appendMessage,
  } = useCopilotChat();

  const messages = visibleMessages;

  // Fetch supply chains when user data is available
  useEffect(() => {
    const fetchSupplyChains = async () => {
      if (!userData?.id || userLoading) return;

      setLoadingSupplyChains(true);
      try {
        const response = await getUserSupplyChains(userData.id);
        
        if (response.status === 'success' && response.data) {
          // Transform supply chain data for the assistant
          const summaries: SupplyChainSummary[] = response.data.map((chain: SupplyChainData) => ({
            supply_chain_id: chain.supply_chain_id,
            name: chain.name || 'Unnamed Supply Chain',
            description: chain.description,
            industry: chain.form_data?.industry || chain.organisation?.industry,
            nodeCount: Array.isArray(chain.nodes) ? chain.nodes.length : 0,
            edgeCount: Array.isArray(chain.edges) ? chain.edges.length : 0,
            avgRiskScore: Array.isArray(chain.nodes) && chain.nodes.length > 0 
              ? chain.nodes.reduce((sum: number, node: any) => sum + (node.data?.riskScore || 0), 0) / chain.nodes.length 
              : 0,
            lastModified: chain.timestamp || new Date().toISOString()
          }));

          setSupplyChains(summaries);
        }
      } catch (error) {
        console.error('Error fetching supply chains for assistant:', error);
      } finally {
        setLoadingSupplyChains(false);
      }
    };

    fetchSupplyChains();
  }, [userData, userLoading]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Provide user data context
  useCopilotReadable({
    description: "Current user profile and organization information",
    value: userData ? {
      user: {
        id: userData.id,
        email: userData.email,
        isAuthenticated: true,
        organisationName: userData.organisation_name,
        location: userData.location,
        industry: userData.industry,
        subIndustry: userData.sub_industry,
        description: userData.description
      },
      currentPage: {
        path: pathname,
        pageName: getPageNameFromPath(pathname)
      }
    } : {
      user: {
        isAuthenticated: false
      },
      currentPage: {
        path: pathname,
        pageName: getPageNameFromPath(pathname)
      }
    }
  });

  // Provide supply chain data context
  useCopilotReadable({
    description: "User's supply chain digital twins and basic information",
    value: {
      supplyChains: supplyChains,
      totalSupplyChains: supplyChains.length,
      industries: [...new Set(supplyChains.map(sc => sc.industry).filter(Boolean))],
      averageComplexity: supplyChains.length > 0 
        ? supplyChains.reduce((sum, sc) => sum + sc.nodeCount, 0) / supplyChains.length 
        : 0,
      averageRiskScore: supplyChains.length > 0
        ? supplyChains.reduce((sum, sc) => sum + sc.avgRiskScore, 0) / supplyChains.length
        : 0,
      loading: loadingSupplyChains
    }
  });

  // Provide navigation context
  useCopilotReadable({
    description: "Available pages and navigation options in the application",
    value: {
      availablePages: navigationPages,
      currentPath: pathname,
      canNavigate: true
    }
  });

  // Navigation action
  useCopilotAction({
    name: "navigateToPage",
    description: "Navigate to a specific page in the application. Use this when the user wants to go to a different section.",
    parameters: [
      {
        name: "pagePath",
        type: "string",
        description: "The path to navigate to (e.g., '/dashboard', '/digital-twin', '/strategy', '/simulation', '/profile')",
        required: true
      }
    ],
    handler: ({ pagePath }) => {
      try {
        const validPage = navigationPages.find(page => 
          page.path === pagePath || page.name.toLowerCase() === pagePath.toLowerCase()
        );

        if (validPage) {
          router.push(validPage.path);
          toast.success(`Navigating to ${validPage.name}`);
          return `Successfully navigating to ${validPage.name} (${validPage.path})`;
        } else {
          if (pagePath.startsWith('/')) {
            router.push(pagePath);
            toast.success(`Navigating to ${pagePath}`);
            return `Successfully navigating to ${pagePath}`;
          } else {
            toast.error(`Invalid page path: ${pagePath}`);
            return `Error: Invalid page path "${pagePath}". Available pages: ${navigationPages.map(p => p.path).join(', ')}`;
          }
        }
      } catch (error) {
        console.error('Navigation error:', error);
        toast.error('Navigation failed');
        return `Error: Failed to navigate to ${pagePath}`;
      }
    }
  });

  // Supply chain navigation action
  useCopilotAction({
    name: "openSupplyChain",
    description: "Open a specific supply chain for editing or viewing.",
    parameters: [
      {
        name: "supplyChainId",
        type: "string", 
        description: "The ID of the supply chain to open",
        required: false
      },
      {
        name: "supplyChainName",
        type: "string",
        description: "The name of the supply chain to open (alternative to ID)",
        required: false
      },
      {
        name: "viewMode",
        type: "string",
        description: "Open in 'edit' mode (default) or 'view' mode (read-only)",
        required: false
      }
    ],
    handler: ({ supplyChainId, supplyChainName, viewMode = 'edit' }) => {
      try {
        let targetChain = null;

        if (supplyChainId) {
          targetChain = supplyChains.find(sc => sc.supply_chain_id === supplyChainId);
        } else if (supplyChainName) {
          targetChain = supplyChains.find(sc => 
            sc.name.toLowerCase().includes(supplyChainName.toLowerCase())
          );
        }

        if (targetChain) {
          const basePath = viewMode === 'view' ? '/digital-twin/view' : '/digital-twin';
          const fullPath = viewMode === 'view' 
            ? `${basePath}/${targetChain.supply_chain_id}`
            : `${basePath}?twinId=${targetChain.supply_chain_id}`;
          
          router.push(fullPath);
          toast.success(`Opening ${targetChain.name} in ${viewMode} mode`);
          return `Successfully opening supply chain "${targetChain.name}" in ${viewMode} mode`;
        } else {
          const availableChains = supplyChains.map(sc => `"${sc.name}" (ID: ${sc.supply_chain_id})`).join(', ');
          return `Error: Supply chain not found. Available supply chains: ${availableChains || 'None'}`;
        }
      } catch (error) {
        console.error('Error opening supply chain:', error);
        toast.error('Failed to open supply chain');
        return `Error: Failed to open supply chain`;
      }
    }
  });

  // Get user insights action
  useCopilotAction({
    name: "getUserInsights",
    description: "Get insights about the user's supply chain portfolio and activities",
    parameters: [],
    handler: () => {
      const insights = {
        totalSupplyChains: supplyChains.length,
        industries: [...new Set(supplyChains.map(sc => sc.industry).filter(Boolean))],
        complexityAnalysis: {
          simple: supplyChains.filter(sc => sc.nodeCount < 5).length,
          moderate: supplyChains.filter(sc => sc.nodeCount >= 5 && sc.nodeCount < 15).length,
          complex: supplyChains.filter(sc => sc.nodeCount >= 15).length
        },
        riskAnalysis: {
          lowRisk: supplyChains.filter(sc => sc.avgRiskScore < 0.3).length,
          mediumRisk: supplyChains.filter(sc => sc.avgRiskScore >= 0.3 && sc.avgRiskScore < 0.7).length,
          highRisk: supplyChains.filter(sc => sc.avgRiskScore >= 0.7).length
        },
        recentActivity: supplyChains
          .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
          .slice(0, 3)
          .map(sc => ({ name: sc.name, lastModified: sc.lastModified }))
      };

      return `User Portfolio Insights:
- Total Supply Chains: ${insights.totalSupplyChains}
- Industries: ${insights.industries.join(', ') || 'Not specified'}
- Complexity: ${insights.complexityAnalysis.simple} simple, ${insights.complexityAnalysis.moderate} moderate, ${insights.complexityAnalysis.complex} complex
- Risk Profile: ${insights.riskAnalysis.lowRisk} low risk, ${insights.riskAnalysis.mediumRisk} medium risk, ${insights.riskAnalysis.highRisk} high risk
- Recent Activity: ${insights.recentActivity.map(sc => sc.name).join(', ') || 'No recent activity'}`;
    }
  });

  const handleSendMessage = async () => {
    if (!input.trim() || isChatLoading) return;

    const userMessage = input.trim();
    setInput('');

    await appendMessage(new TextMessage({
      content: userMessage,
      role: Role.User
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <ISCAChatToggle 
        isOpen={isOpen} 
        onClick={() => setIsOpen(!isOpen)} 
        hasUnreadMessages={false}
      />
      
      <ISCAChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
        isLoading={isChatLoading}
        messagesEndRef={messagesEndRef}
        userName={userData?.organisation_name || userData?.email || 'User'}
      />
    </>
  );
}

// Helper function to get readable page name from path
function getPageNameFromPath(pathname: string): string {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) return "Home";
  
  const mainSegment = pathSegments[0];
  
  switch (mainSegment) {
    case 'dashboard':
      return "Dashboard";
    case 'digital-twin':
      if (pathSegments[1] === 'view') {
        return "Supply Chain View";
      }
      return "Digital Twin";
    case 'strategy':
      return "Strategy";
    case 'simulation':
      if (pathSegments[1] === 'result') {
        return "Simulation Results";
      } else if (pathSegments[1] === 'mitigationstrategy') {
        return "Mitigation Strategy";
      }
      return "Simulation";
    case 'profile':
      return "Profile";
    default:
      return mainSegment.charAt(0).toUpperCase() + mainSegment.slice(1);
  }
}
