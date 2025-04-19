"use client"

import { Button } from "@/components/ui/button"
import { Play, Save } from "lucide-react"

type Props = {
  onRun: () => void
  disabled?: boolean
}

export function SimulationToolbar({ onRun, disabled }: Props) {
  return (
    <div className="flex items-center justify-between border-b p-4">
      <h1 className="text-2xl font-bold">Simulation & Scenario Generation</h1>
     
    </div>
  )
}
