import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, CheckCircle, Clock, Shield, AlertCircle, Star, Download, Send, FileText, Users, Calendar, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';

interface ApiMitigationStrategy {
  id: number
  title: string
  description: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low' | 'Strategic'
  timeframe: string
  costEstimate: string
  impactReduction: string
  status: 'ready' | 'planning' | 'recommended' | 'in-progress' | 'completed'
  category: 'immediate' | 'shortTerm' | 'longTerm'
  feasibility: 'HIGH' | 'MEDIUM' | 'LOW'
  dependencies: string[]
  riskFactors: string[]
  successMetrics: string[]
  resourceRequirements: {
    personnel: number
    equipment: string[]
    partnerships: string[]
  }
}

interface SelectedStrategySummary {
  immediate: ApiMitigationStrategy[]
  shortTerm: ApiMitigationStrategy[]
  longTerm: ApiMitigationStrategy[]
  totalCost: string
  totalImpact: string
  timelineSpan: string
  riskReduction: string
}

interface FinalizeStrategyPanelProps {
  selectedStrategies: SelectedStrategySummary
  open: boolean
  onClose: () => void
  onFinalize: (data: FinalizeData) => void
  isMobile?: boolean
  simulationId?: string
  roadmapOpen?: boolean
}

interface FinalizeData {
  approvedStrategies: number[]
  implementationNotes: string
  priorityAdjustments: { strategyId: number; newPriority: string }[]
  stakeholderApproval: boolean
  budgetConfirmed: boolean
  resourcesAllocated: boolean
  timelineAccepted: boolean
}

