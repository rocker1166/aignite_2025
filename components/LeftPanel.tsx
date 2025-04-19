// src/components/LeftPanel.tsx
import { FC, useState } from 'react';

interface LeftPanelProps {
  onAddNode: (nodeType: string) => void;
  simulationMode: boolean;
}

const LeftPanel: FC<LeftPanelProps> = ({ onAddNode, simulationMode }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('nodes');
  
  const nodeTypes = [
    { id: 'Supplier', icon: '📦', description: 'Raw material source' },
    { id: 'Factory', icon: '🏭', description: 'Manufacturing facility' },
    { id: 'Port', icon: '🚢', description: 'Shipping port' },
    { id: 'Warehouse', icon: '🏪', description: 'Storage facility' },
    { id: 'Distribution', icon: '🚚', description: 'Distribution center' },
    { id: 'Customer', icon: '👥', description: 'End customer' }
  ];
  
  const templates = [
    { id: 'simple-chain', name: 'Simple Chain', nodes: 3 },
    { id: 'hub-spoke', name: 'Hub and Spoke', nodes: 6 },
    { id: 'network', name: 'Network Mesh', nodes: 8 }
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const json = JSON.parse(content);
          console.log('Imported JSON:', json);
          // Here you would process the imported graph
          alert('Graph imported successfully!');
        } catch (err) {
          alert('Error parsing JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-64  border-r border-gray-200 overflow-y-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Supply Chain Builder</h2>
      
      {/* Nodes Section */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('nodes')}
          className="flex items-center justify-between w-full p-2  rounded shadow-sm"
        >
          <span className="font-medium">Add Nodes</span>
          <span>{expandedSection === 'nodes' ? '▼' : '▶'}</span>
        </button>
        
        {expandedSection === 'nodes' && (
          <div className="mt-2 pl-2 space-y-2">
            {nodeTypes.map(node => (
              <button
                key={node.id}
                onClick={() => onAddNode(node.id)}
                disabled={simulationMode}
                className={`flex items-center p-2 w-full hover:bg-gray-200 rounded ${
                  simulationMode ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="mr-2">{node.icon}</span>
                <div className="text-left">
                  <div className="text-sm font-medium">{node.id}</div>
                  <div className="text-xs text-gray-500">{node.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Templates Section */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('templates')}
          className="flex items-center justify-between w-full p-2  rounded shadow-sm"
        >
          <span className="font-medium">Templates</span>
          <span>{expandedSection === 'templates' ? '▼' : '▶'}</span>
        </button>
        
        {expandedSection === 'templates' && (
          <div className="mt-2 pl-2 space-y-2">
            {templates.map(template => (
              <button
                key={template.id}
                disabled={simulationMode}
                className={`flex items-center p-2 w-full hover:bg-gray-200 rounded ${
                  simulationMode ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="text-left">
                  <div className="text-sm font-medium">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.nodes} nodes</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Import/Export Section */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('import')}
          className="flex items-center justify-between w-full p-2  rounded shadow-sm"
        >
          <span className="font-medium">Import/Export</span>
          <span>{expandedSection === 'import' ? '▼' : '▶'}</span>
        </button>
        
        {expandedSection === 'import' && (
          <div className="mt-2 pl-2 space-y-2">
            <label className={`flex items-center p-2 w-full  rounded cursor-pointer ${
              simulationMode ? 'opacity-50 cursor-not-allowed' : ''
            }`}>
              <span className="text-sm font-medium">Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={simulationMode}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
      
      {/* Bulk Actions */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <button
          disabled={simulationMode}
          className={`w-full p-2 mb-2 bg-red-100 text-red-700 rounded hover:bg-red-200 ${
            simulationMode ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Clear All Nodes
        </button>
        
        <button
          disabled={simulationMode}
          className={`w-full p-2  text-blue-700 rounded hover:bg-blue-200 ${
            simulationMode ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
};

export default LeftPanel;