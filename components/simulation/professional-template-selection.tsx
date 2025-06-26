"use client"

import { useState } from "react"
import { 
  Sparkles, 
  FileText, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  Building, 
  Globe, 
  Factory, 
  Truck, 
  ShoppingCart, 
  Plus, 
  ChevronRight,
  Filter,
  Search,
  Layers,
  Shield,
  BarChart3
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ScenarioData } from "@/lib/context/scenario-context"
import { ForecastScenarios } from "./forecast-scenarios"

// Enhanced Glassmorphic Card Component
function GlassmorphicCard({ 
  children, 
  className = "", 
  hover = true,
  ...props 
}: { 
  children: React.ReactNode
  className?: string
  hover?: boolean
  [key: string]: any 
}) {
  return (
    <Card 
      className={cn(
        "border border-white/30 dark:border-slate-700/10 bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/20 rounded-xl transition-all duration-300",
        hover && "hover:shadow-2xl hover:bg-white/80 dark:hover:bg-slate-950/70 hover:scale-[1.02] cursor-pointer",
        className
      )} 
      {...props}
    >
      {children}
    </Card>
  )
}

interface ScenarioTemplate {
  id: string
  name: string
  description: string
  category: 'popular' | 'industry' | 'advanced' | 'forecast'
  icon: React.ComponentType<{ className?: string }>
  severity: 'low' | 'medium' | 'high' | 'critical'
  duration: string
  complexity: 'simple' | 'moderate' | 'complex'
  tags: string[]
  scenarioData: ScenarioData
  isRecommended?: boolean
  popularity?: number
}

