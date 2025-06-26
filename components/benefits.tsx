"use client"

import { motion } from "framer-motion"
import { 
  AlertTriangle, 
  BarChart3, 
  Brain, 
  Clock, 
  DollarSign, 
  LineChart, 
  PieChart,
  Zap
} from "lucide-react"

const BENEFITS = [
  {
    icon: <AlertTriangle className="h-6 w-6" />,
    title: "Proactive Risk Management",
    description: "Identify potential disruptions before they occur and implement mitigation strategies."
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "AI-Driven Recommendations",
    description: "Get intelligent, data-backed suggestions for supply chain optimization."
  },
  {
    icon: <LineChart className="h-6 w-6" />,
    title: "Enhanced Visibility",
    description: "Gain complete transparency across your entire supply chain network."
  },
  {
    icon: <DollarSign className="h-6 w-6" />,
    title: "Cost Reduction",
    description: "Minimize disruption costs and optimize inventory management."
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Faster Recovery",
    description: "Reduce time-to-recovery with pre-planned alternative strategies."
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Real-Time Alerting",
    description: "Receive instant notifications about emerging risks and disruptions."
  },
]

export function Benefits() {
  return (
    <section id="benefits" className="py-16 md:py-24 w-full">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-700 dark:text-blue-400">Why Choose IntelliSupply</h2>
          <p className="font-mono text-muted-foreground max-w-2xl mx-auto">
            Our platform transforms how organizations manage supply chain risk, providing tangible 
            benefits that directly impact your bottom line.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.slice(0, 4).map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border-0 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col items-start"
            >
              <div className="p-3 rounded-lg inline-block mb-4 bg-gradient-to-br from-blue-100/70 to-indigo-100/60 dark:from-blue-900/30 dark:to-indigo-900/30">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-700 dark:text-blue-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                {benefit.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}