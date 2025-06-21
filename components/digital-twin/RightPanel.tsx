import { FC, useState, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { useTheme } from 'next-themes';
import AddressAutocompleteMap from '../ui/AutoComplete';

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
  const [isCollapsed, setIsCollapsed] = useState(false)

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

  // Collapsed state - just show the toggle button
  if (isCollapsed) {
    return (
      <div className="w-12 h-full border-l border-gray-200 dark:border-gray-800/30 bg-white/50 dark:bg-black/20 backdrop-blur-sm flex flex-col">
        {/* Spacer to push content to center and button to bottom */}
        <div className="flex-1">
          {/* Vertical text when collapsed */}
          {selectedElement && (
            <div className="h-full flex items-center justify-center">
              <div className="transform -rotate-90 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-medium">
                Properties
              </div>
            </div>
          )}
        </div>
        
        {/* Expand button fixed at bottom */}
        <div className="mt-auto border-t border-gray-200 dark:border-gray-800/30">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group"
            title="Expand Properties Panel"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors mx-auto" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7" 
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (!selectedElement) {
    return (
      <div className="w-80 border-l border-gray-200 dark:border-gray-800/30 bg-white/50 dark:bg-black/20 backdrop-blur-sm flex flex-col">
        <div className="flex-1 p-6">
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Properties Panel
              </h3>
              <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            {/* Icon and animation */}
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                {/* Outer ring with subtle animation */}
                <div className="absolute inset-0 w-20 h-20 border-2 border-gray-300 dark:border-gray-600 rounded-full animate-pulse"></div>
                
                {/* Inner content */}
                <div className="absolute inset-2 w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-blue-500 dark:text-blue-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" 
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Main message */}
            <div className="space-y-3 max-w-sm">
              <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                Select an element to get started
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Click on any node or edge in the canvas to view and edit its properties, configuration, and details.
              </p>
            </div>

            {/* Helpful tips */}
            <div className="w-full max-w-sm">
              <div className="bg-gray-50/80 dark:bg-gray-900/40 rounded-lg p-4 border border-gray-200/50 dark:border-gray-800/50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Tip:</span> You can modify properties like capacity, costs, and upload product sheets for each node.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Collapse button at bottom */}
        <div className="flex justify-center p-3 border-t border-gray-200 dark:border-gray-800/30">
          <button
            onClick={() => setIsCollapsed(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group"
            title="Collapse Properties Panel"
          >
            <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-500">Hide Panel</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 5l7 7-7 7M5 5l7 7-7 7" 
              />
            </svg>
          </button>
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
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    // Store file metadata and the actual file object in the node data
    handleInputChange('attachedFile', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      uploadedAt: new Date().toISOString(),
      fileObject: file // Store the actual file object for processing
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

          {/* File attachment section */}
          <div className="mb-5 border-t border-gray-200 dark:border-gray-800/50 pt-5 mt-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attach Product Sheet
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={triggerFileUpload}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {hasAttachedFile ? 'Change File' : 'Upload File'}
              </button>
              {hasAttachedFile && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formValues.attachedFile.name}
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            {hasAttachedFile && (
              <button
                type="button"
                onClick={handleFileRemove}
                className="mt-2 text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Upload an Excel sheet (.xlsx, .xls, .csv) with product data.
            </div>
          </div>
        </>
      );
    }

    // Edge-specific fields
    return (
      <>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transportation Mode</label>
          <select
            value={formValues.mode || 'road'}
            onChange={(e) => handleInputChange('mode', e.target.value)}
            className="w-full p-2 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200"
          >
            <option value="road">Road</option>
            <option value="rail">Rail</option>
            <option value="sea">Sea</option>
            <option value="air">Air</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost</label>
          <input
            title='Cost'
            type="number"
            value={formValues.cost || 0}
            onChange={(e) => handleInputChange('cost', parseInt(e.target.value))}
            className="w-full p-2 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transit Time (days)</label>
          <input
            title='Transit Time'
            type="number"
            value={formValues.transitTime || 0}
            onChange={(e) => handleInputChange('transitTime', parseInt(e.target.value))}
            className="w-full p-2 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Risk Multiplier</label>
          <input
            title='Risk Multiplier'
            type="number"
            step="0.1"
            value={formValues.riskMultiplier || 1.0}
            onChange={(e) => handleInputChange('riskMultiplier', parseFloat(e.target.value))}
            className="w-full p-2 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-200"
          />
        </div>
      </>
    );
  };

  return (
    <div className={`w-80 border-l border-gray-200 dark:border-gray-800/30 bg-white/50 dark:bg-black/20 backdrop-blur-sm overflow-y-auto transition-all duration-300 ease-in-out flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800/30">
        <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Properties</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Editing {isNode ? 'node' : 'edge'}: <span className="font-semibold text-blue-600 dark:text-blue-400">{formValues.label || selectedElement.id}</span>
        </p>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4">
        <div className="space-y-4">
          {renderFormFields()}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700/50">
          <button
            onClick={handleSubmit}
            className="w-full p-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 shadow-lg"
          >
            Apply Changes
          </button>
        </div>
      </div>
      
      {/* Collapse button at bottom */}
      <div className="flex justify-center p-3 border-t border-gray-200 dark:border-gray-800/30">
        <button
          onClick={() => setIsCollapsed(true)}
          className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group"
          title="Collapse Properties Panel"
        >
          <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-500">Hide Panel</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 5l7 7-7 7M5 5l7 7-7 7" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RightPanel; 