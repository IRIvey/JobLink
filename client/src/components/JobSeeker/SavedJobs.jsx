import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Trash2, 
  ExternalLink, 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const SavedJobs = ({ userData }) => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/jobs/user/saved', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSavedJobs(data.jobs || []);
      } else {
        setError(data.message || 'Failed to fetch saved jobs');
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      setError('Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/jobs/${jobId}/save`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSavedJobs(savedJobs.filter(job => job._id !== jobId));
      }
    } catch (error) {
      console.error('Error removing saved job:', error);
    }
  };

  const handleViewDetails = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSelectedJob(data.job);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

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

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    const { min, max, currency = 'USD' } = salary;
    const symbol = currency === 'USD' ? '$' : currency;
    
    if (min && max) {
      return `${symbol}${(min/1000).toFixed(0)}k - ${symbol}${(max/1000).toFixed(0)}k`;
    } else if (min) {
      return `${symbol}${(min/1000).toFixed(0)}k+`;
    }
    return 'Not specified';
  };

  const JobDetailsModal = ({ job, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {job.company?.logo ? (
                <img src={job.company.logo} alt={job.company.companyName} className="w-12 h-12 object-contain" />
              ) : (
                <Building2 className="text-indigo-600" size={32} />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h2>
              <p className="text-lg text-gray-600">{job.company?.companyName || 'Company'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={20} />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock size={20} />
              <span>{job.type}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <DollarSign size={20} />
              <span>{formatSalary(job.salary)}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.company?.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About the Company</h3>
              <p className="text-gray-700">{job.company.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills?.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowApplicationModal(job);
                onClose();
              }}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Apply Now
            </button>
            <button
              onClick={() => {
                handleRemove(job._id);
                onClose();
              }}
              className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium flex items-center gap-2"
            >
              <Trash2 size={20} />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
              <p className="text-gray-700">
                You are about to submit your application for this position. Your profile information will be sent to the employer.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600">Position: <span className="font-medium text-gray-900">{job.title}</span></p>
                <p className="text-sm text-gray-600">Company: <span className="font-medium text-gray-900">{job.company?.companyName}</span></p>
                <p className="text-sm text-gray-600">Location: <span className="font-medium text-gray-900">{job.location}</span></p>
              </div>
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
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applicationStatus === 'submitting' ? 'Submitting...' : 'Confirm Application'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const JobCard = ({ job }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4 flex-1">
          <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {job.company?.logo ? (
              <img src={job.company.logo} alt={job.company.companyName} className="w-12 h-12 object-contain" />
            ) : (
              <Building2 className="text-indigo-600" size={32} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {job.title}
            </h3>
            <p className="text-gray-600 mb-2">{job.company?.companyName || 'Company'}</p>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                {job.type}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign size={16} />
                {formatSalary(job.salary)}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => handleRemove(job._id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {job.description && (
        <p className="text-gray-700 mb-4 line-clamp-2">
          {job.description}
        </p>
      )}

      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 5).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
              +{job.skills.length - 5} more
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button 
          onClick={() => handleViewDetails(job._id)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <ExternalLink size={16} />
          View Details
        </button>
        <button 
          onClick={() => setShowApplicationModal(job)}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Apply Now
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
            <p className="text-gray-600">Jobs you've bookmarked for later ({savedJobs.length})</p>
          </div>
          {savedJobs.length > 0 && (
            <button 
              onClick={fetchSavedJobs}
              className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading saved jobs...</p>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Bookmark className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved jobs yet</h3>
            <p className="text-gray-600 mb-4">Save jobs you're interested in to view them later</p>
            <button 
              onClick={() => window.location.href = '/jobs'}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          savedJobs.map((job) => <JobCard key={job._id} job={job} />)
        )}
      </div>

      {/* Modals */}
      {selectedJob && (
        <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
      
      {showApplicationModal && (
        <ApplicationModal job={showApplicationModal} onClose={() => {
          setShowApplicationModal(null);
          setApplicationStatus(null);
        }} />
      )}
    </div>
  );
};

export default SavedJobs;