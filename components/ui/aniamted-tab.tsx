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

/**
 * Renders a horizontal tab interface with animated highlighting for the active tab.
 *
 * Displays a set of tabs as buttons, highlighting the active tab with an animated pill-shaped background. Disabled tabs are visually indicated and cannot be selected. When a tab is selected, the `onValueChange` callback is invoked with the new tab value.
 *
 * @param value - The currently selected tab value.
 * @param onValueChange - Callback invoked when a different tab is selected.
 * @param tabs - Array of tab objects, each containing a value, label, and optional icon.
 * @param className - Optional additional CSS classes for the container.
 * @param disabledValues - Optional array of tab values that should be disabled.
 * @returns A React element rendering the animated tab interface.
 */
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

