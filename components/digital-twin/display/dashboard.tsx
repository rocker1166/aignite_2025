"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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

/**
 * Displays and manages the user's supply chain digital twins dashboard.
 *
 * Fetches supply chain data for the logged-in user, handles loading and error states, and provides UI for viewing, refreshing, and creating digital twins. Renders a responsive grid of digital twin cards or appropriate empty/error states based on the current data and user status.
 */
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
      <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
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
              <div key={i} className="space-y-4 p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-md">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-14" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
        <header className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              My Digital Twins
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor your supply chain digital twins
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="shadow-md"
            >
              <RefreshCWIcon className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={16} />
              Retry
            </Button>
            <Button onClick={() => setView('create')} className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-shadow">
              <PlusIcon size={16} className="mr-2" />
              Create New Twin
            </Button>
          </div>
        </header>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
      <header className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            My Digital Twins
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor your supply chain digital twins
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="shadow-md"
          >
            <RefreshCWIcon className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={16} />
            Refresh
          </Button>
          <Button onClick={() => setView('create')} className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-shadow">
            <PlusIcon size={16} className="mr-2" />
            Create New Twin
          </Button>
        </div>
      </header>
      
      <main>
        {supplyChains.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto max-w-md">
              <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Digital Twins Found</h3>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first supply chain digital twin
              </p>
              <Button onClick={() => setView('create')} className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-shadow">
                <PlusIcon size={16} className="mr-2" />
                Create Your First Twin
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {supplyChains.length} supply chain{supplyChains.length !== 1 ? 's' : ''} found
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supplyChains.map((chain) => (
                <DigitalTwinCard 
                  key={chain.supply_chain_id} 
                  twin={formatSupplyChainForCard(chain)} 
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
} 