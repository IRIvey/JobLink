import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, MapPin, Loader2 } from "lucide-react";

const JobSearch = ({ initialQuery = "" }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [location, setLocation] = useState("");

  // ✅ keep input synced when dashboard top search sends a new query
  useEffect(() => {
    setSearchQuery(initialQuery || "");
  }, [initialQuery]);

  const fetchJobs = async ({ q, loc } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const finalQ = (q ?? searchQuery).trim();
      const finalLoc = (loc ?? location).trim();

      if (finalQ) params.append("query", finalQ);      // ✅ backend expects "query"
      if (finalLoc) params.append("location", finalLoc);

      // If your backend base URL is http://localhost:5001
      // then set axios.defaults.baseURL once in your app OR use full URL here.
      const res = await axios.get(`http://localhost:5001/api/jobs?${params.toString()}`);

      if (res.data?.success) setJobs(res.data.jobs || []);
      else setJobs([]);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ initial load
  useEffect(() => {
    fetchJobs({ q: initialQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ if initialQuery changes, auto-search again
  useEffect(() => {
    if ((initialQuery || "").trim()) {
      fetchJobs({ q: initialQuery });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto">
      {/* Search Header */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Jobs</h1>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Job title / keywords (e.g., developer, react, intern)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="md:w-72 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (optional)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {loading ? "Searching..." : `Results (${jobs.length})`}
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job._id} className="p-4 border rounded-lg hover:border-indigo-500 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">{job.title}</h3>
                    <p className="text-indigo-600 font-medium">{job.company?.companyName}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {job.location}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{job.type}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No jobs found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch;