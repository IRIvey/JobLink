import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, MapPin, Briefcase, DollarSign, 
  Filter, X, Sliders, Loader2, CheckCircle, AlertCircle 
} from 'lucide-react';

const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Application States
  const [showApplicationModal, setShowApplicationModal] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);

  const [filters, setFilters] = useState({
    type: '',
    experience: '',
    minSalary: '',
    maxSalary: '',
  });

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive'];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (location) params.append('location', location);
      if (filters.type) params.append('type', filters.type);
      if (filters.experience) params.append('experience', filters.experience);
      if (filters.minSalary) params.append('minSalary', filters.minSalary);
      if (filters.maxSalary) params.append('maxSalary', filters.maxSalary);

      const response = await axios.get(`/api/jobs?${params.toString()}`);
      if (response.data.success) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // --- Application Logic ---
  const handleApplyJob = async (jobId) => {
    setApplicationStatus('submitting');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setApplicationStatus('success');
        setTimeout(() => {
          setShowApplicationModal(null);
          setApplicationStatus(null);
        }, 2000);
      } else {
        setApplicationStatus('error');
        setTimeout(() => setApplicationStatus(null), 3000);
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      setApplicationStatus('error');
      setTimeout(() => setApplicationStatus(null), 3000);
    }
  };

  // --- Modal Component ---
  const ApplicationModal = ({ job, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        {applicationStatus === 'success' ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
            <p className="text-gray-600">Your application has been sent successfully.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Apply for {job.title}</h3>
                <p className="text-gray-600">{job.company?.companyName}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {applicationStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-red-800 text-sm">Failed to submit application. Please try again.</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <p className="text-gray-700">Submit your profile to <strong>{job.company?.companyName}</strong> for this position.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={applicationStatus === 'submitting'}
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyJob(job._id)}
                disabled={applicationStatus === 'submitting'}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {applicationStatus === 'submitting' ? 'Submitting...' : 'Confirm Application'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ type: '', experience: '', minSalary: '', maxSalary: '' });
    setSearchQuery('');
    setLocation('');
  };

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Search Header */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Your Dream Job</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Job title or keywords..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          
          <div className="md:w-64 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition">
            Search
          </button>
        </div>

        <button 
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <Sliders size={20} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </form>

      {/* Filters Section (Omitted for brevity, keep your existing logic) */}
      {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* ... your existing filter JSX ... */}
          </div>
      )}

      {/* Results Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {loading ? 'Searching...' : `Search Results (${jobs.length} jobs found)`}
        </h2>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job._id} className="p-4 border rounded-lg hover:border-indigo-500 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">{job.title}</h3>
                    <p className="text-indigo-600 font-medium">{job.company?.companyName}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={14}/> {job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase size={14}/> {job.type}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowApplicationModal(job)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No jobs found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showApplicationModal && (
        <ApplicationModal 
          job={showApplicationModal} 
          onClose={() => {
            setShowApplicationModal(null);
            setApplicationStatus(null);
          }} 
        />
      )}
    </div>
  );
};

export default JobSearch;