import React, { useState, useEffect } from "react";
import JobLinkAuth from "./components/Auth/JobLinkAuth.jsx";  
import JobSeekerDashboard from "./components/JobSeeker/JobSeekerDashboard.jsx";  

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

  if (!isAuthenticated) {
    return <JobLinkAuth />;
  }

  if (userType === 'jobseeker') {
    return <JobSeekerDashboard />;
  } else if (userType === 'company') {
    return <div>Company Dashboard (Coming Soon)</div>;
  }

  return <JobLinkAuth />;
}

export default App;