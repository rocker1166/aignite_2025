import { Header } from "@/components/header"

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header title="Simulation Results" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </>
  )
}
