import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function DocsLayout({ sidebar, toc, children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen pt-16 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 text-xs font-semibold shadow-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        aria-label="Toggle Documentation Sidebar"
      >
        {mobileSidebarOpen ? <X size={16} /> : <Menu size={16} />}
        <span>{mobileSidebarOpen ? 'Close Menu' : 'Doc Menu'}</span>
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 dark:bg-black/70 backdrop-blur-sm flex"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-5 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Navigation</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}

      {/* 3-Column Desktop Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_240px] gap-8">
        {/* Left Sidebar */}
        <aside className="hidden lg:block sticky top-20 h-[calc(100vh-5.5rem)] overflow-y-auto pr-4 border-r border-zinc-200 dark:border-zinc-800/80">
          {sidebar}
        </aside>

        {/* Center Main Content */}
        <main className="min-w-0 pt-8 pb-96 min-h-[calc(100vh-4rem)] max-w-3xl">
          {children}
        </main>

        {/* Right Table of Contents */}
        <aside className="hidden xl:block sticky top-20 h-[calc(100vh-5.5rem)] overflow-y-auto pl-4 border-l border-zinc-200 dark:border-zinc-800/80">
          {toc}
        </aside>
      </div>
    </div>
  );
}
