"use client"

import { HeroGeometric } from "@/components/ui/hero-geometric"
import { TimelineSteps } from "@/components/ui/timeline-steps"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderState } from "@/components/ui/order-state"
import { RouteAnimation } from "@/components/ui/route-animation"
import { BentoCard } from "@/components/ui/bento-card"
import { LandingHeader } from "@/components/landing-header"
import { Footer } from "@/components/footer"
import { Benefits } from "@/components/benefits"
import { 
  BarChart3, 
  Globe, 
  Package, 
  Shield, 
  TrendingUp, 
  Truck, 
  Workflow,
  Zap
} from "lucide-react"
import { motion } from "framer-motion"
import SigninButton from "@/components/auth/Signin"

export default function Home() {
  const supplyChainStates = [
    {
      status: "Risk Assessment",
      icon: <Shield className="h-4 w-4" />,
      description: "Identify vulnerabilities in your supply chain",
      isActive: true,
    },
    {
      status: "Diversification",
      icon: <Globe className="h-4 w-4" />,
      description: "Expand supplier network globally",
      isActive: true,
    },
    {
      status: "Inventory Optimization",
      icon: <Package className="h-4 w-4" />,
      description: "Balance stock levels for resilience",
      isActive: false,
    },
    {
      status: "Logistics Planning",
      icon: <Truck className="h-4 w-4" />,
      description: "Develop alternative transportation routes",
      isActive: false,
    },
    {
      status: "Continuous Monitoring",
      icon: <BarChart3 className="h-4 w-4" />,
      description: "Real-time visibility across your network",
      isActive: false,
    },
  ]

  const globalRoutes: {
    from: string;
    to: string;
    status: "active" | "delayed" | "disrupted";
  }[] = [
    { from: "Shanghai", to: "Los Angeles", status: "active" },
    { from: "Rotterdam", to: "New York", status: "delayed" },
    { from: "Singapore", to: "Sydney", status: "active" },
    { from: "Mumbai", to: "Dubai", status: "disrupted" },
  ]

  return (
    <>
      <LandingHeader />
      
      <main className="flex-1 min-h-screen bg-background text-foreground flex flex-col items-center justify-center dark:bg-gray-900 dark:text-gray-100">
        <div className="pt-16"> {/* Padding to account for fixed header */}
          <HeroGeometric />
        </div>
        
        <div id="features" className="w-full">
          <TimelineSteps />
        </div>

        <section id="how-it-works" className="w-full max-w-5xl mx-auto py-12 md:py-20 px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Supply Chain Resilience Framework</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our proven methodology helps businesses prepare for, respond to, and recover from supply chain disruptions.
            </p>
          </motion.div>
          
          <OrderState states={supplyChainStates} className="mb-16" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <RouteAnimation routes={globalRoutes} />

            <BentoCard
              title="Global Disruption Index"
              value="32.7%"
              subtitle="5.3% increase from last quarter"
              colors={["#EC4899", "#F472B6", "#3B82F6"]}
              delay={0.2}
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <BentoCard
              title="Risk Mitigation Score"
              value="87/100"
              subtitle="Industry average: 72/100"
              colors={["#3B82F6", "#60A5FA", "#93C5FD"]}
              delay={0.3}
              icon={<Shield className="h-5 w-5" />}
            />

            <BentoCard
              title="Supplier Diversification"
              value="43"
              subtitle="Countries in your network"
              colors={["#60A5FA", "#34D399", "#93C5FD"]}
              delay={0.4}
              icon={<Globe className="h-5 w-5" />}
            />

            <BentoCard
              title="Response Time"
              value="4.2 hrs"
              subtitle="Average time to address disruptions"
              colors={["#F59E0B", "#A78BFA", "#FCD34D"]}
              delay={0.5}
              icon={<Zap className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BentoCard
              title="Inventory Resilience"
              value="68 days"
              subtitle="Average buffer stock duration"
              colors={["#3B82F6", "#A78BFA", "#FBCFE8"]}
              delay={0.6}
              icon={<Package className="h-5 w-5" />}
            />

            <BentoCard
              title="Digital Transformation"
              value="76%"
              subtitle="Supply chain processes digitized"
              colors={["#10B981", "#34D399", "#6EE7B7"]}
              delay={0.7}
              icon={<Workflow className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Animated Diagram Section with chart placeholders */}
        <section className="w-full max-w-5xl mx-auto py-12 md:py-20 px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-blue-700 via-blue-400 to-rose-400 bg-clip-text text-transparent">
            Supply Chain Resilience in Action
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <Card className="flex-1 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Real-Time Risk Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video relative flex items-center justify-center rounded-md border border-dashed">
                  <div className="h-full w-full bg-muted/20">
                    <div className="relative h-full w-full">
                      {/* Line chart visualization placeholder */}
                      <div className="absolute inset-x-0 bottom-0 h-[60%]">
                        <div className="relative h-full w-full">
                          <svg viewBox="0 0 100 30" className="h-full w-full stroke-blue-500 stroke-2">
                            <path 
                              d="M0,15 L10,10 L20,20 L30,5 L40,15 L50,10 L60,20 L70,15 L80,5 L90,10 L100,15" 
                              fill="none" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="absolute bottom-0 left-0 h-1/3 w-full bg-gradient-to-t from-blue-500/20 to-transparent"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Track risk metrics in real-time across your entire supply chain network
                </div>
              </CardContent>
            </Card>
            
            <Card className="flex-1 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Impact Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video relative flex items-center justify-center rounded-md border border-dashed">
                  <div className="h-full w-full bg-muted/20">
                    <div className="relative h-full w-full p-4">
                      {/* Bar chart visualization placeholder */}
                      <div className="flex h-full items-end justify-around pb-6">
                        <div className="w-[15%] bg-rose-500/50 rounded-t" style={{ height: '60%' }}></div>
                        <div className="w-[15%] bg-rose-500/50 rounded-t" style={{ height: '90%' }}></div>
                        <div className="w-[15%] bg-rose-500/50 rounded-t" style={{ height: '30%' }}></div>
                        <div className="w-[15%] bg-rose-500/50 rounded-t" style={{ height: '45%' }}></div>
                        <div className="w-[15%] bg-rose-500/50 rounded-t" style={{ height: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Visualize supplier risk levels and identify critical vulnerabilities
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        <Benefits />
        
        <section className="w-full bg-gradient-to-b from-background to-card py-16 md:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="container mx-auto px-4 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Supply Chain?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Experience the power of AI-driven supply chain resilience. Start your journey today.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-700 hover:bg-blue-800 text-white shadow-lg">
                <a href="/dashboard">Get Started</a>
              </Button>
              <Button asChild size="lg" variant="ghost" className="border border-blue-700 text-blue-700">
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>
      
      <Footer />
    </>
  )
}