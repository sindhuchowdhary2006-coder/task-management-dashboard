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
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-bold text-blue-600">
          ⚡ TaskFlow
        </Link>

        {user && (
          <div className="flex items-center gap-3 flex-wrap">
            {/* Team badge */}
            {team && (
              <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1">
                <span className="text-xs text-blue-500 font-medium">Team:</span>
                <span className="text-xs text-blue-700 font-bold">{team.teamName}</span>
                <span className="text-xs text-blue-400 font-mono">({team.teamId})</span>
              </div>
            )}
            {/* Role badge */}
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
              {isAdmin ? '👑 Admin' : '👤 Member'}
            </span>
            <span className="text-sm text-gray-600 hidden sm:block">
              {user.name}
            </span>
            <button onClick={handleLogout} className="btn-secondary text-sm">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
