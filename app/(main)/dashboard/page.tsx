import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 overflow-auto">
        <DashboardPage />
      </main>
    </>
  )
}
