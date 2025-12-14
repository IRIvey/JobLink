import React from 'react';
import { Briefcase, ArrowRight, CheckCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Briefcase className="text-indigo-600" size={32} />
              <span className="text-2xl font-bold text-gray-900">JobLink</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/jobseeker-auth')}
                className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/jobseeker-auth')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Connect Talent with Opportunity
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          JobLink matches job seekers with their dream careers using intelligent skill-based recommendations
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/jobseeker-auth')}
            className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg flex items-center gap-2"
          >
            I'm Looking for Jobs
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => navigate('/company-auth')}
            className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold text-lg flex items-center gap-2"
          >
            I'm Hiring Talent
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mt-20 text-left">
                <div className="bg-white p-8 rounded-xl shadow-sm">
                    <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="text-indigo-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Smart Matching</h3>
                    <p className="text-gray-600">
                    Our skill-based algorithm connects you with the most relevant opportunities
                    </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm">
                    <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Users className="text-indigo-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Easy Applications</h3>
                    <p className="text-gray-600">
                    Apply to multiple jobs with one click and track all your applications
                    </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm">
                    <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Briefcase className="text-indigo-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Resume Builder</h3>
                    <p className="text-gray-600">
                    Create professional resumes with our built-in generator and download as PDF
                    </p>
                </div>
            </div>
        </div>
      </div>
    );
  }

export default Home;
