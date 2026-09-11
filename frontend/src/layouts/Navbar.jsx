import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, selectCurrentUser } from '../redux/slices/authSlice';
import { Menu, LogOut, Bell, Activity, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

function Navbar({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SUPERVISOR':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-brand-50 text-brand-700 border-brand-200';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm">
      {/* Left section: Hamburger button & Plant Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Shop Floor: Online
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 font-medium">
            Ball Pen Production Tracking System
          </span>
        </div>
      </div>

      {/* Right section: User Status & Logout */}
      <div className="flex items-center gap-3">
        {/* Role Tag */}
        {user && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${getRoleBadgeColor(
                user.role
              )}`}
            >
              <Shield className="w-3 h-3" />
              {user.role || 'OPERATOR'}
            </span>
            <span className="text-sm font-semibold text-slate-700 hidden md:inline-block">
              {user.username}
            </span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
