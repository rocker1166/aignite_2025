import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { X, TrendingUp, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface RoadmapStep {
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

interface ImplementationRoadmapPanelProps {
  steps: RoadmapStep[];
  open: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export const ImplementationRoadmapPanel: React.FC<ImplementationRoadmapPanelProps> = ({
  steps,
  open,
  onClose,
  isMobile = false,
}) => {
  const getStepColors = (index: number) => {
    const colorSchemes = [
      {
        bg: "bg-gradient-to-br from-red-500 to-red-600",
        border: "border-red-200/50 dark:border-red-800/30",
        shadow: "shadow-red-500/20",
        glow: "shadow-lg shadow-red-500/25"
      },
      {
        bg: "bg-gradient-to-br from-orange-500 to-orange-600", 
        border: "border-orange-200/50 dark:border-orange-800/30",
        shadow: "shadow-orange-500/20",
        glow: "shadow-lg shadow-orange-500/25"
      },
      {
        bg: "bg-gradient-to-br from-blue-500 to-blue-600",
        border: "border-blue-200/50 dark:border-blue-800/30", 
        shadow: "shadow-blue-500/20",
        glow: "shadow-lg shadow-blue-500/25"
      }
    ];
    return colorSchemes[index] || colorSchemes[0];
  };

  // Panel content
  const content = (
    <motion.div
      initial={{ x: isMobile ? 0 : 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isMobile ? 0 : 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full flex flex-col"
    >
      <Card className="border border-white/30 dark:border-slate-700/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/30 rounded-2xl h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between gap-2 p-6 pb-4 border-b border-white/20 dark:border-slate-700/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Implementation Roadmap</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Strategic execution timeline
              </CardDescription>
            </div>
          </div>
          {isMobile && (
            <DrawerClose asChild>
              <button title="a" onClick={onClose} className="p-2 rounded-full hover:bg-muted/50 transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </DrawerClose>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 p-6 space-y-4 overflow-y-auto">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-red-200 via-orange-200 to-blue-200 dark:from-red-800 dark:via-orange-800 dark:to-blue-800 rounded-full"></div>
            
            <div className="space-y-6">
              {steps.map((step, idx) => {
                const colors = getStepColors(idx);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="relative flex items-start gap-4"
                  >
                    {/* Step icon */}
                    <div className={`relative z-10 w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center ${colors.glow} transition-all duration-300 hover:scale-110 flex-shrink-0`}>
                      <div className="text-white">
                        {step.icon}
                      </div>
                    </div>
                    
                    {/* Step content */}
                    <div className={`flex-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border ${colors.border} ${colors.shadow} hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
                      <h3 className="font-semibold text-sm mb-2 text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {step.description}
                      </p>
                      
                      {/* Progress indicator */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${colors.bg} rounded-full transition-all duration-1000`}
                            style={{ width: idx === 0 ? '100%' : idx === 1 ? '60%' : '20%' }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {idx === 0 ? 'Ready' : idx === 1 ? 'In Progress' : 'Planned'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Total Impact</span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Complete implementation reduces supply chain risk by <span className="font-semibold">50%</span> with an expected ROI of <span className="font-semibold">2.4x</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Desktop: fixed side panel, Mobile: Drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={v => !v && onClose()}>
        <DrawerContent className="max-w-full w-[95vw] sm:w-[420px] right-0 ml-auto rounded-t-2xl max-h-[90vh]">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <aside className="hidden lg:block fixed top-20 right-6 h-[calc(100vh-6rem)] w-[400px] z-30">
      {content}
    </aside>
  );
};

export default ImplementationRoadmapPanel; 