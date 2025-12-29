import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  FileText, 
  Home, 
  User, 
  Bell, 
  LogOut,
  Plus,
  CheckCircle,
  Search
} from 'lucide-react';

import CompanyProfile from './CompanyProfilePage';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [companyData, setCompanyData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchCompanyData();
    fetchJobs();
    fetchApplications();
    fetchNotifications();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCompanyData(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setJobs(data.jobs || []);
    } catch (err) { console.error(err); }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setApplications(data.applications || []);
    } catch (err) { console.error(err); }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setNotifications(data.notifications || []);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    window.location.href = '/';
  };

  const navigation = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'post-job', label: 'Post Job', icon: Plus },
    { id: 'jobs', label: 'Job Postings', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'jobs':
        return (
          <div className="space-y-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg">
              <Plus size={16} /> Post New Job
            </button>
            {jobs.map(job => (
              <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between">
                <span className="font-medium">{job.title}</span>
                <span className="text-sm text-green-600">{job.status}</span>
              </div>
            ))}
          </div>
        );
      case 'applications':
        return (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="bg-white p-4 rounded-xl shadow-sm">
                <p className="font-medium">{app.name}</p>
                <p className="text-sm text-gray-500">{app.job}</p>
              </div>
            ))}
          </div>
        );
      case 'profile':
        return <CompanyProfile companyData={companyData} />;
      default:
        return (
          <div className="space-y-6">
            {/* Job Posts Section */}
            {jobs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Your Job Posts</h2>
                {jobs.slice(0, 5).map(job => (
                  <div key={job.id} className="flex justify-between py-3 border-b last:border-none">
                    <span className="font-medium">{job.title}</span>
                    <span className="text-sm text-green-600">{job.status}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Applications Section */}
            {applications.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
                {applications.slice(0, 5).map(app => (
                  <div key={app.id} className="py-3 border-b last:border-none">
                    <p className="font-medium">{app.name}</p>
                    <p className="text-sm text-gray-500">{app.job}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Briefcase className="text-indigo-600" size={32} />
              <span className="text-2xl font-bold text-gray-900">JobLink</span>
            </div>
            <div className="flex-1 max-w-2xl mx-8">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs, companies, skills..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell size={24} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {companyData?.email?.[0]?.toUpperCase() || 'C'}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-6 pt-24 flex gap-6">
        {/* Left Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-1 sticky top-24">
            {navigation.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          {/* Quick Stats below Search Bar - only on home/dashboard */}
          {activeTab === 'home' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <StatBox 
                icon={Briefcase} 
                label="Total Jobs" 
                value={jobs.length} 
                color="bg-indigo-100" 
                textColor="text-indigo-600"
              />
              <StatBox 
                icon={FileText} 
                label="Applications" 
                value={applications.length} 
                color="bg-green-100" 
                textColor="text-green-600"
              />
              <StatBox 
                icon={CheckCircle} 
                label="Active Jobs" 
                value={jobs.filter(j => j.status==='Active').length} 
                color="bg-purple-100" 
                textColor="text-purple-600"
              />
            </div>
          )}
          {renderContent()}
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 flex-shrink-0">
          <div className="space-y-4 sticky top-24">
            {/* Profile Strength */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Profile Strength</h3>
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">60% Complete</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Email verified
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  Add skills
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  Upload resume
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// Stat Box Component
const StatBox = ({ icon: Icon, label, value, color, textColor }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
    <div className={`${color} p-3 rounded-lg`}>
      <Icon className={textColor} size={22}/>
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

export default CompanyDashboard;
