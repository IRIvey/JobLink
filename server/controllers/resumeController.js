import JobSeeker from '../models/Job.js';

// Get user's resume
export const getResume = async (req, res) => {
  try {
    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If no resume exists, return default structure
    if (!jobSeeker.resume) {
      return res.json({
        resume: {
          personalInfo: {
            fullName: jobSeeker.fullName || '',
            email: jobSeeker.email || '',
            phone: jobSeeker.phone || '',
            location: jobSeeker.location || '',
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
        }
      });
    }

    res.json({ resume: jobSeeker.resume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update entire resume
export const updateResume = async (req, res) => {
  try {
    const { resumeData } = req.body;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update resume
    jobSeeker.resume = resumeData;
    await jobSeeker.save();

    res.json({ 
      message: 'Resume updated successfully',
      resume: jobSeeker.resume 
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update personal info section
export const updatePersonalInfo = async (req, res) => {
  try {
    const { personalInfo } = req.body;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!jobSeeker.resume) {
      jobSeeker.resume = {};
    }

    jobSeeker.resume.personalInfo = personalInfo;
    await jobSeeker.save();

    res.json({ 
      message: 'Personal information updated successfully',
      personalInfo: jobSeeker.resume.personalInfo 
    });
  } catch (error) {
    console.error('Error updating personal info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add experience
export const addExperience = async (req, res) => {
  try {
    const { experience } = req.body;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!jobSeeker.resume) {
      jobSeeker.resume = { experience: [] };
    }
    
    if (!jobSeeker.resume.experience) {
      jobSeeker.resume.experience = [];
    }

    // Add unique ID if not provided
    if (!experience.id) {
      experience.id = Date.now().toString();
    }

    jobSeeker.resume.experience.push(experience);
    await jobSeeker.save();

    res.json({ 
      message: 'Experience added successfully',
      experience: jobSeeker.resume.experience 
    });
  } catch (error) {
    console.error('Error adding experience:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update experience
export const updateExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;
    const { experience } = req.body;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    const expIndex = jobSeeker.resume.experience.findIndex(exp => exp.id === experienceId);
    
    if (expIndex === -1) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    jobSeeker.resume.experience[expIndex] = { ...experience, id: experienceId };
    await jobSeeker.save();

    res.json({ 
      message: 'Experience updated successfully',
      experience: jobSeeker.resume.experience 
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete experience
export const deleteExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    jobSeeker.resume.experience = jobSeeker.resume.experience.filter(
      exp => exp.id !== experienceId
    );
    
    await jobSeeker.save();

    res.json({ 
      message: 'Experience deleted successfully',
      experience: jobSeeker.resume.experience 
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add education
export const addEducation = async (req, res) => {
  try {
    const { education } = req.body;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!jobSeeker.resume) {
      jobSeeker.resume = { education: [] };
    }
    
    if (!jobSeeker.resume.education) {
      jobSeeker.resume.education = [];
    }

    // Add unique ID if not provided
    if (!education.id) {
      education.id = Date.now().toString();
    }

    jobSeeker.resume.education.push(education);
    await jobSeeker.save();

    res.json({ 
      message: 'Education added successfully',
      education: jobSeeker.resume.education 
    });
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update education
export const updateEducation = async (req, res) => {
  try {
    const { educationId } = req.params;
    const { education } = req.body;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    const eduIndex = jobSeeker.resume.education.findIndex(edu => edu.id === educationId);
    
    if (eduIndex === -1) {
      return res.status(404).json({ message: 'Education not found' });
    }

    jobSeeker.resume.education[eduIndex] = { ...education, id: educationId };
    await jobSeeker.save();

    res.json({ 
      message: 'Education updated successfully',
      education: jobSeeker.resume.education 
    });
  } catch (error) {
    console.error('Error updating education:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete education
export const deleteEducation = async (req, res) => {
  try {
    const { educationId } = req.params;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    jobSeeker.resume.education = jobSeeker.resume.education.filter(
      edu => edu.id !== educationId
    );
    
    await jobSeeker.save();

    res.json({ 
      message: 'Education deleted successfully',
      education: jobSeeker.resume.education 
    });
  } catch (error) {
    console.error('Error deleting education:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add project
export const addProject = async (req, res) => {
  try {
    const { project } = req.body;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!jobSeeker.resume) {
      jobSeeker.resume = { projects: [] };
    }
    
    if (!jobSeeker.resume.projects) {
      jobSeeker.resume.projects = [];
    }

    // Add unique ID if not provided
    if (!project.id) {
      project.id = Date.now().toString();
    }

    jobSeeker.resume.projects.push(project);
    await jobSeeker.save();

    res.json({ 
      message: 'Project added successfully',
      projects: jobSeeker.resume.projects 
    });
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { project } = req.body;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    const projIndex = jobSeeker.resume.projects.findIndex(proj => proj.id === projectId);
    
    if (projIndex === -1) {
      return res.status(404).json({ message: 'Project not found' });
    }

    jobSeeker.resume.projects[projIndex] = { ...project, id: projectId };
    await jobSeeker.save();

    res.json({ 
      message: 'Project updated successfully',
      projects: jobSeeker.resume.projects 
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    jobSeeker.resume.projects = jobSeeker.resume.projects.filter(
      proj => proj.id !== projectId
    );
    
    await jobSeeker.save();

    res.json({ 
      message: 'Project deleted successfully',
      projects: jobSeeker.resume.projects 
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update skills
export const updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!jobSeeker.resume) {
      jobSeeker.resume = {};
    }

    jobSeeker.resume.skills = skills;
    await jobSeeker.save();

    res.json({ 
      message: 'Skills updated successfully',
      skills: jobSeeker.resume.skills 
    });
  } catch (error) {
    console.error('Error updating skills:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add certification
export const addCertification = async (req, res) => {
  try {
    const { certification } = req.body;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!jobSeeker.resume) {
      jobSeeker.resume = { certifications: [] };
    }
    
    if (!jobSeeker.resume.certifications) {
      jobSeeker.resume.certifications = [];
    }

    // Add unique ID if not provided
    if (!certification.id) {
      certification.id = Date.now().toString();
    }

    jobSeeker.resume.certifications.push(certification);
    await jobSeeker.save();

    res.json({ 
      message: 'Certification added successfully',
      certifications: jobSeeker.resume.certifications 
    });
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update certification
export const updateCertification = async (req, res) => {
  try {
    const { certificationId } = req.params;
    const { certification } = req.body;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    const certIndex = jobSeeker.resume.certifications.findIndex(cert => cert.id === certificationId);
    
    if (certIndex === -1) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    jobSeeker.resume.certifications[certIndex] = { ...certification, id: certificationId };
    await jobSeeker.save();

    res.json({ 
      message: 'Certification updated successfully',
      certifications: jobSeeker.resume.certifications 
    });
  } catch (error) {
    console.error('Error updating certification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete certification
export const deleteCertification = async (req, res) => {
  try {
    const { certificationId } = req.params;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    jobSeeker.resume.certifications = jobSeeker.resume.certifications.filter(
      cert => cert.id !== certificationId
    );
    
    await jobSeeker.save();

    res.json({ 
      message: 'Certification deleted successfully',
      certifications: jobSeeker.resume.certifications 
    });
  } catch (error) {
    console.error('Error deleting certification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export resume as JSON (for download/backup)
export const exportResume = async (req, res) => {
  try {
    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!jobSeeker.resume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    res.json({ 
      resume: jobSeeker.resume,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error exporting resume:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};