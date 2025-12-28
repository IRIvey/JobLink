import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  FileText, 
  Home, 
  Bookmark, 
  Settings, 
  User, 
  MessageSquare, 
  Bell, 
  LogOut, 
  Plus 
} from 'lucide-react';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [companyData, setCompanyData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchCompanyData();
    fetchNotifications();
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/company/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setCompanyData(data.company);
    } catch (err) {
      console.error('Error fetching company data:', err);
    }
  };

  const fetchNotifications = () => {
    // Dummy notifications
    setNotifications([
      { id: 1, message: 'New application received!', read: false },
      { id: 2, message: 'Job posting approved.', read: true },
    ]);
  };

  const fetchJobs = () => {
    // Dummy jobs
    setJobs([
      { id: 1, title: 'Frontend Developer', applicants: 12, status: 'Active' },
      { id: 2, title: 'Backend Developer', applicants: 8, status: 'Active' },
    ]);
  };

  const fetchApplications = () => {
    // Dummy applications
    setApplications([
      { id: 1, name: 'Alice', jobTitle: 'Frontend Developer', status: 'New' },
      { id: 2, name: 'Bob', jobTitle: 'Backend Developer', status: 'Reviewed' },
    ]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    window.location.href = '/';
  };

  const navigation = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'jobs', label: 'Job Postings', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'talent', label: 'Talent Pool', icon: Bookmark },
    { id: 'analytics', label: 'Analytics', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900">Total Job Postings</h3>
              <p className="text-2xl mt-2">{jobs.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900">Total Applications</h3>
              <p className="text-2xl mt-2">{applications.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900">Active Jobs</h3>
              <p className="text-2xl mt-2">{jobs.filter(j => j.status === 'Active').length}</p>
            </div>
          </div>
        );
      case 'jobs':
        return (
          <div className="space-y-4">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2" onClick={() => alert('Add Job')}>
              <Plus size={16}/> Post New Job
            </button>
            {jobs.map(job => (
              <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.applicants} applicants</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-white ${job.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        );
      case 'applications':
        return (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{app.name}</h3>
                  <p className="text-sm text-gray-500">{app.jobTitle}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-white ${app.status === 'New' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        );
      case 'profile':
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold text-gray-900 text-xl mb-4">Company Profile</h2>
            <p><strong>Name:</strong> {companyData?.companyName || '-'}</p>
            <p><strong>Email:</strong> {companyData?.email || '-'}</p>
            <p><strong>Industry:</strong> {companyData?.industry || '-'}</p>
            <p><strong>Location:</strong> {companyData?.location || '-'}</p>
            <p><strong>Total Employees:</strong> {companyData?.totalEmployees || '-'}</p>
            <p className="mt-2"><strong>Description:</strong> {companyData?.description || '-'}</p>
          </div>
        );
      default:
        return <div>Coming Soon</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Briefcase className="text-indigo-600" size={32}/>
              <span className="text-2xl font-bold text-gray-900">JobLink</span>
            </div>
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search candidates, jobs..."
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell size={24}/>
                {notifications.filter(n => !n.read).length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <MessageSquare size={24}/>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {companyData?.companyName?.[0] || 'C'}
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Logout">
                  <LogOut size={20}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 flex gap-6">
        {/* Left Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-20">
            <nav className="p-4 space-y-1">
              {navigation.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Icon size={20}/>
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{renderContent()}</main>

        {/* Right Sidebar */}
        <aside className="w-80 flex-shrink-0 space-y-4 sticky top-20">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Job Postings</span>
                <span className="font-semibold text-gray-900">{jobs.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Applications</span>
                <span className="font-semibold text-gray-900">{applications.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Jobs</span>
                <span className="font-semibold text-gray-900">{jobs.filter(j => j.status==='Active').length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {notifications.map(n => (
                <li key={n.id} className={`${!n.read ? 'font-medium' : ''}`}>{n.message}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CompanyDashboard;
