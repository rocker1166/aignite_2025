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
  setDescription
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
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Digital Twin</h1>

        <input
          type="text"
          title="Supply Chain"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="border border-gray-300 rounded px-3 py-2 w-64"
          placeholder="Enter supply chain name"
        />

        <input
          type="text"
          title="Description"
          value={description || ""}
          onChange={handleDescriptionChange}
          className="border border-gray-300 rounded px-3 py-2 w-64"
          placeholder="Enter supply chain description"
        />
      </div>

      <div className="flex items-center space-x-2">
        {simulationMode && (
          <button
            onClick={() => setSimulationMode(false)}
            className="px-4 py-2 text-gray-800 rounded hover:bg-gray-300"
          >
            Exit Simulation
          </button>
        )}

        <button
          onClick={onSave}
          disabled={simulationMode}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${simulationMode ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          Save
        </button>

        <button
          onClick={onRun}
          disabled={simulationMode}
          className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${simulationMode ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          Run Simulation
        </button>

        <button
          onClick={onExport}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Export
        </button>
      </div>
    </div>
  );
};

export default SimulationToolbar; 