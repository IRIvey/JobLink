import express from "express";
import {
  getResume,
  updateResume,
  updatePersonalInfo,
  addExperience,
  addEducation,
  updateSkills,
  addCertification,
  exportResume,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";
import PDFDocument from "pdfkit"; 
const router = express.Router();

router.use(protect);

// Export resume
router.get("/export", exportResume);
// resumeRoutes.js
const fetchImageBuffer = async (url) => {
  if (!url) return null;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};
// New endpoint for generating PDF from resume object (for companies viewing applicants)
router.post("/generate-pdf", protect, async (req, res) => {
  try {
    const { resume, color } = req.body;

    if (!resume || !resume.personalInfo) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume data',
      });
    }

    console.log('🎨 Generating PDF with color:', color);

    const templateColor = color || "#2563eb";

    const hexToRgb = (hex) => {
      if (!hex) return { r: 37, g: 99, b: 235 };
      
      const cleaned = String(hex).trim();
      const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(cleaned);
      if (short) {
        return {
          r: parseInt(short[1] + short[1], 16),
          g: parseInt(short[2] + short[2], 16),
          b: parseInt(short[3] + short[3], 16)
        };
      }

      const full = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleaned);
      if (full) {
        return {
          r: parseInt(full[1], 16),
          g: parseInt(full[2], 16),
          b: parseInt(full[3], 16)
        };
      }

      return { r: 37, g: 99, b: 235 };
    };

    const primaryRgb = hexToRgb(templateColor);
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=resume_${(resume.personalInfo?.fullName || "candidate").replace(/\s+/g, "_")}.pdf`
    );

    doc.pipe(res);

    const name = resume.personalInfo?.fullName || "Candidate Name";
    const profileUrl = resume.personalInfo?.profilePhoto;

    // Header background
    const headerHeight = 80;
    doc.save();
    doc.opacity(1);
    doc.fillColor(templateColor);
    doc.rect(0, 0, doc.page.width, headerHeight);
    doc.fill();
    doc.restore();

    // Profile image
    const imgBuffer = await fetchImageBuffer(profileUrl);
    const imgSize = 56;
    const imgX = 50;
    const imgY = 12;

    if (imgBuffer) {
      doc.save();
      doc.circle(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2).clip();
      doc.image(imgBuffer, imgX, imgY, { width: imgSize, height: imgSize });
      doc.restore();

      doc.strokeColor("#ffffff")
         .lineWidth(2)
         .circle(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2)
         .stroke();
    }

    // Name
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

        doc.opacity(0.12)
           .fillColor(templateColor)
           .roundedRect(x, y, w, h, 6)
           .fill();

        doc.opacity(1)
           .fillColor(templateColor)
           .text(skill, x + paddingX, y + paddingY);

        x += w + gap;
      }

      doc.y = y + 18 + gap;
      doc.moveDown(1);
    }

    // Certifications
    if (Array.isArray(resume.certifications) && resume.certifications.length > 0) {
      if (doc.y > doc.page.height - 100) doc.addPage();

      doc.font("Helvetica-Bold")
         .fontSize(16)
         .fillAndStroke(templateColor)
         .text("CERTIFICATIONS");
      doc.moveDown(0.5);

      resume.certifications.forEach((cert) => {
        const certName = cert.title || cert.name || "Certification";
        const issuer = cert.issuingOrg || cert.issuer || "";
        const date = cert.issueDate || cert.date || "";
        
        let mainLine = `• ${certName}`;
        if (issuer) mainLine += ` - ${issuer}`;
        if (date) mainLine += ` (${date})`;
        
        doc.fillColor("#000000")
           .font("Helvetica")
           .fontSize(11)
           .text(mainLine, 50);
        
        if (cert.credentialId || cert.credentialUrl) {
          const details = [];
          if (cert.credentialId) details.push(`ID: ${cert.credentialId}`);
          if (cert.credentialUrl) details.push(`URL: ${cert.credentialUrl}`);
          
          doc.fillColor("#6b7280")
             .font("Helvetica")
             .fontSize(9)
             .text(details.join(" | "), 65);
        }
        
        doc.moveDown(0.6);
      });

      doc.moveDown(0.5);
    }

    // Projects
    if (Array.isArray(resume.projects) && resume.projects.length > 0) {
      if (doc.y > doc.page.height - 100) doc.addPage();

      doc.font("Helvetica-Bold")
         .fontSize(16)
         .fillAndStroke(templateColor)
         .text("PROJECTS");
      doc.moveDown(0.5);

      resume.projects.forEach((proj) => {
        doc.fillColor(templateColor)
           .font("Helvetica-Bold")
           .fontSize(11)
           .text(proj.name || "Project");
        
        if (proj.description) {
          doc.fillColor("#000000")
             .font("Helvetica")
             .fontSize(10)
             .text(proj.description, { align: "justify" });
        }

        if (proj.technologies) {
          doc.fillColor("#6b7280")
             .fontSize(9)
             .text(`Technologies: ${proj.technologies}`);
        }

        doc.moveDown(0.6);
      });
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
    }

    doc.end();

  } catch (error) {
    console.error('❌ PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate PDF',
        error: error.message,
      });
    }
  }
});
// Get + update full resume
router.get("/", getResume);
router.put("/", updateResume);

// Personal info
router.put("/personal-info", updatePersonalInfo);

// Experience (ONLY add exists in your controller)
router.post("/experience", addExperience);

// Education (ONLY add exists in your controller)
router.post("/education", addEducation);

// Skills
router.put("/skills", updateSkills);

// Certifications (ONLY add exists in your controller)
router.post("/certifications", addCertification);

export default router;

