import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import CodeBlock from '../common/CodeBlock';

function extractText(node) {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node?.props?.children) return extractText(node.props.children);
  return '';
}

function makeId(node) {
  const text = extractText(node);
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose dark:prose-invert prose-zinc max-w-none prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-headings:font-bold prose-h1:text-3xl prose-h1:text-zinc-900 dark:prose-h1:text-zinc-100 prose-h1:mb-6 prose-h2:text-2xl prose-h2:text-zinc-900 dark:prose-h2:text-zinc-100 prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-zinc-200 dark:prose-h2:border-zinc-800 prose-h3:text-lg prose-h3:text-zinc-900 dark:prose-h3:text-zinc-100 prose-h3:mt-8 prose-h3:mb-3 prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-li:text-zinc-600 dark:prose-li:text-zinc-400 prose-strong:text-zinc-900 dark:prose-strong:text-zinc-200 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre({ children }) {
            return <>{children}</>;
          },
          code({ className, children, ...props }) {
            const hasLang = Boolean(className?.includes('language-') || className?.includes('hljs'));
            if (hasLang) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }
            return (
              <code
                className="font-mono text-xs text-blue-600 dark:text-blue-300 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded before:content-none after:content-none"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1({ children }) {
            const id = makeId(children);
            return <h1 id={id}>{children}</h1>;
          },
          h2({ children }) {
            const id = makeId(children);
            return (
              <h2 id={id} className="group flex items-center gap-2">
                <span>{children}</span>
                <a
                  href={`#${id}`}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-opacity text-sm font-normal"
                  aria-hidden="true"
                >
                  #
                </a>
              </h2>
            );
          },
          h3({ children }) {
            const id = makeId(children);
            return (
              <h3 id={id} className="group flex items-center gap-2">
                <span>{children}</span>
                <a
                  href={`#${id}`}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-opacity text-sm font-normal"
                  aria-hidden="true"
                >
                  #
                </a>
              </h3>
            );
          },
          table({ children }) {
            return (
              <div className="my-6 overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/40 shadow-sm">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-200 bg-zinc-100/90 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/60 align-top">
                {children}
              </td>
            );
          },
          img({ src, alt }) {
            const resolvedSrc = src?.startsWith('./') || src?.startsWith('../')
              ? `/assets/${src.split('/').pop()}`
              : src;
            return (
              <figure className="my-8 text-center">
                <img
                  src={resolvedSrc}
                  alt={alt || ''}
                  loading="lazy"
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 max-w-full mx-auto shadow-md"
                />
                {alt ? <figcaption className="text-xs text-zinc-500 mt-2">{alt}</figcaption> : null}
              </figure>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
