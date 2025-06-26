"use client"

import { HeroGeometric } from "@/components/ui/hero-geometric"
import { TimelineSteps } from "@/components/ui/timeline-steps"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RouteAnimation } from "@/components/ui/route-animation"
import { BentoCard } from "@/components/ui/bento-card"
import { LandingHeader } from "@/components/landing-header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Globe, 
  Package, 
  Shield, 
  TrendingUp, 
  Truck, 
  Workflow,
  Zap,
  ArrowRight,
  BarChart2,
  Activity
} from "lucide-react"
import { motion } from "framer-motion"
import FUIHeroWithGridSimple from "@/src/components/farmui/hero"

export default function Home() {

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
      
      <main className="flex-1 min-h-screen text-foreground flex flex-col items-center justify-center overflow-hidden">
        {/* Abstract background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-300 dark:bg-blue-900/30 opacity-20 blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-purple-300 dark:bg-purple-900/30 opacity-20 blur-3xl"></div>
          <div className="absolute top-2/3 right-1/3 w-72 h-72 rounded-full bg-indigo-300 dark:bg-indigo-900/30 opacity-20 blur-3xl"></div>
        </div>
        
        <div className="pt-16 w-full"> {/* Padding to account for fixed header */}
          <FUIHeroWithGridSimple />
        </div>
        
        <div id="features" className="w-full mt-20">
          <TimelineSteps />
        </div>

        {/* Animated Diagram Section with chart placeholders */}
        <section className="w-full relative py-20 md:py-32 px-4 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent dark:from-transparent dark:via-blue-900/5 dark:to-transparent overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/3 bottom-0 w-72 h-72 rounded-full bg-blue-300/20 dark:bg-blue-900/10 blur-3xl"></div>
            <div className="absolute right-1/4 top-1/3 w-64 h-64 rounded-full bg-purple-300/20 dark:bg-purple-900/10 blur-3xl"></div>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium uppercase tracking-wide">
                Advanced Analytics
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-blue-700 dark:text-blue-400">
                Supply Chain Resilience in Action
              </h2>
              <p className="font-mono text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
                Powerful analytics and visualization tools to help you make data-driven decisions.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 bg-blue-50/80 dark:bg-blue-950/70 backdrop-blur-md shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 text-xl font-bold text-center rounded-t-2xl px-6 pt-6 pb-2">
                    Real-Time Risk Monitoring
                    <div className="mt-2 text-2xl">
                      <BarChart2 />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="aspect-[2/1] relative flex items-center justify-center rounded-lg overflow-hidden mb-3 bg-blue-950/70">
                      {/* SVG grid */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50" fill="none">
                        {[10,20,30,40,50,60,70,80,90].map(x => (
                          <line key={x} x1={x} y1={0} x2={x} y2={50} stroke="white" strokeOpacity="0.08" strokeWidth="0.5" />
                        ))}
                        {[10,20,30,40].map(y => (
                          <line key={y} x1={0} y1={y} x2={100} y2={y} stroke="white" strokeOpacity="0.08" strokeWidth="0.5" />
                        ))}
                      </svg>
                      {/* Chart line */}
                      <svg viewBox="0 0 100 50" className="relative z-10 w-full h-full">
                        <polyline
                          points="0,30 10,20 20,35 30,10 40,30 50,20 60,40 70,30 80,15 90,20 100,30"
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))"
                          opacity="0.8"
                        />
                      </svg>
                    </div>
                    <div className="text-blue-100 text-xs md:text-sm mb-3 leading-snug">
                      Track risk metrics in real-time across your entire supply chain network with advanced analytics and predictive AI.
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-full px-4 py-1 text-xs shadow-md">
                      <span>Learn more</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 bg-blue-50/80 dark:bg-blue-950/70 backdrop-blur-md shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 text-xl font-bold text-center rounded-t-2xl px-6 pt-6 pb-2">
                    Impact Assessment
                    <div className="mt-2 text-2xl">
                      <Activity />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="aspect-[2/1] relative flex items-end justify-center rounded-lg overflow-hidden mb-3 bg-blue-950/70">
                      {/* SVG grid */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50" fill="none">
                        {[10,20,30,40,50,60,70,80,90].map(x => (
                          <line key={x} x1={x} y1={0} x2={x} y2={50} stroke="white" strokeOpacity="0.08" strokeWidth="0.5" />
                        ))}
                        {[10,20,30,40].map(y => (
                          <line key={y} x1={0} y1={y} x2={100} y2={y} stroke="white" strokeOpacity="0.08" strokeWidth="0.5" />
                        ))}
                      </svg>
                      {/* Chart bars */}
                      <svg viewBox="0 0 100 50" className="relative z-10 w-full h-full">
                        <rect x="10" y="25" width="8" height="20" rx="2" fill="white" opacity="0.8" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                        <rect x="25" y="10" width="8" height="35" rx="2" fill="white" opacity="0.8" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                        <rect x="40" y="30" width="8" height="15" rx="2" fill="white" opacity="0.8" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                        <rect x="55" y="20" width="8" height="25" rx="2" fill="white" opacity="0.8" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                        <rect x="70" y="5" width="8" height="40" rx="2" fill="white" opacity="0.8" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                      </svg>
                    </div>
                    <div className="text-blue-100 text-xs md:text-sm mb-3 leading-snug">
                      Visualize supplier risk levels and identify critical vulnerabilities with our comprehensive impact assessment tools.
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-full px-4 py-1 text-xs shadow-md">
                      <span>Learn more</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
        
        <section className="w-full relative py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50 dark:from-transparent dark:to-blue-950/10 -z-10"></div>
          <div className="absolute inset-0 overflow-hidden -z-10">
            <svg className="absolute bottom-0 left-0 w-full h-1/3 text-blue-100/50 dark:text-blue-900/20 translate-y-1/4" 
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
                    fill="currentColor"></path>
            </svg>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="container mx-auto px-4 max-w-6xl relative"
          >
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 border border-blue-100/50 dark:border-blue-900/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium uppercase tracking-wide">
                    Start Today
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-500 dark:to-indigo-400 bg-clip-text text-transparent">
                    Ready to Transform Your Supply Chain?
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                    Experience the power of AI-driven supply chain resilience. Join industry leaders already using our platform to navigate disruptions with confidence.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild size="lg" className="bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white shadow-lg rounded-full px-8">
                      <a href="/dashboard">Get Started</a>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full px-8">
                      <a href="#features">Learn More</a>
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="aspect-square max-w-md mx-auto relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-3xl blur-3xl opacity-60"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Replace with your actual image or 3D illustration */}
                      <div className="w-4/5 h-4/5 rounded-2xl overflow-hidden bg-white/90 dark:bg-slate-800/90 border border-white/50 dark:border-slate-700/50 shadow-xl backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center p-6">
                          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Workflow className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Resilient Supply Chains</h3>
                          <p className="text-slate-600 dark:text-slate-300 text-sm">Intelligent optimization and risk management</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      
      <Footer />
    </>
  )
}