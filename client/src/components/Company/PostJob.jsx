import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";

const PostJob = ({ onJobPosted }) => {
  const [title, setTitle] = useState("");
  // Location state removed as it's handled by the backend
  const [skillsOptions, setSkillsOptions] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [jobType, setJobType] = useState("Full-time");
  const [salary, setSalary] = useState("");
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [jobTypeCategory, setJobTypeCategory] = useState("");
  const [extraSkills, setExtraSkills] = useState([]);
  const [extraSkillInput, setExtraSkillInput] = useState("");

  const experienceMap = {
    "Entry Level": "entry",
    "Mid Level": "mid",
    "Senior Level": "senior",
    "Lead / Management": "lead",
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/companies/categories", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCategories(res.data.categories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSkillsByCategory = async () => {
      if (!jobTypeCategory) {
        setSkillsOptions([]);
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:5001/api/companies/skills?category=${jobTypeCategory}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const options = res.data.skills.map((skill) => ({ value: skill, label: skill }));
        setSkillsOptions(options);
        setSelectedSkills([]);
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      }
    };
    fetchSkillsByCategory();
  }, [jobTypeCategory]);

  const handleAddExtraSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = extraSkillInput.trim();
    if (trimmed && !extraSkills.includes(trimmed)) {
      setExtraSkills([...extraSkills, trimmed]);
      setExtraSkillInput("");
    }
  };

  const removeExtraSkill = (skillToRemove) => {
    setExtraSkills(extraSkills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 1. Validation (Location removed from required check)
    if (!title.trim() || !jobTypeCategory || !description.trim() || !experience) {
      setMessage("Please fill in all required fields (Title, Category, Experience, Description)");
      setLoading(false);
      return;
    }

    try {
      // 2. Salary Parsing
      const salaryNums = salary.replace(/[^0-9-]/g, "").split("-");
      const minVal = parseInt(salaryNums[0]) || 0;
      const maxVal = salaryNums[1] ? parseInt(salaryNums[1]) : minVal;

      const payload = {
        title,
        jobTypeCategory,
        description,
        // location is omitted; backend will inject it from company profile
        type: jobType,
        experience: experienceMap[experience],
        skills: [
          ...selectedSkills.map((s) => s.label),
          ...extraSkills
        ],
        salary: {
          min: minVal,
          max: maxVal,
          currency: "USD",
        },
      };

      const res = await axios.post("http://localhost:5001/api/companies/jobs", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setMessage("Job posted successfully!");
      if (onJobPosted) onJobPosted();

      // Reset states
      setTitle("");
      setSelectedCategory(null);
      setJobTypeCategory("");
      setExtraSkills([]);
      setSelectedSkills([]);
      setJobType("Full-time");
      setSalary("");
      setExperience("");
      setDescription("");
    } catch (err) {
      console.error("Submission Error:", err.response?.data);
      setMessage(err.response?.data?.message || "Failed to post job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 -mt-24">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Job</h1>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm text-center ${message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Title - now full width since location is gone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Senior React Developer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Category *</label>
              <Select
                value={selectedCategory}
                onChange={(s) => {
                  setSelectedCategory(s);
                  setJobTypeCategory(s ? s.value : "");
                }}
                options={categories.map((cat) => ({ value: cat, label: cat }))}
                placeholder="Select category..."
                isClearable
                classNamePrefix="select"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${
                  !jobType ? "text-gray-400" : "text-gray-900"
                }`}
              >
                {/* This acts as the placeholder */}
                <option value="" disabled>
                  Select job type...
                </option>
                
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Standard Skills *</label>
              <Select
                isMulti
                value={selectedSkills}
                onChange={setSelectedSkills}
                options={skillsOptions}
                placeholder={jobTypeCategory ? "Select skills..." : "Pick category first"}
                isDisabled={!jobTypeCategory}
                classNamePrefix="select"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Extra Skills (Custom)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={extraSkillInput}
                  onChange={(e) => setExtraSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddExtraSkill(e)}
                  placeholder="Add custom skill"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button type="button" onClick={handleAddExtraSkill} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">ADD</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {extraSkills.map((s, i) => (
                  <span key={i} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs border border-gray-200">
                    {s} <button type="button" onClick={() => removeExtraSkill(s)} className="text-red-500 hover:text-red-700 font-bold ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. 80000-120000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience *</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="" disabled>Select experience level...</option>
                <option>Entry Level</option>
                <option>Mid Level</option>
                <option>Senior Level</option>
                <option>Lead / Management</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Describe the role..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Job"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;