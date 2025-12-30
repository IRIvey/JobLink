import React from "react";
import {
  Plus,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Users,
  Eye,
  CheckCircle,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";

const ManageJobs = ({ jobs, setJobs }) => {
  const toggleJobStatus = (jobId) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? { ...job, status: job.status === "Active" ? "Paused" : "Active" }
          : job
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>

        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={18} />
          Post New Job
        </button>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      job.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : job.status === "Paused"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign size={14} /> {job.salary}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {job.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> Posted {job.posted}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-indigo-600" />
                    <span className="text-sm font-medium text-gray-900">{job.applicants} applicants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{job.views} views</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleJobStatus(job.id)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title={job.status === "Active" ? "Pause" : "Activate"}
                >
                  {job.status === "Active" ? <Clock size={18} /> : <CheckCircle size={18} />}
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
