import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";

const PostJob = ({ onJobPosted }) => {
  const [title, setTitle] = useState("");
  const [skillsOptions, setSkillsOptions] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [jobType, setJobType] = useState("");
  const [salary, setSalary] = useState("");
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const experienceMap = {
    "Entry Level": "entry",
    "Mid Level": "mid",
    "Senior Level": "senior",
    "Lead / Management": "lead",
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/api/companies/skills", 
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const options = res.data.skills.map((skill) => ({
          value: skill,
          label: skill,
        }));

        setSkillsOptions(options);
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      }
    };

    fetchSkills();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!description.trim()) {
      setMessage("Job description is required");
      setLoading(false);
      return;
    }

    if (!title.trim()) {
      setMessage("Job title is required");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5001/api/companies/jobs',
        {
          title,
          skills: selectedSkills.map((s) => s.label),
          type: jobType,
          salary,
          experience: experienceMap[experience],
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage("Job posted successfully!");
      onJobPosted && onJobPosted();
      setTitle("");
      setSelectedSkills([]);
      setJobType("");
      setSalary("");
      setExperience("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 -mt-24">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Job</h1>

        {message && (
          <div className="mb-4 text-center text-sm text-red-500">{message}</div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. Senior React Developer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills *
              </label>
              <Select
                isMulti
                value={selectedSkills}
                onChange={setSelectedSkills}
                options={skillsOptions}
                placeholder="Select skills..."
                classNamePrefix="select"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type *
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  jobType === "" ? "text-gray-400" : "text-gray-900"
                }`}
              >
                <option value="" disabled className="text-gray-900">
                  Select job type...
                </option>
                <option className="text-gray-900">Full-time</option>
                <option className="text-gray-900">Part-time</option>
                <option className="text-gray-900">Contract</option>
                <option className="text-gray-900">Freelance</option>
                <option className="text-gray-900">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Range
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. $80k - $120k"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  experience === "" ? "text-gray-400" : "text-gray-900"
                }`}
              >
                <option value="" disabled className="text-gray-900">
                  Select experience level...
                </option>
                <option className="text-gray-900">Entry Level</option>
                <option className="text-gray-900">Mid Level</option>
                <option className="text-gray-900">Senior Level</option>
                <option className="text-gray-900">Lead / Management</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              rows="6"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe the role, responsibilities, and requirements..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              {loading ? "Posting..." : "Publish Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;