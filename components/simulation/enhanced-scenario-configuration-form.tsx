"use client"

import { useState } from "react"
import { 
  Calculator, 
  AlertTriangle, 
  Zap, 
  Factory, 
  Layers, 
  Workflow, 
  Info, 
  CheckCircle,
  Circle,
  Settings,
  FileText,
  Target,
  Calendar,
  BarChart3
} from "lucide-react"
import { ClockIcon, ShieldCheckIcon, TrendingUpIcon, CalendarDaysIcon, RouteIcon } from "@/components/icons"
import { CogIcon } from "@/components/icons/cog-icon"
import { SettingsIcon } from "@/components/icons/settings-icon"
import { FileTextIcon } from "@/components/icons/file-text-icon"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Enhanced Glassmorphic Card Component
function GlassmorphicCard({ 
  children, 
  className = "", 
  ...props 
}: { 
  children: React.ReactNode
  className?: string
  [key: string]: any 
}) {
  return (
    <Card 
      className={cn(
        "border border-white/30 dark:border-slate-700/10 bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/20 rounded-xl transition-all duration-300",
        className
      )} 
      {...props}
    >
      {children}
    </Card>
  )
}

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/ui/date-picker"
import { MultiSelect } from "@/components/ui/multiselect"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useScenario } from "@/lib/context/scenario-context"

