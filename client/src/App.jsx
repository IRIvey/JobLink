
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import JobLinkAuth from "./components/Auth/JobLinkAuth.jsx";  
import JobSeekerDashboard from "./components/JobSeeker/JobSeekerDashboard.jsx";
import ResumeBuilder from "./components/JobSeeker/Resume.jsx";

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
        {/* Public Route - Authentication */}
        <Route 
          path="/auth" 
          element={!isAuthenticated ? <JobLinkAuth /> : <Navigate to="/" replace />} 
        />

        {/* Protected Routes - Job Seeker */}
        {isAuthenticated && userType === 'jobseeker' && (
          <>
            {/* Dashboard Route */}
            <Route path="/" element={<JobSeekerDashboard />} />
            <Route path="/dashboard" element={<JobSeekerDashboard />} />
            
            {/* Resume Builder - Separate Page */}
            <Route path="/resume-builder" element={<ResumeBuilder />} />
          </>
        )}

        {/* Protected Routes - Company */}
        {isAuthenticated && userType === 'company' && (
          <>
            <Route 
              path="/" 
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

        {/* Redirect to auth if not authenticated */}
        <Route 
          path="*" 
          element={
            isAuthenticated 
              ? <Navigate to="/" replace /> 
              : <Navigate to="/auth" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
