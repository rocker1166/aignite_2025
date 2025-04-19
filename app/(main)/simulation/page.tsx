import { Header } from "@/components/header"
import { SimulationPage } from "@/components/simulation/simulation-page"

export default function SimulationPageRoute() {
  return (
    <>
      <Header title="Simulation & Scenario Generation" />
      <main className="flex-1 overflow-auto">
        <SimulationPage />
      </main>
    </>
  )
}
