import { useCopilotAction } from "@copilotkit/react-core";
import { toast } from "sonner";
import { selectTemplate, getTemplateInfo, SupplyChainFormData } from '@/lib/template-selector';
import { ActionContext } from './types';

export const useTemplateActions = ({ panelId, props }: ActionContext) => {
  const { onAddMultipleNodes, onLoadTemplate } = props;

  // Build industry specific supply chain
  useCopilotAction({
    name: `buildIndustrySpecificSupplyChain_${panelId}`,
    description: "Build a complete supply chain using intelligent template selection based on industry and characteristics",
    parameters: [
      {
        name: "industry",
        type: "string",
        description: "Industry type (Electronics & High Tech, Food & Beverage, Automotive & Transportation, Pharma & Life Sciences, Energy & Utilities, Apparel, Textiles & Fashion)",
        required: true
      },
      {
        name: "productCharacteristics",
        type: "string[]",
        description: "Product characteristics (high_value, hazardous, perishable, bulk, regulated)",
        required: false
      },
      {
        name: "operationsLocation",
        type: "string[]",
        description: "Geographic scope (domestic, regional, global)",
        required: false
      },
      {
        name: "supplierTiers",
        type: "string",
        description: "Supplier complexity (tier1, tier2, tier3plus)",
        required: false
      }
    ],
    handler: ({ industry, productCharacteristics = [], operationsLocation = ['regional'], supplierTiers = 'tier2' }) => {
      if (onAddMultipleNodes) {
        // Create form data for template selection
        const formData: SupplyChainFormData = {
          industry,
          productCharacteristics,
          operationsLocation,
          supplierTiers,
          currency: 'USD',
          shippingMethods: ['road', 'sea'],
          annualVolumeType: 'units',
          annualVolumeValue: 100000,
          risks: []
        };
        
        const templateData = selectTemplate(formData);
        const templateInfo = getTemplateInfo(formData);
        
        onAddMultipleNodes(templateData.nodes);
        toast.success(`🏗️ Built ${templateInfo.templateName} with ${templateData.nodes.length} nodes. Reason: ${templateInfo.reason}`);
      }
    }
  });

  // Load supply chain template
  useCopilotAction({
    name: `loadSupplyChainTemplate_${panelId}`,
    description: "Load a predefined supply chain template with enhanced mapping",
    parameters: [
      {
        name: "templateName",
        type: "string",
        description: "Name of template to load (automotive, electronics, food-beverage, pharma, fashion, energy, high-value, hazardous, domestic, global, tier1, tier3plus)",
        required: true
      }
    ],
    handler: ({ templateName }) => {
      if (onLoadTemplate) {
        const templateMap: Record<string, string> = {
          'automotive': 'industry-automotive',
          'electronics': 'industry-electronics', 
          'food-beverage': 'industry-food-beverage',
          'food': 'industry-food-beverage',
          'pharma': 'industry-pharma',
          'pharmaceutical': 'industry-pharma',
          'fashion': 'industry-fashion',
          'apparel': 'industry-fashion',
          'energy': 'industry-energy',
          'high-value': 'characteristics-high-value',
          'hazardous': 'characteristics-hazardous',
          'domestic': 'geographic-domestic',
          'global': 'geographic-global',
          'tier1': 'supplier-tiers-tier1',
          'tier3plus': 'supplier-tiers-tier3plus',
          'tier3': 'supplier-tiers-tier3plus'
        };

        const templateId = templateMap[templateName.toLowerCase()];
        if (templateId) {
          onLoadTemplate(templateId);
          toast.success(`📋 Loaded ${templateName} supply chain template successfully!`);
        } else {
          const availableTemplates = Object.keys(templateMap).join(', ');
          toast.error(`❌ Template "${templateName}" not found. Available templates: ${availableTemplates}`);
        }
      }
    }
  });
}; 