import { Header } from "@/components/header"

export default function MitigationStrategyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header title="Mitigation Strategy" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </>
  )
}
