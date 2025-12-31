// controllers/JobSeekerProfileController.js
import JobSeeker from "../models/JobSeeker.js";

/**
 * IMPORTANT:
 * Your JobSeeker model does NOT have a `user` field.
 * So we must query by the JobSeeker document itself.
 *
 * This controller assumes your auth middleware sets:
 *   req.user.id  -> the JobSeeker _id (from JWT)
 *
 * If your JWT uses a different key (like req.user._id), change it in one place below.
 */

// Helper: get profile by logged-in JobSeeker id
const getProfileByAuthId = async (req) => {
  const id = req.user?.id || req.user?._id; // support both
  if (!id) return null;
  return JobSeeker.findById(id);
};

// GET Profile
export const getProfile = async (req, res) => {
  try {
    const profile = await getProfileByAuthId(req);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE Profile (Bio, Skills, Contact, Links, etc.)
export const updateProfile = async (req, res) => {
  try {
    const id = req.user?.id || req.user?._id;
    if (!id) return res.status(401).json({ message: "Unauthorized" });

    // ✅ Optional: prevent updating sensitive fields
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
    const profile = await getProfileByAuthId(req);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.experience.unshift(req.body);
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
    if (!id) return res.status(401).json({ message: "Unauthorized" });

    const profile = await JobSeeker.findByIdAndUpdate(
      id,
      { $pull: { experience: { _id: req.params.experienceId } } },
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

    profile.education.unshift(req.body);
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
    if (!id) return res.status(401).json({ message: "Unauthorized" });

    const profile = await JobSeeker.findByIdAndUpdate(
      id,
      { $pull: { education: { _id: req.params.educationId } } },
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
    const profile = await getProfileByAuthId(req);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.certifications.unshift(req.body);
    await profile.save();

    return res.status(201).json(profile);
  } catch (error) {
    console.error("addCertification error:", error);
    return res.status(400).json({ message: "Error adding certification" });
  }
};

// DELETE Certification
export const deleteCertification = async (req, res) => {
  try {
    const id = req.user?.id || req.user?._id;
    if (!id) return res.status(401).json({ message: "Unauthorized" });

    const profile = await JobSeeker.findByIdAndUpdate(
      id,
      { $pull: { certifications: { _id: req.params.certificationId } } },
      { new: true }
    );

    if (!profile) return res.status(404).json({ message: "Profile not found" });
    return res.status(200).json(profile);
  } catch (error) {
    console.error("deleteCertification error:", error);
    return res.status(400).json({ message: "Delete failed" });
  }
};
