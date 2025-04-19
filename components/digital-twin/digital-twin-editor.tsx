"use client"

import { useEffect, useRef, useState } from "react"
import { Download, Layers, Plus, Save, Upload, X } from "lucide-react"
import * as d3 from "d3"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { NodePropertiesPanel } from "@/components/digital-twin/node-properties-panel"
import { EdgePropertiesPanel } from "@/components/digital-twin/edge-properties-panel"
import { SupplyChainSelector } from "@/components/digital-twin/supply-chain-selector"
import type { Node, Edge, SupplyChain } from "@/lib/types/database"
import {
  getCompleteSupplyChain,
  createNode,
  updateNode,
  deleteNode,
  updateEdge,
  deleteEdge,
  updateSupplyChain,
} from "@/lib/api/supply-chain"

export function DigitalTwinEditor() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [supplyChain, setSupplyChain] = useState<SupplyChain | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null)
  const [isNode, setIsNode] = useState<boolean>(false)
  const [dragging, setDragging] = useState<boolean>(false)
  const [zoom, setZoom] = useState<number>(100)
  const [loading, setLoading] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const { toast } = useToast()
  const [currentSupplyChainId, setCurrentSupplyChainId] = useState<string | null>(null)

  // Load supply chain data when the selected supply chain changes
  const loadSupplyChainData = async (supplyChainId: string) => {
    try {
      setLoading(true)
      const { supplyChain, nodes, edges } = await getCompleteSupplyChain(supplyChainId)
      setSupplyChain(supplyChain)
      setNodes(nodes)
      setEdges(edges)
    } catch (error) {
      console.error("Error loading supply chain data:", error)
      toast({
        title: "Error",
        description: "Failed to load supply chain data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle supply chain selection change
  const handleSupplyChainChange = (supplyChainId: string) => {
    if (supplyChainId && supplyChainId !== currentSupplyChainId) {
      setCurrentSupplyChainId(supplyChainId)
      loadSupplyChainData(supplyChainId)
    }
  }

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // Draw edges
    const edgeGroup = svg.append("g").attr("class", "edges")

    edges.forEach((edge) => {
      const source = nodes.find((n) => n.node_id === edge.from_node_id)
      const target = nodes.find((n) => n.node_id === edge.to_node_id)

      if (source && target) {
        const line = edgeGroup
          .append("line")
          .attr("class", "link")
          .attr("x1", source.x)
          .attr("y1", source.y)
          .attr("x2", target.x)
          .attr("y2", target.y)
          .attr("stroke", "#999")
          .attr("stroke-width", 2)
          .on("click", () => {
            setSelectedElement(edge)
            setIsNode(false)
          })

        // Add edge label
        edgeGroup
          .append("text")
          .attr("x", (source.x + target.x) / 2)
          .attr("y", (source.y + target.y) / 2 - 10)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .text(`${edge.relationship_type}`)
      }
    })

    // Draw nodes
    const nodeGroup = svg.append("g").attr("class", "nodes")

    nodes.forEach((node) => {
      const group = nodeGroup
        .append("g")
        .attr("class", "node")
        .attr("transform", `translate(${node.x}, ${node.y})`)
        .on("click", () => {
          setSelectedElement(node)
          setIsNode(true)
        })
        .call(
          d3
            .drag<SVGGElement, unknown>()
            .on("start", () => setDragging(true))
            .on("drag", (event:any) => {
              const newNodes = nodes.map((n) => {
                if (n.node_id === node.node_id) {
                  return { ...n, x: n.x + event.dx, y: n.y + event.dy }
                }
                return n
              })
              setNodes(newNodes)
            })
            .on("end", async () => {
              setDragging(false)
              // Update node position in database
              const updatedNode = nodes.find((n) => n.node_id === node.node_id)
              if (updatedNode) {
                try {
                  await updateNode(updatedNode.node_id, {
                    x: updatedNode.x,
                    y: updatedNode.y,
                  })
                } catch (error) {
                  console.error("Error updating node position:", error)
                  toast({
                    title: "Error",
                    description: "Failed to update node position",
                    variant: "destructive",
                  })
                }
              }
            }),
        )

      // Node circle with color based on risk
      const riskColor = d3.interpolateRgb("#4ade80", "#ef4444")(node.risk_level / 100)

      group
        .append("circle")
        .attr("r", 20)
        .attr("fill", riskColor)
        .attr("stroke", selectedElement === node ? "#3b82f6" : "#666")
        .attr("stroke-width", selectedElement === node ? 3 : 1)

      // Node type icon (simplified)
      group
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .attr("font-size", "12px")
        .attr("fill", "white")
        .text(node.type.charAt(0).toUpperCase())

      // Node label
      group.append("text").attr("text-anchor", "middle").attr("dy", "35px").attr("font-size", "12px").text(node.name)
    })
  }, [nodes, edges, selectedElement, dragging])

  const handleNodeUpdate = async (updatedNode: Node) => {
    try {
      await updateNode(updatedNode.node_id, updatedNode)
      setNodes(nodes.map((node) => (node.node_id === updatedNode.node_id ? updatedNode : node)))
      setSelectedElement(updatedNode)
      toast({
        title: "Success",
        description: "Node updated successfully",
      })
    } catch (error) {
      console.error("Error updating node:", error)
      toast({
        title: "Error",
        description: "Failed to update node",
        variant: "destructive",
      })
    }
  }

  const handleEdgeUpdate = async (updatedEdge: Edge) => {
    try {
      await updateEdge(updatedEdge.edge_id, updatedEdge)
      setEdges(edges.map((edge) => (edge.edge_id === updatedEdge.edge_id ? updatedEdge : edge)))
      setSelectedElement(updatedEdge)
      toast({
        title: "Success",
        description: "Connection updated successfully",
      })
    } catch (error) {
      console.error("Error updating edge:", error)
      toast({
        title: "Error",
        description: "Failed to update connection",
        variant: "destructive",
      })
    }
  }

  const addNewNode = async () => {
    if (!supplyChain) {
      toast({
        title: "Error",
        description: "Please select a supply chain first",
        variant: "destructive",
      })
      return
    }

    try {
      const newNode: Partial<Node> = {
        supply_chain_id: supplyChain.supply_chain_id,
        name: `New Node`,
        type: "supplier",
        x: 300,
        y: 300,
        risk_level: 50,
        current_inventory: 50,
        capacity: 100,
      }

      const createdNode = await createNode(newNode)
      setNodes([...nodes, createdNode])
      setSelectedElement(createdNode)
      setIsNode(true)

      toast({
        title: "Success",
        description: "Node added successfully",
      })
    } catch (error) {
      console.error("Error adding node:", error)
      toast({
        title: "Error",
        description: "Failed to add node",
        variant: "destructive",
      })
    }
  }

  const deleteSelected = async () => {
    if (!selectedElement) return

    try {
      if (isNode) {
        // Delete node and connected edges
        const nodeId = (selectedElement as Node).node_id
        await deleteNode(nodeId)

        // Delete connected edges from database
        const connectedEdges = edges.filter((edge) => edge.from_node_id === nodeId || edge.to_node_id === nodeId)

        for (const edge of connectedEdges) {
          await deleteEdge(edge.edge_id)
        }

        setNodes(nodes.filter((node) => node.node_id !== nodeId))
        setEdges(edges.filter((edge) => edge.from_node_id !== nodeId && edge.to_node_id !== nodeId))

        toast({
          title: "Success",
          description: "Node deleted successfully",
        })
      } else {
        // Delete edge
        const edgeId = (selectedElement as Edge).edge_id
        await deleteEdge(edgeId)
        setEdges(edges.filter((edge) => edge.edge_id !== edgeId))

        toast({
          title: "Success",
          description: "Connection deleted successfully",
        })
      }

      setSelectedElement(null)
    } catch (error) {
      console.error("Error deleting element:", error)
      toast({
        title: "Error",
        description: "Failed to delete element",
        variant: "destructive",
      })
    }
  }

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0])
  }

  const handleSave = async () => {
    if (!supplyChain) return

    try {
      setSaving(true)

      // Update supply chain details if needed
      if (supplyChain) {
        await updateSupplyChain(supplyChain.supply_chain_id, {
          name: supplyChain.name,
          description: supplyChain.description,
        })
      }

      toast({
        title: "Success",
        description: "Supply chain saved successfully",
      })
    } catch (error) {
      console.error("Error saving supply chain:", error)
      toast({
        title: "Error",
        description: "Failed to save supply chain",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSupplyChainUpdate = (field: string, value: string) => {
    if (!supplyChain) return
    setSupplyChain({
      ...supplyChain,
      [field]: value,
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Digital Twin Editor</h1>
          <SupplyChainSelector onSupplyChainChange={handleSupplyChainChange} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="default" size="sm" onClick={handleSave} disabled={saving || !supplyChain}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden bg-muted/30">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <div className="ml-4">Loading supply chain data...</div>
            </div>
          ) : (
            <>
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <Button onClick={addNewNode} size="sm" disabled={!supplyChain}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Node
                </Button>
                <Button onClick={deleteSelected} size="sm" variant="destructive" disabled={!selectedElement}>
                  <X className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
              </div>

              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-background/80 p-2 rounded-md">
                <Layers className="h-4 w-4" />
                <Slider value={[zoom]} min={50} max={150} step={1} className="w-32" onValueChange={handleZoomChange} />
                <span className="text-xs">{zoom}%</span>
              </div>

              <svg
                ref={svgRef}
                className="w-full h-full"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}
              />
            </>
          )}
        </div>

        {/* Properties Panel */}
        <div className="w-80 border-l bg-background overflow-y-auto">
          {selectedElement ? (
            isNode ? (
              <NodePropertiesPanel node={selectedElement as Node} onUpdate={handleNodeUpdate} />
            ) : (
              <EdgePropertiesPanel edge={selectedElement as Edge} nodes={nodes} onUpdate={handleEdgeUpdate} />
            )
          ) : (
            <Card className="border-0 rounded-none">
              <CardHeader>
                <CardTitle>Supply Chain Properties</CardTitle>
                <CardDescription>Configure your supply chain network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Supply Chain Name</Label>
                    <Input
                      id="name"
                      value={supplyChain?.name || ""}
                      onChange={(e) => handleSupplyChainUpdate("name", e.target.value)}
                      disabled={!supplyChain}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={supplyChain?.description || ""}
                      onChange={(e) => handleSupplyChainUpdate("description", e.target.value)}
                      disabled={!supplyChain}
                    />
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="settings">
                      <AccordionTrigger>Advanced Settings</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select defaultValue="usd" disabled={!supplyChain}>
                              <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="timeUnit">Time Unit</Label>
                            <Select defaultValue="days" disabled={!supplyChain}>
                              <SelectTrigger id="timeUnit">
                                <SelectValue placeholder="Select time unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                                <SelectItem value="weeks">Weeks</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
