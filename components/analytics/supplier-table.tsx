"use client"

import { useState } from "react"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Supplier {
  id: string
  name: string
  location: string
  category: string
  reliability: number
  onTimeDelivery: number
  qualityScore: number
  riskScore: number
}

const suppliers: Supplier[] = [
  {
    id: "1",
    name: "Supplier A",
    location: "Shanghai, China",
    category: "Electronics",
    reliability: 85,
    onTimeDelivery: 92,
    qualityScore: 88,
    riskScore: 35,
  },
  {
    id: "2",
    name: "Supplier B",
    location: "Detroit, USA",
    category: "Automotive",
    reliability: 92,
    onTimeDelivery: 95,
    qualityScore: 90,
    riskScore: 20,
  },
  {
    id: "3",
    name: "Supplier C",
    location: "Mumbai, India",
    category: "Textiles",
    reliability: 78,
    onTimeDelivery: 82,
    qualityScore: 75,
    riskScore: 45,
  },
  {
    id: "4",
    name: "Supplier D",
    location: "Berlin, Germany",
    category: "Machinery",
    reliability: 90,
    onTimeDelivery: 88,
    qualityScore: 92,
    riskScore: 25,
  },
  {
    id: "5",
    name: "Supplier E",
    location: "Tokyo, Japan",
    category: "Electronics",
    reliability: 95,
    onTimeDelivery: 96,
    qualityScore: 94,
    riskScore: 15,
  },
  {
    id: "6",
    name: "Supplier F",
    location: "Sao Paulo, Brazil",
    category: "Raw Materials",
    reliability: 75,
    onTimeDelivery: 70,
    qualityScore: 80,
    riskScore: 55,
  },
  {
    id: "7",
    name: "Supplier G",
    location: "Seoul, South Korea",
    category: "Electronics",
    reliability: 88,
    onTimeDelivery: 90,
    qualityScore: 85,
    riskScore: 30,
  },
]

export function SupplierTable() {
  const [sortColumn, setSortColumn] = useState<keyof Supplier>("reliability")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const sortedSuppliers = [...suppliers].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (column: keyof Supplier) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const getRiskBadge = (score: number) => {
    if (score < 30) {
      return <Badge className="bg-success">Low</Badge>
    } else if (score < 50) {
      return <Badge className="bg-warning">Medium</Badge>
    } else {
      return <Badge className="bg-destructive">High</Badge>
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Supplier</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => handleSort("reliability")} className="p-0 h-auto font-medium">
              Reliability
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => handleSort("onTimeDelivery")} className="p-0 h-auto font-medium">
              On-Time Delivery
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => handleSort("qualityScore")} className="p-0 h-auto font-medium">
              Quality Score
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => handleSort("riskScore")} className="p-0 h-auto font-medium">
              Risk Score
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedSuppliers.map((supplier) => (
          <TableRow key={supplier.id}>
            <TableCell className="font-medium">{supplier.name}</TableCell>
            <TableCell>{supplier.location}</TableCell>
            <TableCell>{supplier.category}</TableCell>
            <TableCell>{supplier.reliability}%</TableCell>
            <TableCell>{supplier.onTimeDelivery}%</TableCell>
            <TableCell>{supplier.qualityScore}%</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {supplier.riskScore}%{getRiskBadge(supplier.riskScore)}
              </div>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>View Performance History</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Run Risk Assessment</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
