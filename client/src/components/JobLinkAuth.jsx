import React, { useState } from 'react';
import { Briefcase, Building2, User, Mail, Lock, ArrowRight, CheckCircle, Users } from 'lucide-react';

const JobLinkAuth = () => {
  const [currentView, setCurrentView] = useState('home');
  const [userType, setUserType] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation
    if (authMode === 'register' && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
      return;
    }

    try {
      const endpoint = authMode === 'login' 
        ? `http://localhost:5001/api/auth/login`
        : `http://localhost:5001/api/auth/register/${userType}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Success!' });
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userType', data.userType);
          // Redirect to dashboard after successful login
          setTimeout(() => {
            setMessage({ type: 'success', text: `Welcome! Redirecting to ${data.userType} dashboard...` });
          }, 1000);
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Authentication failed!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error. Please try again later.' });
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', confirmPassword: '' });
    setMessage({ type: '', text: '' });
  };

  // Home Page
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Navbar */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Briefcase className="text-indigo-600" size={32} />
                <span className="text-2xl font-bold text-gray-900">JobLink</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCurrentView('auth');
                    setAuthMode('login');
                  }}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setCurrentView('auth');
                    setAuthMode('register');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Connect Talent with Opportunity
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              JobLink matches job seekers with their dream careers using intelligent skill-based recommendations
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setCurrentView('auth');
                  setAuthMode('register');
                  setUserType('jobseeker');
                }}
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg flex items-center gap-2"
              >
                I'm Looking for Jobs
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => {
                  setCurrentView('auth');
                  setAuthMode('register');
                  setUserType('company');
                }}
                className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold text-lg flex items-center gap-2"
              >
                I'm Hiring Talent
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Matching</h3>
              <p className="text-gray-600">
                Our skill-based algorithm connects you with the most relevant opportunities
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Applications</h3>
              <p className="text-gray-600">
                Apply to multiple jobs with one click and track all your applications
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Resume Builder</h3>
              <p className="text-gray-600">
                Create professional resumes with our built-in generator and download as PDF
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auth Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to Home */}
        <button
          onClick={() => {
            setCurrentView('home');
            resetForm();
            setUserType('');
          }}
          className="mb-4 text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
        >
          ← Back to Home
        </button>

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
              onClick={() => {
                setAuthMode('login');
                resetForm();
              }}
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                authMode === 'login'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                resetForm();
              }}
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                authMode === 'register'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* User Type Selection for Registration */}
          {authMode === 'register' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('jobseeker')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === 'jobseeker'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <User className={`mx-auto mb-2 ${userType === 'jobseeker' ? 'text-indigo-600' : 'text-gray-400'}`} size={32} />
                  <div className="font-medium text-gray-900">Job Seeker</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('company')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === 'company'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
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

            {/* Message Display */}
            {message.text && (
              <div className={`p-3 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
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
                <button
                  onClick={() => {
                    setAuthMode('register');
                    resetForm();
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setAuthMode('login');
                    resetForm();
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Login here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobLinkAuth;