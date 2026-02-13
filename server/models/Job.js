import mongoose from "mongoose";

export const INDUSTRY_SKILLS = {
  UNIVERSAL_SKILLS : [
    "Communication", "Critical Thinking","Problem Solving","Teamwork","Adaptability",
    "Time Management","Leadership","Creativity","Attention to Detail","Project Management"
  ],
  IT: [
    "JavaScript","Python","Java","C++","C#","Go","Ruby","PHP","Swift","Kotlin","TypeScript",
    "HTML","CSS","SQL","NoSQL","MongoDB","MySQL","PostgreSQL","AWS","Azure","Google Cloud",
    "Docker","Kubernetes","React","Angular","Vue.js","Node.js","Express.js","Django","Flask",
    "Spring Boot","Machine Learning","Data Analysis","Data Science","AI","TensorFlow","PyTorch",
    "Big Data","Hadoop","Spark","REST API","GraphQL","Git","CI/CD"
  ],
  Finance: [
    "Financial Analysis","Budgeting","Accounting","Tax Planning","Risk Management",
    "Investment Analysis","Auditing","Forecasting","Excel","SAP","QuickBooks",
    "Financial Modeling","Reporting","Treasury Management","Regulatory Compliance"
  ],
  Healthcare: [
    "Patient Care","Clinical Research","Medical Coding","Nursing","Pharmacy",
    "Diagnostic Skills","Healthcare Administration","First Aid","HIPAA Compliance",
    "Laboratory Skills","EHR Management"
  ],
  Education: [
    "Teaching","Curriculum Design","Lesson Planning","Student Assessment","Classroom Management",
    "E-Learning Tools","Educational Technology","Communication","Instructional Design",
    "Tutoring","Mentoring"
  ],
  Manufacturing: [
    "AutoCAD","SolidWorks","Mechanical Design","Electrical Engineering","Quality Assurance",
    "Process Improvement","Production Planning","Lean Manufacturing","Supply Chain Management",
    "Safety Compliance"
  ],
  Retail: [
    "Customer Service","Sales","Inventory Management","Merchandising","Point of Sale (POS)",
    "Visual Merchandising","Marketing","Product Knowledge","Team Management","Upselling"
  ],
  RealEstate: [
    "Property Management","Sales","Marketing","Negotiation","Client Relations","Leasing",
    "Valuation","Investment Analysis","Market Research","Contract Management"
  ],
  Telecommunications: [
    "Network Administration","Telecom Systems","VoIP","Fiber Optics","Troubleshooting",
    "Customer Support","RF Engineering","Wireless Technologies","Project Management",
    "Regulatory Compliance"
  ],
  Transportation: [
    "Logistics","Fleet Management","Route Planning","Supply Chain","Safety Compliance",
    "Traffic Management","Warehouse Management","Customer Service","Operations Coordination",
    "Dispatching"
  ],
  Media: [
    "Content Creation","Video Editing","Photography","Graphic Design","Social Media Marketing",
    "SEO","Copywriting","Public Relations","Broadcasting","Advertising"
  ],
  Agriculture: [
    "Crop Management","Irrigation","Soil Analysis","Fertilization","Pest Control",
    "Farm Machinery Operation","Livestock Management","Sustainable Farming",
    "Agricultural Research","Supply Chain"
  ],
  Pharmaceuticals: [
    "Clinical Trials","Drug Development","Regulatory Compliance","Quality Assurance",
    "Research & Development","Lab Techniques","Data Analysis","Medical Writing",
    "Safety Protocols","Project Management"
  ],
  Construction: [
    "Project Management","AutoCAD","Blueprint Reading","Structural Design","Budgeting",
    "Safety Compliance","Contract Management","Surveying","Civil Engineering","Team Management"
  ],
  Government: [
    "Policy Analysis","Public Administration","Regulatory Compliance","Project Management",
    "Communication","Budgeting","Data Analysis","Legal Knowledge","Research",
    "Stakeholder Management"
  ],
  Consulting: [
    "Business Analysis","Strategic Planning","Project Management","Communication",
    "Problem Solving","Data Analysis","Financial Analysis","Client Relations",
    "Negotiation","Process Improvement"
  ],
  Other: [
    "Communication","Critical Thinking","Problem Solving","Adaptability","Teamwork",
    "Time Management","Research","Customer Service","Data Entry","Technical Writing",
    "Leadership"
  ]
};

const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  title: {
    type: String,
    trim: true,
    maxlength: [100, "Job title cannot exceed 100 characters"],
    required: [true, "Job title is required"]
  },

  description: {
    type: String,
    trim: true,
    required: [true, "Job description is required"]
  },

  location: {
    type: String,
    trim: true,
    required: [true, "Location is required"]
  },

  type: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
    default: "Full-time",
    required: true
  },

  jobTypeCategory: {
    type: String,
    required: [true, "Type of job is required"],
    trim: true
  },

  extraSkills: [
    {
      type: String,
      trim: true
    }
  ],

  experience: {
    type: String,
    required: true,
    enum: {
      values: ["entry", "mid", "senior", "lead"],
      message: "{VALUE} is not a valid experience level"
    }
  },

  salary: {
    type: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "USD" }
    },
    required: true
  },

  skills: [
    {
      type: String,
      trim: true
    }
  ],

  status: {
    type: String,
    enum: ["active", "closed", "hired"],
    default: "active",
    required: true
  },

  postedDate: {
    type: Date,
    default: Date.now,
    required: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ FIXED: Removed next parameter and next() call
jobSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

// Indexes
jobSchema.index({ title: "text", description: "text", skills: "text" });
jobSchema.index({ location: 1, type: 1 });
jobSchema.index({ postedDate: -1 });

export default mongoose.model("Job", jobSchema);