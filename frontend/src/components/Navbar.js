import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, team, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3 shadow-sm relative z-20">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-bold text-white">
          ⚡ TaskFlow
        </Link>

        {user && (
          <div className="flex items-center gap-3 flex-wrap">
            {team && (
              <div className="hidden sm:flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-lg px-3 py-1">
                <span className="text-xs text-blue-300 font-medium">Team:</span>
                <span className="text-xs text-white font-bold">{team.teamName}</span>
                <span className="text-xs text-blue-300 font-mono">({team.teamId})</span>
              </div>
            )}
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              isAdmin
                ? 'bg-purple-500/30 text-purple-200 border-purple-400/30'
                : 'bg-green-500/30 text-green-200 border-green-400/30'
            }`}>
              {isAdmin ? '👑 Admin' : '👤 Member'}
            </span>
            <span className="text-sm text-white/80 hidden sm:block">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold py-1.5 px-3 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
