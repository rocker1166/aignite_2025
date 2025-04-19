import { FC, useState, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { useTheme } from 'next-themes';
import AddressAutocompleteMap from './ui/AutoComplete';

interface RightPanelProps {
  selectedElement: Node | Edge | null;
  onUpdate: (updatedElement: Node | Edge) => void;
}

const RightPanel: FC<RightPanelProps> = ({ selectedElement, onUpdate }) => {
  const [formValues, setFormValues] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  
  // Track if we have an attached file
  const hasAttachedFile = formValues.attachedFile?.name;
  
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
      <div className="w-64 p-4 border-l border-gray-200 dark:border-gray-800/30 bg-white/80 dark:bg-black/20 backdrop-blur-sm">
        <div className="text-center text-gray-500 dark:text-gray-400 py-8 rounded-lg bg-gray-100/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800/50 shadow-lg p-4">
          <div className="mb-3 opacity-70">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
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
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if it's an Excel file
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    
    // Store file metadata in the node data
    handleInputChange('attachedFile', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      uploadedAt: new Date().toISOString()
    });
  };
  
  // Handle file removal
  const handleFileRemove = () => {
    // Create a new object without the attachedFile property
    const { attachedFile, ...restValues } = formValues;
    setFormValues(restValues);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleMapCoordinatesChange = (lat: string, lng: string) => {
    setLatitude(lat)
    setLongitude(lng)
  }
  
  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
      // Get node type for conditional rendering
      const nodeType = formValues.type || '';
      
      return (
        <>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Label</label>
            <input
              title='Label'
              type="text"
              value={formValues.label || ''}
              onChange={(e) => handleInputChange('label', e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
            />
          </div>
          
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              title='Description'
              rows={3}
              value={formValues.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
              placeholder="Add a detailed description of this node..."
            />
          </div>
          
            <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
            <div className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/40 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200  cursor-not-allowed">
              {formValues.type || 'Not specified'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Node type cannot be changed after creation
            </div>
            </div>
            
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Capacity</label>
            <input
              title='Capacity'
              type="number"
              value={formValues.capacity || 0}
              onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
              className="w-full p-2.5 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
            />
          </div>
          
          {/* Supplier-specific fields
          {nodeType === 'Supplier' && (
            <>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Quality Rating (1-10)</label>
                <input
                  title='Quality Rating'
                  type="number"
                  min="1"
                  max="10"
                  value={formValues.qualityRating || 7}
                  onChange={(e) => handleInputChange('qualityRating', parseInt(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
                />
              </div>
            </>
          )} */}
          
          {/* Factory-specific field */}
          {nodeType === 'Factory' && (
            <>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Energy Consumption (kWh)</label>
                <input
                  title='Energy Consumption'
                  type="number"
                  value={formValues.energyConsumption || 0}
                  onChange={(e) => handleInputChange('energyConsumption', parseInt(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
                />
              </div>
            </>
          )}
          
          {/* Port-specific fields */}
          {nodeType === 'Port' && (
            <>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Time required at customs (days)</label>
                <input
                  title='Time Required at Customs'
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formValues.timeRequiredAtCustoms || 2}
                  onChange={(e) => handleInputChange('timeRequiredAtCustoms', parseFloat(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
                />
              </div>
            </>
          )}
          
          {/* Warehouse-specific field */}
          {nodeType === 'Warehouse' && (
            <>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cost of Storage per Unit</label>
                <input
                  title='Storage Cost'
                  type="number"
                  value={formValues.storageUnitCost || 0}
                  onChange={(e) => handleInputChange('storageUnitCost', parseFloat(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
                />
              </div>
            </>
          )}
          
          {/* Distribution-specific fields */}
          {nodeType === 'Distribution' && (
            <>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Number of vehicles available for distribution</label>
                <input
                  title='Available Vehicles'
                  type="number"
                  min="1"
                  value={formValues.availableVehicles || 12}
                  onChange={(e) => handleInputChange('availableVehicles', parseInt(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
                />
              </div>
            </>
          )}  
          <AddressAutocompleteMap
            onCoordinatesChange={handleMapCoordinatesChange}
            initialAddress={formValues.address || ''}
            initialLat={formValues.location?.lat || ''}
            initialLng={formValues.location?.lng || ''}
          />
          
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Latitude"
                value={formValues.location?.lat || 0}
                onChange={(e) => handleInputChange('location', {
                  ...formValues.location,
                  lat: parseFloat(e.target.value)
                })}
                className="w-1/2 p-2.5 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
              />
              <input
                type="text"
                placeholder="Longitude"
                value={formValues.location?.lng || 0}
                onChange={(e) => handleInputChange('location', {
                  ...formValues.location,
                  lng: parseFloat(e.target.value)
                })}
                className="w-1/2 p-2.5 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
              />
            </div>
          </div>
          
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Attached File</label>
            {hasAttachedFile ? (
              <div className="flex items-center space-x-2">
                <span className="text-gray-700 dark:text-gray-200">{formValues.attachedFile.name}</span>
                <button
                  type="button"
                  onClick={handleFileRemove}
                  className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-300"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={triggerFileUpload}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.4)] hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] font-medium"
              >
                Upload File
              </button>
            )}
            <input

              title='Upload File'
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </>
      );
    } else {
      // Edge form fields
      return (
        <>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Transport Mode</label>
            <select
              title='Transport Mode'
              value={formValues.mode || 'road'}
              onChange={(e) => handleInputChange('mode', e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
            >
              <option value="road">Road</option>
              <option value="rail">Rail</option>
              <option value="sea">Sea</option>
              <option value="air">Air</option>
            </select>
          </div>
          
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cost per Unit</label>
            <input
              title='Cost per Unit'
              type="number"
              value={formValues.cost || 0}
              onChange={(e) => handleInputChange('cost', parseInt(e.target.value))}
              className="w-full p-2.5 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
            />
          </div>
          
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Transit Time (days)</label>
            <input
              title='Transit Time'
              type="number"
              value={formValues.transitTime || 0}
              onChange={(e) => handleInputChange('transitTime', parseInt(e.target.value))}
              className="w-full p-2.5 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
            />
          </div>
          
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Risk Multiplier</label>
            <input
              title='Risk Multiplier'
              type="number"
              min="1"
              max="3"
              step="0.1"
              value={formValues.riskMultiplier || 1}
              onChange={(e) => handleInputChange('riskMultiplier', parseFloat(e.target.value))}
              className="w-full p-2.5 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              1.0 = standard risk, &gt;1.0 = higher risk
            </div>
          </div>
        </>
      );
    }
  };
  
  return (
    <div className="w-64 p-4 border-l border-gray-200 dark:border-gray-800/50 bg-white/90 dark:bg-black/30 backdrop-blur-sm overflow-y-auto shadow-lg">
      <div className="flex items-center justify-between mb-5 border-b border-gray-200 dark:border-gray-800/50 pb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isNode 
            ? `${formValues.label || 'Unnamed'}`
            : `${selectedElement.source} → ${selectedElement.target}`
          }
        </h2>
        <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold">
          {isNode ? formValues.type || 'Node' : 'Edge'}
        </div>
      </div>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        {renderFormFields()}
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.4)] hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] font-medium"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default RightPanel;