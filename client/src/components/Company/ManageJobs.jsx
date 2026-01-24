import React from "react";
import {
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  ExternalLink,
  Briefcase,
} from "lucide-react";

const ManageJobs = ({ jobs, setJobs }) => {
  const toggleJobStatus = (jobId) => {
    setJobs((prev) =>
      prev.map((job) =>
        job._id === jobId
          ? { ...job, status: job.status === "active" ? "closed" : "active" }
          : job
      )
    );
  };

  // Format date
  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Format salary
  const formatSalary = (salary) => {
    if (!salary || !salary.min) return "Not specified";
    if (salary.min === salary.max) return `$${salary.min.toLocaleString()}`;
    return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`;
  };

  if (jobs.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
          <p className="text-gray-600">Click "Post Job" from the sidebar to create your first job posting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      job.status === "active"
                        ? "bg-green-100 text-green-700"
                        : job.status === "closed"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign size={14} /> {formatSalary(job.salary)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {job.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> Posted {formatDate(job.postedDate)}
                  </span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.skills?.slice(0, 5).map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                  {job.skills?.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{job.skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleJobStatus(job._id)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title={job.status === "active" ? "Close" : "Activate"}
                >
                  {job.status === "active" ? <Clock size={18} /> : <CheckCircle size={18} />}
                </button>

                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit size={18} />
                </button>

                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>

                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageJobs;