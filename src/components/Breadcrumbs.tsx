import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CaretRight } from '@phosphor-icons/react';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show on root landing or very simple paths
  if (pathnames.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-8 px-6 lg:px-10">
      <Link to="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors duration-300">Home</Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        // Format label
        let label = value.charAt(0).toUpperCase() + value.slice(1);
        if (value === 'app') label = 'Dashboard';
        if (value === 'groups') label = 'Groups';
        
        return (
          <React.Fragment key={to}>
            <CaretRight weight="bold" className="w-2.5 h-2.5 text-zinc-300 dark:text-zinc-800" />
            {last ? (
              <span className="text-zinc-900 dark:text-white">{label}</span>
            ) : (
              <Link to={to} className="hover:text-zinc-900 dark:hover:text-white transition-colors duration-300">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
