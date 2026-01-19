import axios from "axios";
import JobSeeker from "../models/JobSeeker.js";
import PDFDocument from "pdfkit";

// ---------- helpers ----------
const toYM = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toISOString().slice(0, 7); // YYYY-MM
  } catch {
    return "";
  }
};

const makeId = (fallback = "id") => `${fallback}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

// ✅ FIXED: Updated to handle new certification field names
const buildResumeFromProfile = (jobSeeker) => {
  return {
    personalInfo: {
      fullName: jobSeeker.fullName || "",
      email: jobSeeker.email || "",
      phone: jobSeeker.phone || "",
      location: jobSeeker.location || "",
      linkedin: jobSeeker.linkedin || "",
      github: jobSeeker.github || "",
      website: jobSeeker.website || "",
      summary: jobSeeker.bio || "",
      profilePhoto: jobSeeker.profilePhoto || "",
      coverPhoto: jobSeeker.coverPhoto || "",
    },

    // ✅ FIXED: Read experience from PROFILE ROOT LEVEL (where profile controller saves it)
    experience: (jobSeeker.experience || []).map((exp) => ({
      id: exp._id?.toString() || makeId("exp"),
      company: exp.company || "",
      position: exp.title || "",
      location: exp.location || "",
      startDate: toYM(exp.startDate),
      endDate: toYM(exp.endDate),
      current: !!exp.current,
      description: exp.description || "",
    })),

    // ✅ FIXED: Read education from PROFILE ROOT LEVEL
    education: (jobSeeker.education || []).map((edu) => ({
      id: edu._id?.toString() || makeId("edu"),
      institution: edu.school || "",
      degree: edu.degree || "",
      field: edu.field || "",
      location: "",
      startDate: toYM(edu.startDate),
      endDate: toYM(edu.endDate),
      gpa: "",
      description: edu.description || "",
    })),

    // ✅ FIXED: Read skills from PROFILE ROOT LEVEL
    skills: jobSeeker.skills || [],

    // ✅ FIXED: Read certifications from RESUME (where profile controller saves them)
    // This already works correctly
    certifications: (jobSeeker.resume?.certifications || []).map((cert) => ({
      id: cert._id?.toString() || cert.id || makeId("cert"),
      title: cert.title || cert.name || "",
      issuingOrg: cert.issuingOrg || cert.issuer || "",
      issueDate: cert.issueDate || toYM(cert.date),
      expiryDate: cert.expiryDate || "",
      credentialId: cert.credentialId || "",
      credentialUrl: cert.credentialUrl || cert.url || "",
      certificateImageUrl: cert.certificateImageUrl || "",
    })),

    // ✅ These come from resume overrides if they exist
    projects: jobSeeker.resume?.projects || [],
    languages: jobSeeker.resume?.languages || [],
    interests: jobSeeker.resume?.interests || [],
  };
};

// ✅ FIXED MERGE FUNCTION - This was the real problem!
const mergeResume = (profileResume, savedResume = {}) => {
  const merged = { ...profileResume };

  // Personal info: field-level override
  const savedPI = savedResume.personalInfo || {};
  merged.personalInfo = {
    ...profileResume.personalInfo,
    ...Object.fromEntries(
      Object.entries(savedPI).filter(([_, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    ),
    profilePhoto: savedPI.profilePhoto?.trim() ? savedPI.profilePhoto : profileResume.personalInfo.profilePhoto,
    coverPhoto: savedPI.coverPhoto?.trim() ? savedPI.coverPhoto : profileResume.personalInfo.coverPhoto,
  };

  // ✅ FIXED: Only use savedResume if it has MORE data than profile
  // This way profile data shows up by default, and resume edits override when they exist
  
  // For experience: use resume only if it has data, otherwise use profile
  if (Array.isArray(savedResume.experience) && savedResume.experience.length > 0) {
    merged.experience = savedResume.experience;
  } else {
    merged.experience = profileResume.experience;
  }

  // For education: use resume only if it has data, otherwise use profile
  if (Array.isArray(savedResume.education) && savedResume.education.length > 0) {
    merged.education = savedResume.education;
  } else {
    merged.education = profileResume.education;
  }

  // For skills: use resume only if it has data, otherwise use profile
  if (Array.isArray(savedResume.skills) && savedResume.skills.length > 0) {
    merged.skills = savedResume.skills;
  } else {
    merged.skills = profileResume.skills;
  }

  // For certifications: use resume only if it has data, otherwise use profile
  if (Array.isArray(savedResume.certifications) && savedResume.certifications.length > 0) {
    merged.certifications = savedResume.certifications;
  } else {
    merged.certifications = profileResume.certifications;
  }

  merged.projects = Array.isArray(savedResume.projects) && savedResume.projects.length > 0 
    ? savedResume.projects 
    : profileResume.projects;
    
  merged.languages = Array.isArray(savedResume.languages) && savedResume.languages.length > 0
    ? savedResume.languages 
    : profileResume.languages;
    
  merged.interests = Array.isArray(savedResume.interests) && savedResume.interests.length > 0
    ? savedResume.interests 
    : profileResume.interests;

  return merged;
};

// ---------- controllers ----------

export const getResume = async (req, res) => {
  try {
    const jobSeeker = await JobSeeker.findById(req.user.id);
    if (!jobSeeker) return res.status(404).json({ message: "User not found" });

    // ✅ Auto-migrate: Add IDs to old data
    let needsSave = false;
    
    if (jobSeeker.resume?.education) {
      jobSeeker.resume.education = jobSeeker.resume.education.map(edu => {
        if (!edu.id && !edu._id) {
          edu.id = new mongoose.Types.ObjectId().toString();
          needsSave = true;
        }
        return edu;
      });
    }

    if (jobSeeker.resume?.experience) {
      jobSeeker.resume.experience = jobSeeker.resume.experience.map(exp => {
        if (!exp.id && !exp._id) {
          exp.id = new mongoose.Types.ObjectId().toString();
          needsSave = true;
        }
        return exp;
      });
    }

    if (jobSeeker.resume?.certifications) {
      jobSeeker.resume.certifications = jobSeeker.resume.certifications.map(cert => {
        if (!cert.id && !cert._id) {
          cert.id = new mongoose.Types.ObjectId().toString();
          needsSave = true;
        }
        return cert;
      });
    }

    if (needsSave) {
      await jobSeeker.save();
    }

    const profileResume = buildResumeFromProfile(jobSeeker);
    const savedResume = jobSeeker.resume || {};
    const merged = mergeResume(profileResume, savedResume);

    return res.json({ resume: merged });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateResume = async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) return res.status(400).json({ message: "Resume data is required" });

    const jobSeeker = await JobSeeker.findById(req.user.id);
    if (!jobSeeker) return res.status(404).json({ message: "User not found" });

    jobSeeker.resume = resumeData;
    await jobSeeker.save();

    const profileResume = buildResumeFromProfile(jobSeeker);
    const merged = mergeResume(profileResume, jobSeeker.resume);

    return res.json({ message: "Resume updated successfully", resume: merged });
  } catch (error) {
    console.error("Error updating resume:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updatePersonalInfo = async (req, res) => {
  try {
    const { personalInfo } = req.body;
    if (!personalInfo) return res.status(400).json({ message: "Personal info is required" });

    const jobSeeker = await JobSeeker.findById(req.user.id);
    if (!jobSeeker) return res.status(404).json({ message: "User not found" });

    if (!jobSeeker.resume) jobSeeker.resume = {};
    jobSeeker.resume.personalInfo = personalInfo;

    await jobSeeker.save();

    const profileResume = buildResumeFromProfile(jobSeeker);
    const merged = mergeResume(profileResume, jobSeeker.resume);

    return res.json({
      message: "Personal information updated successfully",
      resume: merged,
    });
  } catch (error) {
    console.error("Error updating personal info:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addExperience = async (req, res) => {
  try {
    const { experience } = req.body;
    if (!experience) return res.status(400).json({ message: "Experience data is required" });

    const jobSeeker = await JobSeeker.findById(req.user.id);
    if (!jobSeeker) return res.status(404).json({ message: "User not found" });

    if (!jobSeeker.resume) jobSeeker.resume = {};
    if (!Array.isArray(jobSeeker.resume.experience)) jobSeeker.resume.experience = [];

    if (!experience.id) experience.id = makeId("exp");
    jobSeeker.resume.experience.push(experience);

    await jobSeeker.save();

    const merged = mergeResume(buildResumeFromProfile(jobSeeker), jobSeeker.resume);
    return res.json({ message: "Experience added successfully", resume: merged });
  } catch (error) {
    console.error("Error adding experience:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addEducation = async (req, res) => {
  try {
    const { education } = req.body;
    if (!education) return res.status(400).json({ message: "Education data is required" });

    const jobSeeker = await JobSeeker.findById(req.user.id);
    if (!jobSeeker) return res.status(404).json({ message: "User not found" });

    if (!jobSeeker.resume) jobSeeker.resume = {};
    if (!Array.isArray(jobSeeker.resume.education)) jobSeeker.resume.education = [];

    if (!education.id) education.id = makeId("edu");
    jobSeeker.resume.education.push(education);

    await jobSeeker.save();

    const merged = mergeResume(buildResumeFromProfile(jobSeeker), jobSeeker.resume);
    return res.json({ message: "Education added successfully", resume: merged });
  } catch (error) {
    console.error("Error adding education:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    if (!skills || !Array.isArray(skills)) return res.status(400).json({ message: "Skills array is required" });

    const jobSeeker = await JobSeeker.findById(req.user.id);
    if (!jobSeeker) return res.status(404).json({ message: "User not found" });

    if (!jobSeeker.resume) jobSeeker.resume = {};
    jobSeeker.resume.skills = skills;

    await jobSeeker.save();

    const merged = mergeResume(buildResumeFromProfile(jobSeeker), jobSeeker.resume);
    return res.json({ message: "Skills updated successfully", resume: merged });
  } catch (error) {
    console.error("Error updating skills:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addCertification = async (req, res) => {
  try {
    console.log("🔥 HIT resumeController addCertification");
    console.log("ADD CERT BODY of resume:", req.body);

    const certification = req.body;

    if (!certification?.title || !certification?.issuingOrg) {
      return res.status(400).json({ message: "title and issuingOrg are required" });
    }

    const jobSeeker = await JobSeeker.findById(req.user.id);
    if (!jobSeeker) return res.status(404).json({ message: "User not found" });

    if (!jobSeeker.resume) jobSeeker.resume = {};
    if (!Array.isArray(jobSeeker.resume.certifications)) jobSeeker.resume.certifications = [];

    if (!certification.id) certification.id = makeId("cert");
    jobSeeker.resume.certifications.push(certification);

    await jobSeeker.save();

    const merged = mergeResume(buildResumeFromProfile(jobSeeker), jobSeeker.resume);
    return res.json({ message: "Certification added successfully", resume: merged });
  } catch (error) {
    console.error("Error adding certification:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper to fetch image as buffer
const fetchImageBuffer = async (url) => {
  if (!url) return null;
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    console.error("Error fetching image:", error.message);
    return null;
  }
};


export const addProject = async (req, res) => {
  try {
    const { project } = req.body;
    if (!project) return res.status(400).json({ message: "Project data is required" });

    const jobSeeker = await JobSeeker.findById(req.user.id);
    if (!jobSeeker) return res.status(404).json({ message: "User not found" });

    if (!jobSeeker.resume) jobSeeker.resume = {};
    if (!Array.isArray(jobSeeker.resume.projects)) jobSeeker.resume.projects = [];

    if (!project.id) project.id = makeId("proj");
    jobSeeker.resume.projects.push(project);

    await jobSeeker.save();

    const merged = mergeResume(buildResumeFromProfile(jobSeeker), jobSeeker.resume);
    return res.json({ message: "Project added successfully", resume: merged });
  } catch (error) {
    console.error("Error adding project:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    if (!language) return res.status(400).json({ message: "Language data is required" });

    const jobSeeker = await JobSeeker.findById(req.user.id);
    if (!jobSeeker) return res.status(404).json({ message: "User not found" });

    if (!jobSeeker.resume) jobSeeker.resume = {};
    if (!Array.isArray(jobSeeker.resume.languages)) jobSeeker.resume.languages = [];

    if (!language.id) language.id = makeId("lang");
    jobSeeker.resume.languages.push(language);

    await jobSeeker.save();

    const merged = mergeResume(buildResumeFromProfile(jobSeeker), jobSeeker.resume);
    return res.json({ message: "Language added successfully", resume: merged });
  } catch (error) {
    console.error("Error adding language:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateLanguage = async (req, res) => {
  try {
    const { languageId } = req.params;
    const { language } = req.body;
    
    if (!language) return res.status(400).json({ message: "Language data is required" });

    const jobSeeker = await JobSeeker.findById(req.user.id);
    if (!jobSeeker) return res.status(404).json({ message: "User not found" });

    if (!jobSeeker.resume) jobSeeker.resume = {};
    if (!Array.isArray(jobSeeker.resume.languages)) jobSeeker.resume.languages = [];

    const index = jobSeeker.resume.languages.findIndex(
      (lang) => (lang.id || lang._id?.toString()) === languageId
    );

    if (index === -1) {
      return res.status(404).json({ message: "Language not found" });
    }

    jobSeeker.resume.languages[index] = { ...language, id: languageId };
    await jobSeeker.save();

    const merged = mergeResume(buildResumeFromProfile(jobSeeker), jobSeeker.resume);
    return res.json({ message: "Language updated successfully", resume: merged });
  } catch (error) {
    console.error("Error updating language:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteLanguage = async (req, res) => {
  try {
    const { languageId } = req.params;

    const jobSeeker = await JobSeeker.findById(req.user.id);
    if (!jobSeeker) return res.status(404).json({ message: "User not found" });

    if (!jobSeeker.resume) jobSeeker.resume = {};
    if (!Array.isArray(jobSeeker.resume.languages)) jobSeeker.resume.languages = [];

    jobSeeker.resume.languages = jobSeeker.resume.languages.filter(
      (lang) => (lang.id || lang._id?.toString()) !== languageId
    );

    await jobSeeker.save();

    const merged = mergeResume(buildResumeFromProfile(jobSeeker), jobSeeker.resume);
    return res.json({ message: "Language deleted successfully", resume: merged });
  } catch (error) {
    console.error("Error deleting language:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ FIXED PDF Export with new certification fields
// export const exportResume = async (req, res) => {
//   try {
//     const jobSeeker = await JobSeeker.findById(req.user.id);
//     if (!jobSeeker) return res.status(404).json({ message: "User not found" });

//     const profileResume = buildResumeFromProfile(jobSeeker);
//     const resume = mergeResume(profileResume, jobSeeker.resume || {});

//     const templateColor = req.query.color || "#2563eb";

//     const hexToRgb = (hex) => {
//       if (!hex) return { r: 37, g: 99, b: 235 };
//       const cleaned = String(hex).trim();

//       const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(cleaned);
//       if (short) {
//         const r = parseInt(short[1] + short[1], 16);
//         const g = parseInt(short[2] + short[2], 16);
//         const b = parseInt(short[3] + short[3], 16);
//         return { r, g, b };
//       }

//       const full = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleaned);
//       if (full) {
//         return { r: parseInt(full[1], 16), g: parseInt(full[2], 16), b: parseInt(full[3], 16) };
//       }

//       return { r: 37, g: 99, b: 235 };
//     };

//     const primaryRgb = hexToRgb(templateColor);
//     const doc = new PDFDocument({ margin: 50, size: "A4" });

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=resume_${(resume.personalInfo?.fullName || "user").replace(/\s+/g, "_")}_${Date.now()}.pdf`
//     );

