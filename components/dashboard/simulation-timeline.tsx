"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, SkipForward, AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"

const scenarios: { id: "port" | "supplier" | "weather"; name: string; duration: string; impact: string; financial: string }[] = [
  { id: "port", name: "Port Closure", duration: "14 days", impact: "High", financial: "$2.4M" },
  { id: "supplier", name: "Supplier Bankruptcy", duration: "30 days", impact: "Critical", financial: "$5.8M" },
  { id: "weather", name: "Weather Event", duration: "7 days", impact: "Medium", financial: "$1.2M" },
]

const timelineEvents = {
  port: [
    { day: 1, event: "Disruption begins", description: "Port of Shanghai closes due to COVID-19 outbreak" },
    { day: 3, event: "Inventory depleting", description: "First tier suppliers begin to run out of components" },
    { day: 7, event: "Production impact", description: "Manufacturing capacity reduced by 35%" },
    { day: 10, event: "Alt. sourcing", description: "Emergency suppliers activated in Vietnam" },
    { day: 14, event: "Recovery begins", description: "Port reopens with limited capacity" },
    { day: 21, event: "Full recovery", description: "Supply chain operations return to normal" },
  ],
  supplier: [
    { day: 1, event: "Bankruptcy filing", description: "Key supplier files for Chapter 11" },
    { day: 5, event: "Parts shortage", description: "Critical components availability drops to 40%" },
    { day: 12, event: "Production halt", description: "Assembly lines 3 & 4 shut down temporarily" },
    { day: 18, event: "New suppliers", description: "Contracts signed with replacement vendors" },
    { day: 25, event: "Ramp-up", description: "New suppliers begin shipping parts" },
    { day: 30, event: "Stabilization", description: "Supply chain returns to 90% efficiency" },
  ],
  weather: [
    { day: 1, event: "Storm warning", description: "Category 4 hurricane approaching Gulf Coast" },
    { day: 2, event: "Evacuation", description: "Manufacturing facilities in Houston area close" },
    { day: 3, event: "Landfall", description: "Hurricane damages port infrastructure" },
    { day: 4, event: "Assessment", description: "Damage evaluation shows minimal impact to facilities" },
    { day: 5, event: "Reopening", description: "Facilities reopen with generator power" },
    { day: 7, event: "Full recovery", description: "Normal operations resume" },
  ]
}

export function SimulationTimeline() {
  const [activeScenario, setActiveScenario] = useState<"port" | "supplier" | "weather">("port")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentDay, setCurrentDay] = useState(3) // Start with some progress
  const [currentEvents, setCurrentEvents] = useState(timelineEvents.port)
  const maxDay = currentEvents[currentEvents.length - 1].day

  // Update events when scenario changes
  useEffect(() => {
    setCurrentEvents(timelineEvents[activeScenario])
    setCurrentDay(3) // Reset to day 3 when changing scenarios
  }, [activeScenario])

  // Handle auto-play simulation
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
  const handleScenarioChange = (value: "port" | "supplier" | "weather") => {
    setActiveScenario(value);
    setIsPlaying(false);
  }

  return (
    <div className="space-y-2 w-full">
      <Tabs defaultValue="port" onValueChange={(value) => handleScenarioChange(value as "port" | "supplier" | "weather")}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
          <div className="flex flex-wrap items-center gap-2">
            <TabsList className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm h-7">
              {scenarios.map((scenario) => (
                <TabsTrigger
                  key={scenario.id}
                  value={scenario.id}
                  className="text-xs px-2 h-5 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  {scenario.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 border-blue-200/30 dark:border-blue-800/30 bg-white/10 dark:bg-slate-800/20 p-0 hover:bg-white/20 dark:hover:bg-slate-800/30"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 border-blue-200/30 dark:border-blue-800/30 bg-white/10 dark:bg-slate-800/20 p-0 hover:bg-white/20 dark:hover:bg-slate-800/30"
                onClick={() => setCurrentDay(maxDay)}
              >
                <SkipForward className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            <Link href="/simulation" className="flex items-center">
              Run Full Simulation
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>

        {scenarios.map((scenario) => (
          <TabsContent key={scenario.id} value={scenario.id} className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Left column - stats */}
              <div className="md:col-span-3">
                <div className="flex md:flex-col md:gap-1.5 mb-2 justify-between md:justify-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-semibold">Day {currentDay}/{maxDay}</h4>
                      <Badge
                        variant="outline"
                        className={`text-xs px-1.5 py-0 h-5
                          ${
                            scenario.impact === "Critical"
                              ? "bg-red-500/20 text-red-500 dark:text-red-400 border-red-500/30"
                              : scenario.impact === "High"
                                ? "bg-amber-500/20 text-amber-500 dark:text-amber-400 border-amber-500/30"
                                : "bg-blue-500/20 text-blue-500 dark:text-blue-400 border-blue-500/30"
                          }
                        `}
                      >
                        {scenario.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Duration: {scenario.duration}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Impact: <span className="text-slate-800 dark:text-white font-medium">{scenario.financial}</span>
                    </span>
                  </div>
                </div>

                {/* Current event details */}
                <div className="p-2 rounded-lg bg-slate-100/50 dark:bg-slate-800/30 backdrop-blur-sm">
                  {currentEvents.filter(e => e.day <= currentDay).slice(-1).map((event, idx) => (
                    <motion.div 
                      key={`${scenario.id}-${event.day}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h5 className="text-xs font-semibold">{event.event}</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{event.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right column - timeline visualization */}
              <div className="md:col-span-9">
                <div className="relative pt-2 mb-3">
                  {/* Progress track */}
                  <div className="absolute left-0 right-0 h-1 bg-slate-200/50 dark:bg-slate-700/50"></div>
                  
                  {/* Progress fill */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentDay / maxDay) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="absolute left-0 h-1 bg-blue-500"
                  ></motion.div>

                  {/* Event markers */}
                  <div className="relative flex justify-between pt-2">
                    {timelineEvents[scenario.id].map((event, index) => (
                      <div
                        key={index}
                        className="relative flex flex-col items-center"
                        style={{
                          left: `${(event.day / maxDay) * 100}%`,
                          transform: "translateX(-50%)",
                        }}
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${
                            currentDay >= event.day 
                              ? "bg-blue-500 ring-1 ring-blue-500/20" 
                              : "bg-slate-300 dark:bg-slate-700"
                          }`}
                          style={{ marginTop: "-4px" }}
                        ></div>
                        <p className="mt-0.5 text-[9px] font-medium">{event.day}</p>
                        
                        {/* No event descriptions in timeline for space reasons */}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simple event list - more compact */}
                <div className="grid grid-cols-2 gap-2">
                  {timelineEvents[scenario.id]
                    .filter(e => currentDay >= e.day)
                    .slice(-3)
                    .map((event, index) => (
                      <div 
                        key={index}
                        className="text-xs p-1.5 border-l-2 border-blue-500 bg-white/5 dark:bg-slate-800/10 rounded-r-sm"
                      >
                        <p className="font-medium text-[10px]">Day {event.day}: {event.event}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{event.description}</p>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}