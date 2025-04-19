"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RouteAnimationProps {
  routes: {
    from: string
    to: string
    status: "active" | "delayed" | "disrupted"
  }[]
}

export function RouteAnimation({ routes }: RouteAnimationProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "delayed":
        return "bg-amber-500"
      case "disrupted":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Global Supply Routes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video bg-muted/20 rounded-md overflow-hidden border">
          {/* World Map Background - simplified representation */}
          <div className="absolute inset-0 opacity-20 bg-[url('/placeholder.svg')] bg-center bg-no-repeat bg-contain" />
          
          <div className="absolute inset-0">
            {routes.map((route, index) => (
              <div key={`${route.from}-${route.to}`} className="absolute">
                {/* This is a simplified representation - in a real app, you'd use actual coordinates */}
                <motion.div
                  className={`h-2 w-2 rounded-full ${getStatusColor(route.status)} absolute`}
                  style={{
                    top: `${20 + index * 15}%`,
                    left: "20%"
                  }}
                />
                
                {/* Animate a dot along the path */}
                <motion.div
                  className={`h-2 w-2 rounded-full ${getStatusColor(route.status)} absolute`}
                  initial={{ top: `${20 + index * 15}%`, left: "20%" }}
                  animate={{ 
                    top: `${20 + index * 15}%`, 
                    left: "70%",
                    transition: { 
                      duration: route.status === "active" ? 3 : 5,
                      repeat: Infinity,
                      ease: "linear"
                    }
                  }}
                />
                
                <motion.div
                  className={`h-2 w-2 rounded-full ${getStatusColor(route.status)} absolute`}
                  style={{
                    top: `${20 + index * 15}%`,
                    left: "70%"
                  }}
                />
                
                {/* Route labels */}
                <div className="text-xs font-medium absolute" style={{ top: `${20 + index * 15 - 2}%`, left: "10%" }}>
                  {route.from}
                </div>
                <div className="text-xs font-medium absolute" style={{ top: `${20 + index * 15 - 2}%`, left: "75%" }}>
                  {route.to}
                </div>
                
                {/* Status line */}
                <motion.div 
                  className={`h-[1px] absolute ${getStatusColor(route.status)}`}
                  style={{ top: `${20.5 + index * 15}%`, left: "20%", width: "0%" }}
                  animate={{ width: "50%" }}
                  transition={{ 
                    duration: 2,
                    delay: index * 0.3
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-2 right-2 bg-background/80 p-2 rounded-md backdrop-blur-sm text-xs space-y-1">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
              <span>Active</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-amber-500 mr-2" />
              <span>Delayed</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
              <span>Disrupted</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}