//     doc.pipe(res);

//     // Header
//     const name = resume.personalInfo?.fullName || "Your Name";
//     const profileUrl = resume.personalInfo?.profilePhoto;

//     doc.rect(0, 0, doc.page.width, 80)
//       .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
//       .fill();

//     doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(22)
//       .text(name, 50, 28, { align: "left" });

//     // Profile image
//     const imgBuffer = await fetchImageBuffer(profileUrl);
//     if (imgBuffer) {
//       const imgSize = 56;
//       const x = doc.page.width - 50 - imgSize;
//       const y = 12;

//       doc.save();
//       doc.circle(x + imgSize / 2, y + imgSize / 2, imgSize / 2).clip();
//       doc.image(imgBuffer, x, y, { width: imgSize, height: imgSize });
//       doc.restore();

//       doc.circle(x + imgSize / 2, y + imgSize / 2, imgSize / 2)
//         .lineWidth(2)
//         .strokeColor("#ffffff")
//         .stroke();
//     }

//     doc.moveDown(3);

//     // Contact
//     const contactInfo = [
//       resume.personalInfo?.email,
//       resume.personalInfo?.phone,
//       resume.personalInfo?.location,
//       resume.personalInfo?.linkedin,
//       resume.personalInfo?.website,
//     ]
//       .filter(Boolean)
//       .join(" | ");

