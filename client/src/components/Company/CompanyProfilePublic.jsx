import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CompanyProfile from "./CompanyProfilePage";

const API_BASE = "http://localhost:5001/api/companies/profile-public";

// Update the definition to accept companyId as a prop
const CompanyProfilePublic = ({ companyId }) => {
  const { id: urlId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use the prop if available (tab view), otherwise use the URL (direct link view)
  const finalId = companyId || urlId;

  useEffect(() => {
    const fetchCompany = async () => {
      // Prevent fetch if no ID is found (prevents the 500 error)
      if (!finalId || finalId === 'undefined') return;

      try {
        const res = await fetch(`${API_BASE}/${finalId}`);
        const data = await res.json();
        if (data.success) setCompany(data.company);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [finalId]); // Re-run if ID changes

  if (loading) return <p className="p-10 text-center">Loading...</p>;
  
  // Provide a "Back" button if it's rendered inside the dashboard tab
  if (!company) return (
    <div className="p-10 text-center">
      <p>Company not found</p>
    </div>
  );

  return (
    <div className="relative">
      <CompanyProfile companyData={company} isPublicView={true} />
    </div>
  );
};

export default CompanyProfilePublic;