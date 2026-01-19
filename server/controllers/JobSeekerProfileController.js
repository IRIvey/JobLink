// controllers/JobSeekerProfileController.js
import JobSeeker from "../models/JobSeeker.js";
import mongoose from "mongoose";

// Helper: get profile by logged-in JobSeeker id
const getProfileByAuthId = async (req) => {
  const id = req.user?.id || req.user?._id;
  if (!id) return null;
  return JobSeeker.findById(id);
};

// GET Profile
export const getProfile = async (req, res) => {
  try {
    const authId = req.user?.id || req.user?._id;
    if (!authId) return res.status(401).json({ message: "Unauthorized" });

    const profile = await JobSeeker.findById(authId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    return res.status(200).json(profile);
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE Profile (Bio, Skills, Contact, Links, etc.)
// UPDATE Profile (Bio, Skills, Contact, Links, etc.)
export const updateProfile = async (req, res) => {
  try {
    const id = req.user?.id || req.user?._id;
    if (!id) return res.status(401).json({ message: "Unauthorized" });

    const blocked = ["password", "email", "userType", "resume", "createdAt", "updatedAt"];
    blocked.forEach((k) => {
      if (k in req.body) delete req.body[k];
    });

    const profile = await JobSeeker.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // ✅ SYNC fullName to resume.personalInfo.fullName
    if (req.body.fullName) {
      if (!profile.resume) profile.resume = {};
      if (!profile.resume.personalInfo) profile.resume.personalInfo = {};
      profile.resume.personalInfo.fullName = req.body.fullName;
      await profile.save();
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(400).json({ message: "Update failed" });
  }
};

// UPLOAD Profile Photo (Base64 in req.body.image)
export const uploadProfilePhoto = async (req, res) => {
  try {
    const id = req.user?.id || req.user?._id;
    if (!id) return res.status(401).json({ message: "Unauthorized" });

    if (!req.body?.image) {
      return res.status(400).json({ message: "No image provided" });
    }

    const profile = await JobSeeker.findByIdAndUpdate(
      id,
      { profilePhoto: req.body.image },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("uploadProfilePhoto error:", error);
    return res.status(400).json({ message: "Photo upload failed" });
  }
};

// UPLOAD Cover Photo (Base64 in req.body.image)
export const uploadCoverPhoto = async (req, res) => {
  try {
    const id = req.user?.id || req.user?._id;
    if (!id) return res.status(401).json({ message: "Unauthorized" });

    if (!req.body?.image) {
      return res.status(400).json({ message: "No image provided" });
    }

    const profile = await JobSeeker.findByIdAndUpdate(
      id,
      { coverPhoto: req.body.image },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("uploadCoverPhoto error:", error);
    return res.status(400).json({ message: "Cover photo upload failed" });
  }
};

// ADD Experience
export const addExperience = async (req, res) => {
  try {
    const profile = await JobSeeker.findById(req.user.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const body = req.body;
    
    const newExp = {
      title: body.title,
      company: body.company || body.companyName,
      location: body.location,
      startDate: body.startDate || body.from,
      endDate: body.endDate || body.to,
      current: body.current || false,
      description: body.description
    };

    // 1. Add to profile array
    profile.experience.unshift(newExp);
    
    // ✅ Save first to get the Mongoose-generated _id
    await profile.save();
    
    // ✅ Get the _id that Mongoose just generated
    const generatedId = profile.experience[0]._id.toString();

    // 2. Add to resume array with the SAME ID
    if (!profile.resume) profile.resume = {};
    if (!Array.isArray(profile.resume.experience)) profile.resume.experience = [];
    
    const resumeExp = {
      id: generatedId, // ✅ Use the same ID from profile experience
      company: newExp.company,
      position: newExp.title,
      location: newExp.location,
      startDate: newExp.startDate,
      endDate: newExp.endDate,
      current: newExp.current,
      description: newExp.description
    };
    
    profile.resume.experience.unshift(resumeExp);

    await profile.save();
    return res.status(201).json(profile);
  } catch (error) {
    console.error("addExperience error:", error);
    return res.status(400).json({ message: "Error adding experience" });
  }
};

// DELETE Experience
export const deleteExperience = async (req, res) => {
  try {
    const id = req.user?.id || req.user?._id;
    const { experienceId } = req.params;

    const profile = await JobSeeker.findByIdAndUpdate(
      id,
      { 
        $pull: { 
          experience: { _id: experienceId },
          "resume.experience": { 
            $or: [
              { _id: experienceId },
              { id: experienceId }
            ]
          }
        } 
      },
      { new: true }
    );

    if (!profile) return res.status(404).json({ message: "Profile not found" });
    return res.status(200).json(profile);
  } catch (error) {
    console.error("deleteExperience error:", error);
    return res.status(400).json({ message: "Delete failed" });
  }
};

// ADD Education
export const addEducation = async (req, res) => {
  try {
    const profile = await getProfileByAuthId(req);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const body = req.body;
    
    // Create profile-level education
    const newEdu = {
      degree: body.degree,
      school: body.school || body.institution,
      field: body.field,
      startDate: body.startDate,
      endDate: body.endDate,
      description: body.description || ""
    };

    // 1. Add to profile array
    profile.education.unshift(newEdu);
    
    // ✅ IMPORTANT: Save first to get the Mongoose-generated _id
    await profile.save();
    
    // ✅ Get the _id that Mongoose just generated for the education entry
    const generatedId = profile.education[0]._id.toString();

    // 2. Add to resume array with the SAME ID
    if (!profile.resume) profile.resume = {};
    if (!Array.isArray(profile.resume.education)) {
      profile.resume.education = [];
    }

    const resumeEdu = {
      id: generatedId, // ✅ Use the same ID from profile education
      institution: body.school || body.institution,
      degree: body.degree,
      field: body.field,
      location: body.location || "",
      startDate: body.startDate,
      endDate: body.endDate,
      gpa: body.gpa || "",
      description: body.description || ""
    };

    profile.resume.education.unshift(resumeEdu);

    await profile.save();
    return res.status(201).json(profile);
  } catch (error) {
    console.error("addEducation error:", error);
    return res.status(400).json({ message: "Error adding education" });
  }
};

// DELETE Education
export const deleteEducation = async (req, res) => {
  try {
    const id = req.user?.id || req.user?._id;
    const { educationId } = req.params;

    const profile = await JobSeeker.findByIdAndUpdate(
      id,
      { 
        $pull: { 
          education: { _id: educationId },
          "resume.education": { 
            $or: [
              { _id: educationId },
              { id: educationId }
            ]
          }
        } 
      },
      { new: true }
    );

    if (!profile) return res.status(404).json({ message: "Profile not found" });
    return res.status(200).json(profile);
  } catch (error) {
    console.error("deleteEducation error:", error);
    return res.status(400).json({ message: "Delete failed" });
  }
};

// ADD Certification
export const addCertification = async (req, res) => {
  try {
    console.log("🔥 HIT profileController addCertification");
    console.log("ADD CERT BODY of profile:", req.body);

    const jobSeeker = await JobSeeker.findById(req.user.id);
    if (!jobSeeker) return res.status(404).json({ message: "User not found" });

    const body = req.body || {};
    const cert = {
      id: new mongoose.Types.ObjectId().toString(), // ✅ Generate unique ID
      title: body.title || body.name || "",
      issuingOrg: body.issuingOrg || body.issuer || "",
      credentialUrl: body.credentialUrl || body.url || "",
      issueDate: body.issueDate || body.date || "",
      credentialId: body.credentialId || "",
      certificateImageUrl: body.certificateImageUrl || "",
    };

    if (!cert.title.trim() || !cert.issuingOrg.trim()) {
      return res.status(400).json({ message: "title and issuingOrg are required" });
    }

    if (!jobSeeker.resume) jobSeeker.resume = {};
    if (!Array.isArray(jobSeeker.resume.certifications)) jobSeeker.resume.certifications = [];

    jobSeeker.resume.certifications.unshift(cert);
    await jobSeeker.save();

    return res.status(201).json({ message: "Certification added", resume: jobSeeker.resume });
  } catch (error) {
    console.error("addCertification error:", error);
    return res.status(400).json({ message: "Error adding certification" });
  }
};

// DELETE Certification
export const deleteCertification = async (req, res) => {
  try {
    const authId = req.user?.id || req.user?._id;
    const { certificationId } = req.params;

    const profile = await JobSeeker.findByIdAndUpdate(
      authId,
      {
        $pull: {
          "resume.certifications": {
            $or: [{ _id: certificationId }, { id: certificationId }],
          },
        },
      },
      { new: true }
    );

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    return res.status(200).json({
      message: "Deleted successfully",
      certifications: profile.resume.certifications,
    });
  } catch (error) {
    console.error("deleteCertification error:", error);
    return res.status(500).json({ message: "Delete failed" });
  }
};

// ✅ MIGRATION: Fix old data without IDs
export const migrateResumeData = async (req, res) => {
  try {
    const authId = req.user?.id || req.user?._id;
    const profile = await JobSeeker.findById(authId);
    
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    let updated = false;

    // Migrate resume.education - add IDs to entries that don't have them
    if (profile.resume?.education) {
      profile.resume.education = profile.resume.education.map(edu => {
        if (!edu.id && !edu._id) {
          edu.id = new mongoose.Types.ObjectId().toString();
          updated = true;
        } else if (!edu.id && edu._id) {
          edu.id = edu._id.toString();
          updated = true;
        }
        return edu;
      });
    }

    // Migrate resume.experience - add IDs to entries that don't have them
    if (profile.resume?.experience) {
      profile.resume.experience = profile.resume.experience.map(exp => {
        if (!exp.id && !exp._id) {
          exp.id = new mongoose.Types.ObjectId().toString();
          updated = true;
        } else if (!exp.id && exp._id) {
          exp.id = exp._id.toString();
          updated = true;
        }
        return exp;
      });
    }

    // Migrate resume.certifications - add IDs to entries that don't have them
    if (profile.resume?.certifications) {
      profile.resume.certifications = profile.resume.certifications.map(cert => {
        if (!cert.id && !cert._id) {
          cert.id = new mongoose.Types.ObjectId().toString();
          updated = true;
        } else if (!cert.id && cert._id) {
          cert.id = cert._id.toString();
          updated = true;
        }
        return cert;
      });
    }

    // Migrate resume.projects
    if (profile.resume?.projects) {
      profile.resume.projects = profile.resume.projects.map(proj => {
        if (!proj.id && !proj._id) {
          proj.id = new mongoose.Types.ObjectId().toString();
          updated = true;
        } else if (!proj.id && proj._id) {
          proj.id = proj._id.toString();
          updated = true;
        }
        return proj;
      });
    }

    // Migrate resume.languages
    if (profile.resume?.languages) {
      profile.resume.languages = profile.resume.languages.map(lang => {
        if (!lang.id && !lang._id) {
          lang.id = new mongoose.Types.ObjectId().toString();
          updated = true;
        } else if (!lang.id && lang._id) {
          lang.id = lang._id.toString();
          updated = true;
        }
        return lang;
      });
    }

    if (updated) {
      await profile.save();
      return res.status(200).json({ 
        message: "Resume data migrated successfully", 
        profile 
      });
    } else {
      return res.status(200).json({ 
        message: "No migration needed - all entries have IDs", 
        profile 
      });
    }

  } catch (error) {
    console.error("migrateResumeData error:", error);
    return res.status(500).json({ message: "Migration failed" });
  }
};