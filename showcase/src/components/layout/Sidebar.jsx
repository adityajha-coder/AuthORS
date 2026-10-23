import { Link, useParams } from 'react-router-dom';
import { docsManifest } from '../../lib/docs-manifest';
import { ChevronRight } from 'lucide-react';

export default function Sidebar({ onNavigate }) {
  const { slug } = useParams();
  const currentSlug = slug || 'overview';

  return (
    <nav className="space-y-6 pb-8" aria-label="Documentation navigation">
      {docsManifest.map(category => (
        <div key={category.category}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 px-2.5">
            {category.category}
          </div>
          <ul className="space-y-1">
            {category.items.map(item => {
              const active = currentSlug === item.slug;
              return (
                <li key={item.slug}>
                  <Link
                    to={`/docs/${item.slug}`}
                    onClick={onNavigate}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-all no-underline ${
                      active
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium border border-zinc-200 dark:border-zinc-700/60 shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{item.title}</span>
                    {active && <ChevronRight size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
