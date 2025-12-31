import JobSeeker from '../models/JobSeeker.js'; // Changed from Job.js to JobSeeker.js
import PDFDocument from 'pdfkit';
// Get user's resume
export const getResume = async (req, res) => {
  try {
    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If no resume exists, create one from JobSeeker profile data
    if (!jobSeeker.resume || Object.keys(jobSeeker.resume).length === 0) {
      const defaultResume = {
        personalInfo: {
          fullName: jobSeeker.fullName || '',
          email: jobSeeker.email || '',
          phone: jobSeeker.phone || '',
          location: jobSeeker.location || '',
          linkedin: '',
          github: '',
          website: '',
          summary: jobSeeker.bio || ''
        },
        experience: jobSeeker.experience?.map(exp => ({
          id: exp._id?.toString() || Date.now().toString(),
          company: exp.company || '',
          position: exp.title || '',
          location: exp.location || '',
          startDate: exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 7) : '',
          endDate: exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 7) : '',
          current: exp.current || false,
          description: exp.description || ''
        })) || [],
        education: jobSeeker.education?.map(edu => ({
          id: edu._id?.toString() || Date.now().toString(),
          institution: edu.school || '',
          degree: edu.degree || '',
          field: edu.field || '',
          location: '',
          startDate: edu.startDate ? new Date(edu.startDate).toISOString().slice(0, 7) : '',
          endDate: edu.endDate ? new Date(edu.endDate).toISOString().slice(0, 7) : '',
          gpa: '',
          description: edu.description || ''
        })) || [],
        skills: jobSeeker.skills || [],
        certifications: jobSeeker.certifications?.map(cert => ({
          id: cert._id?.toString() || Date.now().toString(),
          name: cert.name || '',
          issuer: cert.issuer || '',
          date: cert.date ? new Date(cert.date).toISOString().slice(0, 7) : '',
          expiryDate: '',
          credentialId: '',
          url: cert.url || ''
        })) || [],
        projects: [],
        languages: [],
        interests: []
      };

      return res.json({ resume: defaultResume });
    }

    // If resume exists but some fields are empty, merge with JobSeeker data
    const mergedResume = {
      personalInfo: {
        fullName: jobSeeker.resume.personalInfo?.fullName || jobSeeker.fullName || '',
        email: jobSeeker.resume.personalInfo?.email || jobSeeker.email || '',
        phone: jobSeeker.resume.personalInfo?.phone || jobSeeker.phone || '',
        location: jobSeeker.resume.personalInfo?.location || jobSeeker.location || '',
        linkedin: jobSeeker.resume.personalInfo?.linkedin || '',
        github: jobSeeker.resume.personalInfo?.github || '',
        website: jobSeeker.resume.personalInfo?.website || '',
        summary: jobSeeker.resume.personalInfo?.summary || jobSeeker.bio || ''
      },
      experience: jobSeeker.resume.experience?.length > 0 
        ? jobSeeker.resume.experience 
        : (jobSeeker.experience?.map(exp => ({
            id: exp._id?.toString() || Date.now().toString(),
            company: exp.company || '',
            position: exp.title || '',
            location: exp.location || '',
            startDate: exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 7) : '',
            endDate: exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 7) : '',
            current: exp.current || false,
            description: exp.description || ''
          })) || []),
      education: jobSeeker.resume.education?.length > 0 
        ? jobSeeker.resume.education 
        : (jobSeeker.education?.map(edu => ({
            id: edu._id?.toString() || Date.now().toString(),
            institution: edu.school || '',
            degree: edu.degree || '',
            field: edu.field || '',
            location: '',
            startDate: edu.startDate ? new Date(edu.startDate).toISOString().slice(0, 7) : '',
            endDate: edu.endDate ? new Date(edu.endDate).toISOString().slice(0, 7) : '',
            gpa: '',
            description: edu.description || ''
          })) || []),
      skills: jobSeeker.resume.skills?.length > 0 
        ? jobSeeker.resume.skills 
        : jobSeeker.skills || [],
      certifications: jobSeeker.resume.certifications || [],
      projects: jobSeeker.resume.projects || [],
      languages: jobSeeker.resume.languages || [],
      interests: jobSeeker.resume.interests || []
    };

    res.json({ resume: mergedResume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update entire resume
export const updateResume = async (req, res) => {
  try {
    const { resumeData } = req.body;

    // Validate that resumeData exists
    if (!resumeData) {
      return res.status(400).json({ message: 'Resume data is required' });
    }

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

    if (!personalInfo) {
      return res.status(400).json({ message: 'Personal info is required' });
    }

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

    if (!experience) {
      return res.status(400).json({ message: 'Experience data is required' });
    }

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

    if (!experience) {
      return res.status(400).json({ message: 'Experience data is required' });
    }

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!jobSeeker.resume || !jobSeeker.resume.experience) {
      return res.status(404).json({ message: 'No experience found' });
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

    if (!jobSeeker.resume || !jobSeeker.resume.experience) {
      return res.status(404).json({ message: 'No experience found' });
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

    if (!education) {
      return res.status(400).json({ message: 'Education data is required' });
    }

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

    if (!education) {
      return res.status(400).json({ message: 'Education data is required' });
    }

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!jobSeeker.resume || !jobSeeker.resume.education) {
      return res.status(404).json({ message: 'No education found' });
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

    if (!jobSeeker.resume || !jobSeeker.resume.education) {
      return res.status(404).json({ message: 'No education found' });
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

    if (!project) {
      return res.status(400).json({ message: 'Project data is required' });
    }

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

    if (!project) {
      return res.status(400).json({ message: 'Project data is required' });
    }

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!jobSeeker.resume || !jobSeeker.resume.projects) {
      return res.status(404).json({ message: 'No projects found' });
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

    if (!jobSeeker.resume || !jobSeeker.resume.projects) {
      return res.status(404).json({ message: 'No projects found' });
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

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: 'Skills array is required' });
    }

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

    if (!certification) {
      return res.status(400).json({ message: 'Certification data is required' });
    }

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

    if (!certification) {
      return res.status(400).json({ message: 'Certification data is required' });
    }

    const jobSeeker = await JobSeeker.findById(req.user.id);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!jobSeeker.resume || !jobSeeker.resume.certifications) {
      return res.status(404).json({ message: 'No certifications found' });
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

    if (!jobSeeker.resume || !jobSeeker.resume.certifications) {
      return res.status(404).json({ message: 'No certifications found' });
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

// Export resume 
export const exportResume = async (req, res) => {
  console.log('=== PDF Export Started ===');
  console.log('User ID:', req.user?.id);
  
  try {
    const jobSeeker = await JobSeeker.findById(req.user.id);
    console.log('JobSeeker found:', !!jobSeeker);
    
    if (!jobSeeker) {
      console.log('ERROR: User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Resume exists:', !!jobSeeker.resume);
    if (!jobSeeker.resume) {
      console.log('ERROR: No resume found');
      return res.status(404).json({ message: 'No resume found' });
    }

    const resume = jobSeeker.resume;
    
    // Get template color from query parameter, default to modern blue
    const templateColor = req.query.color || '#2563eb';
    console.log('Using template color:', templateColor);

    // Helper function to convert hex to RGB for pdfkit
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 37, g: 99, b: 235 }; // Default blue
    };

    const primaryRgb = hexToRgb(templateColor);
    console.log('RGB values:', primaryRgb);

    console.log('Creating PDFDocument...');
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });
    console.log('PDFDocument created successfully');

    // Set response headers for PDF download
    console.log('Setting response headers...');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=resume_${jobSeeker.name?.replace(/\s+/g, '_') || 'user'}_${Date.now()}.pdf`);
    console.log('Response headers set');

    // Pipe the PDF directly to the response
    console.log('Piping PDF to response...');
    doc.pipe(res);
    console.log('PDF piped to response');

    // Add content with null checks
    try {
      console.log('Starting PDF content generation...');
      
      // Header - Name and Title
      const name = resume.personalInfo?.fullName || resume.personalInfo?.name || 'Your Name';
      console.log('Adding name:', name);
      doc.fontSize(24).font('Helvetica-Bold')
         .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
         .text(name, { align: 'center' });
      
      if (resume.personalInfo?.title) {
        console.log('Adding title:', resume.personalInfo.title);
        doc.fontSize(14).font('Helvetica').fillColor('#4b5563').text(resume.personalInfo.title, { align: 'center' });
      }
      doc.moveDown(0.5);

      // Contact Information
      if (resume.personalInfo) {
        const contactInfo = [
          resume.personalInfo.email,
          resume.personalInfo.phone,
          resume.personalInfo.location,
          resume.personalInfo.linkedin,
          resume.personalInfo.website
        ].filter(Boolean).join(' | ');
        
        if (contactInfo) {
          console.log('Adding contact info');
          doc.fontSize(10).font('Helvetica').fillColor('#6b7280').text(contactInfo, { align: 'center' });
        }
      }
      doc.moveDown(1.5);

      // Professional Summary
      if (resume.summary) {
        console.log('Adding summary section');
        doc.fontSize(16).font('Helvetica-Bold')
           .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
           .text('PROFESSIONAL SUMMARY');
        doc.strokeColor(primaryRgb.r, primaryRgb.g, primaryRgb.b).lineWidth(2);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor('#000000').text(resume.summary, { align: 'justify' });
        doc.moveDown(1.5);
      }

      // Work Experience
      if (resume.experience && Array.isArray(resume.experience) && resume.experience.length > 0) {
        console.log('Adding experience section, count:', resume.experience.length);
        doc.fontSize(16).font('Helvetica-Bold')
           .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
           .text('WORK EXPERIENCE');
        doc.strokeColor(primaryRgb.r, primaryRgb.g, primaryRgb.b).lineWidth(2);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown(0.5);

        resume.experience.forEach((exp, index) => {
          console.log(`Adding experience ${index + 1}:`, exp.title || exp.position);
          
          if (doc.y > doc.page.height - 150) {
            doc.addPage();
          }

          doc.fontSize(12).font('Helvetica-Bold')
             .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
             .text(exp.title || exp.position || 'Position');
          doc.fontSize(11).font('Helvetica-Oblique').fillColor('#4b5563')
             .text(`${exp.company || 'Company'}${exp.location ? ' | ' + exp.location : ''}`);
          
          const startDate = exp.startDate || '';
          const endDate = exp.current ? 'Present' : (exp.endDate || '');
          if (startDate || endDate) {
            doc.fontSize(10).font('Helvetica').fillColor('#6b7280')
               .text(`${startDate}${startDate && endDate ? ' - ' : ''}${endDate}`);
          }
          doc.moveDown(0.3);
          
          if (exp.description) {
            doc.fontSize(10).font('Helvetica').fillColor('#000000').text(exp.description, { align: 'justify' });
          }
          
          if (exp.achievements && Array.isArray(exp.achievements) && exp.achievements.length > 0) {
            doc.moveDown(0.3);
            exp.achievements.forEach((achievement) => {
              doc.fontSize(10).fillColor('#000000').text(`• ${achievement}`, { indent: 10 });
            });
          }
          
          if (index < resume.experience.length - 1) {
            doc.moveDown(1);
          }
        });
        doc.moveDown(1.5);
      }

      // Education
      if (resume.education && Array.isArray(resume.education) && resume.education.length > 0) {
        console.log('Adding education section, count:', resume.education.length);
        
        if (doc.y > doc.page.height - 150) {
          doc.addPage();
        }

        doc.fontSize(16).font('Helvetica-Bold')
           .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
           .text('EDUCATION');
        doc.strokeColor(primaryRgb.r, primaryRgb.g, primaryRgb.b).lineWidth(2);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown(0.5);

        resume.education.forEach((edu, index) => {
          console.log(`Adding education ${index + 1}:`, edu.degree);
          
          doc.fontSize(12).font('Helvetica-Bold')
             .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
             .text(edu.degree || 'Degree');
          doc.fontSize(11).font('Helvetica').fillColor('#4b5563')
             .text(edu.institution || edu.school || 'Institution');
          
          const eduDetails = [];
          if (edu.startDate || edu.endDate) {
            eduDetails.push(`${edu.startDate || ''} - ${edu.endDate || ''}`);
          }
          if (edu.gpa) {
            eduDetails.push(`GPA: ${edu.gpa}`);
          }
          if (eduDetails.length > 0) {
            doc.fontSize(10).fillColor('#6b7280').text(eduDetails.join(' | '));
          }
          doc.moveDown(1);
        });
        doc.moveDown(0.5);
      }

      // Skills
      if (resume.skills && Array.isArray(resume.skills) && resume.skills.length > 0) {
        console.log('Adding skills section, count:', resume.skills.length);
        
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }

        doc.fontSize(16).font('Helvetica-Bold')
           .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
           .text('SKILLS');
        doc.strokeColor(primaryRgb.r, primaryRgb.g, primaryRgb.b).lineWidth(2);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').fillColor('#000000').text(resume.skills.join(', '), { align: 'justify' });
        doc.moveDown(1.5);
      }

      // Certifications
      if (resume.certifications && Array.isArray(resume.certifications) && resume.certifications.length > 0) {
        console.log('Adding certifications section, count:', resume.certifications.length);
        
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }

        doc.fontSize(16).font('Helvetica-Bold')
           .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
           .text('CERTIFICATIONS');
        doc.strokeColor(primaryRgb.r, primaryRgb.g, primaryRgb.b).lineWidth(2);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown(0.5);

        resume.certifications.forEach((cert) => {
          doc.fontSize(11).font('Helvetica').fillColor('#000000')
             .text(`• ${cert.name}${cert.issuer ? ' - ' + cert.issuer : ''}${cert.date ? ' (' + cert.date + ')' : ''}`);
        });
        doc.moveDown(1.5);
      }

      // Projects
      if (resume.projects && Array.isArray(resume.projects) && resume.projects.length > 0) {
        console.log('Adding projects section, count:', resume.projects.length);
        
        if (doc.y > doc.page.height - 150) {
          doc.addPage();
        }

        doc.fontSize(16).font('Helvetica-Bold')
           .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
           .text('PROJECTS');
        doc.strokeColor(primaryRgb.r, primaryRgb.g, primaryRgb.b).lineWidth(2);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown(0.5);

        resume.projects.forEach((project, index) => {
          console.log(`Adding project ${index + 1}:`, project.name || project.title);
          
          doc.fontSize(12).font('Helvetica-Bold')
             .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
             .text(project.name || project.title || 'Project');
          if (project.description) {
            doc.fontSize(10).font('Helvetica').fillColor('#000000').text(project.description, { align: 'justify' });
          }
          if (project.technologies && Array.isArray(project.technologies)) {
            doc.fontSize(9).font('Helvetica-Oblique').fillColor('#6b7280')
               .text(`Technologies: ${project.technologies.join(', ')}`);
          }
          doc.moveDown(1);
        });
      }

      console.log('PDF content generation completed successfully');

    } catch (contentError) {
      console.error('!!! ERROR generating PDF content !!!');
      console.error('Content Error:', contentError);
      console.error('Error stack:', contentError.stack);
      doc.fontSize(12).fillColor('#000000').text('Error generating resume content. Please check your resume data.');
    }

    // IMPORTANT: Finalize the PDF - this must be called!
    console.log('Finalizing PDF document...');
    doc.end();
    console.log('PDF document finalized and sent');
    console.log('=== PDF Export Completed ===');

  } catch (error) {
    console.error('!!! CRITICAL ERROR in exportResume !!!');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    
    if (!res.headersSent) {
      console.log('Sending error response to client');
      res.status(500).json({ message: 'Server error', error: error.message });
    } else {
      console.log('Headers already sent, cannot send error response');
    }
  }
};