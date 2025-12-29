import React, { useState } from "react";
import { Briefcase, Mail, Lock } from "lucide-react";

const CompanyAuth = ({onAuthSuccess}) => {
  const [authMode, setAuthMode] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    location: "",
    description: "",
    industry: "",
    totalEmployees: "",
    logo: "",
  });

  const INDUSTRIES = [
  "IT",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Real Estate",
  "Telecommunications",
  "Transportation",
  "Media",
  "Agriculture",
  "Pharmaceuticals",
  "Construction",
  "Government",
  "Consulting",
  "Other"
];


  const [message, setMessage] = useState({ type: "", text: "" });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateEmail = (email) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = 6;
    const digitRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*]/;

    if (password.length < minLength) {
      return "Password must be at least 6 characters long";
    }
    if (!digitRegex.test(password)) {
      return "Password must contain at least one digit";
    }
    if (!specialCharRegex.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)";
    }
    return null;
  };

  const handleAuth = async (e) => {
  e.preventDefault();
  setMessage({ type: "", text: "" });

  // Frontend validation
  if (!validateEmail(formData.email)) {
    setMessage({ type: "error", text: "Please provide a valid email address" });
    return;
  }

  const passwordError = validatePassword(formData.password);
  if (passwordError) {
    setMessage({ type: "error", text: passwordError });
    return;
  }

  if (authMode === "register" && formData.password !== formData.confirmPassword) {
    setMessage({ type: "error", text: "Passwords do not match!" });
    return;
  }

  try {
    const endpoint =
      authMode === "login"
        ? "http://localhost:5001/api/auth/login"
        : "http://localhost:5001/api/auth/register/company";

    const payload =
      authMode === "login"
        ? {
            email: formData.email,
            password: formData.password,
          }
        : {
            email: formData.email,
            password: formData.password,
            companyName: formData.companyName,
            location: formData.location,
            description: formData.description,
            industry: formData.industry,
            totalEmployees: Number(formData.totalEmployees),
            logo: formData.logo || null,
          };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage({ type: "success", text: data.message || "Success!" });

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userType", "company");
        if (onAuthSuccess) onAuthSuccess();
      }
    } else {
      // If API sends multiple error messages (e.g., from validation)
      if (data.message && typeof data.message === "string") {
        setMessage({ type: "error", text: data.message });
      } else if (data.message && Array.isArray(data.message)) {
        setMessage({ type: "error", text: data.message.join(", ") });
      } else {
        setMessage({ type: "error", text: "Authentication failed!" });
      }
    }
  } catch (error) {
    setMessage({ type: "error", text: "Server error. Please try again later." });
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <Briefcase className="text-indigo-600" size={36} />
              <span className="text-3xl font-bold text-gray-900">JobLink</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-xl font-semibold text-gray-700 mb-4">
            Company {authMode === "login" ? "Login" : "Registration"}
          </h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setAuthMode("login");
                setMessage({ type: "", text: "" });
              }}
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                authMode === "login"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setAuthMode("register");
                setMessage({ type: "", text: "" });
              }}
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                authMode === "register"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="company@email.com"
                />
              </div>
            </div>

            {/* Register-only fields */}
            {authMode === "register" && (
              <>
                <input
                  name="companyName"
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg"
                />

                <input
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg"
                />

                <textarea
                  name="description"
                  placeholder="Company Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg"
                />

                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg"
                >
                  <option value=""disabled>Select Industry</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  name="totalEmployees"
                  placeholder="Total Employees"
                  value={formData.totalEmployees}
                  onChange={handleInputChange}
                  required
                  min={1}
                  className="w-full px-4 py-3 border rounded-lg"
                />

                <input
                  name="logo"
                  placeholder="Logo URL (optional)"
                  value={formData.logo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
            {/* Confirm Password */}
            {authMode === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* Message */}
            {message.text && (
              <div
                className={`p-3 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
            >
              {authMode === "login" ? "Login" : "Create Company"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyAuth;
