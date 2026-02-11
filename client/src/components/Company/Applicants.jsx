import React, { useMemo, useState, useEffect } from "react";
import {
  FileText,
  Search,
  Star,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  MapPin,
  MessageSquare,
  X,
  Eye,
  UserCheck,
  Send,
  Download,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  User,
  Linkedin,
  Github,
  Globe,
  ExternalLink,
  Languages,
} from "lucide-react";

/* ================= JOB SEEKER PROFILE MODAL ================= */
const JobSeekerProfileModal = ({ applicationId, onClose }) => {

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/applications/${applicationId}/jobseeker-profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (data.success) setProfile(data.jobSeeker);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (applicationId) fetchProfile();
}, [applicationId, API_URL]);


  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8">
          <p className="text-red-600">Failed to load profile</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header with Cover Photo */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-xl">
            {profile.coverPhoto && (
              <img
                src={profile.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover rounded-t-xl"
              />
            )}
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          >
            <X size={24} className="text-gray-700" />
          </button>

          {/* Profile Photo & Basic Info */}
          <div className="px-8 pb-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
              <div className="flex-shrink-0">
                {profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt={profile.fullName}
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-xl">
                    {profile.fullName?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="flex-1 mt-16 md:mt-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.fullName}</h2>

                <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      {profile.location}
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-1">
                      <Mail size={16} />
                      {profile.email}
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-1">
                      <Phone size={16} />
                      {profile.phone}
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-3">
                  {profile.resume?.personalInfo?.linkedin && (
                    <a
                      href={profile.resume.personalInfo.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <Linkedin size={18} /> LinkedIn
                    </a>
                  )}
                  {profile.resume?.personalInfo?.github && (
                    <a
                      href={profile.resume.personalInfo.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-700 hover:underline"
                    >
                      <Github size={18} /> GitHub
                    </a>
                  )}
                  {profile.resume?.personalInfo?.website && (
                    <a
                      href={profile.resume.personalInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-indigo-600 hover:underline"
                    >
                      <Globe size={18} /> Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {(profile.bio || profile.resume?.personalInfo?.summary) && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {profile.bio || profile.resume.personalInfo.summary}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content Sections */}
        <div className="px-8 pb-8 space-y-6">
          {/* Skills */}
          {profile.resume?.skills && profile.resume.skills.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Code className="text-indigo-600" size={24} />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.resume.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {profile.resume?.experience && profile.resume.experience.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="text-blue-600" size={24} />
                Experience
              </h3>
              <div className="space-y-4">
                {profile.resume.experience.map((exp, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-bold text-gray-900">{exp.position}</h4>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                    {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar size={14} />
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </p>
                    {exp.description && (
                      <p className="text-gray-700 mt-2 text-sm leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {profile.resume?.education && profile.resume.education.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <GraduationCap className="text-green-600" size={24} />
                Education
              </h3>
              <div className="space-y-4">
                {profile.resume.education.map((edu, idx) => (
                  <div key={idx} className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-bold text-gray-900">
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </h4>
                    <p className="text-green-600 font-medium">{edu.institution}</p>
                    {edu.location && <p className="text-sm text-gray-600">{edu.location}</p>}
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar size={14} />
                      {edu.startDate} - {edu.endDate}
                    </p>
                    {edu.gpa && <p className="text-sm text-gray-700 mt-1">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {profile.resume?.certifications && profile.resume.certifications.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="text-amber-600" size={24} />
                Certifications
              </h3>
              <div className="space-y-3">
                {profile.resume.certifications.map((cert, idx) => (
                  <div key={idx} className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold text-gray-900">{cert.title}</h4>
                    <p className="text-amber-600 font-medium">
                      {cert.issuingOrg} {cert.issueDate && `• ${cert.issueDate}`}
                    </p>
                    {cert.credentialId && (
                      <p className="text-sm text-gray-500 mt-1">ID: {cert.credentialId}</p>
                    )}
                    <div className="flex gap-3 mt-2">
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={14} /> View Credential
                        </a>
                      )}
                      {cert.certificateImageUrl && (
                        <a
                          href={cert.certificateImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          🖼️ View Certificate
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {profile.resume?.projects && profile.resume.projects.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="text-purple-600" size={24} />
                Projects
              </h3>
              <div className="space-y-4">
                {profile.resume.projects.map((proj, idx) => (
                  <div key={idx} className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-bold text-gray-900">{proj.name}</h4>
                    <p className="text-gray-700 mt-1 text-sm">{proj.description}</p>
                    {proj.technologies && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-semibold">Technologies:</span> {proj.technologies}
                      </p>
                    )}
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:underline flex items-center gap-1 mt-2"
                      >
                        <ExternalLink size={14} /> View Project
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {profile.resume?.languages && profile.resume.languages.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Languages className="text-pink-600" size={24} />
                Languages
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {profile.resume.languages.map((lang, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{lang.language}</span>
                    <span className="text-sm px-3 py-1 bg-pink-100 text-pink-700 rounded-full">
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= ENHANCED RESUME VIEWER MODAL ================= */
/* ================= ENHANCED RESUME VIEWER MODAL ================= */
/* ================= ENHANCED RESUME VIEWER MODAL ================= */
const ResumeViewerModal = ({ resumeUrl, candidateName, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  useEffect(() => {
    let objectUrl = null;

    const loadResume = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("=== Resume Viewer Debug ===");
        console.log("resumeUrl received:", resumeUrl);
        console.log("resumeUrl type:", typeof resumeUrl);

        const token = localStorage.getItem("token");

        // Check if resumeUrl is the resume object (built with resume builder)
        if (typeof resumeUrl === 'object' && resumeUrl.personalInfo) {
          console.log("✅ Resume is structured data, generating PDF via export endpoint...");
          
          // Call the existing export endpoint with the resume data
          const response = await fetch(`${API_URL}/api/resume/generate-pdf`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ 
              resume: resumeUrl,
              color: '#2563eb' // Default blue color
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to generate PDF (${response.status})`);
          }

          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          setPdfUrl(objectUrl);
        } 
        // It's an uploaded PDF file URL
        else if (typeof resumeUrl === 'string' || (typeof resumeUrl === 'object' && (resumeUrl.fileUrl || resumeUrl.url))) {
          console.log("✅ Resume is a file URL, fetching...");
          
          const finalUrl = typeof resumeUrl === 'string' ? resumeUrl : 
                          resumeUrl?.fileUrl || resumeUrl?.url || '';
          
          if (!finalUrl || finalUrl.trim() === '') {
            throw new Error("Resume file URL is empty");
          }

          const fetchUrl = finalUrl.startsWith('http') ? finalUrl : `${API_URL}${finalUrl}`;
          console.log("Fetching from:", fetchUrl);
          
          const response = await fetch(fetchUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error(`Failed to load resume file (${response.status})`);
          }

          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          setPdfUrl(objectUrl);
        } 
        else {
          throw new Error("Invalid resume data format");
        }

      } catch (err) {
        console.error("❌ Resume load error:", err);
        setError(err.message || "Failed to load resume");
      } finally {
        setLoading(false);
      }
    };

    if (resumeUrl) {
      loadResume();
    } else {
      setError("No resume data provided");
      setLoading(false);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [resumeUrl, API_URL]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${candidateName.replace(/\s+/g, "_")}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full h-[90vh] flex flex-col">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Resume - {candidateName}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={!pdfUrl || loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
              <p className="text-gray-600">Generating PDF resume...</p>
            </div>
          )}

          {error && (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
                <p className="text-red-600 font-semibold mb-2">Failed to Load Resume</p>
                <p className="text-red-500 text-sm mb-4">{error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {!loading && !error && pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="Resume Viewer"
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= INTERVIEW SCHEDULING MODAL ================= */
const InterviewScheduleModal = ({ application, onClose, onSchedule }) => {
  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    type: "video",
    location: "",
    notes: "",
  });

  const handleSchedule = () => {
    if (!interviewData.date || !interviewData.time) {
      alert("Please select date and time");
      return;
    }
    onSchedule(interviewData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            Schedule Interview
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-indigo-600">Candidate:</p>
            <p className="font-semibold text-gray-900">
              {application.name || "Candidate"}
            </p>
            <p className="text-sm text-gray-600">
              Position: {application.job || "Position"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Date
              </label>
              <input
                type="date"
                value={interviewData.date}
                onChange={(e) =>
                  setInterviewData({ ...interviewData, date: e.target.value })
                }
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={interviewData.time}
                onChange={(e) =>
                  setInterviewData({ ...interviewData, time: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Type
            </label>
            <select
              value={interviewData.type}
              onChange={(e) =>
                setInterviewData({ ...interviewData, type: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="video">Video Call</option>
              <option value="phone">Phone Call</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>

          {interviewData.type === "in-person" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={interviewData.location}
                onChange={(e) =>
                  setInterviewData({
                    ...interviewData,
                    location: e.target.value,
                  })
                }
                placeholder="Office address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          )}

          {interviewData.type === "video" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Link
              </label>
              <input
                type="text"
                value={interviewData.location}
                onChange={(e) =>
                  setInterviewData({
                    ...interviewData,
                    location: e.target.value,
                  })
                }
                placeholder="Zoom/Google Meet link"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              rows={3}
              value={interviewData.notes}
              onChange={(e) =>
                setInterviewData({ ...interviewData, notes: e.target.value })
              }
              placeholder="Any special instructions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Schedule Interview
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= HIRING DECISION MODAL ================= */
const HiringDecisionModal = ({ application, onClose, onDecide }) => {
  const [decision, setDecision] = useState("accepted");
  const [feedback, setFeedback] = useState("");

  const handleDecide = () => {
    if (!feedback.trim()) {
      alert("Please provide feedback for the candidate");
      return;
    }
    onDecide({ decision, feedback });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Hiring Decision
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Candidate:</p>
            <p className="font-semibold text-gray-900">
              {application.name || "Candidate"}
            </p>
            <p className="text-sm text-gray-600">
              Position: {application.job || "Position"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Decision
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                <input
                  type="radio"
                  name="decision"
                  value="accepted"
                  checked={decision === "accepted"}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="font-medium">Accept Candidate</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-500 has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                <input
                  type="radio"
                  name="decision"
                  value="rejected"
                  checked={decision === "rejected"}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <XCircle className="text-red-600" size={20} />
                  <span className="font-medium">Reject Candidate</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback (will be sent to candidate) *
            </label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDecide}
            className={`px-6 py-2 text-white rounded-lg ${
              decision === "accepted"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {decision === "accepted" ? "Accept Candidate" : "Reject Candidate"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= EMAIL TEMPLATE MODAL ================= */
const EmailTemplateModal = ({ application, onClose, onSend }) => {
  const [emailData, setEmailData] = useState({
    template: "interview",
    subject: "",
    body: "",
  });

  const templates = {
    interview: {
      subject: `Interview Invitation - ${application.job || "Position"}`,
      body: `Dear ${application.name || "Candidate"},\n\nWe are pleased to invite you for an interview for the position of ${application.job || "Position"} at our company.\n\nWe look forward to discussing your qualifications and learning more about your interest in joining our team.\n\nBest regards,\nHR Team`,
    },
    acceptance: {
      subject: `Congratulations! Job Offer - ${application.job || "Position"}`,
      body: `Dear ${application.name || "Candidate"},\n\nCongratulations! We are delighted to offer you the position of ${application.job || "Position"} at our company.\n\nWe were impressed by your qualifications and believe you will be a great addition to our team.\n\nPlease find the detailed offer letter attached.\n\nBest regards,\nHR Team`,
    },
    rejection: {
      subject: `Application Update - ${application.job || "Position"}`,
      body: `Dear ${application.name || "Candidate"},\n\nThank you for your interest in the ${application.job || "Position"} position at our company.\n\nAfter careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.\n\nWe appreciate the time you invested in the application process and wish you the best in your job search.\n\nBest regards,\nHR Team`,
    },
    custom: {
      subject: "",
      body: "",
    },
  };

  useEffect(() => {
    const template = templates[emailData.template];
    setEmailData({
      template: emailData.template,
      subject: template.subject,
      body: template.body,
    });
  }, [emailData.template]);

  const handleSend = () => {
    if (!emailData.subject.trim() || !emailData.body.trim()) {
      alert("Please fill in subject and message");
      return;
    }
    onSend(emailData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Send Email</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">To:</p>
            <p className="font-semibold text-gray-900">
              {application.email || "candidate@email.com"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Template
            </label>
            <select
              value={emailData.template}
              onChange={(e) =>
                setEmailData({ ...emailData, template: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="interview">Interview Invitation</option>
              <option value="acceptance">Job Offer</option>
              <option value="rejection">Rejection Letter</option>
              <option value="custom">Custom Email</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) =>
                setEmailData({ ...emailData, subject: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              rows={10}
              value={emailData.body}
              onChange={(e) =>
                setEmailData({ ...emailData, body: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Send size={18} />
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */
const Applicants = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
  
  const [applicationsData, setApplicationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState(null);

  // Modal states
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedJobSeekerId, setSelectedJobSeekerId] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showHiringModal, setShowHiringModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const statuses = ["All", "New", "Reviewing", "Interview Scheduled", "Rejected", "Hired"];

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [filterStatus]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const statusParam = filterStatus !== "All" ? `&status=${filterStatus}` : "";

      const res = await fetch(
        `${API_URL}/api/applications/company?page=1&limit=100${statusParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch applications");
      }

      if (data.success) {
        setApplicationsData(data.applications || []);
      }
    } catch (err) {
      setError(err.message);
      setApplicationsData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/applications/company/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      
      const statusMap = {
        'New': 'pending',
        'Reviewing': 'reviewing',
        'Interview Scheduled': 'interview',
        'Hired': 'accepted',
        'Rejected': 'rejected'
      };

      const res = await fetch(
        `${API_URL}/api/applications/${applicationId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: statusMap[newStatus] || newStatus.toLowerCase()
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setApplicationsData(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus }
              : app
          )
        );
        
        if (selectedApplication?.id === applicationId) {
          setSelectedApplication(prev => ({ ...prev, status: newStatus }));
        }
        
        fetchStats();
        alert('Status updated successfully');
      } else {
        throw new Error(data?.message || 'Failed to update status');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleScheduleInterview = async (interviewData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/interviews/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          ...interviewData,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Interview scheduled successfully! Email notification sent to candidate.");
        setShowInterviewModal(false);
        await fetchApplications();
        fetchStats();
      } else {
        alert(data?.message || "Failed to schedule interview");
      }
    } catch (error) {
      console.error("Schedule interview error:", error);
      alert("Failed to schedule interview");
    }
  };

  const handleHiringDecision = async (decisionData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/applications/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          ...decisionData,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`Candidate ${decisionData.decision === 'accepted' ? 'accepted' : 'rejected'} successfully! Email notification sent.`);
        setShowHiringModal(false);
        await fetchApplications();
        fetchStats();
      } else {
        alert(data?.message || "Failed to save decision");
      }
    } catch (error) {
      console.error("Hiring decision error:", error);
      alert("Failed to save decision");
    }
  };

  const handleSendEmail = async (emailData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/emails/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          recipientEmail: selectedApplication.email,
          subject: emailData.subject,
          body: emailData.body,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Email sent successfully!");
        setShowEmailModal(false);
      } else {
        alert(data?.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Send email error:", error);
      alert("Failed to send email");
    }
  };

  const filteredApplications = useMemo(() => {
    return applicationsData.filter((app) => {
      const matchesFilter = filterStatus === "All" || app.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        app.name.toLowerCase().includes(q) || 
        app.job.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [applicationsData, filterStatus, searchQuery]);

  const getStatusColor = (status) => {
    const colors = {
      "New": "bg-green-100 text-green-700",
      "Reviewing": "bg-yellow-100 text-yellow-700",
      "Interview Scheduled": "bg-blue-100 text-blue-700",
      "Rejected": "bg-red-100 text-red-700",
      "Hired": "bg-purple-100 text-purple-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // ✅ FIXED FUNCTION - Gets the correct jobSeeker ID

const handleProfileClick = (app) => {
  if (!app?.id) {
    alert("Application ID missing");
    return;
  }
  setSelectedJobSeekerId(app.id); // ✅ store applicationId in this state
  setShowProfileModal(true);
};


  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 mb-6 rounded-xl shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Applicants</h1>
        <p className="text-gray-600 text-sm md:text-base">Review and manage job applications</p>
      </div>

      <div className="px-2 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1 font-medium">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
              <p className="text-xs text-gray-600 mb-1 font-medium">New</p>
              <p className="text-3xl font-bold text-green-700">{stats.pending}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200">
              <p className="text-xs text-gray-600 mb-1 font-medium">Reviewing</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.reviewing}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <p className="text-xs text-gray-600 mb-1 font-medium">Interview</p>
              <p className="text-3xl font-bold text-blue-700">{stats.interview}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
              <p className="text-xs text-gray-600 mb-1 font-medium">Hired</p>
              <p className="text-3xl font-bold text-purple-700">{stats.accepted}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, job, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    filterStatus === status
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="mt-3 text-gray-600">Loading applications...</p>
          </div>
        )}

        {/* Applications Grid */}
        {!loading && (
          <div className="grid grid-cols-12 gap-4">
            {/* List */}
            <div className="col-span-3">
              <div className="space-y-3 max-h-[calc(100vh-450px)] overflow-y-auto pr-2">
                {filteredApplications.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                  </div>
                ) : (
                  filteredApplications.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApplication(app)}
                      className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedApplication?.id === app.id
                          ? "border-indigo-500 ring-2 ring-indigo-200 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {app.profilePhoto ? (
                          <img 
                            src={app.profilePhoto} 
                            alt={app.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                            {app.name[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">{app.name}</h3>
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star size={14} fill="currentColor" />
                              <span className="text-xs md:text-sm font-medium">{app.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs md:text-sm text-gray-500">{app.experience}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3 font-medium truncate">{app.job}</p>

                      <p className="text-xs text-gray-600 mb-3 line-clamp-1">
                        {app.skills.slice(0, 5).join(' • ')}
                        {app.skills.length > 5 && ` • +${app.skills.length - 5} more`}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                        <span className="text-xs text-gray-500">{app.appliedDate}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          {/* Detail Panel */}
            <div className="col-span-9">
              {selectedApplication ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 max-h-[calc(100vh-450px)] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 pb-6 border-b">
                      <div className="flex items-center gap-4">
                        {/* ✅ CLICKABLE PROFILE PHOTO IN DETAIL */}
                        {selectedApplication.profilePhoto ? (
                          <img 
                            src={selectedApplication.profilePhoto} 
                            alt={selectedApplication.name}
                            onClick={() => handleProfileClick(selectedApplication)}
                            className="w-20 h-20 rounded-full object-cover cursor-pointer hover:ring-4 hover:ring-indigo-300 transition-all"
                          />
                        ) : (
                          <div 
                            onClick={() => handleProfileClick(selectedApplication)}
                            className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-3xl cursor-pointer hover:ring-4 hover:ring-indigo-300 transition-all"
                          >
                            {selectedApplication.name[0]}
                          </div>
                        )}
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedApplication.name}</h2>
                          <p className="text-gray-600 mb-2">{selectedApplication.job}</p>

                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star size={16} fill="currentColor" />
                              <span className="font-semibold">{selectedApplication.rating}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 font-medium">{selectedApplication.experience}</span>
                            {selectedApplication.location && (
                              <>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-1">
                                  <MapPin size={14} className="text-gray-500" />
                                  <span className="text-gray-600">{selectedApplication.location}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail size={18} className="text-indigo-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 mb-0.5 font-medium">Email</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{selectedApplication.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone size={18} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5 font-medium">Phone</p>
                          <p className="text-sm font-semibold text-gray-900">{selectedApplication.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    {selectedApplication.coverLetter && (
                      <div className="mb-6">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <MessageSquare size={18} />
                          Cover Letter
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <button 
                        onClick={() => selectedApplication.resume && setShowResumeModal(true)}
                        disabled={!selectedApplication.resume}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Eye size={18} />
                        View Resume
                      </button>

                      <button 
                        onClick={() => setShowInterviewModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm"
                      >
                        <Calendar size={18} />
                        Schedule Interview
                      </button>

                      <button 
                        onClick={() => setShowEmailModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                      >
                        <Send size={18} />
                        Send Email
                      </button>

                      <button 
                        onClick={() => setShowHiringModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm col-span-3"
                      >
                        <UserCheck size={18} />
                        Make Hiring Decision
                      </button>
                    </div>

                    {/* Status Update */}
                    <div className="border-t pt-5">
                      <h3 className="font-bold text-gray-900 mb-3">Update Status</h3>
                      <div className="flex flex-wrap gap-2">
                        {["New", "Reviewing", "Interview Scheduled", "Rejected", "Hired"].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(selectedApplication.id, status)}
                            className={`px-3 py-2 text-sm rounded-lg transition-all font-semibold ${
                              selectedApplication.status === status
                                ? "bg-indigo-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status History */}
                    {selectedApplication.statusHistory && selectedApplication.statusHistory.length > 0 && (
                      <div className="border-t pt-5 mt-5">
                        <h3 className="font-bold text-gray-900 mb-3">Status History</h3>
                        <div className="space-y-2">
                          {selectedApplication.statusHistory.map((history, idx) => (
                            <div key={idx} className="flex flex-wrap items-center gap-3 text-sm bg-gray-50 p-3 rounded-lg">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(history.status)}`}>
                                {history.status}
                              </span>
                              <span className="text-gray-600 font-medium">
                                {new Date(history.updatedAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                              {history.notes && <span className="text-gray-600">• {history.notes}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full min-h-[400px] flex items-center justify-center p-12">
                  <div className="text-center">
                    <FileText size={56} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Application Selected</h3>
                    <p className="text-gray-500 text-sm">Select an application from the list to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showResumeModal && selectedApplication && selectedApplication.resume && (
        <ResumeViewerModal
          resumeUrl={selectedApplication.resume}
          candidateName={selectedApplication.name}
          onClose={() => setShowResumeModal(false)}
        />
      )}

     {showProfileModal && selectedJobSeekerId && (
  <JobSeekerProfileModal
    applicationId={selectedJobSeekerId}
    onClose={() => {
      setShowProfileModal(false);
      setSelectedJobSeekerId(null);
    }}
  />
)}

      {showInterviewModal && selectedApplication && (
        <InterviewScheduleModal
          application={selectedApplication}
          onClose={() => setShowInterviewModal(false)}
          onSchedule={handleScheduleInterview}
        />
      )}

      {showHiringModal && selectedApplication && (
        <HiringDecisionModal
          application={selectedApplication}
          onClose={() => setShowHiringModal(false)}
          onDecide={handleHiringDecision}
        />
      )}

      {showEmailModal && selectedApplication && (
        <EmailTemplateModal
          application={selectedApplication}
          onClose={() => setShowEmailModal(false)}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
};

export default Applicants;
