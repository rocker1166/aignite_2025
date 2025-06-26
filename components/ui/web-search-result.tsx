import React from 'react';

interface WebSearchResultProps {
  type: 'answer' | 'results' | 'error' | 'no_results' | 'loading';
  query: string;
  answer?: string;
  results?: Array<{
    title: string;
    url: string;
    content?: string;
  }>;
  error?: string;
  children?: React.ReactNode;
}

export const WebSearchResult: React.FC<WebSearchResultProps> = ({
  type,
  query,
  answer,
  results,
  error,
  children
}) => {
  if (type === 'loading') {
    return (
      <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 border-l-4 border-blue-500 rounded-r-lg">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Searching the web...</div>
          <div className="text-slate-600 dark:text-slate-400 text-xs">Query: "{query}"</div>
        </div>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg">
        <div className="font-semibold text-red-800 dark:text-red-200 text-sm flex items-center gap-1">
          ❌ Search Failed
        </div>
        <div className="text-red-700 dark:text-red-300 text-xs mt-1">Query: "{query}"</div>
        <div className="text-red-600 dark:text-red-400 text-xs mt-1">Error: {error}</div>
      </div>
    );
  }

  if (type === 'no_results') {
    return (
      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg">
        <div className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm flex items-center gap-1">
          ℹ️ No Results Found
        </div>
        <div className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">Query: "{query}"</div>
        <div className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
          Try refining your search terms for better results.
        </div>
      </div>
    );
  }

  if (type === 'answer') {
    return (
      <div className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg">
        <div className="font-semibold text-green-800 dark:text-green-200 text-sm flex items-center gap-1">
          ✅ Found Answer
        </div>
        <div className="text-green-700 dark:text-green-300 text-xs mt-1 font-medium">
          Query: "{query}"
        </div>
        <div className="mt-2 p-2 bg-white dark:bg-slate-800 border border-green-200 dark:border-green-800 rounded">
          <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {answer}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'results' && results) {
    return (
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
        <div className="font-semibold text-blue-800 dark:text-blue-200 text-sm flex items-center gap-1">
          📊 Search Results ({results.length})
        </div>
        <div className="text-blue-700 dark:text-blue-300 text-xs mt-1 font-medium">
          Query: "{query}"
        </div>
        <div className="mt-2 space-y-2">
          {results.map((result, index) => (
            <div 
              key={index} 
              className="p-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded"
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {index + 1}. {result.title}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                {result.url}
              </div>
              {result.content && (
                <div className="text-slate-600 dark:text-slate-300 text-xs mt-1 leading-relaxed">
                  {result.content.length > 150 
                    ? `${result.content.substring(0, 150)}...` 
                    : result.content
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback for any other content
  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-l-4 border-slate-400 rounded-r-lg">
      <div className="text-slate-700 dark:text-slate-300 text-sm">
        {children || 'Search completed.'}
      </div>
    </div>
  );
}; 