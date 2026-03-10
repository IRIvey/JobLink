import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  User,
  FileText,
  LogOut,
  Home,
  Bookmark
} from "lucide-react";

import JobSeekerProfile from "./JobSeekerProfile";
import JobSearch from "./JobSearch";
import Applications from "./Applications";
import SavedJobs from "./SavedJobs";
import JobRecommendations from "./JobRecommendations";
import ChatInterface from "./ChatInterface";
import NotificationPanel from "../NotificationPanel";
import CompanyProfilePublic from "../Company/CompanyProfilePublic";
import JobSeekerSearchOverlay from "./JobSeekerSearchOverlay";

const JobSeekerDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("home");
  const [userData, setUserData] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const [topQuery, setTopQuery] = useState("");
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
        setSelectedCompanyId(event.state.cId || null);

        if (event.state.q) {
          setDashboardSearchQuery(event.state.q);
          setTopQuery(event.state.q);
        }
      } else {
        setActiveTab("home");
        setSelectedCompanyId(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5001/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    window.location.href = "/";
  };

  const handleResumeBuilder = () => {
    navigate("/resume-builder");
  };

  const handleOverlayNavigate = (tab, q) => {
    if (q !== undefined) {
      setDashboardSearchQuery(q);
      setTopQuery(q);
    }

    setActiveTab(tab);

    window.history.pushState(
      { tab, q: q || "" },
      "",
      window.location.pathname
    );
  };

  const navigation = [
    { id: "home", label: "Home", icon: Home },
    { id: "search", label: "Search Jobs", icon: Briefcase },
    { id: "applications", label: "My Applications", icon: FileText },
    { id: "saved", label: "Saved Jobs", icon: Bookmark },
    { id: "resume", label: "My Resume", icon: FileText, isExternal: true },
    { id: "profile", label: "Profile", icon: User }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <JobRecommendations
            userData={userData}
            onViewCompany={(id) => {
              setSelectedCompanyId(id);
              setActiveTab("company-view");

              window.history.pushState(
                { tab: "company-view", cId: id },
                "",
                window.location.pathname
              );
            }}
          />
        );

      case "search":
        return (
          <JobSearch
            userData={userData}
            initialQuery={dashboardSearchQuery}
          />
        );

      case "applications":
        return <Applications userData={userData} />;

      case "saved":
        return <SavedJobs userData={userData} />;

      case "profile":
        return (
          <JobSeekerProfile
            userData={userData}
            onUpdate={fetchUserData}
          />
        );

      case "messages":
        return <ChatInterface userData={userData} />;

      case "company-view":
        return (
          <CompanyProfilePublic
            companyId={selectedCompanyId}
            onBack={() => setActiveTab("home")}
          />
        );

      default:
        return <JobRecommendations userData={userData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center h-16">

            <div className="flex items-center gap-2">
              <Briefcase className="text-indigo-600" size={32} />
              <span className="text-2xl font-bold text-gray-900">
                JobLink
              </span>
            </div>

            <JobSeekerSearchOverlay
              query={topQuery}
              onChange={setTopQuery}
              userData={userData}
              onNavigate={handleOverlayNavigate}
            />

            <div className="flex items-center gap-4">

              <NotificationPanel />

              <div className="flex items-center gap-2">

                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {userData?.email?.[0]?.toUpperCase() || "U"}
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>

              </div>
            </div>

          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">

        <div className="flex gap-6">

          <aside className="w-64 flex-shrink-0">

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-20">

              <nav className="p-4 space-y-1">

                {navigation.map((item) => {

                  const Icon = item.icon;

                  if (item.id === "resume") {

                    return (
                      <button
                        key={item.id}
                        onClick={handleResumeBuilder}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);

                        if (item.id === "search") {

                          setDashboardSearchQuery(topQuery.trim());

                          window.history.pushState(
                            { tab: "search", q: topQuery.trim() },
                            "",
                            window.location.pathname
                          );

                        } else {

                          window.history.pushState(
                            { tab: item.id },
                            "",
                            window.location.pathname
                          );
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >

                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>

                    </button>
                  );
                })}

              </nav>

            </div>
          </aside>

          <main className="flex-1">
            {renderContent()}
          </main>

        </div>

      </div>

    </div>
  );
};

export default JobSeekerDashboard;