//     if (contactInfo) {
//       doc.fontSize(10).font("Helvetica").fillColor("#6b7280").text(contactInfo, { align: "center" });
//     }
//     doc.moveDown(1.5);

//     // Summary
//     const summary = resume.personalInfo?.summary || "";
//     if (summary) {
//       doc.fontSize(16).font("Helvetica-Bold")
//         .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
//         .text("PROFESSIONAL SUMMARY");
//       doc.moveDown(0.5);
//       doc.fontSize(11).font("Helvetica").fillColor("#000000").text(summary, { align: "justify" });
//       doc.moveDown(1.2);
//     }

//     // Experience
//     if (Array.isArray(resume.experience) && resume.experience.length > 0) {
//       doc.fontSize(16).font("Helvetica-Bold")
//         .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
//         .text("WORK EXPERIENCE");
//       doc.moveDown(0.5);

//       resume.experience.forEach((exp, index) => {
//         if (doc.y > doc.page.height - 150) doc.addPage();

//         doc.fontSize(12).font("Helvetica-Bold")
//           .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
//           .text(exp.position || exp.title || "Position");
//         doc.fontSize(11).font("Helvetica-Oblique").fillColor("#4b5563")
//           .text(`${exp.company || "Company"}${exp.location ? " | " + exp.location : ""}`);

