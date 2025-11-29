import React, { useState, useEffect } from 'react';
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
  Upload,
  Camera
} from 'lucide-react';

const JobSeekerProfile = ({ userData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    website: '',
    linkedin: '',
    github: ''
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        bio: userData.bio || '',
        skills: userData.skills || [],
        website: userData.website || '',
        linkedin: userData.linkedin || '',
        github: userData.github || ''
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/jobseeker/profile', {
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
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        bio: userData.bio || '',
        skills: userData.skills || [],
        website: userData.website || '',
        linkedin: userData.linkedin || '',
        github: userData.github || ''
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Cover Photo & Profile Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
          {isEditing && (
            <button className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white flex items-center gap-2 shadow-lg">
              <Camera size={16} />
              Change Cover
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-20 gap-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-40 h-40 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white">
                  {formData.fullName?.[0]?.toUpperCase() || formData.email?.[0]?.toUpperCase() || 'U'}
                </div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 border border-gray-200">
                    <Camera size={18} className="text-gray-700" />
                  </button>
                )}
              </div>

              {/* Name & Details */}
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {formData.fullName || 'Add Your Name'}
                </h1>
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
                  {formData.phone && (
                    <div className="flex items-center gap-1">
                      <Phone size={16} className="text-gray-400" />
                      <span>{formData.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Bio */}
          {(formData.bio || isEditing) && (
            <div className="mt-6">
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Write a brief bio about yourself..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
              )}
            </div>
          )}
        </div>
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
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User size={16} />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Your full name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            ) : (
              <p className="text-gray-900 py-3">{formData.fullName || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Phone size={16} />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            ) : (
              <p className="text-gray-900 py-3">{formData.phone || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MapPin size={16} />
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            ) : (
              <p className="text-gray-900 py-3">{formData.location || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Mail size={16} />
              Email Address
            </label>
            <p className="text-gray-900 py-3">{formData.email}</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <LinkIcon size={16} />
              Website
            </label>
            {isEditing ? (
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            ) : (
              <p className="text-gray-900 py-3">{formData.website || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <LinkIcon size={16} />
              LinkedIn
            </label>
            {isEditing ? (
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="linkedin.com/in/username"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            ) : (
              <p className="text-gray-900 py-3">{formData.linkedin || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="text-purple-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
          </div>
          <span className="px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
            {formData.skills.length} skills
          </span>
        </div>
        
        {isEditing && (
          <div className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                placeholder="Add a skill (e.g., React, Node.js, Python)..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <button
                onClick={handleAddSkill}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus size={18} />
                Add Skill
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {formData.skills.length === 0 ? (
            <div className="w-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Award className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500 font-medium">No skills added yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "Edit Profile" to add your skills</p>
            </div>
          ) : (
            formData.skills.map((skill, index) => (
              <span
                key={index}
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 text-indigo-700 rounded-xl text-sm font-semibold hover:shadow-md transition-all"
              >
                {skill}
                {isEditing && (
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-indigo-500 hover:text-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Work Experience */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Briefcase className="text-blue-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Briefcase className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500 font-medium">No work experience added yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your professional experience to stand out</p>
          <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto">
            <Plus size={16} />
            Add Experience
          </button>
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <GraduationCap className="text-green-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Education</h2>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <GraduationCap className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500 font-medium">No education added yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your educational background</p>
          <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto">
            <Plus size={16} />
            Add Education
          </button>
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Award className="text-amber-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Certifications & Awards</h2>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Award className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500 font-medium">No certifications added yet</p>
          <p className="text-gray-400 text-sm mt-1">Showcase your achievements and certifications</p>
          <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto">
            <Plus size={16} />
            Add Certification
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerProfile;