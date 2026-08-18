import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Filter, BarChart3 } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: Home,
    },
    {
      path: '/feature-selection',
      label: 'Feature Selection',
      icon: Filter,
    },
    {
      path: '/model-evaluation',
      label: 'Model Evaluation',
      icon: BarChart3,
    },
  ];

  return (
    <div className="w-64 bg-slate-900 min-h-screen flex flex-col border-r border-slate-200">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded flex items-center justify-center shadow-sm">
            <span className="text-slate-900 font-bold text-xl">BRI</span>
          </div>
          <div className="text-white">
            <div className="font-semibold text-sm">Sistem Prediksi</div>
            <div className="text-xs text-slate-400">Saham BBRI</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded transition-all
                    ${
                      isActive
                        ? 'bg-slate-800 text-white border-l-4 border-blue-500'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-slate-700">
        <div className="text-slate-500 text-xs text-center">
          <p>© 2026 BRI Stock Prediction</p>
          <p className="mt-1">Version 4.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
