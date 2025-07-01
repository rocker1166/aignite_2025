import { TeamSection } from "../../components/home-page/sections/team"
import { LandingHeader } from "../../components/home-page/layout/landing-header"
import { Footer } from "../../components/home-page/layout/footer"

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main className="pt-20">
        <TeamSection />
      </main>
      <Footer />
    </div>
  )
}
