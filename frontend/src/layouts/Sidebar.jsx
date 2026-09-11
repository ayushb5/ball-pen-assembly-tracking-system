import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../redux/slices/authSlice';
import {
  LayoutDashboard,
  ClipboardList,
  Workflow,
  Cpu,
  ShieldCheck,
  Package,
  Boxes,
  Truck,
  PenTool,
  Layers,
  Building2,
  Users,
  BarChart3,
  X,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Production Orders', path: '/orders', icon: ClipboardList },
  { name: 'Assembly Tracking', path: '/assembly', icon: Workflow },
  { name: 'Workstations', path: '/workstations', icon: Cpu },
  { name: 'Quality Checks', path: '/quality', icon: ShieldCheck },
  { name: 'Packaging', path: '/packaging', icon: Package },
  { name: 'Finished Goods', path: '/finished-goods', icon: Boxes },
  { name: 'Dispatch', path: '/dispatch', icon: Truck },
  { name: 'Products Catalog', path: '/products', icon: PenTool },
  { name: 'Raw Materials', path: '/raw-materials', icon: Layers },
  { name: 'Customers', path: '/customers', icon: Building2 },
  { name: 'Employees', path: '/employees', icon: Users },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
];

function Sidebar({ isOpen, setIsOpen }) {
  const user = useSelector(selectCurrentUser);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-slate-300 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm tracking-tight leading-none">
                BallPen MES
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
                Production Tracking
              </div>
            </div>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Manufacturing Modules
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/30">
          <div className="p-2.5 rounded-xl bg-slate-800/70 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center font-bold text-xs">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user?.username || 'Operator'}
              </div>
              <div className="text-[10px] text-brand-400 font-mono">
                {user?.role || 'OPERATOR'}
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online"></span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
