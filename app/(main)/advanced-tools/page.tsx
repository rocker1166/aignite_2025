import { Header } from "@/components/header"
import { AdvancedToolsPage } from "@/components/advanced-tools/advanced-tools-page"

export default function AdvancedToolsPageRoute() {
  return (
    <>
      <Header title="Advanced Tools" />
      <main className="flex-1 overflow-auto">
        <AdvancedToolsPage />
      </main>
    </>
  )
}
