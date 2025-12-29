import React, { useState, useEffect } from 'react';
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
  "IT",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Real Estate",
  "Telecommunications",
  "Transportation",
  "Media",
  "Agriculture",
  "Pharmaceuticals",
  "Construction",
  "Government",
  "Consulting",
  "Other"
];

const CompanyProfile = ({ companyData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    website: '',
    description: '',
    industry: '',
    employees: '',
  });

  useEffect(() => {
    if (companyData) {
      setFormData({
        name: companyData.name || '',
        email: companyData.email || '',
        location: companyData.location || '',
        website: companyData.website || '',
        description: companyData.description || '',
        industry: companyData.industry || '',
        employees: companyData.employees || '',
      });
    }
  }, [companyData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/company/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsEditing(false);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    if (companyData) {
      setFormData({
        name: companyData.name || '',
        email: companyData.email || '',
        location: companyData.location || '',
        website: companyData.website || '',
        description: companyData.description || '',
        industry: companyData.industry || '',
        employees: companyData.employees || '',
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Cover & Profile Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
          {isEditing && (
            <button className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white flex items-center gap-2 shadow-lg">
              <Camera size={16} /> Change Cover
            </button>
          )}
        </div>

        <div className="px-8 pb-8 -mt-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-40 h-40 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white">
                {formData.name?.[0]?.toUpperCase() || 'C'}
              </div>
              {isEditing && (
                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 border border-gray-200">
                  <Camera size={18} className="text-gray-700" />
                </button>
              )}
            </div>

            {/* Company Info */}
            <div>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                  className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-indigo-500"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">{formData.name}</h1>
              )}
              <p className="text-gray-700 mt-2">
                {formData.description || 'Add a company description'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
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
                  <X size={18} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Save size={18} /> Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contact & Info */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact & Info</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['email', 'location', 'website', 'industry', 'employees'].map((field) => (
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

        {/* Awards */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Awards</h2>
            </div>
            <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            {companyData?.awards?.length || 0} awards
            </span>
        </div>

        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Briefcase className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 font-medium">No awards added</p>
            <p className="text-gray-400 text-sm mt-1">
            Showcase your company achievements
            </p>
            <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto">
            <Plus size={16} /> Add Award
            </button>
        </div>
        </div>

        {/* Licenses */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Licenses</h2>
            </div>
            <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            {companyData?.licenses?.length || 0} licenses
            </span>
        </div>

        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Briefcase className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 font-medium">No licenses added</p>
            <p className="text-gray-400 text-sm mt-1">
            Add official licenses or certifications
            </p>
            <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto">
            <Plus size={16} /> Add License
            </button>
        </div>
        </div>
    </div>
  );

  
};

export default CompanyProfile;
