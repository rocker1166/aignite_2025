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
  ArrowRight
} from "lucide-react"
import { motion } from "framer-motion"

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
      
      <main className="flex-1 min-h-screen bg-gradient-to-b from-background via-blue-50/20 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 text-foreground flex flex-col items-center justify-center overflow-hidden">
        {/* Abstract background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-300 dark:bg-blue-900/30 opacity-20 blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-purple-300 dark:bg-purple-900/30 opacity-20 blur-3xl"></div>
          <div className="absolute top-2/3 right-1/3 w-72 h-72 rounded-full bg-indigo-300 dark:bg-indigo-900/30 opacity-20 blur-3xl"></div>
        </div>
        
        <div className="pt-16 w-full"> {/* Padding to account for fixed header */}
          <HeroGeometric />
          
          {/* Floating stats cards */}
          <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 backdrop-blur-sm"
            >
              <Card className="bg-white/80 dark:bg-slate-900/50 border border-white/20 dark:border-slate-700/20 shadow-xl backdrop-blur-md">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">150+</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Global Partners</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 dark:bg-slate-900/50 border border-white/20 dark:border-slate-700/20 shadow-xl backdrop-blur-md">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                    <Workflow className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">99.8%</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Supply Chain Resilience</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 dark:bg-slate-900/50 border border-white/20 dark:border-slate-700/20 shadow-xl backdrop-blur-md">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">4.2hrs</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Avg. Response Time</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
        
        <div id="features" className="w-full mt-20">
          <TimelineSteps />
        </div>

        <section id="how-it-works" className="w-full max-w-6xl mx-auto py-20 md:py-28 px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium uppercase tracking-wide">
              Our Framework
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              Supply Chain Resilience Framework
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
              Our proven methodology helps businesses prepare for, respond to, and recover from supply chain disruptions.
            </p>
          </motion.div>
          
          {/* Improved Framework Section - Step Cards */}
          <div className="mb-20">
            <div className="relative py-4">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-0.5 bg-gradient-to-b from-blue-300 via-indigo-300 to-violet-300 dark:from-blue-700 dark:via-indigo-700 dark:to-violet-700"></div>
              
              {/* Step 1 */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="md:w-1/2 md:pr-12 mb-12 md:mb-24 md:text-right md:ml-0 ml-8"
              >
                <div className="relative">
                  {/* Step Number - Desktop */}
                  <div className="hidden md:flex absolute top-1/2 -right-16 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white items-center justify-center font-bold text-sm z-10">
                    1
                  </div>
                  {/* Step Number - Mobile */}
                  <div className="md:hidden absolute -left-8 top-0 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  
                  <Card className="overflow-hidden border-blue-100 dark:border-blue-800/40 shadow-lg hover:shadow-xl transition-all bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 p-5 border-b border-blue-100 dark:border-blue-800/30">
                      <CardTitle className="text-xl text-blue-700 dark:text-blue-400 flex items-center md:justify-end justify-start gap-2">
                        <Shield className="h-5 w-5" />
                        <span>Risk Assessment</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <p className="text-slate-700 dark:text-slate-300">
                        Comprehensive analysis of your supply chain to identify vulnerabilities, single points of failure, and potential risks using advanced AI algorithms.
                      </p>
                      <div className="mt-4 flex md:justify-end justify-start">
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50">
                          Digital Twin Analysis
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
              
              {/* Step 2 */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="md:w-1/2 md:pl-12 md:ml-auto mb-12 md:mb-24 ml-8"
              >
                <div className="relative">
                  {/* Step Number - Desktop */}
                  <div className="hidden md:flex absolute top-1/2 -left-16 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white items-center justify-center font-bold text-sm z-10">
                    2
                  </div>
                  {/* Step Number - Mobile */}
                  <div className="md:hidden absolute -left-8 top-0 w-6 h-6 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  
                  <Card className="overflow-hidden border-indigo-100 dark:border-indigo-800/40 shadow-lg hover:shadow-xl transition-all bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/30 p-5 border-b border-indigo-100 dark:border-indigo-800/30">
                      <CardTitle className="text-xl text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        <span>Diversification Strategy</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <p className="text-slate-700 dark:text-slate-300">
                        Strategic approach to expand and diversify your supplier network across multiple regions, reducing dependency on single sources and geographic areas.
                      </p>
                      <div className="mt-4">
                        <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50">
                          Multi-source Intelligence
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
              
              {/* Step 3 */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="md:w-1/2 md:pr-12 mb-12 md:mb-24 md:text-right md:ml-0 ml-8"
              >
                <div className="relative">
                  {/* Step Number - Desktop */}
                  <div className="hidden md:flex absolute top-1/2 -right-16 -translate-y-1/2 w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-500 text-white items-center justify-center font-bold text-sm z-10">
                    3
                  </div>
                  {/* Step Number - Mobile */}
                  <div className="md:hidden absolute -left-8 top-0 w-6 h-6 rounded-full bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  
                  <Card className="overflow-hidden border-purple-100 dark:border-purple-800/40 shadow-lg hover:shadow-xl transition-all bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 p-5 border-b border-purple-100 dark:border-purple-800/30">
                      <CardTitle className="text-xl text-purple-700 dark:text-purple-400 flex items-center md:justify-end justify-start gap-2">
                        <Package className="h-5 w-5" />
                        <span>Inventory Optimization</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <p className="text-slate-700 dark:text-slate-300">
                        AI-driven inventory management that balances stock levels for maximum resilience without excessive holding costs, using predictive demand forecasting.
                      </p>
                      <div className="mt-4 flex md:justify-end justify-start">
                        <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50">
                          Adaptive Buffers
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
              
              {/* Step 4 */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="md:w-1/2 md:pl-12 md:ml-auto mb-12 md:mb-24 ml-8"
              >
                <div className="relative">
                  {/* Step Number - Desktop */}
                  <div className="hidden md:flex absolute top-1/2 -left-16 -translate-y-1/2 w-8 h-8 rounded-full bg-green-600 dark:bg-green-500 text-white items-center justify-center font-bold text-sm z-10">
                    4
                  </div>
                  {/* Step Number - Mobile */}
                  <div className="md:hidden absolute -left-8 top-0 w-6 h-6 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  
                  <Card className="overflow-hidden border-green-100 dark:border-green-800/40 shadow-lg hover:shadow-xl transition-all bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 p-5 border-b border-green-100 dark:border-green-800/30">
                      <CardTitle className="text-xl text-green-700 dark:text-green-400 flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        <span>Logistics Planning</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <p className="text-slate-700 dark:text-slate-300">
                        Development of alternative transportation routes and modes to ensure product delivery even during disruptions, with real-time optimization.
                      </p>
                      <div className="mt-4">
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50">
                          Alternative Routes
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
              
              {/* Step 5 */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="md:w-1/2 md:pr-12 mb-12 md:mb-0 md:text-right md:ml-0 ml-8"
              >
                <div className="relative">
                  {/* Step Number - Desktop */}
                  <div className="hidden md:flex absolute top-1/2 -right-16 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-600 dark:bg-amber-500 text-white items-center justify-center font-bold text-sm z-10">
                    5
                  </div>
                  {/* Step Number - Mobile */}
                  <div className="md:hidden absolute -left-8 top-0 w-6 h-6 rounded-full bg-amber-600 dark:bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                    5
                  </div>
                  
                  <Card className="overflow-hidden border-amber-100 dark:border-amber-800/40 shadow-lg hover:shadow-xl transition-all bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30 p-5 border-b border-amber-100 dark:border-amber-800/30">
                      <CardTitle className="text-xl text-amber-700 dark:text-amber-400 flex items-center md:justify-end justify-start gap-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>Continuous Monitoring</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <p className="text-slate-700 dark:text-slate-300">
                        Real-time visibility across your supply chain network with early warning systems, KPI tracking, and automated alerts for emerging risks.
                      </p>
                      <div className="mt-4 flex md:justify-end justify-start">
                        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50">
                          24/7 Surveillance
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="order-2 md:order-1">
              <RouteAnimation routes={globalRoutes} />
            </div>

            <div className="order-1 md:order-2 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium uppercase tracking-wide">
                  Global Impact
                </div>
                <h3 className="text-3xl font-bold mb-4">Real-Time Supply Chain Visibility</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Monitor your global supply chain network with real-time alerts and insights. Identify potential disruptions before they impact your business operations.
                </p>
                <BentoCard
                  title="Global Disruption Index"
                  value="32.7%"
                  subtitle="5.3% increase from last quarter"
                  colors={["#EC4899", "#F472B6", "#3B82F6"]}
                  delay={0.2}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
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
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Supply Chain Resilience in Action
              </h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
                Powerful analytics and visualization tools to help you make data-driven decisions.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 p-6">
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>Real-Time Risk Monitoring</span>
                      <BarChart3 className="h-5 w-5 text-blue-200" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="aspect-video relative flex items-center justify-center rounded-md overflow-hidden mb-4">
                      <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="relative h-full w-full">
                          {/* Line chart visualization placeholder */}
                          <div className="absolute inset-x-0 bottom-0 h-[60%]">
                            <div className="relative h-full w-full">
                              <svg viewBox="0 0 100 30" className="h-full w-full stroke-blue-500 stroke-[1.5] dark:stroke-blue-400">
                                <path 
                                  d="M0,15 L10,10 L20,20 L30,5 L40,15 L50,10 L60,20 L70,15 L80,5 L90,10 L100,15" 
                                  fill="none" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                  className="path-animation"
                                />
                              </svg>
                              <div className="absolute bottom-0 left-0 h-1/3 w-full bg-gradient-to-t from-blue-500/20 to-transparent"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 mb-5 leading-relaxed">
                      Track risk metrics in real-time across your entire supply chain network with advanced analytics and predictive AI.
                    </div>
                    <Button variant="ghost" className="group-hover:bg-blue-50 group-hover:text-blue-700 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-400 flex items-center gap-1 text-sm">
                      <span>Learn more</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 p-6">
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>Impact Assessment</span>
                      <TrendingUp className="h-5 w-5 text-purple-200" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="aspect-video relative flex items-center justify-center rounded-md overflow-hidden mb-4">
                      <div className="h-full w-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        <div className="relative h-full w-full p-4">
                          {/* Bar chart visualization placeholder */}
                          <div className="flex h-full items-end justify-around pb-6">
                            <motion.div 
                              initial={{ height: '0%' }}
                              whileInView={{ height: '60%' }}
                              transition={{ duration: 0.7, delay: 0.5 }}
                              viewport={{ once: true }}
                              className="w-[15%] bg-gradient-to-t from-purple-500 to-pink-500 dark:from-purple-500/70 dark:to-pink-500/70 rounded-t"
                            ></motion.div>
                            <motion.div 
                              initial={{ height: '0%' }}
                              whileInView={{ height: '90%' }}
                              transition={{ duration: 0.7, delay: 0.6 }}
                              viewport={{ once: true }}
                              className="w-[15%] bg-gradient-to-t from-purple-500 to-pink-500 dark:from-purple-500/70 dark:to-pink-500/70 rounded-t"
                            ></motion.div>
                            <motion.div 
                              initial={{ height: '0%' }}
                              whileInView={{ height: '30%' }}
                              transition={{ duration: 0.7, delay: 0.7 }}
                              viewport={{ once: true }}
                              className="w-[15%] bg-gradient-to-t from-purple-500 to-pink-500 dark:from-purple-500/70 dark:to-pink-500/70 rounded-t"
                            ></motion.div>
                            <motion.div 
                              initial={{ height: '0%' }}
                              whileInView={{ height: '45%' }}
                              transition={{ duration: 0.7, delay: 0.8 }}
                              viewport={{ once: true }}
                              className="w-[15%] bg-gradient-to-t from-purple-500 to-pink-500 dark:from-purple-500/70 dark:to-pink-500/70 rounded-t"
                            ></motion.div>
                            <motion.div 
                              initial={{ height: '0%' }}
                              whileInView={{ height: '75%' }}
                              transition={{ duration: 0.7, delay: 0.9 }}
                              viewport={{ once: true }}
                              className="w-[15%] bg-gradient-to-t from-purple-500 to-pink-500 dark:from-purple-500/70 dark:to-pink-500/70 rounded-t"
                            ></motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 mb-5 leading-relaxed">
                      Visualize supplier risk levels and identify critical vulnerabilities with our comprehensive impact assessment tools.
                    </div>
                    <Button variant="ghost" className="group-hover:bg-purple-50 group-hover:text-purple-700 dark:group-hover:bg-purple-900/20 dark:group-hover:text-purple-400 flex items-center gap-1 text-sm">
                      <span>Learn more</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
        
        <Benefits />
        
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
      
      <style jsx global>{`
        @keyframes pathAnimation {
          0% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        .path-animation {
          animation: pathAnimation 3s ease-in-out forwards;
        }
      `}</style>
      
      <Footer />
    </>
  )
}