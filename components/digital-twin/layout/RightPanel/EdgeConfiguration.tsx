import { FC } from 'react';
import { Edge } from 'reactflow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EDGE_PROPERTY_SPECS } from '@/constants/digital-twin';
import DynamicFormField from '@/components/digital-twin/forms/DynamicFormField';

interface EdgeConfigurationProps {
  selectedEdge: Edge;
  formValues: any;
  onInputChange: (field: string, value: any) => void;
  sourceNode?: any;
  targetNode?: any;
}

const EdgeConfiguration: FC<EdgeConfigurationProps> = ({
  selectedEdge,
  formValues,
  onInputChange,
  sourceNode,
  targetNode
}) => {
  // Get all applicable fields for this edge based on the matcher functions
  const getApplicableFields = () => {
    const allFields: any[] = [];
    
    EDGE_PROPERTY_SPECS.forEach(spec => {
      if (spec.matcher(
        sourceNode?.type, 
        targetNode?.type, 
        formValues.mode || 'road',
        { 
          passesThroughKeyRoute: formValues.passesThroughChokepoint,
          sourceCountry: sourceNode?.data?.country,
          targetCountry: targetNode?.data?.country
        }
      )) {
        allFields.push(...spec.fields);
      }
    });
    
    return allFields;
  };

  const applicableFields = getApplicableFields();

  // Check if chokepoint selection should be shown
  const shouldShowChokepointSelection = () => {
    // Only show if nodes are in different countries
    if (sourceNode?.data?.country && targetNode?.data?.country) {
      return sourceNode.data.country !== targetNode.data.country;
    }
    return true; // Show by default if country info is not available
  };

  return (
    <div className="space-y-6">
      {/* Basic Transportation Properties */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Transportation Mode</Label>
        <select
          value={formValues.mode || 'road'}
          onChange={(e) => onInputChange('mode', e.target.value)}
          className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
        >
          <option value="road">🚚 Road Transport</option>
          <option value="rail">🚂 Rail Transport</option>
          <option value="sea">🚢 Sea Transport</option>
          <option value="air">✈️ Air Transport</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Cost</Label>
        <Input
          type="number"
          value={formValues.cost || 0}
          onChange={(e) => onInputChange('cost', parseInt(e.target.value))}
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Transit Time (days)</Label>
        <Input
          type="number"
          value={formValues.transitTime || 0}
          onChange={(e) => onInputChange('transitTime', parseInt(e.target.value))}
          placeholder="0"
        />
      </div>

      {/* Separator */}
      <div className="border-t border-border my-6"></div>
      
      {/* Dynamic Risk and Disruption Fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Risk & Disruption Analysis</h3>
        {applicableFields.map((field) => {
          // Special handling for chokepoint selection - only show if nodes are in different countries
          if (field.key === 'chokepointNames' && !shouldShowChokepointSelection()) {
            return null;
          }
          
          return (
            <DynamicFormField
              key={field.key}
              spec={field}
              value={formValues[field.key]}
              onChange={(value: any) => onInputChange(field.key, value)}
              formValues={formValues}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EdgeConfiguration; 