"use client"

import React, { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, AlertTriangle, CloudLightning, Briefcase, ShoppingCart, Building, Loader2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScenarioData, useScenario } from "@/lib/context/scenario-context" 
import { useUser } from "@/lib/stores/user"
import { useToast } from "@/hooks/use-toast"

interface AIScenarioSuggestionsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectScenario: (scenario: ScenarioData) => void
}

export function AIScenarioSuggestions({ open, onOpenChange, onSelectScenario }: AIScenarioSuggestionsProps) {
  const [scenarios, setScenarios] = useState<ScenarioData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { userData } = useUser()
  const { toast } = useToast()
  const { updateScenarioData } = useScenario()
  
  // Force refetch when needed
  const [refreshKey, setRefreshKey] = useState(0)
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // Fetch scenarios from the API when the sheet is opened
  useEffect(() => {
    async function fetchScenarios() {
      if (!open || !userData?.id) return
      
      setIsLoading(true)
      try {
        // Add cache busting parameter to prevent browser caching
        const response = await fetch(`/api/scenario?t=${Date.now()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          body: JSON.stringify({ userId: userData.id }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch scenarios')
        }
        
        const data = await response.json()
        setScenarios(data.scenarios || [])
      } catch (error) {
        console.error('Error fetching scenarios:', error)
        toast({
          title: "Error",
          description: "Failed to fetch AI scenario suggestions",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchScenarios()
  }, [open, userData?.id, toast, refreshKey])
  
  // Handle scenario selection properly
  const handleSelectScenario = (scenario: ScenarioData) => {
    // Update the global scenario context first
    updateScenarioData(scenario);
    
    // Then call the parent component's onSelectScenario handler
    onSelectScenario(scenario);
    
    // Close the sheet
    onOpenChange(false);
  };
  
  // Function to get appropriate icon based on scenario type
  const getScenarioIcon = (type: string) => {
    switch (type) {
      case "disruption":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "natural":
        return <CloudLightning className="h-5 w-5 text-blue-500" />
      case "political":
        return <Briefcase className="h-5 w-5 text-purple-500" />
      case "demand":
        return <ShoppingCart className="h-5 w-5 text-green-500" />
      default:
        return <Building className="h-5 w-5 text-gray-500" />
    }
  }

  // Function to get severity badge color
  const getSeverityColor = (severity: number): "default" | "destructive" | "outline" | "secondary" => {
    if (severity >= 80) return "destructive"
    if (severity >= 60) return "secondary"
    if (severity >= 40) return "outline"
    return "default"
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex justify-between items-center">
            <SheetTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
              AI Scenario Suggestions
            </SheetTitle>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh} 
              disabled={isLoading}
              title="Refresh scenarios"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <SheetDescription>
            Choose from AI-generated scenarios based on your supply chain data and real-world intelligence.
          </SheetDescription>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Generating AI scenarios...</p>
          </div>
        ) : scenarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
            <p className="text-sm text-muted-foreground">No scenarios available. Please ensure you have supply chain data.</p>
          </div>
        ) : (
          <div className="grid gap-4 mt-6">
            {scenarios.map((scenario, index) => (
              <Card key={index} className="border hover:border-blue-400 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {getScenarioIcon(scenario.scenarioType)}
                      <CardTitle className="text-lg ml-2">{scenario.scenarioName}</CardTitle>
                    </div>
                    <Badge variant={getSeverityColor(scenario.disruptionSeverity)}>
                      {scenario.disruptionSeverity}% Severity
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2 mt-1">
                    {scenario.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Duration: {scenario.disruptionDuration} days</span>
                    <span>Affected: {scenario.affectedNode.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleSelectScenario(scenario)}
                  >
                    Apply This Scenario <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}