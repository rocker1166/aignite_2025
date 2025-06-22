'use client';

import { FC, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

interface SaveSupplyChainDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  initialName?: string;
  initialDescription?: string;
}

interface FormErrors {
  name?: string;
  description?: string;
}

const SaveSupplyChainDialog: FC<SaveSupplyChainDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  initialDescription = ''
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validate form inputs
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Supply chain name is required';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Supply chain name must be at least 3 characters';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Supply chain name must be less than 50 characters';
    }

    if (description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save action
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave(name.trim(), description.trim());
      handleClose();
    } catch (error) {
      console.error('Error saving supply chain:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setName(initialName);
    setDescription(initialDescription);
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  // Handle key press events
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-full mx-4">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Save Supply Chain
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
            Provide a name and description for your supply chain configuration. 
            This will help you identify and manage it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Supply Chain Name Input */}
          <div className="space-y-2">
            <label htmlFor="supply-chain-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Supply Chain Name *
            </label>
            <Input
              id="supply-chain-name"
              type="text"
              placeholder="e.g., Global Electronics Supply Chain"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`w-full transition-colors ${
                errors.name 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'focus:border-blue-500 focus:ring-blue-500'
              }`}
              maxLength={50}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.name}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {name.length}/50 characters
            </p>
          </div>

          {/* Supply Chain Description Textarea */}
          <div className="space-y-2">
            <label htmlFor="supply-chain-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <Textarea
              id="supply-chain-description"
              placeholder="Describe your supply chain configuration, key components, and objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full min-h-[100px] resize-none transition-colors ${
                errors.description 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'focus:border-blue-500 focus:ring-blue-500'
              }`}
              maxLength={500}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.description}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {description.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !name.trim()}
            className="w-full sm:w-auto order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Supply Chain'}
          </Button>
        </DialogFooter>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
          Press Ctrl + Enter to save quickly
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveSupplyChainDialog; 