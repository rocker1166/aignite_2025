"use client"

type Props = {
  progress: number
}

export function SimulationLoader({ progress }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-64 h-64 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        <div className="mt-8 text-xl font-semibold">Running Simulation...</div>
        <div className="mt-2 text-muted-foreground">{progress}% Complete</div>
      </div>
    </div>
  )
}
