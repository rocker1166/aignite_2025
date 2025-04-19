import { Header } from "@/components/header"
import { AnalyticsPage } from "@/components/analytics/analytics-page"

export default function AnalyticsPageRoute() {
  return (
    <>
      <Header title="KPI & Impact Analytics" />
      <main className="flex-1 overflow-auto">
        <AnalyticsPage />
      </main>
    </>
  )
}
