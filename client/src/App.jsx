import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import JobLinkAuth from "./components/Auth/JobLinkAuth.jsx";  
import JobSeekerDashboard from "./components/JobSeeker/JobSeekerDashboard.jsx";
import ResumeBuilder from "./components/JobSeeker/Resume.jsx";
import CompanyAuth from "./components/Auth/CompanyAuth.jsx";
import Home from "./components/Home.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    
    if (token && storedUserType) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          isAuthenticated ? (
            userType === 'jobseeker' ? <Navigate to="/dashboard" replace /> : <Navigate to="/company" replace />
          ) : (
            <Home />
          )
        } />

        <Route 
          path="/jobseeker-auth" 
          element={!isAuthenticated ? <JobLinkAuth defaultMode="login" /> : <Navigate to="/" replace />} 
        />

        <Route
          path="/company-auth"
          element={!isAuthenticated ? <CompanyAuth /> : <Navigate to="/" replace />}
        />

        {/* Protected Routes - Job Seeker */}
        {isAuthenticated && userType === 'jobseeker' && (
          <>
            <Route path="/dashboard" element={<JobSeekerDashboard />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
          </>
        )}

        {/* Protected Routes - Company */}
        {isAuthenticated && userType === 'company' && (
          <>
            <Route 
              path="/company" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Company Dashboard</h1>
                    <p className="text-gray-600">Coming Soon...</p>
                  </div>
                </div>
              } 
            />
          </>
        )}

        {/* Catch-All Redirect */}
        <Route 
          path="*" 
          element={
            isAuthenticated 
              ? userType === 'jobseeker' 
                ? <Navigate to="/dashboard" replace /> 
                : <Navigate to="/company" replace />
              : <Navigate to="/" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
