import React from "react";
import { Briefcase, Users, Eye, CheckCircle, MapPin } from "lucide-react";

const DashboardHome = ({ jobs, applications }) => {
  const activeJobs = jobs.filter((j) => j.status === "Active");
  const newApps = applications.filter((a) => a.status === "New");
  const totalViews = jobs.reduce((sum, job) => sum + job.views, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Active Jobs" value={activeJobs.length} color="indigo" trend="+2 this week" />
        <StatCard icon={Users} label="New Applications" value={newApps.length} color="green" trend="+12 today" />
        <StatCard icon={Eye} label="Total Views" value={totalViews} color="blue" trend="+45 this week" />
        <StatCard
          icon={CheckCircle}
          label="Interviews"
          value={applications.filter((a) => a.status === "Interview Scheduled").length}
          color="purple"
          trend="3 scheduled"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Apps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700">View All</button>
          </div>

          <div className="space-y-3">
            {applications.slice(0, 4).map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                    {app.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{app.name}</p>
                    <p className="text-sm text-gray-500">{app.job}</p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    app.status === "New"
                      ? "bg-green-100 text-green-700"
                      : app.status === "Reviewing"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Top Performing Jobs</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700">View All</button>
          </div>

          <div className="space-y-3">
            {jobs.filter((j) => j.status === "Active").map((job) => (
              <div key={job.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-gray-900">{job.title}</p>
                  <span className="text-sm text-gray-500">{job.applicants} apps</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye size={14} /> {job.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {job.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// StatCard (local helper)
const StatCard = ({ icon: Icon, label, value, color, trend }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
          {trend}
        </span>
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{label}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

export default DashboardHome;
