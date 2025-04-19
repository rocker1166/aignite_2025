"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, ZoomIn, ZoomOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"

// Define the node data structure
interface Node {
  id: string
  name: string
  type: string
  status: "operational" | "partial" | "failed"
  x: number
  y: number
}

// Define the link data structure
interface Link {
  source: string
  target: string
  value: number
}

// Sample data for the network
const nodes: Node[] = [
  { id: "1", name: "Supplier A", type: "supplier", status: "failed", x: 100, y: 100 },
  { id: "2", name: "Factory B", type: "manufacturing", status: "failed", x: 250, y: 150 },
  { id: "3", name: "Port C", type: "logistics", status: "partial", x: 400, y: 100 },
  { id: "4", name: "Distributor D", type: "distribution", status: "partial", x: 550, y: 150 },
  { id: "5", name: "Warehouse E", type: "storage", status: "operational", x: 700, y: 100 },
  { id: "6", name: "Retailer F", type: "retail", status: "operational", x: 850, y: 150 },
  { id: "7", name: "Supplier G", type: "supplier", status: "operational", x: 100, y: 250 },
  { id: "8", name: "Factory H", type: "manufacturing", status: "operational", x: 250, y: 300 },
  { id: "9", name: "Warehouse I", type: "storage", status: "operational", x: 400, y: 250 },
  { id: "10", name: "Retailer J", type: "retail", status: "operational", x: 550, y: 300 },
  { id: "11", name: "Supplier K", type: "supplier", status: "operational", x: 700, y: 250 },
]

const links: Link[] = [
  { source: "1", target: "2", value: 5 },
  { source: "2", target: "3", value: 5 },
  { source: "3", target: "4", value: 5 },
  { source: "4", target: "5", value: 5 },
  { source: "5", target: "6", value: 5 },
  { source: "7", target: "8", value: 5 },
  { source: "8", target: "9", value: 5 },
  { source: "9", target: "10", value: 5 },
  { source: "7", target: "2", value: 3 },
  { source: "11", target: "5", value: 3 },
]

export default function CascadingFailureMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [day, setDay] = useState(5)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  // Draw the network on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply zoom and offset
    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(zoom, zoom)

    // Draw links
    links.forEach((link) => {
      const source = nodes.find((n) => n.id === link.source)
      const target = nodes.find((n) => n.id === link.target)

      if (source && target) {
        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)

        // Style based on node statuses
        if (source.status === "failed" || target.status === "failed") {
          ctx.strokeStyle = "#ef4444" // Red for failed connections
          ctx.lineWidth = 3
        } else if (source.status === "partial" || target.status === "partial") {
          ctx.strokeStyle = "#eab308" // Yellow for partial connections
          ctx.lineWidth = 2
        } else {
          ctx.strokeStyle = "#94a3b8" // Gray for normal connections
          ctx.lineWidth = 1
        }

        ctx.stroke()
      }
    })

    // Draw nodes
    nodes.forEach((node) => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, 20, 0, Math.PI * 2)

      // Fill based on status
      if (node.status === "failed") {
        ctx.fillStyle = "#ef4444" // Red for failed
      } else if (node.status === "partial") {
        ctx.fillStyle = "#eab308" // Yellow for partial
      } else {
        ctx.fillStyle = "#22c55e" // Green for operational
      }

      ctx.fill()

      // Node border
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Node label
      ctx.fillStyle = "#ffffff"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.name, node.x, node.y)
    })

    ctx.restore()
  }, [zoom, offset, day])

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y

    setOffset({
      x: offset.x + dx,
      y: offset.y + dy,
    })

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleDayChange = (value: number[]) => {
    setDay(value[0])
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-28 justify-between">
              Day {day}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Simulation Day</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <Slider defaultValue={[day]} max={30} min={1} step={1} onValueChange={handleDayChange} />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDay(1)}>Day 1 (Start)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDay(5)}>Day 5 (Factory B Failure)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDay(14)}>Day 14 (Recovery Start)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDay(30)}>Day 30 (End)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span>Operational</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span>Failed</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={1000}
        height={500}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}
