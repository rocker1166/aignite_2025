"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SquareStack, Waves, TrendingUp, Target, ArrowRight, Sparkles } from "lucide-react";

const TIMELINE_STEPS = [
  {
    title: "Build Digital Twin",
    description: "Map your supply chain with an interactive drag-and-drop editor.",
    color: "from-blue-600 to-blue-400",
    icon: SquareStack,
    features: ["Interactive Mapping", "Real-time Visualization"],
  },
  {
    title: "Simulate Disruption",
    description: "Run AI-powered scenarios for natural disasters, supplier failures, and more.",
    color: "from-rose-500 to-pink-400",
    icon: Waves,
    features: ["AI Scenarios", "Multi-Risk Analysis"],
  },
  {
    title: "Assess Impact",
    description: "Visualize cost, delay, and inventory effects in real time.",
    color: "from-violet-600 to-indigo-400",
    icon: TrendingUp,
    features: ["Real-time Analytics", "Cost Modeling"],
  },
  {
    title: "Get Recommendations",
    description: "Receive smart, cost-effective mitigation strategies and ROI analysis.",
    color: "from-amber-500 to-yellow-400",
    icon: Target,
    features: ["Smart Strategies", "ROI Analysis"],
  },
];

export function TimelineSteps() {
  return (
    <section className="w-full max-w-7xl mx-auto py-20 md:py-32 px-4 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Primary gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-blue-900/10 dark:via-indigo-900/5 dark:to-purple-900/10" />
        
        {/* Floating gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        
        {/* Geometric elements */}
        <div className="absolute top-10 right-10 w-6 h-6 border border-blue-300/30 dark:border-blue-700/30 rotate-45 animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-20 left-20 w-4 h-4 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
      </div>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-block mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100/80 via-indigo-100/60 to-purple-100/80 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-purple-900/30 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30">
          <span className="text-blue-700 dark:text-blue-300 text-sm font-medium uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            How It Works
          </span>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent leading-tight">
          AI-Powered Supply Chain Intelligence
        </h2>
        
        <p className="font-mono text-slate-300 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
          Transform disruptions into opportunities with our comprehensive four-step process that combines AI intelligence with real-world supply chain expertise.
        </p>
      </motion.div>

      {/* Timeline Steps */}
      <div className="relative">
        {/* Connecting line for desktop */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 via-violet-200 to-amber-200 dark:from-blue-800 dark:via-indigo-800 dark:via-violet-800 dark:to-amber-800 transform -translate-y-1/2 z-0" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {TIMELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            
            return (
                             <motion.div
                 key={step.title}
                 initial={{ opacity: 0, y: 50 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: idx * 0.15 }}
                 viewport={{ once: true }}
                 className="relative z-10"
               >
                 <Card className="group overflow-hidden border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-md shadow-xl hover:shadow-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                   {/* Subtle gradient overlay on hover */}
                   <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <CardHeader className="relative p-6 pb-4">
                    {/* Step number and icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative w-14 h-14 rounded-2xl bg-white/20 dark:bg-white/10 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 backdrop-blur-md">
                        <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400 drop-shadow-md opacity-90" />
                        {/* Subtle glow effect on hover */}
                        <div className="absolute inset-0 rounded-2xl bg-blue-100/30 dark:bg-blue-900/10 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300" />
                      </div>
                      
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {idx + 1}
                      </div>
                    </div>
                    
                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative p-6 pt-0 space-y-4">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                      {step.description}
                    </p>
                    
                                         {/* Feature badges */}
                     <div className="flex flex-wrap gap-2">
                       {step.features.map((feature, featureIdx) => (
                         <Badge 
                           key={featureIdx}
                           variant="outline" 
                           className="text-xs px-2 py-1 bg-white/30 dark:bg-white/10 border-white/30 dark:border-white/20 hover:bg-white/50 dark:hover:bg-white/20 transition-colors duration-200 backdrop-blur-sm"
                         >
                           {feature}
                         </Badge>
                       ))}
                    </div>
                    
                    {/* Hover arrow */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Learn more
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Call to action */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
          <span className="font-medium">See It In Action</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </motion.div>
    </section>
  );
}