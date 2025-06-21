import { FC, useRef } from 'react';
import { Node } from 'reactflow';
import AddressAutocompleteMap from '@/components/ui/AutoComplete';
import DynamicFormField from '@/components/digital-twin/DynamicFormField';
import { NODE_PROPERTY_SPECS, NODE_TYPE_MAP, COMMON_RISK_FIELDS } from '@/constants/digital-twin';
import { NodeType } from '@/lib/types/digital-twin';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle, Factory, Building2, Truck, Package, Settings, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CountryDropdown } from '@/components/ui/country-dropdown';
import { Switch } from '@/components/ui/switch';

interface NodeConfigurationProps {
  selectedNode: Node;
  formValues: any;
  onInputChange: (field: string, value: any) => void;
  onMapCoordinatesChange: (lat: string, lng: string, address?: string) => void;
}

const NodeConfiguration: FC<NodeConfigurationProps> = ({
  selectedNode,
  formValues,
  onInputChange,
  onMapCoordinatesChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track if we have an attached file
  const hasAttachedFile = formValues.attachedFile?.name;

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
    onInputChange('attachedFile', {
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
    const newFormValues = { ...restValues };
    
    // Remove attachedFile from formValues
    Object.keys(formValues).forEach(key => {
      if (key !== 'attachedFile') {
        newFormValues[key] = formValues[key];
      }
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    onInputChange('attachedFile', undefined);
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Get node type for dynamic properties
  const nodeType = formValues.type || '';
  const mappedNodeType: NodeType | undefined = NODE_TYPE_MAP[nodeType];
  const propertySpecs = mappedNodeType ? NODE_PROPERTY_SPECS[mappedNodeType] : [];

  // Get appropriate icon for node type
  const getNodeTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'factory':
      case 'manufacturer':
        return <Factory className="w-4 h-4" />;
      case 'warehouse':
      case 'distribution center':
        return <Building2 className="w-4 h-4" />;
      case 'supplier':
      case 'vendor':
        return <Package className="w-4 h-4" />;
      case 'logistics':
      case 'transport':
        return <Truck className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full space-y-4">
        {/* Node Type Header - Always visible at top */}
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-background border border-border rounded-md">
                {getNodeTypeIcon(nodeType)}
              </div>
              <div className="flex-1">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Node Type
                </Label>
                <div className="text-base font-semibold text-foreground mt-0.5">
                  {nodeType || 'Not specified'}
                </div>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center justify-center w-6 h-6 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                  <Info className="w-4 h-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                sideOffset={8}
                className="max-w-xs z-50"
                avoidCollisions={true}
                collisionPadding={16}
              >
                <p className="text-sm">
                  Node type cannot be changed after creation. To change the type, delete this node and create a new one.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

      <Accordion type="multiple" defaultValue={["general", "type-specific", "risk-assessment", "appearance"]} className="w-full">
      {/* General Section */}
      <AccordionItem value="general">
        <AccordionTrigger className="text-sm font-medium">
          General
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Label</Label>
              <span className="text-xs text-muted-foreground">
                  {(formValues.label || '').length}/50
              </span>
            </div>
            <div className="p-0.5">
              <Input
                type="text"
                value={formValues.label || ''}
                onChange={(e) => {
                  if (e.target.value.length <= 50) {
                    onInputChange('label', e.target.value);
                  }
                }}
                placeholder="Enter label..."
                maxLength={50}
                className="px-4 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum 50 characters for the node label.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Description</Label>
            <div className="p-0.5">
              <Textarea
                rows={3}
                value={formValues.description || ''}
                onChange={(e) => onInputChange('description', e.target.value)}
                placeholder="Add a detailed description..."
                className="resize-none px-4 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
            </div>
          </div>

          {/* External Company Dependencies */}
          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="text-sm font-medium text-foreground">
                  Depends on External Company?
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="inline-block w-4 h-4 ml-2 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      sideOffset={8}
                      className="max-w-xs z-50"
                      avoidCollisions={true}
                      collisionPadding={16}
                    >
                      <p className="text-sm">
                        Toggle if this node depends on or is operated by an external company or partner.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
              </div>
              <Switch
                checked={formValues.dependsOnExternalCompany || false}
                onCheckedChange={(checked) => onInputChange('dependsOnExternalCompany', checked)}
              />
            </div>

            {/* Show external company fields when toggle is enabled */}
            {formValues.dependsOnExternalCompany && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Company Name</Label>
                  <div className="p-0.5">
                    <Input
                      type="text"
                      value={formValues.externalCompanyName || ''}
                      onChange={(e) => onInputChange('externalCompanyName', e.target.value)}
                      placeholder="Enter company name..."
                      className="px-4 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Company Country of Origin</Label>
                  <div className="p-0.5">
                    <CountryDropdown
                      defaultValue={formValues.externalCompanyCountry}
                      onChange={(country) => onInputChange('externalCompanyCountry', country.alpha3)}
                      placeholder="Select country of origin..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Description of Company 
                    <span className="text-xs text-muted-foreground ml-1">(optional)</span>
                  </Label>
                  <div className="p-0.5">
                    <Textarea
                      rows={3}
                      value={formValues.externalCompanyDescription || ''}
                      onChange={(e) => onInputChange('externalCompanyDescription', e.target.value)}
                      placeholder="Optional: Describe the external company's role and relationship..."
                      className="resize-none px-4 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Location Section */}
      <AccordionItem value="location">
        <AccordionTrigger className="text-sm font-medium">
          Location
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Country</Label>
            <div className="p-0.5">
              <CountryDropdown
                defaultValue={formValues.location?.country}
                onChange={(country) => onInputChange('location', {
                  ...formValues.location,
                  country: country.alpha3,
                  countryName: country.name
                })}
                placeholder="Select country..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Address & Coordinates</Label>
            <AddressAutocompleteMap
              onCoordinatesChange={onMapCoordinatesChange}
              initialAddress={formValues.address || ''}
              initialLat={formValues.location?.lat || ''}
              initialLng={formValues.location?.lng || ''}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Risk Assessment Section */}
      <AccordionItem value="risk-assessment">
        <AccordionTrigger className="text-sm font-medium">
          Risk Assessment
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          {COMMON_RISK_FIELDS.map((spec) => (
            <DynamicFormField
              key={spec.key}
              spec={spec}
              value={formValues[spec.key]}
              onChange={(value) => onInputChange(spec.key, value)}
              formValues={formValues}
            />
          ))}
        </AccordionContent>
      </AccordionItem>

      {/* Type-Specific Properties Section */}
      {propertySpecs.length > 0 && (
        <AccordionItem value="type-specific">
          <AccordionTrigger className="text-sm font-medium">
            {nodeType} Properties
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {propertySpecs.map((spec) => (
              <DynamicFormField
                key={spec.key}
                spec={spec}
                value={formValues[spec.key]}
                onChange={(value) => onInputChange(spec.key, value)}
                formValues={formValues}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Appearance Section */}
      <AccordionItem value="appearance">
        <AccordionTrigger className="text-sm font-medium">
          Appearance
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Node Color</Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formValues.nodeColor || '#ffffff'}
                  onChange={(e) => onInputChange('nodeColor', e.target.value)}
                  className="nodrag w-12 h-8 rounded border border-border cursor-pointer"
                  title="Choose node color"
                />
                <div 
                  className="w-8 h-8 rounded border border-border"
                  style={{ backgroundColor: formValues.nodeColor || '#ffffff' }}
                  title="Current color preview"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  value={formValues.nodeColor || '#ffffff'}
                  onChange={(e) => onInputChange('nodeColor', e.target.value)}
                  placeholder="#ffffff"
                  className="font-mono text-sm"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
              <Button
                type="button"
                onClick={() => onInputChange('nodeColor', '#ffffff')}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Reset
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Choose a custom color for this node. Changes will be applied immediately.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Attachments Section */}
      <AccordionItem value="attachments">
        <AccordionTrigger className="text-sm font-medium">
          Attachments
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              Attach Product Sheet
            </Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={triggerFileUpload}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {hasAttachedFile ? 'Change File' : 'Upload File'}
                </Button>
                {hasAttachedFile && (
                  <Button
                    type="button"
                    onClick={handleFileRemove}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </Button>
                )}
              </div>
              {hasAttachedFile && (
                <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-foreground font-medium">
                      {formValues.attachedFile.name}
                    </span>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Upload an Excel sheet (.xlsx, .xls, .csv) with product data.
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
      </div>
    </TooltipProvider>
  );
};

export default NodeConfiguration; 