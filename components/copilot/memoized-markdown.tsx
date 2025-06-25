import { marked } from 'marked';
import { memo, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

/*
Example of properly formatted markdown table:
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3<br>Line break |
| Cell 4   | Cell 5   | Cell 6 |

Note: Remove extra | at the end of header rows and ensure consistent formatting
*/

// Error Boundary Component for Markdown Parsing
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class MarkdownErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Markdown rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div 
          className="border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 rounded-md p-3 text-sm"
          role="alert"
          aria-labelledby="markdown-error-title"
        >
          <div id="markdown-error-title" className="font-medium text-red-800 dark:text-red-400 mb-1">
            Markdown Rendering Error
          </div>
          <div className="text-red-700 dark:text-red-300">
            Unable to render this content. Please check the markdown formatting.
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-red-600 dark:text-red-400">
                Technical Details
              </summary>
              <pre className="mt-1 text-xs bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-x-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
  try {
    const tokens = marked.lexer(markdown);
    return tokens.map(token => token.raw);
  } catch (error) {
    console.error('Error parsing markdown:', error);
    // Return the original markdown as a single block if parsing fails
    return [markdown];
  }
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <MarkdownErrorBoundary>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // Customize components for chat message styling with accessibility
            p: ({ children }) => (
              <p className="my-1 text-xs leading-relaxed">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul 
                className="my-1 pl-4 text-xs" 
                role="list"
                aria-label="Unordered list"
              >
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol 
                className="my-1 pl-4 text-xs" 
                role="list"
                aria-label="Ordered list"
              >
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="my-0.5 text-xs" role="listitem">
                {children}
              </li>
            ),
            h1: ({ children }) => (
              <h1 
                className="text-sm font-semibold my-1" 
                role="heading" 
                aria-level={1}
                tabIndex={0}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 
                className="text-xs font-semibold my-1" 
                role="heading" 
                aria-level={2}
                tabIndex={0}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 
                className="text-xs font-medium my-1" 
                role="heading" 
                aria-level={3}
                tabIndex={0}
              >
                {children}
              </h3>
            ),
            code: ({ children }) => (
              <code 
                className="bg-muted px-1 py-0.5 rounded text-xs font-mono"
                role="code"
                aria-label="Inline code"
              >
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre 
                className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto my-1"
                role="code"
                aria-label="Code block"
                tabIndex={0}
              >
                {children}
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote 
                className="border-l-2 border-muted-foreground pl-2 italic text-xs my-1"
                role="blockquote"
                aria-label="Quote"
              >
                {children}
              </blockquote>
            ),
            // Enhanced table components with accessibility
            table: ({ children }) => (
              <div className="my-2 overflow-x-auto max-w-full" role="region" aria-label="Data table">
                <table 
                  className="min-w-full border-collapse border border-border text-xs table-auto"
                  role="table"
                  aria-label="Markdown table"
                >
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-muted/50" role="rowgroup">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody role="rowgroup">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr 
                className="border-b border-border hover:bg-muted/30 focus-within:bg-muted/40"
                role="row"
                tabIndex={0}
              >
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th 
                className="border border-border px-2 py-1 text-left font-medium text-xs"
                role="columnheader"
                scope="col"
                tabIndex={0}
              >
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td 
                className="border border-border px-2 py-1 text-xs align-top max-w-xs break-words"
                role="cell"
                tabIndex={0}
              >
                {children}
              </td>
            ),
            // Enhanced links with keyboard navigation
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-sm"
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={href?.startsWith('http') ? `External link: ${children}` : undefined}
              >
                {children}
              </a>
            ),
            // Handle line breaks
            br: () => <br aria-hidden="true" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </MarkdownErrorBoundary>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  },
);

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => {
      try {
        return parseMarkdownIntoBlocks(content);
      } catch (error) {
        console.error('Error creating markdown blocks:', error);
        return [content]; // Fallback to original content
      }
    }, [content]);

    // Handle empty or invalid content gracefully
    if (!content && content !== '') {
      return null;
    }

    return (
      <MarkdownErrorBoundary 
        fallback={
          <div 
            className="border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 rounded-md p-3 text-sm"
            role="alert"
            aria-labelledby="markdown-fallback-title"
          >
            <div id="markdown-fallback-title" className="font-medium text-yellow-800 dark:text-yellow-400 mb-1">
              Content Display Issue
            </div>
            <div className="text-yellow-700 dark:text-yellow-300">
              The content could not be properly formatted. Displaying as plain text:
            </div>
            <pre className="mt-2 text-xs bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded whitespace-pre-wrap">
              {content}
            </pre>
          </div>
        }
      >
        <div 
          className="space-y-0.5" 
          role="document"
          aria-label={`Markdown content: ${id}`}
        >
          {blocks.map((block, index) => (
            <MemoizedMarkdownBlock 
              content={block} 
              key={`${id}-block_${index}`} 
            />
          ))}
        </div>
      </MarkdownErrorBoundary>
    );
  },
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown'; 