import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import {
  User, Mail, Phone, MapPin, Linkedin, Github, Globe, Plus, Trash2, 
  Edit2, Save, Download, Eye, FileText, Briefcase, GraduationCap, 
  Award, Code, Languages, Loader, Menu, X, Layout, Palette, Star,
  Calendar, ExternalLink, Target, Zap, Move, ArrowLeft, Home
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api';

// Empty initial data structure
const EMPTY_DATA = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
    profilePhoto: '',   // ✅ added
    coverPhoto: ''      // ✅ added (optional)
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  languages: [],
  certifications: [] // already here ✅
};


// Template definitions
const TEMPLATES = {
  modern: {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean, contemporary design with bold typography',
    primaryColor: '#2563eb',
    accentColor: '#3b82f6',
    fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif'
  },
  creative: {
    id: 'creative',
    name: 'Creative Portfolio',
    description: 'Vibrant and eye-catching design',
    primaryColor: '#7c3aed',
    accentColor: '#a78bfa',
    fontFamily: '"Space Grotesk", system-ui, sans-serif'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Elite',
    description: 'Sophisticated minimalist approach',
    primaryColor: '#0f172a',
    accentColor: '#475569',
    fontFamily: '"Inter", system-ui, sans-serif'
  },
  bold: {
    id: 'bold',
    name: 'Bold Impact',
    description: 'Strong visual hierarchy and contrast',
    primaryColor: '#dc2626',
    accentColor: '#f87171',
    fontFamily: '"Outfit", system-ui, sans-serif'
  }
};
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('edit');
  const [activeSection, setActiveSection] = useState('preview');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resumeData, setResumeData] = useState(EMPTY_DATA);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Section order for drag and drop
const [sectionOrder, setSectionOrder] = useState([
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'languages',
  'certifications', // ✅ add this
]);


  const [editingExperience, setEditingExperience] = useState(null);
  const [editingEducation, setEditingEducation] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  // Fetch resume data on component mount
  useEffect(() => {
    fetchResumeData();
  }, []);

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/resume`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // If 404, it means no resume exists yet, use empty data
        if (response.status === 404) {
          console.log('No resume found, starting with empty data');
          showMessage('info', 'No existing resume found. Start creating one!');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // The backend returns { resume: {...} }
      if (data.resume) {
        setResumeData(data.resume);
        showMessage('success', 'Resume loaded successfully!');
      }
      
    } catch (error) {
      console.error('Error fetching resume:', error);
      showMessage('error', 'Failed to load resume data. Starting with empty resume.');
      // Keep empty data if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const saveResumeToBackend = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/resume`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resumeData })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      showMessage('success', 'Resume saved successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
      showMessage('error', 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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

  const saveExperience = () => {
    if (!editingExperience) return;
    
    const existingIndex = resumeData.experience.findIndex(exp => exp.id === editingExperience.id);
    let newExperience;
    
    if (existingIndex >= 0) {
      newExperience = [...resumeData.experience];
      newExperience[existingIndex] = editingExperience;
    } else {
      newExperience = [...resumeData.experience, editingExperience];
    }
    
    setResumeData({ ...resumeData, experience: newExperience });
    setEditingExperience(null);
    showMessage('success', 'Experience saved successfully!');
  };

  const deleteExperience = (id) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter(exp => exp.id !== id)
    });
    showMessage('success', 'Experience deleted successfully!');
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

  const saveEducation = () => {
    if (!editingEducation) return;
    
    const existingIndex = resumeData.education.findIndex(edu => edu.id === editingEducation.id);
    let newEducation;
    
    if (existingIndex >= 0) {
      newEducation = [...resumeData.education];
      newEducation[existingIndex] = editingEducation;
    } else {
      newEducation = [...resumeData.education, editingEducation];
    }
    
    setResumeData({ ...resumeData, education: newEducation });
    setEditingEducation(null);
    showMessage('success', 'Education saved successfully!');
  };

  const deleteEducation = (id) => {
    if (!window.confirm('Are you sure you want to delete this education?')) return;
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id)
    });
    showMessage('success', 'Education deleted successfully!');
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

  const saveProject = () => {
    if (!editingProject) return;
    
    const existingIndex = resumeData.projects.findIndex(proj => proj.id === editingProject.id);
    let newProjects;
    
    if (existingIndex >= 0) {
      newProjects = [...resumeData.projects];
      newProjects[existingIndex] = editingProject;
    } else {
      newProjects = [...resumeData.projects, editingProject];
    }
    
    setResumeData({ ...resumeData, projects: newProjects });
    setEditingProject(null);
    showMessage('success', 'Project saved successfully!');
  };

  const deleteProject = (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter(proj => proj.id !== id)
    });
    showMessage('success', 'Project deleted successfully!');
  };

  const addSkill = (skill) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, skill.trim()]
      });
      showMessage('success', 'Skill added successfully!');
    }
  };

  const removeSkill = (skill) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter(s => s !== skill)
    });
    showMessage('success', 'Skill removed successfully!');
  };

