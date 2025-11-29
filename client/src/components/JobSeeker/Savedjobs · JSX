import React, { useState } from 'react';
import { Bookmark, Trash2, ExternalLink, Building2, MapPin, DollarSign, Clock } from 'lucide-react';

export const SavedJobs = ({ userData }) => {
  const [savedJobs, setSavedJobs] = useState([]);

  const handleRemove = (jobId) => {
    setSavedJobs(savedJobs.filter(job => job._id !== jobId));
  };

  const JobCard = ({ job }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4 flex-1">
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
          onClick={() => handleRemove(job._id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
          <ExternalLink size={16} />
          View Details
        </button>
        <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Apply Now
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
        <p className="text-gray-600">Jobs you've bookmarked for later</p>
      </div>

      <div className="space-y-4">
        {savedJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Bookmark className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved jobs yet</h3>
            <p className="text-gray-600 mb-4">Save jobs you're interested in to view them later</p>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Browse Jobs
            </button>
          </div>
        ) : (
          savedJobs.map((job) => <JobCard key={job._id} job={job} />)
        )}
      </div>
    </div>
  );
};

export default SavedJobs;