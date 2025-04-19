"use client"

import { useState } from "react"
import { ArrowUpDown, Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type NodeStatus = "Operational" | "Partial" | "Disrupted" | "Failed"

interface Node {
  id: string
  name: string
  type: string
  status: NodeStatus
  statusDetail: string
  downtime: string
  outputDrop: string
  recovery: string
  riskScore: number
}

const nodes: Node[] = [
  {
    id: "1",
    name: "Supplier A",
    type: "Supplier",
    status: "Disrupted",
    statusDetail: "Primary disruption",
    downtime: "14 days",
    outputDrop: "-70%",
    recovery: "Day 15",
    riskScore: 85,
  },
  {
    id: "2",
    name: "Factory B",
    type: "Manufacturing",
    status: "Failed",
    statusDetail: "Failed (Day 5)",
    downtime: "9 days",
    outputDrop: "-60%",
    recovery: "Day 14",
    riskScore: 78,
  },
  {
    id: "3",
    name: "Port C",
    type: "Logistics",
    status: "Partial",
    statusDetail: "Limited capacity",
    downtime: "—",
    outputDrop: "-30%",
    recovery: "Ongoing",
    riskScore: 65,
  },
  {
    id: "4",
    name: "Distributor D",
    type: "Distribution",
    status: "Partial",
    statusDetail: "Reduced throughput",
    downtime: "—",
    outputDrop: "-25%",
    recovery: "Day 18",
    riskScore: 55,
  },
  {
    id: "5",
    name: "Warehouse E",
    type: "Storage",
    status: "Operational",
    statusDetail: "Using buffer inventory",
    downtime: "—",
    outputDrop: "-15%",
    recovery: "Day 20",
    riskScore: 40,
  },
  {
    id: "6",
    name: "Retailer F",
    type: "Retail",
    status: "Operational",
    statusDetail: "Stock limitations",
    downtime: "—",
    outputDrop: "-10%",
    recovery: "Day 21",
    riskScore: 35,
  },
  {
    id: "7",
    name: "Supplier G",
    type: "Supplier",
    status: "Operational",
    statusDetail: "Unaffected",
    downtime: "—",
    outputDrop: "0%",
    recovery: "—",
    riskScore: 10,
  },
]

export default function NodeImpactGrid() {
  const [sortBy, setSortBy] = useState<keyof Node>("riskScore")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const sortedNodes = [...nodes].sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortBy] > b[sortBy] ? 1 : -1
    } else {
      return a[sortBy] < b[sortBy] ? 1 : -1
    }
  })

  const handleSort = (column: keyof Node) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case "Operational":
        return <Badge className="bg-green-500">Operational</Badge>
      case "Partial":
        return <Badge className="bg-yellow-500">Partial</Badge>
      case "Disrupted":
        return <Badge className="bg-orange-500">Disrupted</Badge>
      case "Failed":
        return <Badge variant="destructive">Failed</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Node-Level Impact Grid
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  This grid shows the impact on each node in your supply chain. Click on column headers to sort the
                  data.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>Detailed impact analysis for each node in the supply chain</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
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
                  <TableCell>{node.type}</TableCell>
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
  )
}
