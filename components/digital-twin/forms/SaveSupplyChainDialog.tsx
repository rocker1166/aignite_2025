'use client';

import { FC, useState, useEffect, useCallback } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import debounce from 'lodash.debounce';
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
  // URL state for name and description with debouncing
  const [nameParam, setNameParam] = useQueryState('saveName', parseAsString);
  const [descriptionParam, setDescriptionParam] = useQueryState('saveDescription', parseAsString);
  
  // Local state for immediate UI updates
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Debounced URL parameter updates
  const debouncedSetNameParam = useCallback(
    debounce((value: string) => {
      setNameParam(value || null);
    }, 500),
    [setNameParam]
  );

  const debouncedSetDescriptionParam = useCallback(
    debounce((value: string) => {
      setDescriptionParam(value || null);
    }, 500),
    [setDescriptionParam]
  );

  // Initialize values from URL params or props when dialog opens
  useEffect(() => {
    if (isOpen) {
      const initialNameValue = nameParam || initialName || 'Default Supply Chain';
      const initialDescValue = descriptionParam || initialDescription || '';
      
      setName(initialNameValue);
      setDescription(initialDescValue);
    }
  }, [isOpen, nameParam, descriptionParam, initialName, initialDescription]);

  // Update URL params when local values change
  useEffect(() => {
    if (isOpen && name !== (nameParam || initialName)) {
      debouncedSetNameParam(name);
    }
  }, [name, nameParam, initialName, isOpen, debouncedSetNameParam]);

  useEffect(() => {
    if (isOpen && description !== (descriptionParam || initialDescription)) {
      debouncedSetDescriptionParam(description);
    }
  }, [description, descriptionParam, initialDescription, isOpen, debouncedSetDescriptionParam]);

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
    // Clear URL parameters when dialog closes successfully
    setNameParam(null);
    setDescriptionParam(null);
    
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

  // Handle input changes with immediate local state update
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
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
              onChange={handleNameChange}
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
              onChange={handleDescriptionChange}
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