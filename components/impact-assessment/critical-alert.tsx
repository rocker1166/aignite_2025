import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Displays a styled card with a critical alert message and recommended mitigation actions.
 *
 * Renders an alert icon, a heading, and a descriptive warning about Factory B's projected failure, including suggested steps to address the issue.
 */
export default function CriticalAlert() {
  return (
    <Card className="bg-white dark:bg-slate-800 shadow-lg border-0">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Critical Alert</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Factory B is projected to fail on Day 5 if no mitigation actions are taken. Recommend increasing
              inventory buffer to 35% and activating alternate supplier.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 