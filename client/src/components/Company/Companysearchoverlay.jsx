import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Briefcase,
  FileText,
  Users,
  MapPin,
  Tag,
  ChevronRight,
  Clock,
  X,
  Loader2,
} from "lucide-react";

/**
 * CompanySearchOverlay
 *
 * Props:
 *  - query        : string  – controlled value from parent (globalSearch)
 *  - onChange     : fn      – updates parent globalSearch state
 *  - jobs         : array   – already-fetched jobs from CompanyDashboard
 *  - applications : array   – already-fetched applications from CompanyDashboard
 *  - onNavigate   : fn(tab) – calls setActiveTab in parent
 */
const CompanySearchOverlay = ({ query, onChange, jobs = [], applications = [], onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState({ jobs: [], applications: [], seekers: [] });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem("company_recent_searches") || "[]"); }
    catch { return []; }
  });

  const inputRef = useRef(null);
  const overlayRef = useRef(null);
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

  // ── Search logic ────────────────────────────────────────────────────────
  const runSearch = useCallback(
    async (q) => {
      const term = q.trim().toLowerCase();
      if (!term) { setResults({ jobs: [], applications: [], seekers: [] }); return; }

      setLoading(true);

      // 1) Search local jobs (already loaded)
      const matchedJobs = jobs.filter((j) =>
        [j.title, j.location, j.status, j.type, j.description]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(term))
      ).slice(0, 5);

      // 2) Search local applications
      const matchedApps = applications.filter((a) =>
        [a.applicantName, a.applicantEmail, a.status, a.jobTitle]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(term))
      ).slice(0, 5);

      // 3) Search job seekers via API
      let matchedSeekers = [];
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5001/api/companies/search-seekers?q=${encodeURIComponent(term)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          matchedSeekers = (data.seekers || []).slice(0, 5);
        }
      } catch (_) {
        // silently fail – seeker search is best-effort
      }

      setResults({ jobs: matchedJobs, applications: matchedApps, seekers: matchedSeekers });
      setLoading(false);
    },
    [jobs, applications]
  );

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    if (query.trim().length === 0) {
      setResults({ jobs: [], applications: [], seekers: [] });
      setLoading(false);
      return;
    }
    debounceTimer.current = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(debounceTimer.current);
  }, [query, runSearch]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const saveRecent = (term) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((r) => r !== term)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem("company_recent_searches", JSON.stringify(updated));
  };

  const handleSelect = (tab) => {
    saveRecent(query);
    onNavigate(tab);
    setOpen(false);
    onChange("");
  };

  const hasResults =
    results.jobs.length > 0 || results.applications.length > 0 || results.seekers.length > 0;
  const showDropdown = open && (query.trim().length > 0 || recentSearches.length > 0);

  // ── Status badge colour ──────────────────────────────────────────────────
  const statusColor = (status = "") => {
    const s = status.toLowerCase();
    if (s === "open" || s === "active") return "bg-green-100 text-green-700";
    if (s === "closed") return "bg-red-100 text-red-700";
    if (s === "pending") return "bg-yellow-100 text-yellow-700";
    if (s === "hired") return "bg-purple-100 text-purple-700";
    if (s === "reviewed") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div ref={overlayRef} className="relative flex-1 max-w-2xl mx-8">
      {/* ── Input ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search jobs, applicants, skills..."
          value={query}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
        {query && (
          <button
            onClick={() => { onChange(""); setResults({ jobs: [], applications: [], seekers: [] }); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-[200] overflow-hidden max-h-[520px] overflow-y-auto">

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <Loader2 size={15} className="animate-spin" />
              Searching…
            </div>
          )}

          {/* No results */}
          {!loading && query.trim() && !hasResults && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No results found for <span className="font-medium text-gray-600">"{query}"</span>
            </div>
          )}

          {/* Recent searches (shown when input is empty) */}
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

          {/* Jobs */}
          {results.jobs.length > 0 && (
            <Section title="Job Postings" icon={<Briefcase size={14} />}>
              {results.jobs.map((job) => (
                <ResultRow
                  key={job._id || job.id}
                  onClick={() => handleSelect("jobs")}
                  icon={<Briefcase size={15} className="text-indigo-500 flex-shrink-0" />}
                  primary={job.title}
                  secondary={
                    <span className="flex items-center gap-2 flex-wrap">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {job.location}
                        </span>
                      )}
                      {job.type && <span>{job.type}</span>}
                    </span>
                  }
                  badge={job.status}
                  badgeClass={statusColor(job.status)}
                />
              ))}
              <ViewAll label="View all job postings" onClick={() => handleSelect("jobs")} />
            </Section>
          )}

          {/* Applications */}
          {results.applications.length > 0 && (
            <Section title="Applications" icon={<FileText size={14} />}>
              {results.applications.map((app) => (
                <ResultRow
                  key={app._id || app.id}
                  onClick={() => handleSelect("applications")}
                  icon={<FileText size={15} className="text-green-500 flex-shrink-0" />}
                  primary={app.applicantName || app.applicantEmail || "Applicant"}
                  secondary={app.jobTitle || ""}
                  badge={app.status}
                  badgeClass={statusColor(app.status)}
                />
              ))}
              <ViewAll label="View all applications" onClick={() => handleSelect("applications")} />
            </Section>
          )}

          {/* Job Seekers */}
          {results.seekers.length > 0 && (
            <Section title="Job Seekers" icon={<Users size={14} />}>
              {results.seekers.map((s) => (
                <ResultRow
                  key={s._id || s.id}
                  onClick={() => handleSelect("applications")}
                  icon={
                    s.profilePhoto
                      ? <img src={s.profilePhoto} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                      : <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                          {(s.fullName || s.email || "?")[0].toUpperCase()}
                        </div>
                  }
                  primary={s.fullName || s.email}
                  secondary={
                    <span className="flex items-center gap-2 flex-wrap">
                      {s.location && (
                        <span className="flex items-center gap-1"><MapPin size={11} />{s.location}</span>
                      )}
                      {s.skills?.slice(0, 3).map((sk) => (
                        <span key={sk} className="flex items-center gap-1 bg-indigo-50 text-indigo-600 rounded px-1.5 py-0.5 text-xs">
                          <Tag size={9} />{sk}
                        </span>
                      ))}
                    </span>
                  }
                />
              ))}
            </Section>
          )}

          {/* Keyboard hint */}
          <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-4 text-xs text-gray-400">
            <span><kbd className="bg-gray-100 rounded px-1">↵</kbd> to select</span>
            <span><kbd className="bg-gray-100 rounded px-1">Esc</kbd> to close</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Small sub-components ────────────────────────────────────────────────────
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
      {secondary && (
        <p className="text-xs text-gray-500 truncate mt-0.5">{secondary}</p>
      )}
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

export default CompanySearchOverlay;