//         const startDate = exp.startDate || "";
//         const endDate = exp.current ? "Present" : (exp.endDate || "");
//         if (startDate || endDate) {
//           doc.fontSize(10).font("Helvetica").fillColor("#6b7280")
//             .text(`${startDate}${startDate && endDate ? " - " : ""}${endDate}`);
//         }

//         if (exp.description) {
//           doc.moveDown(0.3);
//           doc.fontSize(10).font("Helvetica").fillColor("#000000").text(exp.description, { align: "justify" });
//         }

//         if (index < resume.experience.length - 1) doc.moveDown(1);
//       });

//       doc.moveDown(1.2);
//     }

//     // Languages
// if (Array.isArray(resume.languages) && resume.languages.length > 0) {
//   if (doc.y > doc.page.height - 100) doc.addPage();

//   doc.fontSize(16).font("Helvetica-Bold")
//     .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
//     .text("LANGUAGES");
//   doc.moveDown(0.5);

//   resume.languages.forEach((lang) => {
//     const langText = `• ${lang.language || "Language"}: ${lang.proficiency || ""}`;
//     doc.fontSize(11).font("Helvetica").fillColor("#000000").text(langText);
//     doc.moveDown(0.4);
//   });

//   doc.moveDown(1.0);
// }
//     // Education
//     if (Array.isArray(resume.education) && resume.education.length > 0) {
//       if (doc.y > doc.page.height - 150) doc.addPage();

