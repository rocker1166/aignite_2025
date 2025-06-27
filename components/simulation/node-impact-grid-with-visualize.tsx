"use client"

import { useState } from "react"
import { ArrowUpDown, Info, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import CascadingFailureMap from "@/components/cascading-failure-map"

// Hardcoded node data for simulation results
const HARDCODED_NODES = [
  {
    id: "SH-PORT-001",
    name: "Shanghai Port Terminal A",
    type: "port",
    status: "failed",
    statusDetail: "Complete shutdown due to typhoon",
    downtime: "72 hours",
    outputDrop: "100%",
    recovery: "14 days",
    riskScore: 95
  },
  {
    id: "WH-SHA-002",
    name: "Shanghai Warehouse Complex",
    type: "warehouse",
    status: "disrupted", 
    statusDetail: "Limited operations, 30% capacity",
    downtime: "24 hours",
    outputDrop: "70%",
    recovery: "7 days",
    riskScore: 78
  },
  {
    id: "DC-HK-003",
    name: "Hong Kong Distribution Center",
    type: "distribution",
    status: "partial",
    statusDetail: "Overflow handling, reduced efficiency",
    downtime: "0 hours",
    outputDrop: "25%",
    recovery: "3 days",
    riskScore: 45
  },
  {
    id: "MF-GZ-004",
    name: "Guangzhou Electronics Factory",
    type: "manufacturing",
    status: "partial",
    statusDetail: "Raw material shortage",
    downtime: "12 hours",
    outputDrop: "45%",
    recovery: "10 days",
    riskScore: 62
  },
  {
    id: "SP-BJ-005",
    name: "Beijing Auto Parts Supplier",
    type: "supplier",
    status: "operational",
    statusDetail: "Normal operations maintained",
    downtime: "0 hours",
    outputDrop: "5%",
    recovery: "1 day",
    riskScore: 22
  },
  {
    id: "WH-SZ-006",
    name: "Shenzhen Tech Warehouse",
    type: "warehouse",
    status: "disrupted",
    statusDetail: "Rerouting delays",
    downtime: "18 hours",
    outputDrop: "55%",
    recovery: "8 days",
    riskScore: 71
  },
  {
    id: "DC-TJ-007",
    name: "Tianjin Distribution Hub",
    type: "distribution",
    status: "operational",
    statusDetail: "Increased throughput to compensate",
    downtime: "0 hours",
    outputDrop: "0%",
    recovery: "0 days",
    riskScore: 18
  },
  {
    id: "MF-CD-008",
    name: "Chengdu Manufacturing Plant",
    type: "manufacturing",
    status: "partial",
    statusDetail: "Supply chain delays",
    downtime: "8 hours",
    outputDrop: "35%",
    recovery: "6 days",
    riskScore: 52
  }
]

type SupplyChainNode = typeof HARDCODED_NODES[0]

export default function NodeImpactGridWithVisualize() {
  const [sortBy, setSortBy] = useState<keyof SupplyChainNode>("riskScore")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [visualizeOpen, setVisualizeOpen] = useState(false)

  const sortedNodes = [...HARDCODED_NODES].sort((a, b) => {
    if (sortOrder === "asc") {
      if (typeof a[sortBy] === "string" && typeof b[sortBy] === "string") {
        return (a[sortBy] as string).localeCompare(b[sortBy] as string)
      }
      return (a[sortBy] ?? 0) > (b[sortBy] ?? 0) ? 1 : -1
    } else {
      if (typeof a[sortBy] === "string" && typeof b[sortBy] === "string") {
        return (b[sortBy] as string).localeCompare(a[sortBy] as string)
      }
      return (a[sortBy] ?? 0) < (b[sortBy] ?? 0) ? 1 : -1
    }
  })

  const handleSort = (column: keyof SupplyChainNode) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const getStatusBadge = (status: string) => {
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500">{capitalizedStatus}</Badge>
      case "partial":
        return <Badge className="bg-yellow-500">{capitalizedStatus}</Badge>
      case "disrupted":
        return <Badge className="bg-orange-500">{capitalizedStatus}</Badge>
      case "failed":
        return <Badge variant="destructive">{capitalizedStatus}</Badge>
      default:
        return <Badge>{capitalizedStatus}</Badge>
    }
  }

  return (
    <>
      <Card className="shadow-xl shadow-black/10 border-border/50 bg-white/70 dark:bg-slate-900/5 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CardTitle className="flex items-center">
                Node-Level Impact Grid
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        This grid shows the impact on each node in your supply chain. Click on column headers to sort the data.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </div>
            <Dialog open={visualizeOpen} onOpenChange={setVisualizeOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/20 backdrop-blur-xl border-white/40 dark:border-slate-700/30 hover:bg-white/90 dark:hover:bg-slate-900/30"
                >
                  <Eye className="h-4 w-4" />
                  Visualize
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Cascading Failure Visualization</DialogTitle>
                  <DialogDescription>
                    Interactive network view showing how disruptions cascade through your supply chain
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <CascadingFailureMap />
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>Detailed impact analysis for each node in the supply chain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border shadow-lg shadow-black/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("name")} className="p-0 h-8">
                      Node
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("type")} className="p-0 h-8">
                      Type
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("status")} className="p-0 h-8">
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("downtime")} className="p-0 h-8">
                      Downtime
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("outputDrop")} className="p-0 h-8">
                      Output Drop
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("recovery")} className="p-0 h-8">
                      Recovery
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("riskScore")} className="p-0 h-8">
                      Risk Score
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedNodes.map((node) => (
                  <TableRow key={node.id}>
                    <TableCell className="font-medium">{node.name}</TableCell>
                    <TableCell>{node.type.charAt(0).toUpperCase() + node.type.slice(1)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(node.status)}
                        <span className="text-xs text-muted-foreground">{node.statusDetail}</span>
                      </div>
                    </TableCell>
                    <TableCell>{node.downtime}</TableCell>
                    <TableCell>{node.outputDrop}</TableCell>
                    <TableCell>{node.recovery}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              node.riskScore > 70 ? "bg-red-500" : node.riskScore > 40 ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${node.riskScore}%` }}
                          />
                        </div>
                        <span className="text-xs">{node.riskScore}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
