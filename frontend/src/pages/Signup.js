import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Background3D from '../components/Background3D';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member', teamId: '', teamName: '' });
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Fetch available teams when role = member
  useEffect(() => {
    if (form.role === 'member') {
      setTeamsLoading(true);
      API.get('/auth/teams')
        .then(({ data }) => setTeams(data.data || []))
        .catch(() => setTeams([]))
        .finally(() => setTeamsLoading(false));
    }
  }, [form.role]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.role === 'member' && !form.teamId) { toast.error('Please select a team to join'); return; }

    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role: form.role };
      if (form.role === 'admin') payload.teamName = form.teamName || `${form.name}'s Team`;
      if (form.role === 'member') payload.teamId = form.teamId;

      const { data } = await API.post('/auth/signup', payload);
      login(data.user, data.token, data.team);
      toast.success(
        form.role === 'admin'
          ? `Team "${data.team?.teamName}" created! Your Team ID: ${data.team?.teamId}`
          : `Joined team "${data.team?.teamName}" successfully!`
      );
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition";
  const selectClass = "w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden py-8">
      <Background3D />
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/20 border border-blue-400/30 mb-3">
              <span className="text-2xl">⚡</span>
            </div>
            <h1 className="text-3xl font-bold text-white">TaskFlow</h1>
            <p className="text-blue-200 mt-1">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Role selector first — changes the rest of the form */}
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1">I am signing up as</label>
              <select name="role" value={form.role} onChange={handleChange} className={selectClass}>
                <option value="member">Member — join an existing team</option>
                <option value="admin">Admin — create a new team</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1">Full Name</label>
              <input type="text" name="name" className={inputClass} placeholder="Jane Doe"
                value={form.name} onChange={handleChange} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1">Email</label>
              <input type="email" name="email" className={inputClass} placeholder="you@example.com"
                value={form.email} onChange={handleChange} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1">Password</label>
              <input type="password" name="password" className={inputClass} placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange} required />
            </div>

            {/* Admin: optional team name */}
            {form.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">
                  Team Name <span className="text-blue-300 text-xs">(optional — defaults to "{form.name || 'Your'}'s Team")</span>
                </label>
                <input type="text" name="teamName" className={inputClass} placeholder="e.g. Engineering Team"
                  value={form.teamName} onChange={handleChange} />
              </div>
            )}

            {/* Member: select team from dropdown */}
            {form.role === 'member' && (
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">Select Team to Join</label>
                {teamsLoading ? (
                  <div className="flex items-center gap-2 text-blue-200 text-sm py-2"><Spinner size="sm" /> Loading teams...</div>
                ) : teams.length === 0 ? (
                  <p className="text-yellow-300 text-sm py-2">No teams found. Ask your admin to sign up first and share the Team ID.</p>
                ) : (
                  <select name="teamId" value={form.teamId} onChange={handleChange} className={selectClass} required>
                    <option value="">— Select a team —</option>
                    {teams.map((t) => (
                      <option key={t.teamId} value={t.teamId}>
                        {t.teamName} (ID: {t.teamId})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-blue-300 text-xs mt-1">Don't see your team? Ask your admin for the Team ID and enter it directly:</p>
                <input type="text" name="teamId" className={`${inputClass} mt-1`} placeholder="Paste Team ID manually (e.g. T-AB12CD34)"
                  value={form.teamId} onChange={handleChange} />
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/30 mt-2">
              {loading && <Spinner size="sm" />}
              {loading ? 'Creating account...' : form.role === 'admin' ? '🚀 Create Team & Sign Up' : '👥 Join Team & Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-blue-200 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
