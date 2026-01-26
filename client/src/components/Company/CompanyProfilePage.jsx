import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Link as LinkIcon,
  Edit2, 
  Save, 
  X, 
  Plus,
  Camera
} from 'lucide-react';

const INDUSTRIES = [
  "IT","Finance","Healthcare","Education","Manufacturing","Retail",
  "Real Estate","Telecommunications","Transportation","Media",
  "Agriculture","Pharmaceuticals","Construction","Government",
  "Consulting","Other"
];

const CompanyProfile = ({ companyData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Use local state to manage changes and instant preview
  const [localCompanyData, setLocalCompanyData] = useState(companyData || {});

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    location: '',
    website: '', 
    description: '',
    industry: '',
    totalEmployees: '',
  });

  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const token = localStorage.getItem('token');
  const API_BASE = "http://localhost:5001/api/companies/profile";

  useEffect(() => {
    if (companyData) {
      setLocalCompanyData(companyData);
      setFormData({
        companyName: companyData.companyName || '',
        email: companyData.email || '',
        location: companyData.location || '',
        website: companyData.website || '',
        description: companyData.description || '',
        industry: companyData.industry || '',
        totalEmployees: companyData.totalEmployees || '',
      });
    }
  }, [companyData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate?.();
      } else {
        console.error("Update failed:", await response.text());
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    if (companyData) {
      setFormData({
        companyName: companyData.companyName || '',
        email: companyData.email || '',
        location: companyData.location || '',
        website: companyData.website || '',
        description: companyData.description || '',
        industry: companyData.industry || '',
        totalEmployees: companyData.totalEmployees || '',
      });
    }
    setIsEditing(false);
  };

  // ✅ Photo upload with instant preview
  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Max 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/${type === "profile" ? "profile-photo" : "cover-photo"}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ image: reader.result }),
          }
        );

        if (!response.ok) {
          const text = await response.text();
          console.error("Upload failed:", response.status, text);
          return;
        }

        // ✅ Update local state instantly
        const updatedImage = reader.result;
        setLocalCompanyData((prev) => ({
          ...prev,
          [type === "profile" ? "profilePhoto" : "coverPhoto"]: updatedImage,
        }));

        onUpdate?.(); // optional parent refresh
      } catch (err) {
        console.error("Upload failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      
      {/* File Inputs */}
      <input type="file" ref={profileInputRef} className="hidden" accept="image/*"
        onChange={(e) => handlePhotoUpload(e, 'profile')} />
      <input type="file" ref={coverInputRef} className="hidden" accept="image/*"
        onChange={(e) => handlePhotoUpload(e, 'cover')} />

      {/* Cover + Profile + Name + BIO Combined */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
        <div className="h-48 bg-gray-100 relative">
          {localCompanyData?.coverPhoto ? (
            <img src={localCompanyData.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          )}
          <button
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-lg hover:bg-white shadow-lg flex items-center gap-1"
            onClick={() => coverInputRef.current?.click()}
          >
            <Camera size={16} />
          </button>
        </div>

        <div className="px-8 pb-6 -mt-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-40 h-40 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white overflow-hidden">
                {localCompanyData?.profilePhoto ? (
                  <img src={localCompanyData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  formData.companyName?.[0]?.toUpperCase() || "C"
                )}
              </div>
              <button
                className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg border border-gray-200"
                onClick={() => profileInputRef.current?.click()}
              >
                <Camera size={18} className="text-gray-700" />
              </button>
            </div>

            {/* Company Name */}
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                  className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-indigo-500 w-full"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">
                  {formData.companyName || "Add Company Name"}
                </h1>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4 md:mt-0">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Edit2 size={18} /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Save size={14} /> Save 
                </button>
              </>
            )}
          </div>
        </div>

        {/* BIO INSERTED BELOW NAME */}
        <div className="px-8 pb-8">
          {isEditing ? (
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Write something about your company..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          ) : (
            <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
              {formData.description?.trim()
                ? formData.description
                : "No company bio added yet."}
            </p>
          )}
        </div>
      </div>

      {/* Contact & Info */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact & Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['email', 'location', 'website', 'industry', 'totalEmployees']
            .map((field) => (
            <div key={field}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                {field === 'email' && <Mail size={16} />}
                {field === 'location' && <MapPin size={16} />}
                {field === 'website' && <LinkIcon size={16} />}
                <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
              </label>

              {isEditing ? (
                field === 'industry' ? (
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field === 'website' ? 'url' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    placeholder={`Enter ${field}`}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                )
              ) : (
                <p className="text-gray-900 py-3">
                  {formData[field] || 'Not provided'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CompanyProfile;
