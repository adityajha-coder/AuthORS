import { useScrollSpy } from '../../hooks/useScrollSpy';
import { useState, useEffect } from 'react';

export default function TableOfContents({ headings }) {
  const ids = headings ? headings.map(h => h.id) : [];
  const activeId = useScrollSpy(ids);
  const [clickedId, setClickedId] = useState(null);

  useEffect(() => {
    if (clickedId) {
      const timer = setTimeout(() => setClickedId(null), 800);
      return () => clearTimeout(timer);
    }
  }, [clickedId]);

  if (!headings || headings.length === 0) return null;

  const currentActiveId = clickedId || activeId;

  const handleClick = (e, id) => {
    e.preventDefault();
    setClickedId(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <div className="space-y-3 pb-8">
      <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-2.5">
        ON THIS PAGE
      </div>
      <ul className="space-y-1">
        {headings.map(heading => {
          const active = currentActiveId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={`block text-xs py-1 px-2.5 rounded transition-all truncate border-l-2 no-underline cursor-pointer ${
                  heading.level === 3 ? 'pl-5 text-[11px]' : ''
                } ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 font-medium border-l-blue-600 dark:border-l-blue-500 bg-blue-50 dark:bg-blue-500/10'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-l-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
                title={heading.text}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
