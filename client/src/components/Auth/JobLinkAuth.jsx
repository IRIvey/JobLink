import React, { useState } from 'react';
import { Briefcase, Building2, User, Mail, Lock, ArrowRight, CheckCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JobLinkAuth = ({ defaultMode }) => {
  const [authMode, setAuthMode] = useState(defaultMode || 'login'); // login or register
  const [userType, setUserType] = useState(''); // jobseeker or company
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const resetForm = () => {
    setFormData({ email: '', password: '', confirmPassword: '' });
    setMessage({ type: '', text: '' });
    setUserType('');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (authMode === 'register' && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
      return;
    }

    try {
      // Decide endpoint based on auth mode and user type
      const endpoint =
        authMode === 'login'
          ? "http://localhost:5001/api/auth/login"
          : userType === 'jobseeker'
          ? "http://localhost:5001/api/auth/register/jobseeker"
          : "http://localhost:5001/api/auth/register/company";

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Success!' });
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userType', userType || 'jobseeker');
          setTimeout(() => navigate('/'), 1000); // redirect to dashboard after success
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Authentication failed!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error. Please try again later.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <Briefcase className="text-indigo-600" size={36} />
              <span className="text-3xl font-bold text-gray-900">JobLink</span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => { setAuthMode('login'); resetForm(); }}
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setAuthMode('register'); resetForm(); }}
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${authMode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Register
            </button>
          </div>

          {/* User Type Selection for Registration */}
          {authMode === 'register' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">I am a:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('jobseeker')}
                  className={`p-4 rounded-lg border-2 transition-all ${userType === 'jobseeker' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                  <User className={`mx-auto mb-2 ${userType === 'jobseeker' ? 'text-indigo-600' : 'text-gray-400'}`} size={32} />
                  <div className="font-medium text-gray-900">Job Seeker</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('company')}
                  className={`p-4 rounded-lg border-2 transition-all ${userType === 'company' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                  <Building2 className={`mx-auto mb-2 ${userType === 'company' ? 'text-indigo-600' : 'text-gray-400'}`} size={32} />
                  <div className="font-medium text-gray-900">Company</div>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* Message */}
            {message.text && (
              <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={authMode === 'register' && !userType}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {authMode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {authMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button onClick={() => setAuthMode('register')} className="text-indigo-600 hover:text-indigo-700 font-medium">Register here</button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button onClick={() => setAuthMode('login')} className="text-indigo-600 hover:text-indigo-700 font-medium">Login here</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobLinkAuth;
