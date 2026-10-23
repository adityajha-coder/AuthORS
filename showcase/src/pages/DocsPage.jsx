import { useParams, Navigate } from 'react-router-dom';
import { useMemo, useEffect } from 'react';
import DocsLayout from '../components/layout/DocsLayout';
import Sidebar from '../components/layout/Sidebar';
import TableOfContents from '../components/layout/TableOfContents';
import MarkdownRenderer from '../components/docs/MarkdownRenderer';
import { getDocBySlug } from '../lib/docs-manifest';
import { extractToc } from '../lib/toc-extractor';

// import all markdown content files
const contentModules = import.meta.glob('../content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function getContent(file) {
  const key = `../content/${file}.md`;
  return contentModules[key] || null;
}

export default function DocsPage() {
  const { slug } = useParams();
  const doc = getDocBySlug(slug || 'overview');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!doc) {
    return <Navigate to="/docs/overview" replace />;
  }

  const content = getContent(doc.file);

  const headings = useMemo(() => {
    if (!content) return [];
    return extractToc(content);
  }, [content]);

  if (!content) {
    return (
      <DocsLayout
        sidebar={<Sidebar />}
        toc={<TableOfContents headings={[]} />}
      >
        <div className="py-20 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            Content for "{doc.title}" coming soon.
          </p>
        </div>
      </DocsLayout>
    );
  }

  return (
    <DocsLayout
      sidebar={<Sidebar />}
      toc={<TableOfContents headings={headings} />}
    >
      <MarkdownRenderer content={content} />
    </DocsLayout>
  );
}
