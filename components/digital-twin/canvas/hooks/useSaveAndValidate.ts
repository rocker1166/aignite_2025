"use client";

import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

import { useUser } from '@/lib/stores/user';
import { saveSupplyChainToDatabase } from '@/lib/api/supply-chain';
import { validateSupplyChain, ValidationIssue } from '@/lib/validation/supply-chain-validator';

export function useSaveAndValidate({
  nodes,
  edges,
  supplyChainName,
  description,
  selectedSupplyChain,
}: {
  nodes: Node[];
  edges: Edge[];
  supplyChainName: string;
  description: string;
  selectedSupplyChain: string;
}) {
  const { userData } = useUser();
  const router = useRouter();
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const performSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const connections = edges.map(edge => {
        const sourceNode = nodes.find(node => node.id === edge.source);
        const targetNode = nodes.find(node => node.id === edge.target);
        return {
          sourceId: edge.source, targetId: edge.target, sourceLabel: sourceNode?.data.label, targetLabel: targetNode?.data.label,
          mode: edge.data.mode, cost: edge.data.cost, transitTime: edge.data.transitTime, riskMultiplier: edge.data.riskMultiplier
        };
      });
      const urlParams = new URLSearchParams(window.location.search);
      const saveNameFromUrl = urlParams.get('saveName');
      const saveDescriptionFromUrl = urlParams.get('saveDescription');
      const finalSupplyChainName = saveNameFromUrl || supplyChainName;
      const finalDescription = saveDescriptionFromUrl || description;
      const formDataFromUrl = {
        industry: urlParams.get('industry'), customIndustry: urlParams.get('customIndustry'),
        productCharacteristics: urlParams.get('productCharacteristics')?.split(',') || [],
        supplierTiers: urlParams.get('supplierTiers'), operationsLocation: urlParams.get('operationsLocation')?.split(',') || [],
        country: urlParams.get('country'), currency: urlParams.get('currency'), shippingMethods: urlParams.get('shippingMethods')?.split(',') || [],
        annualVolumeType: urlParams.get('annualVolumeType'),
        annualVolumeValue: urlParams.get('annualVolumeValue') ? parseInt(urlParams.get('annualVolumeValue')!) : null,
        risks: urlParams.get('risks')?.split(',') || []
      };
      let formDataFromLocalStorage = null;
      try {
        const storedData = localStorage.getItem(`supplyChain-${selectedSupplyChain}`);
        if (storedData) formDataFromLocalStorage = JSON.parse(storedData);
      } catch (error) { console.error('Error parsing localStorage data:', error); }
      const supplyChainData = {
        id: selectedSupplyChain, name: finalSupplyChainName, description: finalDescription,
        nodes, edges, connections, timestamp: new Date().toISOString(),
        formData: formDataFromLocalStorage || formDataFromUrl,
        organisation: {
          id: userData?.id, name: userData?.organisation_name, description: userData?.description,
          industry: userData?.industry, sub_industry: userData?.sub_industry, location: userData?.location
        }
      };
      await saveSupplyChainToDatabase(supplyChainData);
      toast.success('Supply chain saved successfully!');
      router.push('/digital-twin');
      setShowValidationDialog(false);
      if (saveNameFromUrl || saveDescriptionFromUrl) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('saveName');
        newUrl.searchParams.delete('saveDescription');
        window.history.replaceState({}, '', newUrl.toString());
      }
    } catch (error) {
      console.error('Error saving supply chain:', error);
      toast.error('Failed to save supply chain.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, selectedSupplyChain, supplyChainName, description, userData, router]);

  const handleSave = useCallback(async () => {
    const issues = validateSupplyChain(nodes, edges);
    setValidationIssues(issues);
    const errors = issues.filter(issue => issue.severity === 'error');
    if (errors.length > 0) {
      setShowValidationDialog(true);
      return;
    }
    const warnings = issues.filter(issue => issue.severity === 'warning');
    if (warnings.length > 0) {
      setShowValidationDialog(true);
      return;
    }
    await performSave();
  }, [nodes, edges, performSave]);

  const handleValidateSupplyChain = useCallback(() => {
    const issues = validateSupplyChain(nodes, edges);
    setValidationIssues(issues);
    setShowValidationDialog(true);
  }, [nodes, edges]);

  return {
    handleSave,
    performSave,
    isSaving,
    validationIssues,
    showValidationDialog,
    setShowValidationDialog,
    handleValidateSupplyChain,
  };
} 