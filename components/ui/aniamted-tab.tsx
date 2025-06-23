"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface AnimatedTabsProps {
    value: string
    onValueChange: (value: string) => void
    tabs: { value: string; label: string; icon?: ReactNode }[]
    className?: string
    disabledValues?: string[]
}

export function AnimatedTabs({ value, onValueChange, tabs, className, disabledValues = [] }: AnimatedTabsProps) {
    return (
        <div className={cn("flex space-x-1 w-fit rounded-lg bg-muted p-1", className)}>
            {tabs.map((tab) => {
                const isDisabled = disabledValues.includes(tab.value)
                return (
                    <button
                        key={tab.value}
                        onClick={() => !isDisabled && onValueChange(tab.value)}
                        className={cn(
                            "relative rounded-md px-3 py-2 text-sm font-medium transition-all outline-none",
                            value === tab.value ? "text-foreground" : "text-muted-foreground hover:text-foreground/80",
                            isDisabled && "opacity-50 cursor-not-allowed hover:text-muted-foreground",
                        )}
                        disabled={isDisabled}
                        style={{
                            WebkitTapHighlightColor: "transparent",
                        }}
                    >
                        {value === tab.value && !isDisabled && (
                            <motion.div
                                layoutId="active-pill"
                                className="absolute inset-0 bg-background"
                                style={{ borderRadius: 6 }}
                                transition={{ 
                                    type: "spring", 
                                    stiffness: 500, 
                                    damping: 30,
                                    mass: 1
                                }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                            {tab.icon}
                            {tab.label}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

