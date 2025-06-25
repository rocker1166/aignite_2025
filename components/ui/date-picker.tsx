"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  showTime?: boolean
  disabled?: boolean
}

/**
 * Renders a date picker component with optional time selection and customizable appearance.
 *
 * Displays a button that shows the selected date (and time if enabled) or a placeholder. When clicked, a popover calendar appears for selecting a date. The component supports disabling interaction and custom styling.
 *
 * @param date - The currently selected date, or undefined if none is selected.
 * @param onSelect - Callback invoked when a date is selected or cleared.
 * @param placeholder - Text shown when no date is selected. Defaults to "Pick a date".
 * @param className - Additional CSS classes for the button.
 * @param showTime - If true, displays time alongside the date. Defaults to false.
 * @param disabled - If true, disables the date picker button. Defaults to false.
 */
export function DatePicker({ 
  date, 
  onSelect, 
  placeholder = "Pick a date", 
  className,
  showTime = false,
  disabled = false 
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          disabled={disabled}
          className={cn(
            "w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, showTime ? "PPP p" : "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={onSelect} />
      </PopoverContent>
    </Popover>
  )
}