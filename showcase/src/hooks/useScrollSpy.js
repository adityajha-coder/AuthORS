import { useState, useEffect, useRef } from 'react';

export function useScrollSpy(ids, offset = 80) {
  const [activeId, setActiveId] = useState('');
  const observer = useRef(null);

  useEffect(() => {
    if (!ids || ids.length === 0) return;

    const elements = ids
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if (elements.length === 0) return;

    // Check if user is scrolled to the absolute bottom of page
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - 60) {
        // Activate the last heading
        setActiveId(ids[ids.length - 1]);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    observer.current = new IntersectionObserver(
      (entries) => {
        // If we are at the bottom, handleScroll handles the last item
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const clientHeight = window.innerHeight;
        if (scrollTop + clientHeight >= scrollHeight - 60) {
          return;
        }

        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: `-${offset}px 0px -50% 0px`,
        threshold: 0,
      }
    );

    elements.forEach(el => observer.current.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [ids, offset]);

  return activeId;
}
