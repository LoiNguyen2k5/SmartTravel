import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface SidebarItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  title?: string;
  colorScheme?: 'slate' | 'emerald' | 'sky';
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  title = 'Menu',
  colorScheme = 'slate',
}) => {
  const { pathname } = useLocation();

  const colorMap = {
    slate: { bg: 'bg-slate-900', active: 'bg-slate-700', hover: 'hover:bg-slate-800', accent: 'text-sky-400' },
    emerald: { bg: 'bg-emerald-900', active: 'bg-emerald-700', hover: 'hover:bg-emerald-800', accent: 'text-emerald-300' },
    sky: { bg: 'bg-sky-900', active: 'bg-sky-700', hover: 'hover:bg-sky-800', accent: 'text-sky-300' },
  };

  const colors = colorMap[colorScheme];

  return (
    <aside className={`w-60 min-h-full ${colors.bg} text-white flex flex-col p-4 gap-1`}>
      {title && (
        <div className={`mb-5 px-2 text-lg font-extrabold ${colors.accent}`}>{title}</div>
      )}
      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition
              ${pathname === item.path ? colors.active : `text-slate-300 ${colors.hover}`}`}
          >
            {item.icon && <span className={colors.accent}>{item.icon}</span>}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
