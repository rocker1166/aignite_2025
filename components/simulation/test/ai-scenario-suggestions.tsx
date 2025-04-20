"use client"

import React, { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, AlertTriangle, CloudLightning, Briefcase, ShoppingCart, Building } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { aiScenarioSuggestions, ScenarioData } from "@/lib/context/scenario-context"

interface AIScenarioSuggestionsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectScenario: (scenario: ScenarioData) => void
}

export function AIScenarioSuggestions({ open, onOpenChange, onSelectScenario }: AIScenarioSuggestionsProps) {
  
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
          <SheetTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
            AI Scenario Suggestions
          </SheetTitle>
          <SheetDescription>
            Choose from AI-generated scenarios based on industry best practices and common disruption patterns.
          </SheetDescription>
        </SheetHeader>
        
        <div className="grid gap-4 mt-6">
          {aiScenarioSuggestions.map((scenario, index) => (
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
                  onClick={() => {
                    onSelectScenario(scenario)
                    onOpenChange(false)
                  }}
                >
                  Apply This Scenario <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}