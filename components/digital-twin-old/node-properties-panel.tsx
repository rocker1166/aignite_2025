"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Node } from "@/lib/types/database"

interface NodePropertiesPanelProps {
  node: Node
  onUpdate: (node: Node) => void
}

export function NodePropertiesPanel({ node, onUpdate }: NodePropertiesPanelProps) {
  const [localNode, setLocalNode] = useState<Node>(node)

  const handleChange = (field: keyof Node, value: any) => {
    const updatedNode = { ...localNode, [field]: value }
    setLocalNode(updatedNode)
  }

  const handleSave = () => {
    onUpdate(localNode)
  }

  return (
    <Card className="border-0 rounded-none">
      <CardHeader>
        <CardTitle>Node Properties</CardTitle>
        <CardDescription>Configure the selected node</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={localNode.name} onChange={(e) => handleChange("name", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={localNode.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select node type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="factory">Factory</SelectItem>
                  <SelectItem value="distribution">Distribution Center</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Risk Level ({localNode.risk_level}%)</Label>
              <Slider
                value={[localNode.risk_level]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => handleChange("risk_level", value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label>Current Inventory ({localNode.current_inventory}%)</Label>
              <Slider
                value={[localNode.current_inventory]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => handleChange("current_inventory", value[0])}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input
                type="number"
                value={localNode.capacity}
                onChange={(e) => handleChange("capacity", Number.parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Position X</Label>
              <Input
                type="number"
                value={localNode.x}
                onChange={(e) => handleChange("x", Number.parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Position Y</Label>
              <Input
                type="number"
                value={localNode.y}
                onChange={(e) => handleChange("y", Number.parseInt(e.target.value))}
              />
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full">
                View Detailed Analytics
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
