import React, { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  Link as LinkIcon,
  Camera,
} from "lucide-react";

const JobSeekerProfile = ({ userData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(null); // 'experience' | 'education' | 'certifications'

  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    skills: [],
    website: "",
    linkedin: "",
    github: "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [itemForm, setItemForm] = useState({});

  const token = localStorage.getItem("token");
  const API_BASE = "http://localhost:5001/api/jobseeker/profile";

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        location: userData.location || "",
        bio: userData.bio || "",
        skills: userData.skills || [],
        website: userData.website || "",
        linkedin: userData.linkedin || "",
        github: userData.github || "",
      });
    }
  }, [userData]);

  // --- Simple input handler ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Photo Upload Handlers ---
  // Backend expected:
  // POST /photo  { image: base64 }
  // POST /cover  { image: base64 }
  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await fetch(`${API_BASE}/${type}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image: reader.result }),
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("Upload failed:", response.status, text);
          return;
        }

        onUpdate?.();
      } catch (err) {
        console.error("Upload failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Save Profile ---
  // Backend expected:
  // PUT /  {fullName,email,...}
  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Profile update failed:", response.status, text);
        return;
      }

      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // --- Skills ---
  const handleAddSkill = () => {
    const s = newSkill.trim();
    if (!s) return;
    if (formData.skills.includes(s)) return;

    setFormData((prev) => ({ ...prev, skills: [...prev.skills, s] }));
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // --- Sub-document Handlers ---
  // Backend expected:
  // POST /experience, /education, /certifications
  const handleAddItem = async (path) => {
    try {
      const response = await fetch(`${API_BASE}/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(itemForm),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Add failed:", response.status, text);
        return;
      }

      setShowModal(null);
      setItemForm({});
      onUpdate?.();
    } catch (err) {
      console.error("Add failed", err);
    }
  };

  // Backend expected:
  // DELETE /experience/:experienceId
  // DELETE /education/:educationId
  // DELETE /certifications/:certificationId
  const handleDeleteItem = async (path, id) => {
    if (!window.confirm("Are you sure?")) return;

    // map correct param name based on your controller route params
    const paramKey =
      path === "experience"
        ? "experienceId"
        : path === "education"
        ? "educationId"
        : "certificationId";

    try {
      const response = await fetch(`${API_BASE}/${path}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Delete failed:", response.status, text);
        return;
      }

      onUpdate?.();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const sections = [
    {
      title: "Work Experience",
      key: "experience",
      icon: <Briefcase className="text-blue-600" />,
      bg: "bg-blue-100",
      path: "experience",
    },
    {
      title: "Education",
      key: "education",
      icon: <GraduationCap className="text-green-600" />,
      bg: "bg-green-100",
      path: "education",
    },
    {
      title: "Certifications",
      key: "certifications",
      icon: <Award className="text-amber-600" />,
      bg: "bg-amber-100",
      path: "certifications",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input
        type="file"
        accept="image/*"
        ref={profileInputRef}
        className="hidden"
        onChange={(e) => handlePhotoUpload(e, "photo")}
      />
      <input
        type="file"
        accept="image/*"
        ref={coverInputRef}
        className="hidden"
        onChange={(e) => handlePhotoUpload(e, "cover")}
      />

      {/* Cover Photo & Profile Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="h-48 relative overflow-hidden bg-gray-100">
          {userData?.coverPhoto ? (
            <img
              src={userData.coverPhoto}
              className="w-full h-full object-cover"
              alt="Cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          )}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-lg hover:bg-white shadow-lg"
          >
            <Camera size={16} />
          </button>
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-20 gap-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              <div className="relative">
                <div className="w-40 h-40 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white overflow-hidden">
                  {userData?.profilePhoto ? (
                    <img
                      src={userData.profilePhoto}
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                  ) : (
                    formData.fullName?.[0]?.toUpperCase() || "U"
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg border border-gray-200"
                >
                  <Camera size={18} className="text-gray-700" />
                </button>
              </div>

              <div className="pb-2">
                {isEditing ? (
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="text-3xl font-bold text-gray-900 mb-2 w-full border-b-2 border-gray-200 focus:border-indigo-600 outline-none"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {formData.fullName || "Add Your Name"}
                  </h1>
                )}

                <div className="flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />{" "}
                    {isEditing ? (
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Location"
                        className="border-b border-gray-200 focus:border-indigo-600 outline-none"
                      />
                    ) : (
                      formData.location || "Location"
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Mail size={16} />{" "}
                    {isEditing ? (
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        className="border-b border-gray-200 focus:border-indigo-600 outline-none"
                      />
                    ) : (
                      formData.email
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
                >
                  <Edit2 size={18} /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // reset values to latest userData
                      if (userData) {
                        setFormData({
                          fullName: userData.fullName || "",
                          email: userData.email || "",
                          phone: userData.phone || "",
                          location: userData.location || "",
                          bio: userData.bio || "",
                          skills: userData.skills || [],
                          website: userData.website || "",
                          linkedin: userData.linkedin || "",
                          github: userData.github || "",
                        });
                      }
                    }}
                    className="px-6 py-3 bg-white border-2 text-gray-700 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg"
                  >
                    <Save size={18} /> Save
                  </button>
                </>
              )}
            </div>
          </div>

          {(formData.bio || isEditing) && (
            <div className="mt-6">
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="Write a short bio..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
              )}
            </div>
          )}

          {/* Extra fields when editing */}
          {isEditing && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone"
                className="w-full p-3 border rounded-xl"
              />
              <input
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="Website"
                className="w-full p-3 border rounded-xl"
              />
              <input
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="LinkedIn"
                className="w-full p-3 border rounded-xl"
              />
              <input
                name="github"
                value={formData.github}
                onChange={handleInputChange}
                placeholder="GitHub"
                className="w-full p-3 border rounded-xl"
              />
            </div>
          )}

          {/* Skills */}
          <div className="mt-6">
            <h3 className="font-bold text-gray-900 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.skills?.length ? (
                formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full flex items-center gap-2"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-indigo-700 hover:text-indigo-900"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No skills added yet</span>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g. React)"
                  className="flex-1 p-3 border rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-3 bg-indigo-600 text-white rounded-xl"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Sections */}
      {sections.map((section) => (
        <div
          key={section.key}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${section.bg} rounded-lg`}>
                {section.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {section.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowModal(section.key);
                setItemForm({});
              }}
              className="flex items-center gap-2 text-indigo-600 font-semibold"
            >
              <Plus size={18} /> Add
            </button>
          </div>

          <div className="space-y-6">
            {userData?.[section.key]?.length > 0 ? (
              userData[section.key].map((item) => (
                <div
                  key={item._id}
                  className="group relative border-l-4 border-indigo-500 pl-6 py-2"
                >
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(section.path, item._id)}
                    className="absolute right-0 top-0 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>

                  <h3 className="text-lg font-bold text-gray-900">
                    {item.title || item.degree || item.name}
                  </h3>
                  <p className="text-indigo-600 font-medium">
                    {item.company || item.school || item.issuer}
                  </p>

                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <Calendar size={14} />
                    {item.startDate
                      ? `${new Date(item.startDate).getFullYear()} - ${
                          item.current
                            ? "Present"
                            : item.endDate
                            ? new Date(item.endDate).getFullYear()
                            : "Present"
                        }`
                      : item.date || ""}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500">
                  No {section.title.toLowerCase()} added yet
                </p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold capitalize">
                Add {showModal}
              </h3>
              <button type="button" onClick={() => setShowModal(null)}>
                <X />
              </button>
            </div>

            <div className="space-y-4">
              {showModal === "experience" && (
                <>
                  <input
                    placeholder="Job Title"
                    className="w-full p-3 border rounded-xl"
                    onChange={(e) =>
                      setItemForm((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                  <input
                    placeholder="Company"
                    className="w-full p-3 border rounded-xl"
                    onChange={(e) =>
                      setItemForm((p) => ({ ...p, company: e.target.value }))
                    }
                  />
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs">Start Date</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded"
                        onChange={(e) =>
                          setItemForm((p) => ({ ...p, startDate: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs">End Date</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded"
                        onChange={(e) =>
                          setItemForm((p) => ({ ...p, endDate: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {showModal === "education" && (
                <>
                  <input
                    placeholder="Degree (e.g. B.S. Computer Science)"
                    className="w-full p-3 border rounded-xl"
                    onChange={(e) =>
                      setItemForm((p) => ({ ...p, degree: e.target.value }))
                    }
                  />
                  <input
                    placeholder="School/University"
                    className="w-full p-3 border rounded-xl"
                    onChange={(e) =>
                      setItemForm((p) => ({ ...p, school: e.target.value }))
                    }
                  />
                </>
              )}

              {showModal === "certifications" && (
                <>
                  <input
                    placeholder="Certification Name"
                    className="w-full p-3 border rounded-xl"
                    onChange={(e) =>
                      setItemForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                  <input
                    placeholder="Issuing Organization"
                    className="w-full p-3 border rounded-xl"
                    onChange={(e) =>
                      setItemForm((p) => ({ ...p, issuer: e.target.value }))
                    }
                  />
                </>
              )}

              <button
                type="button"
                onClick={() => handleAddItem(showModal)}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSeekerProfile;