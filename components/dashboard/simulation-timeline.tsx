"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, SkipForward, AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Card } from '@/components/ui/card'

const scenarios: { id: "port" | "supplier" | "weather"; name: string; duration: string; impact: string; financial: string }[] = [
  { id: "port", name: "Port Closure", duration: "14 days", impact: "High", financial: "$2.4M" },
  { id: "supplier", name: "Supplier Bankruptcy", duration: "30 days", impact: "Medium", financial: "$1.8M" },
  { id: "weather", name: "Weather Event", duration: "7 days", impact: "Low", financial: "$0.8M" },
]

const timelineEvents = {
  port: [
    { id: 'day-1', day: 1, event: 'Disruption begins', description: 'Port of Shanghai closes due to COVID-19 outbreak' },
    { id: 'day-3', day: 3, event: 'Inventory depleting', description: 'First tier suppliers begin to run out of components' },
    { id: 'day-7', day: 7, event: 'Production impact', description: 'Manufacturing lines affected by component shortage' },
    { id: 'day-10', day: 10, event: 'Recovery starts', description: 'Alternative shipping routes established' }
  ],
  supplier: [
    { id: 'day-1', day: 1, event: 'Bankruptcy announced', description: 'Key supplier files for bankruptcy' },
    { id: 'day-5', day: 5, event: 'Supply shortage', description: 'Critical components become unavailable' },
    { id: 'day-15', day: 15, event: 'New supplier', description: 'Alternative supplier onboarding begins' },
    { id: 'day-30', day: 30, event: 'Recovery', description: 'Supply chain stabilizes with new supplier' }
  ],
  weather: [
    { id: 'day-1', day: 1, event: 'Storm warning', description: 'Category 4 hurricane approaching Gulf Coast' },
    { id: 'day-2', day: 2, event: 'Port closure', description: 'Ports begin emergency shutdown procedures' },
    { id: 'day-4', day: 4, event: 'Storm passes', description: 'Weather conditions begin to improve' },
    { id: 'day-7', day: 7, event: 'Operations resume', description: 'Ports return to normal operations' }
  ]
}

const timelinePoints = [
  { id: 'day-1', day: 1, active: true, position: 0, event: 'Disruption begins', description: 'Port of Shanghai closes due to COVID-19 outbreak' },
  { id: 'day-3', day: 3, active: true, position: 30, event: 'Inventory depleting', description: 'First tier suppliers begin to run out of components' },
  { id: 'day-7', day: 7, active: false, position: 70, event: '', description: '' },
  { id: 'day-10', day: 10, active: false, position: 100, event: '', description: '' }
]