// Helper component for labels with tooltips
const LabelWithTooltip = ({ 
  children, 
  tooltip, 
  className = "text-sm font-medium text-slate-700 dark:text-slate-300",
  required = false,
  ...props 
}: {
  children: React.ReactNode
  tooltip: string
  className?: string
  required?: boolean
  htmlFor?: string
}) => (
  <div className="flex items-center gap-2">
    <Label className={className} {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-help flex-shrink-0" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </div>
)

// Step Component for better organization
function StepCard({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  isCompleted = false,
  stepNumber
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  isCompleted?: boolean
  stepNumber: number
}) {
  return (
    <GlassmorphicCard className={cn(
      "transition-all duration-300",
      isCompleted && "border-green-500/30"
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
            isCompleted 
              ? "bg-green-500 text-white" 
              : "bg-blue-500 text-white"
          )}>
            {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNumber}
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {title}
            </CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </GlassmorphicCard>
  )
}

export function EnhancedScenarioConfigurationForm() {
  const { scenarioData, updateScenarioData, supplyChains, selectedSupplyChainId, setSelectedSupplyChainId } = useScenario()

  // Options for affected nodes multiselect
  const affectedNodeOptions = [
    { label: "Supplier A", value: "supplier-a", icon: Factory },
    { label: "Supplier B", value: "supplier-b", icon: Factory },
    { label: "Warehouse Central", value: "warehouse-central", icon: Layers },
    { label: "Factory Main", value: "factory-main", icon: Factory },
    { label: "Distribution Center", value: "distribution-center", icon: Workflow },
    { label: "Retail Outlet", value: "retail-outlet", icon: Factory },
  ]

  // Check completion status for each step
  const isStep1Complete = !!(scenarioData.scenarioName && scenarioData.scenarioType && selectedSupplyChainId)
  const isStep2Complete = !!(scenarioData.affectedNode && scenarioData.description && scenarioData.disruptionSeverity > 0 && scenarioData.disruptionDuration > 0)
  const isStep3Complete = !!(scenarioData.monteCarloRuns > 0)

  const totalProgress = ((isStep1Complete ? 1 : 0) + (isStep2Complete ? 1 : 0) + (isStep3Complete ? 1 : 0)) / 3 * 100

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Progress Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Configure Your Scenario
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Follow the steps below to set up your simulation parameters
              </p>
            </div>
            <Badge variant="outline" className="px-4 py-2 text-sm">
              {Math.round(totalProgress)}% Complete
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Configuration Progress</span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {[
              { number: 1, title: "Basic Setup", completed: isStep1Complete },
              { number: 2, title: "Impact Details", completed: isStep2Complete },
              { number: 3, title: "Advanced Settings", completed: isStep3Complete }
            ].map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                    step.completed
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}
                >
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                  {step.title}
                </div>
                {index < 2 && (
                  <div className="w-4 h-4 text-slate-400 mx-2">→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="space-y-6">
          {/* Step 1: Basic Configuration */}
          <StepCard
            title="Basic Configuration"
            description="Set up your scenario fundamentals"
            icon={Settings}
            stepNumber={1}
            isCompleted={isStep1Complete}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <LabelWithTooltip 
                    htmlFor="scenario-name"
                    required
                    tooltip="Give your scenario a descriptive name that clearly identifies the situation you want to simulate."
                  >
                    Scenario Name
                  </LabelWithTooltip>
                  <Input
                    id="scenario-name"
                    className="h-11 shadow-sm rounded-lg border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g., Port Strike Analysis"
                    value={scenarioData.scenarioName}
                    onChange={(e) => updateScenarioData({ scenarioName: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <LabelWithTooltip 
                    required
                    tooltip="Select the category that best describes your scenario type."
                  >
                    Scenario Type
                  </LabelWithTooltip>
                  <Select 
                    value={scenarioData.scenarioType} 
                    onValueChange={(val) => updateScenarioData({ scenarioType: val })}
                  >
                    <SelectTrigger className="h-11 shadow-sm rounded-lg border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Select scenario type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disruption">Supply Disruption</SelectItem>
                      <SelectItem value="natural">Natural Disaster</SelectItem>
                      <SelectItem value="political">Political Event</SelectItem>
                      <SelectItem value="demand">Demand Surge</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <LabelWithTooltip 
                  required
                  tooltip="Choose which supply chain you want to analyze."
                >
                  Supply Chain
                </LabelWithTooltip>
                <Select 
                  value={selectedSupplyChainId} 
                  onValueChange={setSelectedSupplyChainId}
                >
                  <SelectTrigger className="h-11 shadow-sm rounded-lg border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Select supply chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplyChains.map((chain) => (
                      <SelectItem key={chain.supply_chain_id} value={chain.supply_chain_id}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </StepCard>

          {/* Step 2: Impact Details */}
          <StepCard
            title="Impact Details"
            description="Define the scope and severity of disruption"
            icon={Target}
            stepNumber={2}
            isCompleted={isStep2Complete}
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <LabelWithTooltip 
                  required
                  tooltip="Select the specific nodes that will be directly impacted by your scenario."
                >
                  Affected Nodes
                </LabelWithTooltip>
                <MultiSelect
                  key={scenarioData.affectedNode} // Force re-mount when affectedNode changes
                  options={affectedNodeOptions}
                  onValueChange={(values) => updateScenarioData({ affectedNode: values.join(',') })}
                  defaultValue={scenarioData.affectedNode ? scenarioData.affectedNode.split(',') : []}
                  placeholder="Select affected nodes"
                  className="shadow-sm rounded-lg border-slate-200 dark:border-slate-700"
                  maxCount={3}
                />
              </div>

              <div className="space-y-3">
                <LabelWithTooltip 
                  required
                  tooltip="Provide a detailed description of your scenario including cause, scope, and expected impact."
                >
                  Scenario Description
                </LabelWithTooltip>
                <Textarea
                  className="min-h-[100px] shadow-sm rounded-lg border-slate-200 dark:border-slate-700"
                  placeholder="Describe your scenario in detail..."
                  value={scenarioData.description}
                  onChange={(e) => updateScenarioData({ description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <LabelWithTooltip 
                    required
                    tooltip="Enter the percentage reduction in operational capacity (0-100%)."
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="w-4 h-4" />
                      Disruption Severity (%)
                    </div>
                  </LabelWithTooltip>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    className="h-11 shadow-sm rounded-lg border-slate-200 dark:border-slate-700"
                    value={scenarioData.disruptionSeverity || ''}
                    onChange={(e) => updateScenarioData({ disruptionSeverity: e.target.value ? Number(e.target.value) : 0 })}
                    placeholder="e.g., 75"
                  />
                </div>

                <div className="space-y-3">
                  <LabelWithTooltip 
                    required
                    tooltip="Specify how long the disruption will last in days."
                  >
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      Duration (days)
                    </div>
                  </LabelWithTooltip>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    step={1}
                    className="h-11 shadow-sm rounded-lg border-slate-200 dark:border-slate-700"
                    value={scenarioData.disruptionDuration || ''}
                    onChange={(e) => updateScenarioData({ disruptionDuration: e.target.value ? Number(e.target.value) : 0 })}
                    placeholder="e.g., 14"
                  />
                </div>
              </div>
            </div>
          </StepCard>

          {/* Step 3: Advanced Settings */}
          <StepCard
            title="Advanced Settings"
            description="Fine-tune simulation parameters"
            icon={BarChart3}
            stepNumber={3}
            isCompleted={isStep3Complete}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <LabelWithTooltip 
                    tooltip="Number of simulation iterations to run. Higher values provide more accurate results."
                  >
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Monte Carlo Runs
                    </div>
                  </LabelWithTooltip>
                  <Input
                    type="number"
                    min={100}
                    max={50000}
                    step={100}
                    className="h-10 shadow-sm rounded-lg border-slate-200 dark:border-slate-700"
                    value={scenarioData.monteCarloRuns || ''}
                    onChange={(e) => updateScenarioData({ monteCarloRuns: e.target.value ? Number(e.target.value) : 1000 })}
                    placeholder="1000"
                  />
                </div>

                <div className="space-y-3">
                  <LabelWithTooltip 
                    tooltip="Statistical distribution used for random variables in the simulation."
                  >
                    Distribution Type
                  </LabelWithTooltip>
                  <Select 
                    value={scenarioData.distributionType} 
                    onValueChange={(val) => updateScenarioData({ distributionType: val })}
                  >
                    <SelectTrigger className="h-10 shadow-sm rounded-lg border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Normal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="uniform">Uniform</SelectItem>
                      <SelectItem value="exponential">Exponential</SelectItem>
                      <SelectItem value="lognormal">Log-Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <LabelWithTooltip 
                    tooltip="Threshold percentage below which nodes are considered failed."
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Failure Threshold (%)
                    </div>
                  </LabelWithTooltip>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    className="h-10 shadow-sm rounded-lg border-slate-200 dark:border-slate-700"
                    value={scenarioData.failureThreshold || ''}
                    onChange={(e) => updateScenarioData({ failureThreshold: e.target.value ? Number(e.target.value) : 50 })}
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <LabelWithTooltip 
                    tooltip="Safety buffer percentage for inventory and capacity planning."
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="w-4 h-4" />
                      Buffer Percentage (%)
                    </div>
                  </LabelWithTooltip>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    className="h-10 shadow-sm rounded-lg border-slate-200 dark:border-slate-700"
                    value={scenarioData.bufferPercent || ''}
                    onChange={(e) => updateScenarioData({ bufferPercent: e.target.value ? Number(e.target.value) : 15 })}
                    placeholder="15"
                  />
                </div>

                <div className="space-y-3">
                  <LabelWithTooltip 
                    tooltip="Random seed for reproducible results. Leave empty for random seed."
                  >
                    Random Seed (Optional)
                  </LabelWithTooltip>
                  <Input
                    className="h-10 shadow-sm rounded-lg border-slate-200 dark:border-slate-700"
                    value={scenarioData.randomSeed || ''}
                    onChange={(e) => updateScenarioData({ randomSeed: e.target.value })}
                    placeholder="Leave empty for random"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="space-y-1">
                    <LabelWithTooltip 
                      className="text-sm font-medium"
                      tooltip="Enable cascade failure simulation where disruptions can spread to connected nodes."
                    >
                      Enable Cascade Effects
                    </LabelWithTooltip>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Simulate how disruptions spread through the network
                    </p>
                  </div>
                  <Switch
                    checked={scenarioData.cascadeEnabled}
                    onCheckedChange={(checked) => updateScenarioData({ cascadeEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="space-y-1">
                    <LabelWithTooltip 
                      className="text-sm font-medium"
                      tooltip="Enable alternate routing capabilities to find backup supply paths."
                    >
                      Alternate Routing
                    </LabelWithTooltip>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Allow the system to find alternative supply paths
                    </p>
                  </div>
                  <Switch
                    checked={scenarioData.alternateRouting}
                    onCheckedChange={(checked) => updateScenarioData({ alternateRouting: checked })}
                  />
                </div>
              </div>
            </div>
          </StepCard>
        </div>
      </div>
    </TooltipProvider>
  )
}
