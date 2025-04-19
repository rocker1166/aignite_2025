import { Header } from "@/components/header";
import { Suspense, lazy } from "react";

// Lazy load the DashboardPage component
const DashboardPage = lazy(() => import("@/components/dashboard/dashboard-page"));

export default function Home() {
  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 overflow-auto">
        {/* Suspense handles fallback text during the lazy loading of DashboardPage */}
        <Suspense fallback={<div>Loading Dashboard... Please wait.</div>}>
          <DashboardPage />
        </Suspense>
      </main>
    </>
  );
}