//       doc.fontSize(16).font("Helvetica-Bold")
//         .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
//         .text("EDUCATION");
//       doc.moveDown(0.5);

//       resume.education.forEach((edu) => {
//         doc.fontSize(12).font("Helvetica-Bold")
//           .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
//           .text(edu.degree || "Degree");
//         doc.fontSize(11).font("Helvetica").fillColor("#4b5563")
//           .text(edu.institution || edu.school || "Institution");

//         const d = [];
//         if (edu.startDate || edu.endDate) d.push(`${edu.startDate || ""} - ${edu.endDate || ""}`);
//         if (edu.gpa) d.push(`GPA: ${edu.gpa}`);
//         if (d.length) doc.fontSize(10).fillColor("#6b7280").text(d.join(" | "));

//         doc.moveDown(0.8);
//       });

//       doc.moveDown(0.8);
//     }

//     // Skills
//     if (Array.isArray(resume.skills) && resume.skills.length > 0) {
//       doc.fontSize(16).font("Helvetica-Bold")
//         .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
//         .text("SKILLS");
//       doc.moveDown(0.5);

//       let x = 50;
//       let y = doc.y;
//       const paddingX = 8;
//       const paddingY = 4;
//       const gap = 6;

//       doc.fontSize(10).font("Helvetica");

//       for (const skill of resume.skills) {
//         const w = doc.widthOfString(skill) + paddingX * 2;
//         const h = 18;