const handleDownloadResume = async () => {
  try {
    console.log('Starting PDF download...');
    showMessage('info', 'Generating PDF...');

    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);

    // Get the selected template colors - fix the variable name issue
    const currentTemplate = TEMPLATES[selectedTemplate] || TEMPLATES.modern;
    const templateColor = currentTemplate.primaryColor;

    console.log('Selected template:', selectedTemplate);
    console.log('Template color:', templateColor);

    // Make API call to backend with template color
 const response = await fetch(
  `${API_BASE_URL}/resume/export?color=${encodeURIComponent(templateColor)}`,
  {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);


    console.log('Response status:', response.status);
    console.log('Content-Type:', response.headers.get('Content-Type'));

    if (!response.ok) {
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Failed to generate PDF');
      } else {
        const errorText = await response.text();
        console.error('Server error (text):', errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    }

    // Get the PDF blob from response
    console.log('Getting blob from response...');
    const blob = await response.blob();
    console.log('Blob size:', blob.size, 'bytes');
    console.log('Blob type:', blob.type);

    if (blob.size === 0) {
      throw new Error('PDF file is empty');
    }

    // Create download link
    console.log('Creating download link...');
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${resumeData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'user'}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    console.log('Triggering download...');
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('Download completed successfully');
    showMessage('success', 'Resume downloaded successfully!');
  } catch (error) {
    console.error('!!! Error downloading resume !!!');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    showMessage('error', `Failed to download resume: ${error.message}`);
  }
};
  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(sectionOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSectionOrder(items);
    showMessage('success', 'Section order updated!');
  };

  const template = TEMPLATES[selectedTemplate];

  const sections = [
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'languages', label: 'Languages', icon: Languages }
  ];

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg font-medium">Loading your resume...</p>
        </div>
      </div>
    );
  }

  // Resume Preview Component
  const ResumePreview = () => {
    const renderSection = (sectionId) => {
      switch (sectionId) {
        case 'summary':
          return resumeData.personalInfo.summary && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2" 
                  style={{ color: template.primaryColor, borderColor: template.accentColor }}>
                SUMMARY
              </h2>
              <p className="text-gray-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
            </div>
          );

        case 'experience':
          return resumeData.experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2" 
                  style={{ color: template.primaryColor, borderColor: template.accentColor }}>
                EXPERIENCE
              </h2>
              <div className="space-y-6">
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: template.accentColor }}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{exp.position}</h3>
                        <p className="font-semibold" style={{ color: template.primaryColor }}>{exp.company}</p>
                        <p className="text-sm text-gray-600">{exp.location}</p>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar size={14} />
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'education':
          return resumeData.education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2" 
                  style={{ color: template.primaryColor, borderColor: template.accentColor }}>
                EDUCATION
              </h2>
              <div className="space-y-6">
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="relative pl-4 border-l-2" style={{ borderColor: template.accentColor }}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{edu.degree} in {edu.field}</h3>
                        <p className="font-semibold" style={{ color: template.primaryColor }}>{edu.institution}</p>
                        <p className="text-sm text-gray-600">{edu.location}</p>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar size={14} />
                        {edu.startDate} - {edu.endDate}
                      </div>
                    </div>
                    {edu.gpa && <p className="text-sm text-gray-700 mt-1">GPA: {edu.gpa}</p>}
                    {edu.description && <p className="text-gray-700 mt-2 leading-relaxed">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
case 'certifications':
  return resumeData.certifications.length > 0 && (
    <div className="mb-8">
      <h2
        className="text-2xl font-bold mb-4 pb-2 border-b-2"
        style={{ color: template.primaryColor, borderColor: template.accentColor }}
      >
        CERTIFICATIONS
      </h2>

      <div className="space-y-3">
        {resumeData.certifications.map((cert) => (
          <div key={cert.id || cert._id} className="flex justify-between gap-4">
            <div>
              {/* ✅ FIXED: Use title OR name */}
              <p className="font-semibold text-gray-900">{cert.title || cert.name}</p>
              
              {/* ✅ FIXED: Use issuingOrg OR issuer, and issueDate OR date */}
              <p className="text-sm text-gray-600">
                {cert.issuingOrg || cert.issuer}
                {(cert.issueDate || cert.date) ? ` • ${cert.issueDate || cert.date}` : ''}
              </p>

              {/* ✅ FIXED: Show credentialId if available */}
              {cert.credentialId && (
                <p className="text-sm text-gray-500">ID: {cert.credentialId}</p>
              )}

              {/* ✅ FIXED: Use credentialUrl OR url */}
              {(cert.credentialUrl || cert.url) && (
                <a
                  href={cert.credentialUrl || cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium flex items-center gap-1 hover:underline mt-1"
                  style={{ color: template.primaryColor }}
                >
                  <ExternalLink size={14} />
                  View Credential
                </a>
              )}

              {/* ✅ NEW: Show certificate image if available */}
              {cert.certificateImageUrl && (
                <a
                  href={cert.certificateImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium flex items-center gap-1 hover:underline mt-1"
                  style={{ color: template.primaryColor }}
                >
                  🖼️ View Certificate
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

        case 'skills':
          return resumeData.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2" 
                  style={{ color: template.primaryColor, borderColor: template.accentColor }}>
                SKILLS
              </h2>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 rounded-lg font-medium text-sm border-2 transition-all hover:scale-105"
                    style={{ 
                      backgroundColor: `${template.accentColor}20`,
                      color: template.primaryColor,
                      borderColor: template.accentColor
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );

        case 'projects':
          return resumeData.projects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2" 
                  style={{ color: template.primaryColor, borderColor: template.accentColor }}>
                PROJECTS
              </h2>
              <div className="space-y-6">
                {resumeData.projects.map((proj) => (
                  <div key={proj.id} className="relative pl-4 border-l-2" style={{ borderColor: template.accentColor }}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{proj.name}</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">{proj.description}</p>
                    {proj.technologies && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold" style={{ color: template.primaryColor }}>Technologies:</span> {proj.technologies}
                      </p>
                    )}
                    {proj.link && (
                      <a 
                        href={proj.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium flex items-center gap-1 hover:underline"
                        style={{ color: template.primaryColor }}
                      >
                        <ExternalLink size={14} />
                        View Project
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );

        case 'languages':
          return resumeData.languages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2" 
                  style={{ color: template.primaryColor, borderColor: template.accentColor }}>
                LANGUAGES
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {resumeData.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{lang.language}</span>
                    <span className="text-sm px-3 py-1 rounded-full" 
                          style={{ backgroundColor: `${template.accentColor}30`, color: template.primaryColor }}>
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );

   

        default:
          return null;
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-2xl p-12 max-w-5xl mx-auto" 
           style={{ fontFamily: template.fontFamily }}>
        {/* Header - Photo and Name Side by Side */}
<div className="pb-8 mb-8 border-b-4" style={{ borderColor: template.primaryColor }}>
  <div className="flex items-start gap-8 mb-6">
    {/* Profile Photo - Left Side */}
    {resumeData.personalInfo.profilePhoto && (
      <div className="flex-shrink-0">
        <img
          src={resumeData.personalInfo.profilePhoto}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 shadow-lg"
          style={{ borderColor: template.primaryColor }}
        />
      </div>
    )}
    
    {/* Name and Title - Right Side */}
    <div className="flex-1 text-left">
      <h1 className="text-5xl font-bold mb-2" style={{ color: template.primaryColor }}>
        {resumeData.personalInfo.fullName.toUpperCase()}
      </h1>
      <p className="text-xl font-semibold mb-4" style={{ color: template.accentColor }}>
        Software Engineering Student
      </p>
    </div>
  </div>
  
  {/* Contact Info - Centered Below */}
  <div className="flex justify-center flex-wrap gap-6 text-sm text-gray-700">
    {resumeData.personalInfo.email && (
      <span className="flex items-center gap-2">
        <Mail size={16} style={{ color: template.primaryColor }} /> 
        {resumeData.personalInfo.email}
      </span>
    )}
    {resumeData.personalInfo.phone && (
      <span className="flex items-center gap-2">
        <Phone size={16} style={{ color: template.primaryColor }} /> 
        {resumeData.personalInfo.phone}
      </span>
    )}
    {resumeData.personalInfo.location && (
      <span className="flex items-center gap-2">
        <MapPin size={16} style={{ color: template.primaryColor }} /> 
        {resumeData.personalInfo.location}
      </span>
    )}
  </div>
  
  {/* Social Links */}
  <div className="flex justify-center gap-6 mt-4">
    {resumeData.personalInfo.linkedin && (
      <a 
        href={resumeData.personalInfo.linkedin} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:underline font-medium"
        style={{ color: template.primaryColor }}
      >
        <Linkedin size={18} /> LinkedIn
      </a>
    )}
    {resumeData.personalInfo.github && (
      <a 
        href={resumeData.personalInfo.github} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:underline font-medium"
        style={{ color: template.primaryColor }}
      >
        <Github size={18} /> GitHub
      </a>
    )}
    {resumeData.personalInfo.website && (
      <a 
        href={resumeData.personalInfo.website} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:underline font-medium"
        style={{ color: template.primaryColor }}
      >
        <Globe size={18} /> Website
      </a>
    )}
  </div>
</div>
        {/* Dynamic Sections */}
        {sectionOrder.map(section => renderSection(section))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;700&family=Outfit:wght@400;500;700&display=swap" rel="stylesheet" />
      
      {/* Message Alert */}
      {message.text && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border-2 transform transition-all duration-300 ${
          message.type === 'success' 
            ? 'bg-emerald-500 border-emerald-600' 
            : message.type === 'info'
            ? 'bg-blue-500 border-blue-600'
            : 'bg-red-500 border-red-600'
        } text-white font-medium`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? <Zap size={20} /> : <X size={20} />}
            {message.text}
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-700 hover:text-indigo-600"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Dashboard</span>
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Resume Builder 
                </h1>
                <p className="text-sm text-gray-600">Create your perfect resume in minutes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'edit'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Edit2 size={18} className="inline mr-2" />
                Edit
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'design'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Palette size={18} className="inline mr-2" />
                Design
              </button>
              <button
                onClick={saveResumeToBackend}
                disabled={saving}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium shadow-lg shadow-green-200 hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save 
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadResume}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium shadow-lg shadow-emerald-200 hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Download size={18} />
                Download
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <div className="sticky top-20 p-6">
            {activeTab === 'edit' ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Layout size={20} />
                    Sections
                  </h2>
                </div>
                <nav className="p-3 space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Palette size={20} />
                    Templates
                  </h2>
                </div>
                <div className="p-3 space-y-3">
                  {Object.values(TEMPLATES).map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedTemplate === tmpl.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-8 h-8 rounded-lg"
                          style={{ backgroundColor: tmpl.primaryColor }}
                        />
                        <h3 className="font-bold text-gray-900">{tmpl.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{tmpl.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'edit' && activeSection === 'preview' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Preview</h2>
                <p className="text-gray-600">This is how your resume will look</p>
              </div>
              <ResumePreview />
            </div>
          )}

          {activeTab === 'edit' && activeSection === 'personal' && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <User className="text-blue-600" size={32} />
                Personal Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">GitHub</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.github}
                    onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="github.com/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.website}
                    onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="www.yourwebsite.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Professional Summary</label>
                  <textarea
                    value={resumeData.personalInfo.summary}
                    onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Write a brief summary about your professional background and career goals..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'edit' && activeSection === 'experience' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Briefcase className="text-blue-600" size={32} />
                    Work Experience
                  </h2>
                  <button
                    onClick={addExperience}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Experience
                  </button>
                </div>

                <div className="space-y-4">
                 {resumeData.experience.map((exp, index) => (
  <div key={exp.id || exp._id || `exp-${index}`} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            <h3 className="font-bold text-xl text-gray-900">{exp.position}</h3>
                          </div>
                          <p className="text-blue-600 font-semibold">{exp.company}</p>
                          <p className="text-sm text-gray-600">{exp.location}</p>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar size={14} />
                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                          </p>
                          <p className="text-gray-700 mt-3">{exp.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingExperience(exp)}
                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => deleteExperience(exp.id)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {editingExperience && (
                <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-8 animate-fadeIn">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {resumeData.experience.find(e => e.id === editingExperience.id) ? 'Edit' : 'Add'} Experience
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Position *</label>
                      <input
                        type="text"
                        value={editingExperience.position}
                        onChange={(e) => setEditingExperience({ ...editingExperience, position: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Company *</label>
                      <input
                        type="text"
                        value={editingExperience.company}
                        onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tech Corp"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={editingExperience.location}
                        onChange={(e) => setEditingExperience({ ...editingExperience, location: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="New York, NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                      <input
                        type="month"
                        value={editingExperience.startDate}
                        onChange={(e) => setEditingExperience({ ...editingExperience, startDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                      <input
                        type="month"
                        value={editingExperience.endDate}
                        onChange={(e) => setEditingExperience({ ...editingExperience, endDate: e.target.value })}
                        disabled={editingExperience.current}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex items-center pt-8">
                      <input
                        type="checkbox"
                        checked={editingExperience.current}
                        onChange={(e) => setEditingExperience({ ...editingExperience, current: e.target.checked })}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm font-bold text-gray-700">Currently working here</label>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={editingExperience.description}
                        onChange={(e) => setEditingExperience({ ...editingExperience, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={saveExperience}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <Save size={20} />
                      Save Experience
                    </button>
                    <button
                      onClick={() => setEditingExperience(null)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
         {activeTab === 'edit' && activeSection === 'certifications' && (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
      <Award className="text-blue-600" size={32} />
      Certifications
    </h2>

    {/* Add certification form */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <input
        type="text"
        placeholder="Certification Title (e.g., AWS Solutions Architect)"
        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        id="certTitle"
      />
      <input
        type="text"
        placeholder="Issuing Organization (e.g., Amazon Web Services)"
        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        id="certIssuingOrg"
      />
      <input
        type="month"
        placeholder="Issue Date"
        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        id="certIssueDate"
      />
      <input
        type="text"
        placeholder="Credential ID (Optional)"
        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        id="certCredentialId"
      />
      <input
        type="url"
        placeholder="Credential URL (Optional)"
        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        id="certCredentialUrl"
      />
      <input
        type="url"
        placeholder="Certificate Image URL (Optional)"
        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        id="certImageUrl"
      />
      
      <div className="col-span-2">
        <button
          onClick={() => {
            const title = document.getElementById('certTitle').value.trim();
            const issuingOrg = document.getElementById('certIssuingOrg').value.trim();
            const issueDate = document.getElementById('certIssueDate').value;
            const credentialId = document.getElementById('certCredentialId').value.trim();
            const credentialUrl = document.getElementById('certCredentialUrl').value.trim();
            const certificateImageUrl = document.getElementById('certImageUrl').value.trim();

            if (!title || !issuingOrg) {
              return showMessage('error', 'Title and Issuing Organization are required');
            }

            const newCert = {
              id: Date.now().toString(),
              title,
              issuingOrg,
              issueDate,
              credentialId,
              credentialUrl,
              certificateImageUrl
            };

            setResumeData((prev) => ({
              ...prev,
              certifications: [...(prev.certifications || []), newCert],
            }));

            // Clear form
            document.getElementById('certTitle').value = '';
            document.getElementById('certIssuingOrg').value = '';
            document.getElementById('certIssueDate').value = '';
            document.getElementById('certCredentialId').value = '';
            document.getElementById('certCredentialUrl').value = '';
            document.getElementById('certImageUrl').value = '';
            
            showMessage('success', 'Certification added!');
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add Certification
        </button>
      </div>
    </div>

    {/* List certifications */}
    <div className="space-y-3">
      {(resumeData.certifications || []).map((cert) => (
        <div key={cert.id || cert._id} className="border-2 border-gray-200 rounded-xl p-4 flex justify-between items-start hover:border-blue-300 transition-all">
          <div className="flex-1">
            <p className="font-bold text-gray-900">{cert.title || cert.name}</p>
            <p className="text-sm text-gray-600">
              {cert.issuingOrg || cert.issuer}
              {(cert.issueDate || cert.date) ? ` • ${cert.issueDate || cert.date}` : ''}
            </p>
            
            {cert.credentialId && (
              <p className="text-sm text-gray-500 mt-1">🆔 ID: {cert.credentialId}</p>
            )}
            
            <div className="flex gap-3 mt-2">
              {(cert.credentialUrl || cert.url) && (
                <a 
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1" 
                  href={cert.credentialUrl || cert.url} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <ExternalLink size={14} />
                  Credential
                </a>
              )}
              
              {cert.certificateImageUrl && (
                <a 
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1" 
                  href={cert.certificateImageUrl} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  🖼️ Certificate
                </a>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setResumeData((prev) => ({
                ...prev,
                certifications: prev.certifications.filter((c) => (c.id || c._id) !== (cert.id || cert._id)),
              }));
              showMessage('success', 'Certification removed!');
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}
      
      {(!resumeData.certifications || resumeData.certifications.length === 0) && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Award className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500">No certifications added yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your professional certifications above</p>
        </div>
      )}
    </div>
  </div>
)}

          {activeTab === 'edit' && activeSection === 'education' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <GraduationCap className="text-blue-600" size={32} />
                    Education
                  </h2>
                  <button
                    onClick={addEducation}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Education
                  </button>
                </div>

                <div className="space-y-4">
                 {resumeData.education.map((edu, index) => (
  <div key={edu.id || edu._id || `edu-${index}`} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            <h3 className="font-bold text-xl text-gray-900">{edu.degree} in {edu.field}</h3>
                          </div>
                          <p className="text-blue-600 font-semibold">{edu.institution}</p>
                          <p className="text-sm text-gray-600">{edu.location}</p>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar size={14} />
                            {edu.startDate} - {edu.endDate}
                          </p>
                          {edu.gpa && <p className="text-sm text-gray-700 mt-1 font-semibold">GPA: {edu.gpa}</p>}
                          {edu.description && <p className="text-gray-700 mt-2">{edu.description}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingEducation(edu)}
                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => deleteEducation(edu.id)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {editingEducation && (
                <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {resumeData.education.find(e => e.id === editingEducation.id) ? 'Edit' : 'Add'} Education
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Institution *</label>
                      <input
                        type="text"
                        value={editingEducation.institution}
                        onChange={(e) => setEditingEducation({ ...editingEducation, institution: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="University Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Degree *</label>
                      <input
                        type="text"
                        value={editingEducation.degree}
                        onChange={(e) => setEditingEducation({ ...editingEducation, degree: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Bachelor's, Master's, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Field of Study *</label>
                      <input
                        type="text"
                        value={editingEducation.field}
                        onChange={(e) => setEditingEducation({ ...editingEducation, field: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={editingEducation.location}
                        onChange={(e) => setEditingEducation({ ...editingEducation, location: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="City, State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                      <input
                        type="month"
                        value={editingEducation.startDate}
                        onChange={(e) => setEditingEducation({ ...editingEducation, startDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                      <input
                        type="month"
                        value={editingEducation.endDate}
                        onChange={(e) => setEditingEducation({ ...editingEducation, endDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">GPA (Optional)</label>
                      <input
                        type="text"
                        value={editingEducation.gpa}
                        onChange={(e) => setEditingEducation({ ...editingEducation, gpa: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="3.8/4.0"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Additional Details (Optional)</label>
                      <textarea
                        value={editingEducation.description}
                        onChange={(e) => setEditingEducation({ ...editingEducation, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Relevant coursework, honors, activities..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={saveEducation}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <Save size={20} />
                      Save Education
                    </button>
                    <button
                      onClick={() => setEditingEducation(null)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'edit' && activeSection === 'skills' && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Code className="text-blue-600" size={32} />
                Skills
              </h2>
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">Add Skill</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    id="skillInput"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {resumeData.skills.map((skill, index) => (
  <div
    key={`skill-${index}-${skill}`}
                    className="group flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-700 px-5 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-red-500 hover:text-red-700 hover:scale-110 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'edit' && activeSection === 'projects' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <FileText className="text-blue-600" size={32} />
                    Projects
                  </h2>
                  <button
                    onClick={addProject}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Project
                  </button>
                </div>

                <div className="space-y-4">
                  {resumeData.projects.map((proj, index) => (
  <div key={proj.id || proj._id || `proj-${index}`} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            <h3 className="font-bold text-xl text-gray-900">{proj.name}</h3>
                          </div>
                          <p className="text-gray-700 mt-2 leading-relaxed">{proj.description}</p>
                          {proj.technologies && (
                            <p className="text-sm text-gray-600 mt-3">
                              <span className="font-bold text-blue-600">Technologies:</span> {proj.technologies}
                            </p>
                          )}
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline mt-2 inline-flex items-center gap-1 font-medium"
                            >
                              <ExternalLink size={14} />
                              View Project
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingProject(proj)}
                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => deleteProject(proj.id)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {editingProject && (
                <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {resumeData.projects.find(p => p.id === editingProject.id) ? 'Edit' : 'Add'} Project
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Project Name *</label>
                      <input
                        type="text"
                        value={editingProject.name}
                        onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="E-commerce Platform"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                      <textarea
                        value={editingProject.description}
                        onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe what you built and your role..."
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Technologies Used</label>
                      <input
                        type="text"
                        value={editingProject.technologies}
                        onChange={(e) => setEditingProject({ ...editingProject, technologies: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Project Link (Optional)</label>
                      <input
                        type="url"
                        value={editingProject.link}
                        onChange={(e) => setEditingProject({ ...editingProject, link: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://github.com/username/project"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={saveProject}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <Save size={20} />
                      Save Project
                    </button>
                    <button
                      onClick={() => setEditingProject(null)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'edit' && activeSection === 'languages' && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Languages className="text-blue-600" size={32} />
                Programming Languages
              </h2>
              <p className="text-gray-600 mb-6">List your proficiency in various programming languages</p>
              <div className="grid grid-cols-2 gap-4">
                {resumeData.languages.map((lang, index) => (
  <div key={lang.id || lang._id || `lang-${index}-${lang.language}`} className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <span className="font-bold text-gray-900">{lang.language}</span>
                    <span className="text-sm px-4 py-2 rounded-full bg-white border-2 border-blue-300 text-blue-700 font-semibold">
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'edit' && activeSection === 'interests' && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Star className="text-blue-600" size={32} />
                Interests & Passions
              </h2>
              <div className="flex flex-wrap gap-3">
              {resumeData.interests && resumeData.interests.map((interest, index) => (
  <span 
    key={`interest-${index}-${interest}`} 
                    className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 text-purple-700"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div>
              <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Layout className="text-purple-600" size={32} />
                  Customize Layout
                </h2>
                <p className="text-gray-600 mb-6">Drag and drop sections to reorder them in your resume</p>
                
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="sections">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {sectionOrder.map((sectionId, index) => (
                          <Draggable key={sectionId} draggableId={sectionId} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-6 rounded-xl border-2 transition-all ${
                                  snapshot.isDragging
                                    ? 'border-blue-500 bg-blue-50 shadow-2xl scale-105'
                                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <Move className="text-gray-400" size={24} />
                                  <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 capitalize">
                                      {sectionId}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      Section {index + 1} of {sectionOrder.length}
                                    </p>
                                  </div>
                                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm">
                                    #{index + 1}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview with Current Design</h2>
                <ResumePreview />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;