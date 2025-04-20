import { FC, useState, useEffect } from 'react';

interface SimulationToolbarProps {
  selectedSupplyChain: string;
  setSelectedSupplyChain: (id: string) => void;
  onSave: () => void;
  onRun: () => void;
  onExport: () => void;
  simulationMode: boolean;
  setSimulationMode: (mode: boolean) => void;
  supplyChainName?: string;
  setSupplyChainName?: (name: string) => void;
  description?: string;
  setDescription?: (desc: string) => void;
  localSupplyChains: Array<{id: string, name: string}>;
  onSupplyChainSelect: (id: string) => void;
}

const SimulationToolbar: FC<SimulationToolbarProps> = ({
  selectedSupplyChain,
  setSelectedSupplyChain,
  onSave,
  onRun,
  onExport,
  simulationMode,
  setSimulationMode,
  supplyChainName,
  setSupplyChainName,
  description,
  setDescription,
  localSupplyChains,
  onSupplyChainSelect
}) => {
  const [inputValue, setInputValue] = useState('');

  // Initialize input value with the label corresponding to the selected supply chain
  useEffect(() => {
    const supplyChainOptions = {
      'default-chain': 'Default Supply Chain',
      'electronics-chain': 'Electronics Supply Chain',
      'automotive-chain': 'Automotive Supply Chain'
    };

    setInputValue(supplyChainOptions[selectedSupplyChain as keyof typeof supplyChainOptions] || selectedSupplyChain);
    if (setSupplyChainName) {
      setSupplyChainName(supplyChainOptions[selectedSupplyChain as keyof typeof supplyChainOptions] || selectedSupplyChain);
    }
  }, [selectedSupplyChain, setSupplyChainName]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (setSupplyChainName) {
      setSupplyChainName(e.target.value);
    }
  };

  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (setDescription) {
      setDescription(e.target.value);
    }
  };

  // Handle blur event to update the selected supply chain
  const handleBlur = () => {
    // You might want to implement more complex logic here
    // This is a simple version that just passes the input value as the ID
    setSelectedSupplyChain(inputValue);
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
      <div className="flex items-center space-x-4 flex-1">
        {/* Supply Chain Selection */}
        <div className="w-64">
          <select
            id="supply-chain-select"
            value={selectedSupplyChain}
            onChange={(e) => onSupplyChainSelect(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select Supply Chain</option>
            {localSupplyChains.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>

        {/* Supply Chain Name */}
        <input
          type="text"
          value={supplyChainName}
          onChange={(e) => setSupplyChainName?.(e.target.value)}
          placeholder="Supply Chain Name"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />

        {/* Description */}
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription?.(e.target.value)}
          placeholder="Description"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={onRun}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Run Simulation
        </button>
        <button
          onClick={onExport}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Export
        </button>
      </div>
    </div>
  );
};

export default SimulationToolbar;