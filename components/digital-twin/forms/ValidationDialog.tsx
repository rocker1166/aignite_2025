'use client';

import { FC } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  XCircle, 
  Info, 
  Eye, 
  Save, 
  X,
  ChevronRight,
  Target,
  Link
} from 'lucide-react';
import { ValidationIssue, getValidationSummary } from '@/lib/validation/supply-chain-validator';

interface ValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  issues: ValidationIssue[];
  onFocusElement: (elementId: string, elementType: 'node' | 'edge') => void;
  onSaveWithWarnings?: () => void;
  isLoading?: boolean;
}

const ValidationDialog: FC<ValidationDialogProps> = ({
  isOpen,
  onClose,
  issues,
  onFocusElement,
  onSaveWithWarnings,
  isLoading = false
}) => {
  const summary = getValidationSummary(issues);
  const errors = issues.filter(issue => issue.severity === 'error');
  const warnings = issues.filter(issue => issue.severity === 'warning');

  const getSeverityIcon = (severity: 'error' | 'warning') => {
    return severity === 'error' ? (
      <XCircle className="h-4 w-4 text-red-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-amber-500" />
    );
  };

  const getSeverityColor = (severity: 'error' | 'warning') => {
    return severity === 'error' 
      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
      : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800';
  };

  const getElementTypeIcon = (elementType: string) => {
    switch (elementType) {
      case 'node':
        return <Target className="h-4 w-4" />;
      case 'edge':
        return <Link className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const handleFocusElement = (issue: ValidationIssue) => {
    if (issue.elementType !== 'graph') {
      onFocusElement(issue.elementId, issue.elementType as 'node' | 'edge');
    }
  };

  const IssueCard = ({ issue }: { issue: ValidationIssue }) => (
    <div 
      className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)} transition-all duration-200 hover:shadow-sm`}
    >
      <div className="flex items-start gap-3">
        {/* Severity Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getSeverityIcon(issue.severity)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {getElementTypeIcon(issue.elementType)}
              <span className="ml-1 capitalize">{issue.elementType}</span>
            </Badge>
            {issue.elementType !== 'graph' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFocusElement(issue)}
                className="h-6 px-2 text-xs hover:bg-background/80"
              >
                <Eye className="h-3 w-3 mr-1" />
                Focus
              </Button>
            )}
          </div>
          
          <h4 className="font-medium text-sm text-foreground mb-1">
            {issue.message}
          </h4>
          
          <p className="text-xs text-muted-foreground leading-relaxed">
            {issue.suggestion}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Supply Chain Validation
          </DialogTitle>
        </DialogHeader>

        {/* Summary Section */}
        <div className="px-6">
          <Alert className={summary.errors > 0 ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20' : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'}>
            <AlertDescription className="text-sm">
              {summary.errors > 0 ? (
                <>
                  <strong>Cannot save:</strong> Found {summary.errors} error{summary.errors !== 1 ? 's' : ''}{' '}
                  {summary.warnings > 0 && `and ${summary.warnings} warning${summary.warnings !== 1 ? 's' : ''} `}
                  that need to be addressed.
                </>
              ) : summary.warnings > 0 ? (
                <>
                  <strong>Ready to save:</strong> Found {summary.warnings} warning{summary.warnings !== 1 ? 's' : ''}{' '}
                  that you may want to review, but saving is allowed.
                </>
              ) : (
                <>
                  <strong>All good:</strong> No validation issues found. Ready to save!
                </>
              )}
            </AlertDescription>
          </Alert>
        </div>

        {/* Issues List */}
        {issues.length > 0 && (
          <div className="px-6 pb-2 flex-1 min-h-0">
            <ScrollArea className="h-full max-h-[400px]">
              <div className="space-y-6 pr-4 pb-4">
                {/* Errors Section */}
                {errors.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <h3 className="font-semibold text-sm text-red-700 dark:text-red-400">
                        Errors ({errors.length})
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        Must be fixed before saving
                      </span>
                    </div>
                    <div className="space-y-3">
                      {errors.map((issue) => (
                        <IssueCard key={issue.id} issue={issue} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Separator between errors and warnings */}
                {errors.length > 0 && warnings.length > 0 && (
                  <Separator className="my-4" />
                )}

                {/* Warnings Section */}
                {warnings.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <h3 className="font-semibold text-sm text-amber-700 dark:text-amber-400">
                        Warnings ({warnings.length})
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        Recommendations for improvement
                      </span>
                    </div>
                    <div className="space-y-3">
                      {warnings.map((issue) => (
                        <IssueCard key={issue.id} issue={issue} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="p-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground">
              Click "Focus" to navigate to problematic elements in the canvas
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
              
              {summary.canSave && (
                <Button 
                  onClick={onSaveWithWarnings}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isLoading ? 'Saving...' : 'Save Supply Chain'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ValidationDialog; 