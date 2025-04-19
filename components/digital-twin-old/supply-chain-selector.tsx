"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { SupplyChain } from "@/lib/types/database"
import { getSupplyChains, createSupplyChain } from "@/lib/api/supply-chain"

interface SupplyChainSelectorProps {
  onSupplyChainChange: (supplyChainId: string) => void
}

export function SupplyChainSelector({ onSupplyChainChange }: SupplyChainSelectorProps) {
  const [supplyChains, setSupplyChains] = useState<SupplyChain[]>([])
  const [selectedSupplyChain, setSelectedSupplyChain] = useState<SupplyChain | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [newSupplyChainName, setNewSupplyChainName] = useState("")
  const [newSupplyChainDescription, setNewSupplyChainDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  // Fetch supply chains on component mount
  useEffect(() => {
    const fetchSupplyChains = async () => {
      try {
        setLoading(true)
        // In a real app, you would get the user ID from authentication
        // For now, we'll use a placeholder user ID
        const userId = "placeholder-user-id"
        const data = await getSupplyChains(userId)
        setSupplyChains(data)

        // Select the first supply chain by default if available
        if (data.length > 0) {
          setSelectedSupplyChain(data[0])
          onSupplyChainChange(data[0].supply_chain_id)
        }
      } catch (error) {
        console.error("Error fetching supply chains:", error)
        toast({
          title: "Error",
          description: "Failed to load supply chains",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSupplyChains()
  }, [onSupplyChainChange, toast])

  const handleSupplyChainSelect = (supplyChain: SupplyChain) => {
    setSelectedSupplyChain(supplyChain)
    onSupplyChainChange(supplyChain.supply_chain_id)
  }

  const handleCreateSupplyChain = async () => {
    if (!newSupplyChainName.trim()) {
      toast({
        title: "Error",
        description: "Supply chain name is required",
        variant: "destructive",
      })
      return
    }

    try {
      setCreating(true)
      // In a real app, you would get the user ID from authentication
      const userId = "placeholder-user-id"

      const newSupplyChain = await createSupplyChain({
        user_id: userId,
        name: newSupplyChainName,
        description: newSupplyChainDescription,
        status: "active",
      })

      setSupplyChains([...supplyChains, newSupplyChain])
      setSelectedSupplyChain(newSupplyChain)
      onSupplyChainChange(newSupplyChain.supply_chain_id)

      setNewSupplyChainName("")
      setNewSupplyChainDescription("")
      setOpen(false)

      toast({
        title: "Success",
        description: "Supply chain created successfully",
      })
    } catch (error) {
      console.error("Error creating supply chain:", error)
      toast({
        title: "Error",
        description: "Failed to create supply chain",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-4">
            {loading ? "Loading..." : selectedSupplyChain ? selectedSupplyChain.name : "Select Supply Chain"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[240px]">
          <DropdownMenuLabel>Select Supply Chain</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {supplyChains.map((supplyChain) => (
            <DropdownMenuItem key={supplyChain.supply_chain_id} onClick={() => handleSupplyChainSelect(supplyChain)}>
              {supplyChain.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Supply Chain
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Supply Chain</DialogTitle>
            <DialogDescription>Enter the details for your new supply chain network.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supply Chain Name</Label>
              <Input
                id="name"
                placeholder="e.g., Electronics Supply Chain"
                value={newSupplyChainName}
                onChange={(e) => setNewSupplyChainName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your supply chain network"
                value={newSupplyChainDescription}
                onChange={(e) => setNewSupplyChainDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSupplyChain} disabled={creating}>
              {creating ? "Creating..." : "Create Supply Chain"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