const scenarioTemplates: ScenarioTemplate[] = [
  {
    id: 'supplier-disruption',
    name: 'Supplier Disruption',
    description: 'Analyze impact when a key supplier faces operational issues or closure',
    category: 'popular',
    icon: Factory,
    severity: 'high',
    duration: '2-4 weeks',
    complexity: 'simple',
    tags: ['Supplier Risk', 'Single Point of Failure', 'Quick Analysis'],
    isRecommended: true,
    popularity: 95,
    scenarioData: {
      scenarioName: 'Key Supplier Disruption',
      scenarioType: 'disruption',
      description: 'A critical supplier experiences operational disruption affecting production capacity by 70-80%',
      disruptionSeverity: 75,
      disruptionDuration: 14,
      affectedNode: 'supplier-a',
      startDate: '',
      endDate: '',
      monteCarloRuns: 1000,
      distributionType: 'normal',
      cascadeEnabled: true,
      failureThreshold: 50,
      bufferPercent: 15,
      alternateRouting: true,
      randomSeed: ''
    }
  },
  {
    id: 'natural-disaster',
    name: 'Natural Disaster Impact',
    description: 'Simulate effects of earthquakes, floods, or severe weather on supply chain',
    category: 'popular',
    icon: AlertTriangle,
    severity: 'critical',
    duration: '1-3 months',
    complexity: 'moderate',
    tags: ['Natural Disaster', 'Geographic Risk', 'Extended Impact'],
    isRecommended: true,
    popularity: 88,
    scenarioData: {
      scenarioName: 'Regional Natural Disaster',
      scenarioType: 'natural',
      description: 'Major natural disaster affecting multiple facilities and transportation routes in a region',
      disruptionSeverity: 85,
      disruptionDuration: 45,
      affectedNode: 'supplier-a,warehouse-central',
      startDate: '',
      endDate: '',
      monteCarloRuns: 1500,
      distributionType: 'normal',
      cascadeEnabled: true,
      failureThreshold: 40,
      bufferPercent: 20,
      alternateRouting: true,
      randomSeed: ''
    }
  },
  {
    id: 'demand-surge',
    name: 'Sudden Demand Surge',
    description: 'Test capacity when facing unexpected spike in customer demand',
    category: 'popular',
    icon: TrendingUp,
    severity: 'medium',
    duration: '2-8 weeks',
    complexity: 'simple',
    tags: ['Demand Planning', 'Capacity Stress', 'Market Response'],
    popularity: 82,
    scenarioData: {
      scenarioName: 'Unexpected Demand Surge',
      scenarioType: 'demand',
      description: 'Sudden 300% increase in demand due to viral marketing or competitor shortage',
      disruptionSeverity: 60,
      disruptionDuration: 21,
      affectedNode: 'factory-main,distribution-center',
      startDate: '',
      endDate: '',
      monteCarloRuns: 800,
      distributionType: 'normal',
      cascadeEnabled: false,
      failureThreshold: 70,
      bufferPercent: 10,
      alternateRouting: false,
      randomSeed: ''
    }
  },
  {
    id: 'transportation-crisis',
    name: 'Transportation Crisis',
    description: 'Evaluate impact of shipping delays, port strikes, or logistics disruptions',
    category: 'popular',
    icon: Truck,
    severity: 'medium',
    duration: '1-6 weeks',
    complexity: 'moderate',
    tags: ['Logistics', 'Transportation', 'Infrastructure'],
    popularity: 76,
    scenarioData: {
      scenarioName: 'Major Transportation Disruption',
      scenarioType: 'disruption',
      description: 'Port strike or transportation network failure affecting delivery schedules',
      disruptionSeverity: 70,
      disruptionDuration: 28,
      affectedNode: 'warehouse-central,distribution-center',
      startDate: '',
      endDate: '',
      monteCarloRuns: 1200,
      distributionType: 'normal',
      cascadeEnabled: true,
      failureThreshold: 60,
      bufferPercent: 25,
      alternateRouting: true,
      randomSeed: ''
    }
  },
  {
    id: 'geopolitical-event',
    name: 'Geopolitical Event',
    description: 'Analyze impact of trade wars, sanctions, or political instability',
    category: 'advanced',
    icon: Globe,
    severity: 'critical',
    duration: '3-12 months',
    complexity: 'complex',
    tags: ['Political Risk', 'Trade Policy', 'Long-term Impact'],
    popularity: 69,
    scenarioData: {
      scenarioName: 'Geopolitical Trade Disruption',
      scenarioType: 'political',
      description: 'Trade restrictions or sanctions affecting international supply routes',
      disruptionSeverity: 90,
      disruptionDuration: 120,
      affectedNode: 'supplier-a,supplier-b',
      startDate: '',
      endDate: '',
      monteCarloRuns: 2000,
      distributionType: 'normal',
      cascadeEnabled: true,
      failureThreshold: 30,
      bufferPercent: 30,
      alternateRouting: true,
      randomSeed: ''
    }
  },
  {
    id: 'cyber-attack',
    name: 'Cyber Security Incident',
    description: 'Simulate impact of ransomware, data breaches, or system failures',
    category: 'advanced',
    icon: Zap,
    severity: 'critical',
    duration: '1-4 weeks',
    complexity: 'complex',
    tags: ['Cybersecurity', 'Digital Risk', 'Operations Halt'],
    popularity: 71,
    scenarioData: {
      scenarioName: 'Critical System Cyber Attack',
      scenarioType: 'disruption',
      description: 'Ransomware attack compromising production systems and data integrity',
      disruptionSeverity: 95,
      disruptionDuration: 14,
      affectedNode: 'factory-main,warehouse-central',
      startDate: '',
      endDate: '',
      monteCarloRuns: 1000,
      distributionType: 'normal',
      cascadeEnabled: true,
      failureThreshold: 20,
      bufferPercent: 40,
      alternateRouting: false,
      randomSeed: ''
    }
  },
  {
    id: 'automotive-recall',
    name: 'Product Recall Crisis',
    description: 'Industry-specific: Automotive product recall affecting production',
    category: 'industry',
    icon: Building,
    severity: 'medium',
    duration: '4-8 weeks',
    complexity: 'moderate',
    tags: ['Automotive', 'Quality Issues', 'Regulatory'],
    popularity: 63,
    scenarioData: {
      scenarioName: 'Critical Component Recall',
      scenarioType: 'disruption',
      description: 'Safety recall requiring immediate halt of production and component replacement',
      disruptionSeverity: 80,
      disruptionDuration: 35,
      affectedNode: 'factory-main,supplier-a',
      startDate: '',
      endDate: '',
      monteCarloRuns: 1200,
      distributionType: 'normal',
      cascadeEnabled: true,
      failureThreshold: 45,
      bufferPercent: 20,
      alternateRouting: true,
      randomSeed: ''
    }
  },
  {
    id: 'retail-seasonal',
    name: 'Seasonal Demand Peak',
    description: 'Industry-specific: Retail holiday season capacity stress test',
    category: 'industry',
    icon: ShoppingCart,
    severity: 'medium',
    duration: '6-12 weeks',
    complexity: 'moderate',
    tags: ['Retail', 'Seasonal', 'Capacity Planning'],
    popularity: 58,
    scenarioData: {
      scenarioName: 'Holiday Season Peak Demand',
      scenarioType: 'demand',
      description: 'Black Friday and holiday season surge with 400% demand increase',
      disruptionSeverity: 50,
      disruptionDuration: 56,
      affectedNode: 'distribution-center,retail-outlet',
      startDate: '',
      endDate: '',
      monteCarloRuns: 800,
      distributionType: 'normal',
      cascadeEnabled: false,
      failureThreshold: 80,
      bufferPercent: 5,
      alternateRouting: false,
      randomSeed: ''
    }
  }
]

