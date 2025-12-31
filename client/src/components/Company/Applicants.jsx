import React, { useMemo, useState } from "react";
import {
  FileText,
  Search,
  Star,
  Mail,
  Phone,
  MoreVertical,
  Calendar,
  CheckCircle,
  Download,
  XCircle,
} from "lucide-react";

const Applicants = ({ applications = [], handleStatusChange }) => {
  const dummyApplications = [
    {
      id: 1,
      name: "Sarah Johnson",
      job: "Senior React Developer",
      status: "New",
      rating: 4.5,
      experience: "5 years",
      email: "sarah.j@email.com",
      phone: "+1-555-0123",
      appliedDate: "2024-12-28",
      skills: ["React", "Node.js", "TypeScript"],
    },
    {
      id: 2,
      name: "Michael Chen",
      job: "Senior React Developer",
      status: "Reviewing",
      rating: 4.8,
      experience: "7 years",
      email: "michael.c@email.com",
      phone: "+1-555-0456",
      appliedDate: "2024-12-27",
      skills: ["React", "Python", "AWS"],
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      job: "Product Manager",
      status: "Interview Scheduled",
      rating: 4.6,
      experience: "6 years",
      email: "emily.r@email.com",
      phone: "+1-555-0789",
      appliedDate: "2024-12-26",
      skills: ["Product Strategy", "Agile", "Data Analysis"],
    },
    {
      id: 4,
      name: "David Kim",
      job: "Product Manager",
      status: "Rejected",
      rating: 4.3,
      experience: "4 years",
      email: "david.k@email.com",
      phone: "+1-555-0321",
      appliedDate: "2024-12-29",
      skills: ["Roadmapping", "User Research", "SQL"],
    },
    {
      id: 5,
      name: "Aisha Rahman",
      job: "UX Designer",
      status: "Hired",
      rating: 4.9,
      experience: "3 years",
      email: "aisha.r@email.com",
      phone: "+880-17-1234-5678",
      appliedDate: "2024-12-25",
      skills: ["Figma", "User Research", "Design Systems"],
    },
  ];

  // ✅ use dummy data if props are empty
  const dataToShow = applications.length ? applications : dummyApplications;

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const statuses = ["All", "New", "Reviewing", "Interview Scheduled", "Rejected", "Hired"];

  const safeHandleStatusChange =
    handleStatusChange ||
    (() => {
      // no-op, so UI doesn't crash if you didn't pass handleStatusChange
    });

  const filteredApplications = useMemo(() => {
    return dataToShow.filter((app) => {
      const matchesFilter = filterStatus === "All" || app.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        app.name.toLowerCase().includes(q) || app.job.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [dataToShow, filterStatus, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-3">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApplication(app)}
              className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedApplication?.id === app.id
                  ? "border-indigo-500 ring-2 ring-indigo-200"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {app.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.name}</h3>
                    <p className="text-sm text-gray-500">{app.experience}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-medium">{app.rating}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">{app.job}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {app.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    app.status === "New"
                      ? "bg-green-100 text-green-700"
                      : app.status === "Reviewing"
                      ? "bg-yellow-100 text-yellow-700"
                      : app.status === "Interview Scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : app.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {app.status}
                </span>
                <span className="text-xs text-gray-500">{app.appliedDate}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selectedApplication ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                    {selectedApplication.name[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedApplication.name}</h2>
                    <p className="text-gray-600">{selectedApplication.job}</p>

                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <span className="text-sm font-medium">{selectedApplication.rating}</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{selectedApplication.experience}</span>
                    </div>
                  </div>
                </div>

                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail size={18} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedApplication.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone size={18} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedApplication.phone}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-6">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <Calendar size={18} />
                  Schedule Interview
                </button>

                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <CheckCircle size={18} />
                  Move to Next Stage
                </button>

                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download size={18} />
                </button>

                <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <XCircle size={18} />
                </button>
              </div>

              {/* Status */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {["New", "Reviewing", "Interview Scheduled", "Rejected", "Hired"].map((status) => (
                    <button
                      key={status}
                      onClick={() => safeHandleStatusChange(selectedApplication.id, status)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        selectedApplication.status === status
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Application Selected</h3>
              <p className="text-gray-600">Select an application from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applicants;
