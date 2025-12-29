import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Mail, 
  MapPin, 
  Edit2, 
  Save, 
  X, 
  Plus, 
  Award, 
  Link as LinkIcon, 
  Upload, 
  Camera 
} from 'lucide-react';

const CompanyProfile = ({ companyData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    location: '',
    industry: '',
    description: '',
    totalEmployees: 0,
    website: '',
    linkedin: '',
    certificates: [],
    licenses: [],
    logo: '',
    coverPhoto: ''
  });

  useEffect(() => {
    if (companyData) {
      setFormData({
        companyName: companyData.companyName || '',
        email: companyData.email || '',
        location: companyData.location || '',
        industry: companyData.industry || '',
        description: companyData.description || '',
        totalEmployees: companyData.totalEmployees || 0,
        website: companyData.website || '',
        linkedin: companyData.linkedin || '',
        certificates: companyData.certificates || [],
        licenses: companyData.licenses || [],
        logo: companyData.logo || '',
        coverPhoto: companyData.coverPhoto || ''
      });
    }
  }, [companyData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/company/profile/${companyData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
    if (companyData) setFormData({ ...companyData });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Cover Photo & Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="h-48 bg-gray-200 relative">
          {formData.coverPhoto && (
            <img src={formData.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          )}
          {isEditing && (
            <button className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white flex items-center gap-2 shadow-lg">
              <Camera size={16} /> Change Cover
            </button>
          )}
        </div>

        {/* Company Info */}
        <div className="px-8 pb-8 -mt-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          {/* Logo */}
          <div className="relative">
            <div className="w-40 h-40 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white">
              {formData.companyName?.[0]?.toUpperCase() || 'C'}
            </div>
            {isEditing && (
              <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 border border-gray-200">
                <Camera size={18} />
              </button>
            )}
          </div>

          {/* Company Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.companyName || 'Company Name'}</h1>
            <div className="flex flex-wrap gap-4 text-gray-600">
              {formData.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{formData.location}</span>
                </div>
              )}
              {formData.email && (
                <div className="flex items-center gap-1">
                  <Mail size={16} className="text-gray-400" />
                  <span>{formData.email}</span>
                </div>
              )}
              {formData.industry && (
                <div className="flex items-center gap-1">
                  <Briefcase size={16} className="text-gray-400" />
                  <span>{formData.industry}</span>
                </div>
              )}
              {formData.totalEmployees > 0 && (
                <div className="flex items-center gap-1">
                  <Briefcase size={16} className="text-gray-400" />
                  <span>{formData.totalEmployees} employees</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
            >
              <Edit2 size={18} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
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
            </div>
          )}
        </div>

        {/* Description */}
        {formData.description && (
          <div className="px-8 pb-8">
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Write a description about your company..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{formData.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Contact & Links */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <LinkIcon className="text-indigo-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Contact & Links</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['website','linkedin'].map((field) => (
            <div key={field}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <LinkIcon size={16} />
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name={field}
                  value={formData[field] || ''}
                  onChange={handleInputChange}
                  placeholder={`Enter ${field} link`}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              ) : (
                <p className="text-gray-900 py-3">{formData[field] || 'Not provided'}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Certificates Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Award className="text-amber-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Certificates</h2>
        </div>
        {formData.certificates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Award className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 font-medium">No certificates added yet</p>
            <p className="text-gray-400 text-sm mt-1">Add company certificates to showcase authenticity</p>
            {isEditing && (
              <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto">
                <Plus size={16} /> Add Certificate
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.certificates.map((cert, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                <div>
                  <p className="font-medium">{cert.name}</p>
                  <p className="text-sm text-gray-500">{cert.fileType.toUpperCase()}</p>
                </div>
                {isEditing && (
                  <button className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Licenses Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Award className="text-green-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Licenses</h2>
        </div>
        {formData.licenses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Award className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 font-medium">No licenses added yet</p>
            <p className="text-gray-400 text-sm mt-1">Add licenses to ensure compliance</p>
            {isEditing && (
              <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto">
                <Plus size={16} /> Add License
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.licenses.map((lic, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                <div>
                  <p className="font-medium">{lic.name}</p>
                  {lic.licenseNumber && <p className="text-sm text-gray-500">ID: {lic.licenseNumber}</p>}
                  {lic.issuedBy && <p className="text-sm text-gray-500">Issued by: {lic.issuedBy}</p>}
                </div>
                {isEditing && (
                  <button className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfile;