interface ProfessionalTemplateSelectionProps {
  onTemplateSelect: (template: ScenarioTemplate | null) => void
  onStartFromScratch: () => void
  onAIScenarios: () => void
  onSelectScenario: (scenario: ScenarioData) => void
}

export function ProfessionalTemplateSelection({ 
  onTemplateSelect, 
  onStartFromScratch,
  onAIScenarios,
  onSelectScenario 
}: ProfessionalTemplateSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'moderate': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'complex': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const filteredTemplates = scenarioTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const groupedTemplates = {
    recommended: filteredTemplates.filter(t => t.isRecommended),
    popular: filteredTemplates.filter(t => t.category === 'popular' && !t.isRecommended),
    industry: filteredTemplates.filter(t => t.category === 'industry'),
    advanced: filteredTemplates.filter(t => t.category === 'advanced')
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium">
          <Layers className="w-4 h-4" />
          Choose Your Starting Point
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Scenario Templates
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Select from pre-built scenarios tailored for common supply chain risks, or start fresh with your own custom configuration.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassmorphicCard 
          className="group"
          onClick={() => {
            const templateSection = document.getElementById('template-section')
            if (templateSection) {
              templateSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-lg">Template Gallery</CardTitle>
            <CardDescription>Browse curated scenarios</CardDescription>
          </CardHeader>
        </GlassmorphicCard>

        <GlassmorphicCard className="group" onClick={onAIScenarios}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-lg">AI Scenarios</CardTitle>
            <CardDescription>Get intelligent suggestions</CardDescription>
          </CardHeader>
        </GlassmorphicCard>

        <GlassmorphicCard className="group" onClick={onStartFromScratch}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-lg">Start from Scratch</CardTitle>
            <CardDescription>Build a custom scenario</CardDescription>
          </CardHeader>
        </GlassmorphicCard>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scenarios by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-white/30 dark:border-slate-700/30"
          />
        </div>
        
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
          <TabsList className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-white/30 dark:border-slate-700/30">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="industry">Industry</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Forecast Scenarios Section */}
      <div className="space-y-6">
        <ForecastScenarios onSelectScenario={onSelectScenario} />
      </div>

      {/* Recommended Templates */}
      {groupedTemplates.recommended.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Recommended for You
            </h2>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              Most Popular
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedTemplates.recommended.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onTemplateSelect(template)}
                getSeverityColor={getSeverityColor}
                getComplexityColor={getComplexityColor}
                isRecommended
              />
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div className="space-y-4" id="template-section">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            All Scenario Templates
          </h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {filteredTemplates.length} available
          </Badge>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No scenarios found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onTemplateSelect(template)}
                getSeverityColor={getSeverityColor}
                getComplexityColor={getComplexityColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface TemplateCardProps {
  template: ScenarioTemplate
  onSelect: () => void
  getSeverityColor: (severity: string) => string
  getComplexityColor: (complexity: string) => string
  isRecommended?: boolean
}

function TemplateCard({ 
  template, 
  onSelect, 
  getSeverityColor, 
  getComplexityColor, 
  isRecommended 
}: TemplateCardProps) {
  const Icon = template.icon

  return (
    <GlassmorphicCard className="group relative" onClick={onSelect}>
      {isRecommended && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            ⭐ Recommended
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <CardTitle className="text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {template.name}
              </CardTitle>
              {template.popularity && (
                <div className="text-xs text-muted-foreground mt-1">
                  {template.popularity}% adoption rate
                </div>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {template.description}
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge className={getSeverityColor(template.severity)} variant="secondary">
            {template.severity} risk
          </Badge>
          <Badge className={getComplexityColor(template.complexity)} variant="secondary">
            {template.complexity}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {template.duration}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800/50">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </GlassmorphicCard>
  )
}
