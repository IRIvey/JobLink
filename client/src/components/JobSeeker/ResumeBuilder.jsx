import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Plus,
  Trash2,
  Edit2,
  Save,
  Download,
  Eye,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Languages,
  Loader
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api';

const ResumeBuilder = ({ userData }) => {
  const [activeSection, setActiveSection] = useState('preview');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: []
  });

  const [editingExperience, setEditingExperience] = useState(null);
  const [editingEducation, setEditingEducation] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    loadResumeData();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const loadResumeData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/resume`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load resume');
      
      const data = await response.json();
      setResumeData(data.resume);
    } catch (error) {
      console.error('Error loading resume:', error);
      showMessage('error', 'Failed to load resume data');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalInfoChange = (field, value) => {
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value
      }
    });
  };

  const savePersonalInfo = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/resume/personal-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ personalInfo: resumeData.personalInfo })
      });

      if (!response.ok) throw new Error('Failed to save');
      
      showMessage('success', 'Personal information saved successfully!');
    } catch (error) {
      console.error('Error saving personal info:', error);
      showMessage('error', 'Failed to save personal information');
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => {
    setEditingExperience({
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
  };

  const saveExperience = async () => {
    if (!editingExperience) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const existingIndex = resumeData.experience.findIndex(exp => exp.id === editingExperience.id);
      
      let response;
      if (existingIndex >= 0) {
        // Update existing
        response = await fetch(`${API_BASE_URL}/resume/experience/${editingExperience.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ experience: editingExperience })
        });
      } else {
        // Add new
        response = await fetch(`${API_BASE_URL}/resume/experience`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ experience: editingExperience })
        });
      }

      if (!response.ok) throw new Error('Failed to save');
      
      const data = await response.json();
      setResumeData({ ...resumeData, experience: data.experience });
      setEditingExperience(null);
      showMessage('success', 'Experience saved successfully!');
    } catch (error) {
      console.error('Error saving experience:', error);
      showMessage('error', 'Failed to save experience');
    } finally {
      setSaving(false);
    }
  };

  const deleteExperience = async (id) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/resume/experience/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete');
      
      const data = await response.json();
      setResumeData({ ...resumeData, experience: data.experience });
      showMessage('success', 'Experience deleted successfully!');
    } catch (error) {
      console.error('Error deleting experience:', error);
      showMessage('error', 'Failed to delete experience');
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => {
    setEditingEducation({
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: ''
    });
  };

  const saveEducation = async () => {
    if (!editingEducation) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const existingIndex = resumeData.education.findIndex(edu => edu.id === editingEducation.id);
      
      let response;
      if (existingIndex >= 0) {
        response = await fetch(`${API_BASE_URL}/resume/education/${editingEducation.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ education: editingEducation })
        });
      } else {
        response = await fetch(`${API_BASE_URL}/resume/education`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ education: editingEducation })
        });
      }

      if (!response.ok) throw new Error('Failed to save');
      
      const data = await response.json();
      setResumeData({ ...resumeData, education: data.education });
      setEditingEducation(null);
      showMessage('success', 'Education saved successfully!');
    } catch (error) {
      console.error('Error saving education:', error);
      showMessage('error', 'Failed to save education');
    } finally {
      setSaving(false);
    }
  };

  const deleteEducation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this education?')) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/resume/education/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete');
      
      const data = await response.json();
      setResumeData({ ...resumeData, education: data.education });
      showMessage('success', 'Education deleted successfully!');
    } catch (error) {
      console.error('Error deleting education:', error);
      showMessage('error', 'Failed to delete education');
    } finally {
      setSaving(false);
    }
  };

  const addProject = () => {
    setEditingProject({
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: '',
      link: '',
      startDate: '',
      endDate: ''
    });
  };

  const saveProject = async () => {
    if (!editingProject) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const existingIndex = resumeData.projects.findIndex(proj => proj.id === editingProject.id);
      
      let response;
      if (existingIndex >= 0) {
        response = await fetch(`${API_BASE_URL}/resume/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ project: editingProject })
        });
      } else {
        response = await fetch(`${API_BASE_URL}/resume/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ project: editingProject })
        });
      }

      if (!response.ok) throw new Error('Failed to save');
      
      const data = await response.json();
      setResumeData({ ...resumeData, projects: data.projects });
      setEditingProject(null);
      showMessage('success', 'Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      showMessage('error', 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/resume/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete');
      
      const data = await response.json();
      setResumeData({ ...resumeData, projects: data.projects });
      showMessage('success', 'Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      showMessage('error', 'Failed to delete project');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async (skill) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      const newSkills = [...resumeData.skills, skill.trim()];
      
      setSaving(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/resume/skills`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ skills: newSkills })
        });

        if (!response.ok) throw new Error('Failed to save');
        
        const data = await response.json();
        setResumeData({ ...resumeData, skills: data.skills });
        showMessage('success', 'Skill added successfully!');
      } catch (error) {
        console.error('Error adding skill:', error);
        showMessage('error', 'Failed to add skill');
      } finally {
        setSaving(false);
      }
    }
  };

  const removeSkill = async (skill) => {
    const newSkills = resumeData.skills.filter(s => s !== skill);
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/resume/skills`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skills: newSkills })
      });

      if (!response.ok) throw new Error('Failed to save');
      
      const data = await response.json();
      setResumeData({ ...resumeData, skills: data.skills });
      showMessage('success', 'Skill removed successfully!');
    } catch (error) {
      console.error('Error removing skill:', error);
      showMessage('error', 'Failed to remove skill');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveResume = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/resume`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeData })
      });

      if (!response.ok) throw new Error('Failed to save');
      
      showMessage('success', 'Resume saved successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
      showMessage('error', 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadResume = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/resume/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to export');
      
      const data = await response.json();
      
      // Create a blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showMessage('success', 'Resume exported successfully!');
    } catch (error) {
      console.error('Error downloading resume:', error);
      showMessage('error', 'Failed to download resume');
    }
  };

  const sections = [
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'certifications', label: 'Certifications', icon: Award }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message.text && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
            <p className="text-gray-600 mt-1">Create and manage your professional resume</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveResume}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
              Save Resume
            </button>
            <button
              onClick={handleDownloadResume}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={20} />
              Export JSON
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Sidebar - Section Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-20">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Personal Information Section */}
          {activeSection === 'personal' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.github}
                    onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="github.com/username"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.website}
                    onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="www.yourwebsite.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                  <textarea
                    value={resumeData.personalInfo.summary}
                    onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Write a brief summary about your professional background and career goals..."
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={savePersonalInfo}
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Experience Section */}
          {activeSection === 'experience' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
                  <button
                    onClick={addExperience}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={20} />
                    Add Experience
                  </button>
                </div>

                {/* Experience List */}
                <div className="space-y-4">
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{exp.position}</h3>
                          <p className="text-indigo-600">{exp.company}</p>
                          <p className="text-sm text-gray-600">{exp.location}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                          </p>
                          <p className="text-gray-700 mt-2">{exp.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingExperience(exp)}
                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteExperience(exp.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Edit Form */}
              {editingExperience && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {resumeData.experience.find(e => e.id === editingExperience.id) ? 'Edit' : 'Add'} Experience
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                      <input
                        type="text"
                        value={editingExperience.position}
                        onChange={(e) => setEditingExperience({ ...editingExperience, position: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        value={editingExperience.company}
                        onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Tech Corp"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={editingExperience.location}
                        onChange={(e) => setEditingExperience({ ...editingExperience, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="New York, NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="month"
                        value={editingExperience.startDate}
                        onChange={(e) => setEditingExperience({ ...editingExperience, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="month"
                        value={editingExperience.endDate}
                        onChange={(e) => setEditingExperience({ ...editingExperience, endDate: e.target.value })}
                        disabled={editingExperience.current}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingExperience.current}
                        onChange={(e) => setEditingExperience({ ...editingExperience, current: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Currently working here</label>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={editingExperience.description}
                        onChange={(e) => setEditingExperience({ ...editingExperience, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={saveExperience}
                      disabled={saving}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingExperience(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Education Section */}
          {activeSection === 'education' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Education</h2>
                  <button
                    onClick={addEducation}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={20} />
                    Add Education
                  </button>
                </div>

                {/* Education List */}
                <div className="space-y-4">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{edu.degree} in {edu.field}</h3>
                          <p className="text-indigo-600">{edu.institution}</p>
                          <p className="text-sm text-gray-600">{edu.location}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {edu.startDate} - {edu.endDate}
                          </p>
                          {edu.gpa && <p className="text-sm text-gray-700 mt-1">GPA: {edu.gpa}</p>}
                          {edu.description && <p className="text-gray-700 mt-2">{edu.description}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingEducation(edu)}
                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteEducation(edu.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Edit Form */}
              {editingEducation && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {resumeData.education.find(e => e.id === editingEducation.id) ? 'Edit' : 'Add'} Education
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                      <input
                        type="text"
                        value={editingEducation.institution}
                        onChange={(e) => setEditingEducation({ ...editingEducation, institution: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="University Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                      <input
                        type="text"
                        value={editingEducation.degree}
                        onChange={(e) => setEditingEducation({ ...editingEducation, degree: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Bachelor's, Master's, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
                      <input
                        type="text"
                        value={editingEducation.field}
                        onChange={(e) => setEditingEducation({ ...editingEducation, field: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={editingEducation.location}
                        onChange={(e) => setEditingEducation({ ...editingEducation, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="City, State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="month"
                        value={editingEducation.startDate}
                        onChange={(e) => setEditingEducation({ ...editingEducation, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="month"
                        value={editingEducation.endDate}
                        onChange={(e) => setEditingEducation({ ...editingEducation, endDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GPA (Optional)</label>
                      <input
                        type="text"
                        value={editingEducation.gpa}
                        onChange={(e) => setEditingEducation({ ...editingEducation, gpa: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="3.8/4.0"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details (Optional)</label>
                      <textarea
                        value={editingEducation.description}
                        onChange={(e) => setEditingEducation({ ...editingEducation, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Relevant coursework, honors, activities..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={saveEducation}
                      disabled={saving}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingEducation(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skills Section */}
          {activeSection === 'skills' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Skill</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="skillInput"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., JavaScript, Project Management, Adobe Photoshop"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSkill(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('skillInput');
                      addSkill(input.value);
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {activeSection === 'projects' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
                  <button
                    onClick={addProject}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={20} />
                    Add Project
                  </button>
                </div>

                {/* Projects List */}
                <div className="space-y-4">
                  {resumeData.projects.map((proj) => (
                    <div key={proj.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{proj.name}</h3>
                          <p className="text-gray-700 mt-2">{proj.description}</p>
                          {proj.technologies && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Technologies:</strong> {proj.technologies}
                            </p>
                          )}
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:underline mt-1 inline-block"
                            >
                              View Project →
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingProject(proj)}
                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteProject(proj.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Edit Form */}
              {editingProject && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {resumeData.projects.find(p => p.id === editingProject.id) ? 'Edit' : 'Add'} Project
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                      <input
                        type="text"
                        value={editingProject.name}
                        onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="E-commerce Platform"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={editingProject.description}
                        onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Describe what you built and your role..."
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
                      <input
                        type="text"
                        value={editingProject.technologies}
                        onChange={(e) => setEditingProject({ ...editingProject, technologies: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Link (Optional)</label>
                      <input
                        type="url"
                        value={editingProject.link}
                        onChange={(e) => setEditingProject({ ...editingProject, link: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://github.com/username/project"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={saveProject}
                      disabled={saving}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingProject(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Section */}
          {activeSection === 'preview' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center border-b border-gray-300 pb-6 mb-6">
                  <h1 className="text-4xl font-bold text-gray-900">{resumeData.personalInfo.fullName || 'Your Name'}</h1>
                  <div className="flex justify-center flex-wrap gap-4 mt-4 text-sm text-gray-600">
                    {resumeData.personalInfo.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={16} /> {resumeData.personalInfo.email}
                      </span>
                    )}
                    {resumeData.personalInfo.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={16} /> {resumeData.personalInfo.phone}
                      </span>
                    )}
                    {resumeData.personalInfo.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={16} /> {resumeData.personalInfo.location}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-center gap-4 mt-2 text-sm">
                    {resumeData.personalInfo.linkedin && (
                      <a href={resumeData.personalInfo.linkedin} className="text-indigo-600 hover:underline flex items-center gap-1">
                        <Linkedin size={16} /> LinkedIn
                      </a>
                    )}
                    {resumeData.personalInfo.github && (
                      <a href={resumeData.personalInfo.github} className="text-indigo-600 hover:underline flex items-center gap-1">
                        <Github size={16} /> GitHub
                      </a>
                    )}
                    {resumeData.personalInfo.website && (
                      <a href={resumeData.personalInfo.website} className="text-indigo-600 hover:underline flex items-center gap-1">
                        <Globe size={16} /> Website
                      </a>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {resumeData.personalInfo.summary && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Professional Summary</h2>
                    <p className="text-gray-700">{resumeData.personalInfo.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {resumeData.experience.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Experience</h2>
                    <div className="space-y-4">
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                              <p className="text-indigo-600">{exp.company}</p>
                            </div>
                            <p className="text-sm text-gray-600">
                              {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">{exp.location}</p>
                          <p className="text-gray-700 mt-2">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData.education.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Education</h2>
                    <div className="space-y-4">
                      {resumeData.education.map((edu) => (
                        <div key={edu.id}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                              <p className="text-indigo-600">{edu.institution}</p>
                            </div>
                            <p className="text-sm text-gray-600">
                              {edu.startDate} - {edu.endDate}
                            </p>
                          </div>
                          {edu.gpa && <p className="text-sm text-gray-700">GPA: {edu.gpa}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Projects</h2>
                    <div className="space-y-4">
                      {resumeData.projects.map((proj) => (
                        <div key={proj.id}>
                          <h3 className="font-semibold text-gray-900">{proj.name}</h3>
                          <p className="text-gray-700 mt-1">{proj.description}</p>
                          {proj.technologies && (
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Technologies:</strong> {proj.technologies}
                            </p>
                          )}
                          {proj.link && (
                            <a href={proj.link} className="text-sm text-indigo-600 hover:underline">
                              View Project →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {activeSection === 'certifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Certifications</h2>
              <div className="text-center text-gray-500 py-12">
                <Award size={48} className="mx-auto mb-4 text-gray-400" />
                <p>Certifications feature coming soon!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;