import { SimulationPage } from "@/components/simulation/simulation-page"
import { ImpactProvider } from "@/lib/context/impact-context"

export default function SimulationLayout() {
  return (
    <div className="flex h-full flex-col">
      <ImpactProvider>
        <SimulationPage />
      </ImpactProvider>
    </div>
  )
}