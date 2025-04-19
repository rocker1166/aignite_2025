// src/components/RightPanel.tsx
import { FC, useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';

interface RightPanelProps {
  selectedElement: Node | Edge | null;
  onUpdate: (updatedElement: Node | Edge) => void;
}

const RightPanel: FC<RightPanelProps> = ({ selectedElement, onUpdate }) => {
  const [formValues, setFormValues] = useState<any>({});
  
  // Update form values when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setFormValues(selectedElement.data || {});
    } else {
      setFormValues({});
    }
  }, [selectedElement]);
  
  if (!selectedElement) {
    return (
      <div className="w-64 p-4 border-l border-gray-200 ">
        <div className="text-center text-gray-500 py-8">
          Select a node or edge to view and edit properties
        </div>
      </div>
    );
  }
  
  const handleInputChange = (field: string, value: any) => {
    setFormValues({
      ...formValues,
      [field]: value
    });
  };
  
  const handleSubmit = () => {
    const updatedElement = {
      ...selectedElement,
      data: {
        ...formValues
      }
    };
    onUpdate(updatedElement);
  };
  
  // Determine if we're dealing with a node or edge
  const isNode = !('source' in selectedElement);
  
  // Generate form fields based on element type
  const renderFormFields = () => {
    if (isNode) {
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <input
            title='Label'
              type="text"
              value={formValues.label || ''}
              onChange={(e) => handleInputChange('label', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
                title='Type'
              value={formValues.type || ''}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              disabled // Type is not editable after creation
            >
              <option value="Supplier">Supplier</option>
              <option value="Factory">Factory</option>
              <option value="Port">Port</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Distribution">Distribution</option>
              <option value="Customer">Customer</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
                title='Capacity'
              type="number"
              value={formValues.capacity || 0}
              onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (days)</label>
            <input
                title='Lead Time'
              type="number"
              value={formValues.leadTime || 0}
              onChange={(e) => handleInputChange('leadTime', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Score</label>
            <input
                title='Risk Score'
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={formValues.riskScore || 0}
              onChange={(e) => handleInputChange('riskScore', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
            <div className="text-center mt-1">
              {(formValues.riskScore || 0).toFixed(1)}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Latitude"
                value={formValues.location?.lat || 0}
                onChange={(e) => handleInputChange('location', {
                  ...formValues.location,
                  lat: parseFloat(e.target.value)
                })}
                className="w-1/2 p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Longitude"
                value={formValues.location?.lng || 0}
                onChange={(e) => handleInputChange('location', {
                  ...formValues.location,
                  lng: parseFloat(e.target.value)
                })}
                className="w-1/2 p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </>
      );
    } else {
      // Edge form fields
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Transport Mode</label>
            <select
                title='Transport Mode'
              value={formValues.mode || 'road'}
              onChange={(e) => handleInputChange('mode', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="road">Road</option>
              <option value="rail">Rail</option>
              <option value="sea">Sea</option>
              <option value="air">Air</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit</label>
            <input
                title='Cost per Unit'
              type="number"
              value={formValues.cost || 0}
              onChange={(e) => handleInputChange('cost', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Transit Time (days)</label>
            <input
                title='Transit Time'
              type="number"
              value={formValues.transitTime || 0}
              onChange={(e) => handleInputChange('transitTime', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Multiplier</label>
            <input
                title='Risk Multiplier'
              type="number"
              min="1"
              max="3"
              step="0.1"
              value={formValues.riskMultiplier || 1}
              onChange={(e) => handleInputChange('riskMultiplier', parseFloat(e.target.value))}
              className="w-full p-2 border  rounded"
            />
            <div className="text-xs text-gray-500 mt-1">
              1.0 = standard risk, &gt;1.0 = higher risk
            </div>
          </div>
        </>
      );
    }
  };
  
  return (
    <div className="w-64 p-4 border-l   overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {isNode 
            ? `Node: ${formValues.label || 'Unnamed'}`
            : `Route: ${selectedElement.source} → ${selectedElement.target}`
          }
        </h2>
      </div>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        {renderFormFields()}
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default RightPanel;