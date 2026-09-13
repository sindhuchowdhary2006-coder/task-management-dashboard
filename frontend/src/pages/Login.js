import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Background3D from '../components/Background3D';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token, data.team);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 border border-blue-400/30 mb-3">
              <span className="text-3xl">⚡</span>
            </div>
            <h1 className="text-3xl font-bold text-white">TaskFlow</h1>
            <p className="text-blue-200 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1">Email</label>
              <input id="email" type="email" name="email"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-1">Password</label>
              <input id="password" type="password" name="password"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="••••••••" value={form.password} onChange={handleChange} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/30">
              {loading && <Spinner size="sm" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-blue-200 mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-white hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