//         if (x + w > doc.page.width - 50) {
//           x = 50;
//           y += h + gap;
//         }

//         doc.roundedRect(x, y, w, h, 6)
//           .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
//           .opacity(0.12)
//           .fill();

//         doc.opacity(1)
//           .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
//           .text(skill, x + paddingX, y + paddingY);

//         x += w + gap;
//       }

//       doc.moveDown(2);
//     }


//     // ✅ FIXED: Certifications with new field names
//     if (Array.isArray(resume.certifications) && resume.certifications.length > 0) {
//       if (doc.y > doc.page.height - 100) doc.addPage();

//       doc.fontSize(16).font("Helvetica-Bold")
//         .fillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
//         .text("CERTIFICATIONS");
//       doc.moveDown(0.5);

//       resume.certifications.forEach((cert) => {
//         const certText = `• ${cert.title || cert.name || "Certification"}${
//           cert.issuingOrg || cert.issuer ? " - " + (cert.issuingOrg || cert.issuer) : ""
//         }${cert.issueDate || cert.date ? " (" + (cert.issueDate || cert.date) + ")" : ""}`;
        
//         doc.fontSize(11).font("Helvetica").fillColor("#000000").text(certText);
        
//         // ✅ Add credential info if available
//         if (cert.credentialId || cert.credentialUrl) {
//           const details = [];
//           if (cert.credentialId) details.push(`ID: ${cert.credentialId}`);
//           if (cert.credentialUrl) details.push(`URL: ${cert.credentialUrl}`);
          
//           doc.fontSize(9).font("Helvetica").fillColor("#6b7280")
//             .text(`  ${details.join(" | ")}`, { indent: 20 });
//         }
        
//         doc.moveDown(0.5);
//       });

//       doc.moveDown(1.0);
//     }

//     doc.end();
//   } catch (error) {
//     console.error("exportResume error:", error);
//     if (!res.headersSent) {
//       return res.status(500).json({ message: "Server error", error: error.message });
//     }
//   }
// };


