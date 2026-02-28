import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Briefcase,
  FileText,
  Bookmark,
  MapPin,
  Tag,
  ChevronRight,
  Clock,
  X,
  Loader2,
  Building2,
  DollarSign,
} from "lucide-react";

/**
 * JobSeekerSearchOverlay
 *
 * Props:
 *  - query        : string  – controlled value from parent (topQuery)
 *  - onChange     : fn      – updates parent topQuery state
 *  - userData     : object  – logged-in job seeker (for token)
 *  - onNavigate   : fn(tab, q?) – calls setActiveTab + optionally sets dashboardSearchQuery
 */
const JobSeekerSearchOverlay = ({ query, onChange, userData, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState({ jobs: [], savedJobs: [], applications: [] });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem("seeker_recent_searches") || "[]"); }
    catch { return []; }
  });

  const overlayRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // ── Close on outside click ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Keyboard: Escape closes ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ── Core search ─────────────────────────────────────────────────────────
  const runSearch = useCallback(async (q) => {
    const term = q.trim();
    if (!term) {
      setResults({ jobs: [], savedJobs: [], applications: [] });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // Run all 3 fetches in parallel
    const [jobsRes, savedRes, appsRes] = await Promise.allSettled([

      // 1) Full-text job search (reuses your existing Atlas Search endpoint)
      fetch(
        `http://localhost:5001/api/jobseeker/jobs/search?query=${encodeURIComponent(term)}&limit=5`,
        { headers }
      ).then((r) => r.json()),

      // 2) Saved jobs search
      fetch(
        `http://localhost:5001/api/jobseeker/search/saved?q=${encodeURIComponent(term)}`,
        { headers }
      ).then((r) => r.json()),

      // 3) Applications search
      fetch(
        `http://localhost:5001/api/jobseeker/search/applications?q=${encodeURIComponent(term)}`,
        { headers }
      ).then((r) => r.json()),
    ]);

    setResults({
      jobs:         jobsRes.status === "fulfilled"  ? (jobsRes.value?.jobs         || []).slice(0, 5) : [],
      savedJobs:    savedRes.status === "fulfilled" ? (savedRes.value?.savedJobs   || []).slice(0, 5) : [],
      applications: appsRes.status === "fulfilled"  ? (appsRes.value?.applications || []).slice(0, 5) : [],
    });

    setLoading(false);
  }, []);

  // ── Debounce trigger ─────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    if (!query.trim()) {
      setResults({ jobs: [], savedJobs: [], applications: [] });
      setLoading(false);
      return;
    }
    debounceTimer.current = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(debounceTimer.current);
  }, [query, runSearch]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const saveRecent = (term) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((r) => r !== term)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem("seeker_recent_searches", JSON.stringify(updated));
  };

  // Navigate to a tab and optionally pass the search query through
  const handleSelect = (tab, passQuery = false) => {
    saveRecent(query);
    onNavigate(tab, passQuery ? query : undefined);
    setOpen(false);
    onChange("");
  };

  const statusColor = (status = "") => {
    const s = status.toLowerCase();
    if (s === "active" || s === "open")     return "bg-green-100 text-green-700";
    if (s === "pending")                    return "bg-yellow-100 text-yellow-700";
    if (s === "reviewed")                   return "bg-blue-100 text-blue-700";
    if (s === "hired" || s === "accepted")  return "bg-purple-100 text-purple-700";
    if (s === "rejected" || s === "closed") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  const hasResults =
    results.jobs.length > 0 ||
    results.savedJobs.length > 0 ||
    results.applications.length > 0;

  const showDropdown = open && (query.trim().length > 0 || recentSearches.length > 0);

  return (
    <div ref={overlayRef} className="relative flex-1 max-w-2xl mx-8">

      {/* ── Input ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search jobs, companies, skills..."
          value={query}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              e.preventDefault();
              saveRecent(query);
              onNavigate("search", query); // go straight to full search tab
              setOpen(false);
            }
          }}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
        {query && (
          <button
            onClick={() => {
              onChange("");
              setResults({ jobs: [], savedJobs: [], applications: [] });
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-[200] overflow-hidden max-h-[540px] overflow-y-auto">

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <Loader2 size={15} className="animate-spin text-indigo-500" />
              Searching…
            </div>
          )}

          {/* No results */}
          {!loading && query.trim() && !hasResults && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-400">
                No results for <span className="font-medium text-gray-600">"{query}"</span>
              </p>
              <button
                onClick={() => handleSelect("search", true)}
                className="mt-2 text-xs text-indigo-600 hover:underline"
              >
                Search all jobs instead →
              </button>
            </div>
          )}

          {/* Recent searches */}
          {!query.trim() && recentSearches.length > 0 && (
            <Section title="Recent Searches" icon={<Clock size={14} />}>
              {recentSearches.map((r) => (
                <button
                  key={r}
                  onClick={() => { onChange(r); setOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 text-left"
                >
                  <Clock size={14} className="text-gray-400 flex-shrink-0" />
                  {r}
                </button>
              ))}
            </Section>
          )}

          {/* Jobs from Atlas Search */}
          {results.jobs.length > 0 && (
            <Section title="Jobs" icon={<Briefcase size={14} />}>
              {results.jobs.map((job) => (
                <ResultRow
                  key={job._id}
                  onClick={() => handleSelect("search", true)}
                  icon={
                    job.company?.logo
                      ? <img src={job.company.logo} alt="" className="w-6 h-6 rounded object-cover flex-shrink-0" />
                      : <Building2 size={15} className="text-indigo-500 flex-shrink-0" />
                  }
                  primary={job.title}
                  secondary={
                    <span className="flex items-center gap-2 flex-wrap">
                      {job.company?.companyName && (
                        <span className="font-medium text-gray-600">{job.company.companyName}</span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1 text-gray-400">
                          <MapPin size={10} />{job.location}
                        </span>
                      )}
                      {job.type && (
                        <span className="bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 text-xs">{job.type}</span>
                      )}
                      {job.salary?.min && (
                        <span className="flex items-center gap-1 text-green-600 text-xs">
                          <DollarSign size={10} />{job.salary.min.toLocaleString()}
                          {job.salary.max ? `–${job.salary.max.toLocaleString()}` : "+"}
                        </span>
                      )}
                    </span>
                  }
                  badge={job.experience}
                  badgeClass="bg-indigo-50 text-indigo-600"
                />
              ))}
              <ViewAll label="See all matching jobs" onClick={() => handleSelect("search", true)} />
            </Section>
          )}

          {/* Saved Jobs */}
          {results.savedJobs.length > 0 && (
            <Section title="Saved Jobs" icon={<Bookmark size={14} />}>
              {results.savedJobs.map((job) => (
                <ResultRow
                  key={job._id}
                  onClick={() => handleSelect("saved")}
                  icon={<Bookmark size={15} className="text-amber-500 flex-shrink-0" />}
                  primary={job.title}
                  secondary={
                    <span className="flex items-center gap-2">
                      {job.company?.companyName && (
                        <span className="text-gray-500">{job.company.companyName}</span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1 text-gray-400">
                          <MapPin size={10} />{job.location}
                        </span>
                      )}
                    </span>
                  }
                  badge={job.type}
                  badgeClass="bg-amber-50 text-amber-700"
                />
              ))}
              <ViewAll label="View saved jobs" onClick={() => handleSelect("saved")} />
            </Section>
          )}

          {/* Applications */}
          {results.applications.length > 0 && (
            <Section title="My Applications" icon={<FileText size={14} />}>
              {results.applications.map((app) => (
                <ResultRow
                  key={app._id}
                  onClick={() => handleSelect("applications")}
                  icon={<FileText size={15} className="text-green-500 flex-shrink-0" />}
                  primary={app.jobTitle || app.job?.title || "Application"}
                  secondary={
                    <span className="flex items-center gap-2">
                      {(app.companyName || app.job?.company?.companyName) && (
                        <span className="text-gray-500">
                          {app.companyName || app.job?.company?.companyName}
                        </span>
                      )}
                    </span>
                  }
                  badge={app.status}
                  badgeClass={statusColor(app.status)}
                />
              ))}
              <ViewAll label="View all applications" onClick={() => handleSelect("applications")} />
            </Section>
          )}

          {/* Hint bar */}
          <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-3">
              <span><kbd className="bg-gray-100 rounded px-1">↵</kbd> search all jobs</span>
              <span><kbd className="bg-gray-100 rounded px-1">Esc</kbd> close</span>
            </span>
            {query.trim() && (
              <button
                onClick={() => handleSelect("search", true)}
                className="text-indigo-500 hover:text-indigo-700 font-medium"
              >
                Full results →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sub-components (same pattern as CompanySearchOverlay) ───────────────────
const Section = ({ title, icon, children }) => (
  <div>
    <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {icon}{title}
    </div>
    {children}
  </div>
);

const ResultRow = ({ onClick, icon, primary, secondary, badge, badgeClass }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left group"
  >
    {icon}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-700">{primary}</p>
      {secondary && <p className="text-xs text-gray-500 truncate mt-0.5">{secondary}</p>}
    </div>
    {badge && (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${badgeClass}`}>
        {badge}
      </span>
    )}
    <ChevronRight size={14} className="text-gray-300 flex-shrink-0 group-hover:text-indigo-400" />
  </button>
);

const ViewAll = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-xs text-indigo-600 hover:text-indigo-800 px-4 py-2 text-right hover:bg-indigo-50 transition-colors font-medium"
  >
    {label} →
  </button>
);

export default JobSeekerSearchOverlay;