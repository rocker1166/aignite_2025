"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DigitalTwinCard from '@/components/digital-twin/display/digital-twin-card';
import { useQueryState, parseAsString } from 'nuqs';
import { getUserSupplyChains } from '@/lib/api/supply-chain';
import { useUser } from '@/lib/stores/user';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { RefreshCWIcon, PlusIcon } from '@/components/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SupplyChainData {
  supply_chain_id: string;
  name: string;
  description: string;
  organisation: {
    industry: string;
    location: string;
  };
  form_data: {
    risks: string[];
    industry: string;
  };
  timestamp: string;
  nodes: any[];
  edges: any[];
}

interface ApiResponse {
  status: string;
  data: SupplyChainData[];
  meta: {
    total_supply_chains: number;
    total_nodes: number;
    total_edges: number;
  };
}

// Glassmorphic Card Component
function GlassmorphicCard({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  return (
    <Card 
      className={`border border-white/30 dark:border-slate-600/30 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/40 rounded-xl ${className}`} 
      {...props}
    >
      {children}
    </Card>
  )
}

export default function DigitalTwinDashboard() {
  const [supplyChains, setSupplyChains] = useState<SupplyChainData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useQueryState('view', parseAsString);
  const { userData, userLoading } = useUser();

  const fetchSupplyChains = async () => {
    if (!userData?.id) {
      setError('User not found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response: ApiResponse = await getUserSupplyChains(userData.id);
      
      if (response.status === 'success' && response.data) {
        setSupplyChains(response.data);
      } else {
        setError('Failed to load supply chains');
      }
    } catch (err) {
      console.error('Error fetching supply chains:', err);
      setError(err instanceof Error ? err.message : 'Failed to load supply chains');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Wait for user loading to complete
    if (userLoading) {
      return;
    }

    // If user loading is complete but no user data, set error
    if (!userData?.id) {
      setError('User not found. Please log in.');
      return;
    }

    // User is loaded and available, fetch supply chains
    setLoading(true);
    fetchSupplyChains();
  }, [userLoading, userData?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSupplyChains();
  };

  const formatSupplyChainForCard = (chain: SupplyChainData) => {
    const riskLevel = chain.form_data?.risks?.length > 2 ? 'High Risk' : 
                     chain.form_data?.risks?.length > 1 ? 'Medium Risk' : 'Low Risk';
    
    const date = new Date(chain.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });

    return {
      id: chain.supply_chain_id,
      name: chain.name || 'Unnamed Supply Chain',
      description: chain.description || `${chain.organisation?.industry || 'Supply chain'} operations in ${chain.organisation?.location || 'multiple locations'}`,
      tags: [
        chain.form_data?.industry || chain.organisation?.industry || 'General',
        riskLevel,
        date
      ].filter(Boolean),
    };
  };

  // Show loading skeleton while user is loading or supply chains are loading
  if (userLoading || loading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-cyan-100 dark:from-gray-900 dark:to-slate-900 overflow-x-hidden">
        {/* Enhanced background blurred elements for light mode */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 dark:bg-purple-900 opacity-30 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 dark:bg-blue-900 opacity-25 blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 dark:bg-emerald-900 opacity-20 blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-orange-300 to-amber-400 dark:bg-orange-900 opacity-15 blur-3xl animate-pulse"></div>
        
        <div className="relative p-4 sm:p-6 lg:p-8">
          <header className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </header>
          <main>
            <div className="mb-6">
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <GlassmorphicCard key={i} className="space-y-4 p-6">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-14" />
                  </div>
                </GlassmorphicCard>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-cyan-100 dark:from-gray-900 dark:to-slate-900 overflow-x-hidden">
        {/* Enhanced background blurred elements for light mode */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 dark:bg-purple-900 opacity-30 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 dark:bg-blue-900 opacity-25 blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 dark:bg-emerald-900 opacity-20 blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-orange-300 to-amber-400 dark:bg-orange-900 opacity-15 blur-3xl animate-pulse"></div>
        
        <div className="relative p-4 sm:p-6 lg:p-8">
          <header className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                My Digital Twins
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Manage and monitor your supply chain digital twins
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="shadow-md border-white/30 dark:border-slate-600/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-800/90"
              >
                <RefreshCWIcon className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={16} />
                Retry
              </Button>
              <Button onClick={() => setView('create')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                <PlusIcon size={16} className="mr-2" />
                Create New Twin
              </Button>
            </div>
          </header>
          <GlassmorphicCard className="p-6">
            <Alert variant="destructive" className="border-red-200/30 bg-red-50/70 dark:bg-red-900/10 backdrop-blur-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </GlassmorphicCard>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-cyan-100 dark:from-gray-900 dark:to-slate-900 overflow-x-hidden">
      {/* Enhanced background blurred elements for light mode */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 dark:bg-purple-900 opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 dark:bg-blue-900 opacity-25 blur-3xl"></div>
      <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 dark:bg-emerald-900 opacity-20 blur-2xl"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-orange-300 to-amber-400 dark:bg-orange-900 opacity-15 blur-3xl animate-pulse"></div>
      
      <div className="relative p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              My Digital Twins
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage and monitor your supply chain digital twins
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="shadow-md border-white/30 dark:border-slate-600/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-800/90"
            >
              <RefreshCWIcon className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={16} />
              Refresh
            </Button>
            <Button onClick={() => setView('create')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300">
              <PlusIcon size={16} className="mr-2" />
              Create New Twin
            </Button>
          </div>
        </header>
        
        <main>
          {supplyChains.length === 0 ? (
            <GlassmorphicCard className="text-center py-12">
              <div className="mx-auto max-w-md">
                <div className="mx-auto h-12 w-12 text-slate-600 dark:text-slate-400 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">No Digital Twins Found</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Get started by creating your first supply chain digital twin
                </p>
                <Button onClick={() => setView('create')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <PlusIcon size={16} className="mr-2" />
                  Create Your First Twin
                </Button>
              </div>
            </GlassmorphicCard>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {supplyChains.length} supply chain{supplyChains.length !== 1 ? 's' : ''} found
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supplyChains.map((chain) => (
                  <div key={chain.supply_chain_id} className="group">
                    <GlassmorphicCard className="h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-white/80 dark:hover:bg-slate-800/90">
                      <DigitalTwinCard 
                        twin={formatSupplyChainForCard(chain)} 
                      />
                    </GlassmorphicCard>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
} 