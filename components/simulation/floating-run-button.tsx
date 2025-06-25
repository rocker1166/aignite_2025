"use client"

import { PlayIcon } from "@/components/icons/play-button"
import { Button } from "@/components/ui/button"

interface FloatingRunButtonProps {
  isFormValid: boolean
  onRunSimulation: () => void
}

/**
 * Renders a floating action button for running a simulation, fixed to the bottom-right corner of the viewport.
 *
 * The button is enabled only when the form is valid, displaying "Run Simulation" with a play icon; otherwise, it shows "Complete Form" and is disabled. Clicking the button triggers the provided simulation callback.
 *
 * @param isFormValid - Indicates whether the form is valid and the button should be enabled
 * @param onRunSimulation - Callback invoked when the button is clicked
 */
export function FloatingRunButton({ isFormValid, onRunSimulation }: FloatingRunButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button 
        onClick={onRunSimulation} 
        disabled={!isFormValid}
        size="lg"
        className="shadow-xl h-12 px-6 text-base rounded-lg bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
      >
        <PlayIcon className="mr-2" size={20} />
        {isFormValid ? "Run Simulation" : "Complete Form"}
      </Button>
    </div>
  )
} 