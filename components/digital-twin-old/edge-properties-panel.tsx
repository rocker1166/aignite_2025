"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Node, Edge } from "@/lib/types/database"

interface EdgePropertiesPanelProps {
  edge: Edge
  nodes: Node[]
  onUpdate: (edge: Edge) => void
}

export function EdgePropertiesPanel({ edge, nodes, onUpdate }: EdgePropertiesPanelProps) {
  const [localEdge, setLocalEdge] = useState<Edge>(edge)

  const handleChange = (field: keyof Edge, value: any) => {
    const updatedEdge = { ...localEdge, [field]: value }
    setLocalEdge(updatedEdge)
  }

  const handleSave = () => {
    onUpdate(localEdge)
  }

  const sourceNode = nodes.find((node) => node.node_id === edge.from_node_id)
  const targetNode = nodes.find((node) => node.node_id === edge.to_node_id)

  return (
    <Card className="border-0 rounded-none">
      <CardHeader>
        <CardTitle>Connection Properties</CardTitle>
        <CardDescription>Configure the selected connection</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={localEdge.from_node_id} onValueChange={(value) => handleChange("from_node_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source node" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.node_id} value={node.node_id}>
                      {node.name} ({node.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Select value={localEdge.to_node_id} onValueChange={(value) => handleChange("to_node_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target node" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.node_id} value={node.node_id}>
                      {node.name} ({node.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Connection Type</Label>
              <Select
                value={localEdge.relationship_type}
                onValueChange={(value) => handleChange("relationship_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="information">Information</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Cost</Label>
              <Input
                type="number"
                value={localEdge.cost}
                onChange={(e) => handleChange("cost", Number.parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Transit Time (days)</Label>
              <Input
                type="number"
                value={localEdge.transit_time}
                onChange={(e) => handleChange("transit_time", Number.parseFloat(e.target.value))}
              />
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full">
                View Route Analytics
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button className="w-full" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