export function SimulationTimeline() {
  const [activeScenario, setActiveScenario] = useState<"port" | "supplier" | "weather">("port")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentDay, setCurrentDay] = useState(3) // Start with some progress

  // Memoize currentEvents to avoid recreating on every render
  const currentEvents = useMemo(() => timelineEvents[activeScenario], [activeScenario])
  
  // Memoize maxDay calculation
  const maxDay = useMemo(() => currentEvents[currentEvents.length - 1].day, [currentEvents])
  
  // Memoize current event detail - only the latest visible event
  const currentEventDetail = useMemo(() => {
    const visibleEvents = currentEvents.filter(e => e.day <= currentDay)
    return visibleEvents.length ? visibleEvents[visibleEvents.length - 1] : null
  }, [currentEvents, currentDay])
  
  // Memoize visible timeline events
  const visibleTimelineEvents = useMemo(() => 
    currentEvents.filter(e => currentDay >= e.day).slice(-3),
    [currentEvents, currentDay]
  )
  
  // Memoize impact style classes for better performance
  const getImpactClasses = useCallback((impact: string) => {
    if (impact === "Critical") return "bg-red-500/20 text-red-500 dark:text-red-400 border-red-500/30"
    if (impact === "High") return "bg-amber-500/20 text-amber-500 dark:text-amber-400 border-amber-500/30"
    return "bg-blue-500/20 text-blue-500 dark:text-blue-400 border-blue-500/30"
  }, [])

  // Update day when scenario changes
  useEffect(() => {
    setCurrentDay(3) // Reset to day 3 when changing scenarios
  }, [activeScenario])

  // Handle auto-play simulation with useCallback to prevent recreation on every render
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentDay(day => {
          const newDay = day + 1;
          if (newDay > maxDay) {
            setIsPlaying(false);
            return maxDay;
          }
          return newDay;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, maxDay]);

  // Handle scenario switch
  const handleScenarioChange = useCallback((value: "port" | "supplier" | "weather") => {
    setActiveScenario(value);
    setIsPlaying(false);
  }, []);
  
  // Memoize progress percentage for animation
  const progressPercentage = useMemo(() => 
    `${(currentDay / maxDay) * 100}%`, 
    [currentDay, maxDay]
  )

  // Helper function to determine event layout with improved positioning
  const getEventLayout = (events: typeof timelineEvents[keyof typeof timelineEvents]) => {
    return events.map((event, index, array) => {
      const position = (event.day / maxDay) * 100
      
      // Determine if this event should be adjusted for screen bounds
      let adjustedPosition = position
      if (position < 15) {
        adjustedPosition = 15 // Prevent left overflow
      } else if (position > 85) {
        adjustedPosition = 85 // Prevent right overflow
      }

      // Calculate if this event is too close to the previous one
      const prevEvent = array[index - 1]
      const isCloseToPrevious = prevEvent && 
        Math.abs(adjustedPosition - ((prevEvent.day / maxDay) * 100)) < 20

      // Determine vertical position based on proximity and screen bounds
      const layout = isCloseToPrevious
        ? prevEvent.layout === 'top' ? 'bottom' : 'top'
        : index % 2 === 0 ? 'top' : 'bottom'

      return {
        ...event,
        position: adjustedPosition,
        layout,
        alignment: position < 20 ? 'left' : position > 80 ? 'right' : 'center'
      }
    })
  }

  const visibleEvents = getEventLayout(timelineEvents[activeScenario])
    .filter(event => event.day <= currentDay)

  const currentScenario = scenarios.find(s => s.id === activeScenario)!

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {scenarios.map(scenario => (
            <Button
              key={scenario.id}
              variant="ghost"
              onClick={() => handleScenarioChange(scenario.id)}
              className={`${
                activeScenario === scenario.id
                  ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              {scenario.name}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-8 w-8 text-slate-400 hover:bg-slate-800/50"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setCurrentDay(maxDay)
                setIsPlaying(false)
              }}
              className="h-8 w-8 text-slate-400 hover:bg-slate-800/50"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <Button asChild variant="ghost" className="text-blue-400 hover:bg-blue-500/10">
            <Link href="/simulation/new" className="flex items-center gap-2">
              Run Full Simulation
              <SkipForward className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="space-y-8">
        {/* Current Day and Impact */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-slate-200">Day {currentDay}/{maxDay}</h3>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                {currentScenario.impact}
              </span>
            </div>
            <p className="text-sm text-slate-400">Duration: {currentScenario.duration}</p>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="font-medium">Impact:</span>
            <span className="text-amber-400">{currentScenario.financial}</span>
          </div>
        </div>

        {/* Timeline Track */}
        <div className="relative">
          {/* Simple Timeline Bar */}
          <div className="relative h-12">
            {/* Track Background */}
            <div className="absolute top-6 h-1 w-full rounded-full bg-slate-800/50" />
            
            {/* Active Progress */}
            <div 
              className="absolute top-6 h-1 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: progressPercentage }}
            />
            
            {/* Timeline Points */}
            <div className="absolute top-4 w-full">
              {timelineEvents[activeScenario].map(event => (
                <div
                  key={`point-${event.id}`}
                  className="absolute -mt-1"
                  style={{ left: `${(event.day / maxDay) * 100}%` }}
                >
                  <div className={`
                    h-3 w-3 rounded-full border-2 
                    ${currentDay >= event.day
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-slate-600 bg-slate-800'
                    }
                  `} />
                  <span className="absolute left-1/2 mt-4 -translate-x-1/2 text-sm text-slate-400">
                    Day {event.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Event Cards Grid */}
          <div className="mt-16 grid grid-cols-2 gap-4">
            {visibleEvents.map((event) => (
              <Card
                key={`event-${event.id}`}
                className="bg-slate-800/30 border-slate-700 p-4 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-sm font-medium text-blue-400">
                      Day {event.day}: {event.event}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {event.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div className="rounded-lg bg-slate-800/30 p-4">
          {currentEventDetail && (
            <>
              <h4 className="font-medium text-slate-200">{currentEventDetail.event}</h4>
              <p className="mt-1 text-sm text-slate-400">{currentEventDetail.description}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper functions for text alignment
function getTransformStyle(alignment: 'left' | 'center' | 'right') {
  switch (alignment) {
    case 'left':
      return 'translateX(0)'
    case 'right':
      return 'translateX(-100%)'
    default:
      return 'translateX(-50%)'
  }
}

function getAlignmentClasses(alignment: 'left' | 'center' | 'right') {
  switch (alignment) {
    case 'left':
      return 'items-start'
    case 'right':
      return 'items-end'
    default:
      return 'items-start'
  }
}

function TimelinePoint({ day, active, position }: { day: number; active: boolean; position: number }) {
  return (
    <div 
      className="absolute flex flex-col items-center"
      style={{ left: `${position}%` }}
    >
      <div className={`
        h-3 w-3 rounded-full border-2 
        ${active 
          ? 'border-blue-500 bg-blue-500' 
          : 'border-slate-600 bg-slate-800'
        }
      `} />
      <span className="absolute top-6 text-sm text-slate-400">{day}</span>
    </div>
  )
}