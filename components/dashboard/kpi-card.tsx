import type React from "react"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  trend: string
  trendDirection: "up" | "down"
  icon: React.ReactNode
  description: string
  color: string
  href: string
}

export function KpiCard({ title, value, trend, trendDirection, icon, description, color, href }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("rounded-full p-2", color)}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1">
          {trendDirection === "up" ? (
            <ArrowUpIcon className={cn("mr-1 h-4 w-4", trend.startsWith("+") ? "text-destructive" : "text-success")} />
          ) : (
            <ArrowDownIcon
              className={cn("mr-1 h-4 w-4", trend.startsWith("-") ? "text-success" : "text-destructive")}
            />
          )}
          <p
            className={cn(
              "text-xs",
              trendDirection === "up" && trend.startsWith("+") ? "text-destructive" : "",
              trendDirection === "down" && trend.startsWith("-") ? "text-success" : "",
              trendDirection === "up" && !trend.startsWith("+") ? "text-success" : "",
              trendDirection === "down" && !trend.startsWith("-") ? "text-destructive" : "",
            )}
          >
            {trend}
          </p>
          <p className="text-xs text-muted-foreground ml-2">{description}</p>
        </div>
      </CardContent>
      <CardFooter className="p-2">
        <Link href={href} className="text-xs text-primary hover:underline w-full text-right">
          View Details
        </Link>
      </CardFooter>
    </Card>
  )
}
