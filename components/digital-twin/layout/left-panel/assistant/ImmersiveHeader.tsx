"use client"

import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImmersiveHeaderProps } from './types';
import InternetSearchIcon from './InternetSearchIcon';

export const ImmersiveHeader: React.FC<ImmersiveHeaderProps> = ({ 
  onExit, 
  internetSearch = false, 
  setInternetSearch, 
  isSearching = false
}) => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-border bg-muted/20">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
        <h2 className="text-sm font-semibold text-foreground truncate">AI Assistant</h2>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Web Search Toggle */}
        {setInternetSearch && (
          <InternetSearchIcon
            internet={internetSearch}
            setInternet={setInternetSearch}
            status={isSearching}
            showSearch={isSearching}
          />
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}; 