export const FinalizeStrategyPanel: React.FC<FinalizeStrategyPanelProps> = ({
  selectedStrategies,
  open,
  onClose,
  onFinalize,
  isMobile = false,
  simulationId,
  roadmapOpen = false
}) => {
  const [checkedStrategies, setCheckedStrategies] = useState<Set<number>>(new Set())
  const [implementationNotes, setImplementationNotes] = useState("")
  const [stakeholderApproval, setStakeholderApproval] = useState(false)
  const [budgetConfirmed, setBudgetConfirmed] = useState(false)
  const [resourcesAllocated, setResourcesAllocated] = useState(false)
  const [timelineAccepted, setTimelineAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const allStrategies = React.useMemo(() => [
    ...selectedStrategies.immediate,
    ...selectedStrategies.shortTerm,
    ...selectedStrategies.longTerm
  ], [selectedStrategies.immediate, selectedStrategies.shortTerm, selectedStrategies.longTerm])

  // Initialize all strategies as checked - only on mount or when strategies change
  React.useEffect(() => {
    if (allStrategies.length > 0) {
      setCheckedStrategies(new Set(allStrategies.map(s => s.id)))
    }
  }, [allStrategies.length, selectedStrategies])

  const handleStrategyCheck = (strategyId: number, checked: boolean) => {
    const newChecked = new Set(checkedStrategies)
    if (checked) {
      newChecked.add(strategyId)
    } else {
      newChecked.delete(strategyId)
    }
    setCheckedStrategies(newChecked)
  }

  const handleSelectAll = () => {
    setCheckedStrategies(new Set(allStrategies.map(s => s.id)))
  }

  const handleDeselectAll = () => {
    setCheckedStrategies(new Set())
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30"
      case "High":
        return "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30"
      case "Low":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30"
      case "Strategic":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'immediate':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'shortTerm':
        return <Clock className="w-4 h-4 text-orange-500" />
      case 'longTerm':
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const isFormValid = () => {
    return checkedStrategies.size > 0 && 
           stakeholderApproval && 
           budgetConfirmed && 
           resourcesAllocated && 
           timelineAccepted
  }

  const handleFinalize = async () => {
    if (!isFormValid()) {
      toast.error('Please complete all required approvals to finalize the strategy')
      return
    }

    setIsSubmitting(true)
    
    try {
      const finalizeData: FinalizeData = {
        approvedStrategies: Array.from(checkedStrategies),
        implementationNotes,
        priorityAdjustments: [],
        stakeholderApproval,
        budgetConfirmed,
        resourcesAllocated,
        timelineAccepted
      }

      // Call the finalize API
      if (simulationId) {
        const response = await fetch('/api/agent/strategy/finalize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            simulationId,
            finalizeData
          })
        })

        if (response.ok) {
          toast.success('Strategy successfully finalized and onboarded!')
        } else {
          throw new Error('Failed to finalize strategy')
        }
      }

      onFinalize(finalizeData)
      onClose()
    } catch (error) {
      console.error('Error finalizing strategy:', error)
      toast.error('Failed to finalize strategy. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportSummary = () => {
    const checkedStrategiesData = allStrategies.filter(s => checkedStrategies.has(s.id))
    const exportData = {
      strategies: checkedStrategiesData,
      summary: selectedStrategies,
      notes: implementationNotes,
      exportDate: new Date().toISOString(),
      simulationId
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mitigation-strategy-${simulationId || 'export'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Strategy summary exported successfully!')
  }

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const FinalizeContent = () => (
    <motion.div
      variants={containerAnimation}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Strategy Selection Section */}
      <motion.div variants={itemAnimation} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Strategy Selection
          </h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
              className="text-xs"
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeselectAll}
              className="text-xs"
            >
              Deselect All
            </Button>
          </div>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {allStrategies.map((strategy) => (
            <motion.div
              key={strategy.id}
              variants={itemAnimation}
              className="flex items-start gap-3 p-4 bg-gray-50/70 dark:bg-gray-900/60 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100/70 dark:hover:bg-gray-800/60 transition-colors"
            >
              <Checkbox
                id={`strategy-${strategy.id}`}
                checked={checkedStrategies.has(strategy.id)}
                onCheckedChange={(checked) => handleStrategyCheck(strategy.id, checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getCategoryIcon(strategy.category)}
                  <Label 
                    htmlFor={`strategy-${strategy.id}`}
                    className="font-medium text-sm cursor-pointer truncate"
                  >
                    {strategy.title}
                  </Label>
                  <Badge className={`text-xs px-2 py-0.5 font-medium ${getPriorityColor(strategy.priority)}`}>
                    {strategy.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {strategy.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {strategy.costEstimate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {strategy.timeframe}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {strategy.impactReduction} reduction
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Separator />

      {/* Summary Section */}
      <motion.div variants={itemAnimation} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Implementation Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">Selected Strategies</p>
            <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{checkedStrategies.size}</p>
          </div>
          
          <div className="p-4 bg-green-50/70 dark:bg-green-950/30 rounded-lg border border-green-200/50 dark:border-green-800/30">
            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-2">Total Cost</p>
            <p className="text-xl font-bold text-green-800 dark:text-green-200">{selectedStrategies.totalCost}</p>
          </div>
          
          <div className="p-4 bg-purple-50/70 dark:bg-purple-950/30 rounded-lg border border-purple-200/50 dark:border-purple-800/30">
            <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">Risk Reduction</p>
            <p className="text-xl font-bold text-purple-800 dark:text-purple-200">{selectedStrategies.riskReduction}</p>
          </div>
          
          <div className="p-4 bg-orange-50/70 dark:bg-orange-950/30 rounded-lg border border-orange-200/50 dark:border-orange-800/30">
            <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-2">Timeline</p>
            <p className="text-xl font-bold text-orange-800 dark:text-orange-200">{selectedStrategies.timelineSpan}</p>
          </div>
        </div>
      </motion.div>

      <Separator />

      {/* Implementation Notes */}
      <motion.div variants={itemAnimation} className="space-y-3">
        <Label htmlFor="implementation-notes" className="text-sm font-medium">
          Implementation Notes (Optional)
        </Label>
        <Textarea
          id="implementation-notes"
          placeholder="Add any specific implementation requirements, constraints, or stakeholder considerations..."
          value={implementationNotes}
          onChange={(e) => setImplementationNotes(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </motion.div>

      <Separator />

      {/* Approval Checklist */}
      <motion.div variants={itemAnimation} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Final Approvals Required
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/30 dark:border-blue-800/30">
            <Checkbox
              id="stakeholder-approval"
              checked={stakeholderApproval}
              onCheckedChange={(checked) => setStakeholderApproval(checked === true)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="stakeholder-approval" className="text-sm flex items-center gap-2 font-medium cursor-pointer">
                <Users className="w-4 h-4" />
                Stakeholder approval obtained
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                All key stakeholders have reviewed and approved the strategy
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200/30 dark:border-green-800/30">
            <Checkbox
              id="budget-confirmed"
              checked={budgetConfirmed}
              onCheckedChange={(checked) => setBudgetConfirmed(checked === true)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="budget-confirmed" className="text-sm flex items-center gap-2 font-medium cursor-pointer">
                <DollarSign className="w-4 h-4" />
                Budget confirmed and allocated
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Financial resources are secured and allocated
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200/30 dark:border-purple-800/30">
            <Checkbox
              id="resources-allocated"
              checked={resourcesAllocated}
              onCheckedChange={(checked) => setResourcesAllocated(checked === true)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="resources-allocated" className="text-sm flex items-center gap-2 font-medium cursor-pointer">
                <Users className="w-4 h-4" />
                Resources and personnel allocated
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Personnel and equipment assignments are confirmed
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border border-orange-200/30 dark:border-orange-800/30">
            <Checkbox
              id="timeline-accepted"
              checked={timelineAccepted}
              onCheckedChange={(checked) => setTimelineAccepted(checked === true)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="timeline-accepted" className="text-sm flex items-center gap-2 font-medium cursor-pointer">
                <Calendar className="w-4 h-4" />
                Implementation timeline accepted
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                All parties agree to the proposed timeline and milestones
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={itemAnimation} className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleExportSummary}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Summary
        </Button>
        
        <Button
          onClick={handleFinalize}
          disabled={!isFormValid() || isSubmitting}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex-1"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
              Finalizing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Finalize & Onboard Strategy
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  )

  // Panel content wrapper
  const content = (
    <motion.div
      initial={{ x: isMobile ? 0 : 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isMobile ? 0 : 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full flex flex-col"
    >
      <Card className="border border-white/30 dark:border-slate-700/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/30 rounded-2xl h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between gap-2 p-6 pb-4 border-b border-white/20 dark:border-slate-700/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Finalize Strategy</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Review and onboard your mitigation strategy
              </CardDescription>
            </div>
          </div>
          {!isMobile && (
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Close finalize panel"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 p-6 overflow-y-auto">
          <FinalizeContent />
        </CardContent>
      </Card>
    </motion.div>
  )

  // Mobile: Drawer, Desktop: Side panel
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <DrawerTitle className="text-lg font-semibold">Finalize Strategy</DrawerTitle>
            </div>
            <DrawerClose asChild>
              <button 
                className="p-2 rounded-full hover:bg-muted/50 transition-colors"
                aria-label="Close finalize drawer"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </DrawerClose>
          </DrawerHeader>
          <div className="p-6 overflow-y-auto">
            <FinalizeContent />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  // Desktop side panel
  if (!open) return null

  return (
    <div className={`fixed right-0 top-0 h-screen w-[400px] z-[51] p-3 transition-transform duration-300 ease-in-out ${
      roadmapOpen ? 'translate-x-[-400px]' : ''
    }`}>
      {content}
    </div>
  )
}

export default FinalizeStrategyPanel
