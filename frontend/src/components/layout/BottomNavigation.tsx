import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type NavTab = 'reports' | 'submit' | 'profile';

interface NavItem {
  id: NavTab;
  label: string;
  icon: JSX.Element;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: (
      <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 21V3h14v18l-7-3-7 3z"></path>
      </svg>
    ),
  },
  {
    id: 'submit',
    label: 'Submit',
    path: '/submit',
    icon: (
      <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12h14"></path>
        <path d="M12 5v14"></path>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: (
      <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
];

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background-dark/80 backdrop-blur-sm border-t border-black/5 dark:border-white/10">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                active
                  ? 'text-primary'
                  : 'text-muted-light dark:text-muted-dark hover:text-primary'
              }`}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <div className="w-6 h-6">{item.icon}</div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </footer>
  );
};