// ✅ UPDATED PDF Export to match UI Preview
export const exportResume = async (req, res) => {
  try {
    const jobSeeker = await JobSeeker.findById(req.user.id);
    if (!jobSeeker) return res.status(404).json({ message: "User not found" });

    const profileResume = buildResumeFromProfile(jobSeeker);
    const resume = mergeResume(profileResume, jobSeeker.resume || {});

    // ✅ FIXED: Get color with extensive debugging
    const receivedColor = req.query.color;
    console.log('========== PDF EXPORT DEBUG ==========');
    console.log('🎨 Raw query params:', req.query);
    console.log('🎨 Received color:', receivedColor);
    console.log('🎨 Type of color:', typeof receivedColor);
    
    const templateColor = receivedColor || "#2563eb";
    console.log('🎨 Final template color:', templateColor);

    const hexToRgb = (hex) => {
      console.log('🔍 hexToRgb input:', hex);
      
      if (!hex) {
        console.log('⚠️ No hex provided, using default blue');
        return { r: 37, g: 99, b: 235 };
      }
      
      const cleaned = String(hex).trim();
      console.log('🔍 Cleaned hex:', cleaned);

      // Try short format (#RGB)
      const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(cleaned);
      if (short) {
        const result = {
          r: parseInt(short[1] + short[1], 16),
          g: parseInt(short[2] + short[2], 16),
          b: parseInt(short[3] + short[3], 16)
        };
        console.log('✅ Short format matched:', result);
        return result;
      }

      // Try full format (#RRGGBB)
      const full = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleaned);
      if (full) {
        const result = {
          r: parseInt(full[1], 16),
          g: parseInt(full[2], 16),
          b: parseInt(full[3], 16)
        };
        console.log('✅ Full format matched:', result);
        return result;
      }

      console.log('❌ No format matched, using default blue');
      return { r: 37, g: 99, b: 235 };
    };

    const primaryRgb = hexToRgb(templateColor);
    console.log('🎨 Final RGB values:', primaryRgb);
    console.log('🎨 Template color hex:', templateColor);
    console.log('=====================================');

    // ✅ Convert to decimal format for PDFKit (0-1 range instead of 0-255)
    const colorDecimal = {
      r: primaryRgb.r / 255,
      g: primaryRgb.g / 255,
      b: primaryRgb.b / 255
    };
    console.log('🎨 Decimal color:', colorDecimal);

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=resume_${(resume.personalInfo?.fullName || "user").replace(/\s+/g, "_")}_${Date.now()}.pdf`
    );

    doc.pipe(res);

    const name = resume.personalInfo?.fullName || "Your Name";
    const profileUrl = resume.personalInfo?.profilePhoto;

    // ✅ FIXED: Draw header background - nuclear option with explicit everything
    const headerHeight = 80;
    
    // Reset all states
    doc.save();
    doc.opacity(1);
    
    // Try hex color directly (PDFKit should support this)
    doc.fillColor(templateColor);
    
    console.log('🎨 About to draw header rect with color:', templateColor);
    console.log('🎨 Current fill color state:', doc._fillColor);
    
    doc.rect(0, 0, doc.page.width, headerHeight);
    doc.fill();
    doc.restore();
    
    console.log('✅ Header rect drawn');

    // ✅ Profile image on LEFT side
    const imgBuffer = await fetchImageBuffer(profileUrl);
    const imgSize = 56;
    const imgX = 50; // Left side
    const imgY = 12;

    if (imgBuffer) {
      doc.save();
      doc.circle(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2).clip();
      doc.image(imgBuffer, imgX, imgY, { width: imgSize, height: imgSize });
      doc.restore();

      // White border around profile pic
      doc.strokeColor("#ffffff")
         .lineWidth(2)
         .circle(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2)
         .stroke();
    }

    // ✅ Name positioned to the right of profile picture
    const nameX = imgBuffer ? 120 : 50;
    doc.fillColor("#ffffff")
       .font("Helvetica-Bold")
       .fontSize(22)
       .text(name, nameX, 28, { align: "left" });

    doc.moveDown(3);

    // Contact info
    const contactInfo = [
      resume.personalInfo?.email,
      resume.personalInfo?.phone,
      resume.personalInfo?.location,
      resume.personalInfo?.linkedin,
      resume.personalInfo?.website,
    ]
      .filter(Boolean)
      .join(" | ");

    if (contactInfo) {
      doc.fillColor("#6b7280")
         .font("Helvetica")
         .fontSize(10)
         .text(contactInfo, { align: "center" });
    }
    doc.moveDown(1.5);

    // Summary
    const summary = resume.personalInfo?.summary || "";
    if (summary) {
      doc.font("Helvetica-Bold")
         .fontSize(16)
         .fillAndStroke(templateColor)
         .text("PROFESSIONAL SUMMARY");
      doc.moveDown(0.5);
      doc.fillColor("#000000")
         .font("Helvetica")
         .fontSize(11)
         .text(summary, { align: "justify" });
      doc.moveDown(1.2);
    }

    // Experience
    if (Array.isArray(resume.experience) && resume.experience.length > 0) {
      doc.font("Helvetica-Bold")
         .fontSize(16)
         .fillAndStroke(templateColor)
         .text("WORK EXPERIENCE");
      doc.moveDown(0.5);

      resume.experience.forEach((exp, index) => {
        if (doc.y > doc.page.height - 150) doc.addPage();

        doc.fillColor(templateColor)
           .font("Helvetica-Bold")
           .fontSize(12)
           .text(exp.position || exp.title || "Position");
        
        doc.fillColor("#4b5563")
           .font("Helvetica-Oblique")
           .fontSize(11)
           .text(`${exp.company || "Company"}${exp.location ? " | " + exp.location : ""}`);

        const startDate = exp.startDate || "";
        const endDate = exp.current ? "Present" : (exp.endDate || "");
        if (startDate || endDate) {
          doc.fillColor("#6b7280")
             .font("Helvetica")
             .fontSize(10)
             .text(`${startDate}${startDate && endDate ? " - " : ""}${endDate}`);
        }

        if (exp.description) {
          doc.moveDown(0.3);
          doc.fillColor("#000000")
             .font("Helvetica")
             .fontSize(10)
             .text(exp.description, { align: "justify" });
        }

        if (index < resume.experience.length - 1) doc.moveDown(1);
      });

      doc.moveDown(1.2);
    }

    // Languages
    if (Array.isArray(resume.languages) && resume.languages.length > 0) {
      if (doc.y > doc.page.height - 100) doc.addPage();

      doc.font("Helvetica-Bold")
         .fontSize(16)
         .fillAndStroke(templateColor)
         .text("LANGUAGES");
      doc.moveDown(0.5);

      resume.languages.forEach((lang) => {
        const langText = `• ${lang.language || "Language"}: ${lang.proficiency || ""}`;
        doc.fillColor("#000000")
           .font("Helvetica")
           .fontSize(11)
           .text(langText);
        doc.moveDown(0.4);
      });

      doc.moveDown(1.0);
    }

    // Education
    if (Array.isArray(resume.education) && resume.education.length > 0) {
      if (doc.y > doc.page.height - 150) doc.addPage();

      doc.font("Helvetica-Bold")
         .fontSize(16)
         .fillAndStroke(templateColor)
         .text("EDUCATION");
      doc.moveDown(0.5);

      resume.education.forEach((edu) => {
        doc.fillColor(templateColor)
           .font("Helvetica-Bold")
           .fontSize(12)
           .text(edu.degree || "Degree");
        
        doc.fillColor("#4b5563")
           .font("Helvetica")
           .fontSize(11)
           .text(edu.institution || edu.school || "Institution");

        const d = [];
        if (edu.startDate || edu.endDate) d.push(`${edu.startDate || ""} - ${edu.endDate || ""}`);
        if (edu.gpa) d.push(`GPA: ${edu.gpa}`);
        if (d.length) {
          doc.fillColor("#6b7280")
             .fontSize(10)
             .text(d.join(" | "));
        }

        doc.moveDown(0.8);
      });

      doc.moveDown(0.8);
    }

    // Skills
    if (Array.isArray(resume.skills) && resume.skills.length > 0) {
      if (doc.y > doc.page.height - 100) doc.addPage();
      
      doc.font("Helvetica-Bold")
         .fontSize(16)
         .fillAndStroke(templateColor)
         .text("SKILLS");
      doc.moveDown(0.5);

      let x = 50;
      let y = doc.y;
      const paddingX = 8;
      const paddingY = 4;
      const gap = 6;

      doc.fontSize(10).font("Helvetica");

      for (const skill of resume.skills) {
        const w = doc.widthOfString(skill) + paddingX * 2;
        const h = 18;

        if (x + w > doc.page.width - 50) {
          x = 50;
          y += h + gap;
        }

        // Skill badge background - use hex with opacity
        doc.opacity(0.12)
           .fillColor(templateColor)
           .roundedRect(x, y, w, h, 6)
           .fill();

        // Skill text
        doc.opacity(1)
           .fillColor(templateColor)
           .text(skill, x + paddingX, y + paddingY);

        x += w + gap;
      }

      doc.y = y + 18 + gap;
      doc.moveDown(1);
    }

    // ✅ FIXED: Certifications with proper alignment
    if (Array.isArray(resume.certifications) && resume.certifications.length > 0) {
      if (doc.y > doc.page.height - 100) doc.addPage();

      doc.font("Helvetica-Bold")
         .fontSize(16)
         .fillAndStroke(templateColor)
         .text("CERTIFICATIONS");
      doc.moveDown(0.5);

      resume.certifications.forEach((cert, index) => {
        // Main certification line
        const certName = cert.title || cert.name || "Certification";
        const issuer = cert.issuingOrg || cert.issuer || "";
        const date = cert.issueDate || cert.date || "";
        
        // Build the main line
        let mainLine = `• ${certName}`;
        if (issuer) mainLine += ` - ${issuer}`;
        if (date) mainLine += ` (${date})`;
        
        doc.fillColor("#000000")
           .font("Helvetica")
           .fontSize(11)
           .text(mainLine, 50);
        
        // ✅ FIXED: Credential details on separate line with proper indentation
        if (cert.credentialId || cert.credentialUrl) {
          const details = [];
          if (cert.credentialId) details.push(`ID: ${cert.credentialId}`);
          if (cert.credentialUrl) details.push(`URL: ${cert.credentialUrl}`);
          
          doc.fillColor("#6b7280")
             .font("Helvetica")
             .fontSize(9)
             .text(details.join(" | "), 65); // Indent by 15 pixels
        }
        
        doc.moveDown(0.6);
      });

      doc.moveDown(0.5);
    }

    doc.end();
  } catch (error) {
    console.error("❌ exportResume error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};