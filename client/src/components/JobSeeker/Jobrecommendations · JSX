import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  DollarSign, 
  Clock, 
  Bookmark, 
  ExternalLink,
  TrendingUp,
  Building2,
  Users
} from 'lucide-react';

const JobRecommendations = ({ userData }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/jobs/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/jobs/${jobId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setSavedJobs([...savedJobs, jobId]);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const JobCard = ({ job }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="text-indigo-600" size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {job.title || 'Software Engineer'}
            </h3>
            <p className="text-gray-600 mb-2">{job.company || 'Tech Company Inc.'}</p>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                {job.location || 'San Francisco, CA'}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                {job.type || 'Full-time'}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign size={16} />
                {job.salary || '$100k - $150k'}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => handleSaveJob(job._id)}
          className={`p-2 rounded-lg hover:bg-gray-100 ${
            savedJobs.includes(job._id) ? 'text-indigo-600' : 'text-gray-400'
          }`}
        >
          <Bookmark size={20} fill={savedJobs.includes(job._id) ? 'currentColor' : 'none'} />
        </button>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">
        {job.description || 'We are looking for a talented professional to join our team...'}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {(job.skills || ['React', 'Node.js', 'MongoDB']).slice(0, 5).map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-green-600">
          <TrendingUp size={16} />
          <span>90% Match</span>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <ExternalLink size={16} />
            View Details
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-sm p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles size={32} />
          <h1 className="text-3xl font-bold">Recommended for You</h1>
        </div>
        <p className="text-indigo-100 text-lg">
          Jobs that match your skills and preferences
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Sparkles className="text-indigo-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">New Matches</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Profile Views</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Companies Interested</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Top Matches ({recommendations.length || '12'} jobs)
          </h2>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option>Best Match</option>
            <option>Most Recent</option>
            <option>Highest Salary</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <>
            {[1, 2, 3, 4, 5].map((item) => (
              <JobCard key={item} job={{}} />
            ))}
          </>
        ) : (
          recommendations.map((job) => (
            <JobCard key={job._id} job={job} />
          ))
        )}
      </div>
    </div>
  );
};

export default JobRecommendations;

