import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Link as LinkIcon,
  Edit2, 
  Save, 
  X, 
  Plus,
  Camera,
  Trash,
  Trash2,
  Calendar
} from 'lucide-react';

const INDUSTRIES = [
  "IT","Finance","Healthcare","Education","Manufacturing","Retail",
  "Real Estate","Telecommunications","Transportation","Media",
  "Agriculture","Pharmaceuticals","Construction","Government",
  "Consulting","Other"
];

const CompanyProfile = ({ companyData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [itemForm, setItemForm] = useState({});
  const [localCompanyData, setLocalCompanyData] = useState(companyData || {});
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    location: '',
    website: '', 
    description: '',
    industry: '',
    totalEmployees: '',
  });

  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const token = localStorage.getItem('token');
  const API_BASE = "http://localhost:5001/api/companies/profile";

  useEffect(() => {
    if (companyData) {
      setLocalCompanyData(companyData);
      setFormData({
        companyName: companyData.companyName || '',
        email: companyData.email || '',
        location: companyData.location || '',
        website: companyData.website || '',
        description: companyData.description || '',
        industry: companyData.industry || '',
        totalEmployees: companyData.totalEmployees || '',
      });
    }
  }, [companyData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate?.();
      } else {
        console.error("Update failed:", await response.text());
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    if (companyData) {
      setFormData({
        companyName: companyData.companyName || '',
        email: companyData.email || '',
        location: companyData.location || '',
        website: companyData.website || '',
        description: companyData.description || '',
        industry: companyData.industry || '',
        totalEmployees: companyData.totalEmployees || '',
      });
    }
    setIsEditing(false);
  };

  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Max 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/${type === "profile" ? "profile-photo" : "cover-photo"}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ image: reader.result }),
          }
        );

        if (!response.ok) {
          const text = await response.text();
          console.error("Upload failed:", response.status, text);
          return;
        }

        const updatedImage = reader.result;
        setLocalCompanyData((prev) => ({
          ...prev,
          [type === "profile" ? "profilePhoto" : "coverPhoto"]: updatedImage,
        }));

        onUpdate?.();
      } catch (err) {
        console.error("Upload failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCompanyItem = async (path) => {
  try {
    const response = await fetch(`${API_BASE}/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(itemForm),
    });

    if (!response.ok) {
      console.error("Add failed");
      return;
    }

    const data = await response.json(); // contains full updated array

    // Correctly update state
    setLocalCompanyData(prev => ({
      ...prev,
      [path]: data[path] // use "certificates" or "licenses"
    }));

    setShowModal(null);
    setItemForm({});
    onUpdate?.();
  } catch (err) {
    console.error(err);
  }
};

  const handleDeleteCompanyItem = async (path, id) => {
  if (!window.confirm("Are you sure?")) return;

  try {
    const response = await fetch(`${API_BASE}/${path}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Delete failed");
      return;
    }

    // ✅ Update local state immediately
    setLocalCompanyData(prev => ({
      ...prev,
      [path]: (prev[path] || []).filter(item => item._id !== id),
    }));

    onUpdate?.(); // optional if you want to refresh from server too
  } catch (err) {
    console.error(err);
  }
};


  const renderModalForm = () => {
    if (!showModal) return null;

    return (
      <div
        onClick={() => { setShowModal(null); setItemForm({}); }}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-lg p-6 w-96 space-y-4"
        >
          <h3 className="text-lg font-semibold">
            Add {showModal === "certificates" ? "Certificate" : "License"}
          </h3>

          {showModal === "certificates" && (
            <>
              <input type="text" maxLength={50} placeholder="Name" className="w-full border p-2 rounded" value={itemForm.name || ""} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
              <input type="text" maxLength={100} placeholder="Link" className="w-full border p-2 rounded" value={itemForm.link || ""} onChange={(e) => setItemForm({ ...itemForm, link: e.target.value })} />
              <input type="text" maxLength={50} placeholder="Awarded By" className="w-full border p-2 rounded" value={itemForm.awardedBy || ""} onChange={(e) => setItemForm({ ...itemForm, awardedBy: e.target.value })} />
              <label className="text-sm text-gray-600">Awarded Date</label>
              <input type="date" className="w-full border p-2 rounded" value={itemForm.awardedDate || ""} onChange={(e) => setItemForm({ ...itemForm, awardedDate: e.target.value })} />
            </>
          )}

          {showModal === "licenses" && (
            <>
              <input type="text" maxLength={50} placeholder="Name" className="w-full border p-2 rounded" value={itemForm.name || ""} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
              <input type="text" maxLength={50} placeholder="License Number" className="w-full border p-2 rounded" value={itemForm.licenseNumber || ""} onChange={(e) => setItemForm({ ...itemForm, licenseNumber: e.target.value })} />
              <input type="text" maxLength={50} placeholder="Issued By" className="w-full border p-2 rounded" value={itemForm.issuedBy || ""} onChange={(e) => setItemForm({ ...itemForm, issuedBy: e.target.value })} />
              <input type="text" maxLength={200} placeholder="File URL" className="w-full border p-2 rounded" value={itemForm.fileUrl || ""} onChange={(e) => setItemForm({ ...itemForm, fileUrl: e.target.value })} />
              <select className="w-full border p-2 rounded" value={itemForm.fileType || ""} onChange={(e) => setItemForm({ ...itemForm, fileType: e.target.value })}>
                <option value="">Select File Type</option>
                <option value="pdf">PDF</option>
                <option value="jpg">JPG</option>
                <option value="jpeg">JPEG</option>
              </select>
              <label className="text-sm text-gray-600">Issue Date</label>
              <input type="date" className="w-full border p-2 rounded" value={itemForm.issueDate || ""} onChange={(e) => setItemForm({ ...itemForm, issueDate: e.target.value })} />
              <label className="text-sm text-gray-600">Expiry Date</label>
              <input type="date" className="w-full border p-2 rounded" value={itemForm.expiryDate || ""} onChange={(e) => setItemForm({ ...itemForm, expiryDate: e.target.value })} />
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button className="px-4 py-2 rounded border" onClick={() => { setShowModal(null); setItemForm({}); }}>Cancel</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => handleAddCompanyItem(showModal === "certificates" ? "certificates" : "licenses")}>Save</button>
          </div>
        </div>
      </div>
    );
  };

  if (!localCompanyData) return <p>Loading company data...</p>;

  return (
    <div className="space-y-6">
      {/* File Inputs */}
      <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'profile')} />
      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'cover')} />

      {/* Cover + Profile + Name + BIO */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
        <div className="h-48 bg-gray-100 relative">
          {localCompanyData?.coverPhoto ? (
            <img src={localCompanyData.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          )}
          <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-lg hover:bg-white shadow-lg flex items-center gap-1" onClick={() => coverInputRef.current?.click()}>
            <Camera size={16} />
          </button>
        </div>

        <div className="px-8 pb-6 -mt-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            <div className="relative">
              <div className="w-40 h-40 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white overflow-hidden">
                {localCompanyData?.profilePhoto ? (
                  <img src={localCompanyData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  formData.companyName?.[0]?.toUpperCase() || "C"
                )}
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg border border-gray-200" onClick={() => profileInputRef.current?.click()}>
                <Camera size={18} className="text-gray-700" />
              </button>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <input type="text" maxLength={50} name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Company Name" className="text-3xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-indigo-500 w-full" />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">{formData.companyName || "Add Company Name"}</h1>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all">
                <Edit2 size={18} /> Edit Profile
              </button>
            ) : (
              <>
                <button onClick={handleCancel} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
                  <X size={14} /> Cancel
                </button>
                <button disabled={JSON.stringify(formData) === JSON.stringify(companyData)} onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <Save size={14} /> Save
                </button>
              </>
            )}
          </div>
        </div>

        <div className="px-8 pb-8">
          {isEditing ? (
            <textarea maxLength={300} name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Write something about your company..." className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" />
          ) : (
            <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">{formData.description?.trim() ? formData.description : "No company bio added yet."}</p>
          )}
        </div>
      </div>

      {/* Contact & Info */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact & Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['email', 'location', 'website', 'industry', 'totalEmployees'].map((field) => (
            <div key={field}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                {field === 'email' && <Mail size={16} />}
                {field === 'location' && <MapPin size={16} />}
                {field === 'website' && <LinkIcon size={16} />}
                <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
              </label>

              {isEditing ? (
                field === 'industry' ? (
                  <select name="industry" value={formData.industry} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((ind) => (<option key={ind} value={ind}>{ind}</option>))}
                  </select>
                ) : (
                  <input type={field === 'website' ? 'url' : 'text'} name={field} value={formData[field]} onChange={handleInputChange} placeholder={`Enter ${field}`} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                )
              ) : (
                <p className="text-gray-900 py-3">{formData[field] || 'Not provided'}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ================== CERTIFICATES SECTION ================== */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Certificates</h2>
          <button
            className="flex items-center gap-2 text-indigo-600 font-semibold"
            onClick={() => {
              setShowModal("certificates");
              setItemForm({});
            }}
          >
            <Plus size={16} /> Add
          </button>
        </div>

        <div className="space-y-4">
          {localCompanyData.certificates?.length ? (
            localCompanyData.certificates.map((cert) => (
              <div
                key={cert._id}
                className="group relative border-l-4 border-indigo-500 pl-6 py-3"
              >
                <button
                  type="button"
                  onClick={() => handleDeleteCompanyItem("certificates", cert._id)}
                  className="absolute right-0 top-0 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash size={16} />
                </button>

                <h3 className="text-lg font-bold text-gray-900">{cert.name}</h3>
                <p className="text-indigo-600 font-medium">
                  {cert.awardedBy}
                </p>

                <div className="mt-1 flex gap-3 flex-wrap">
                  {cert.link && (
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <LinkIcon size={14} /> View Certificate
                    </a>
                  )}
                </div>

                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <Calendar size={14} />
                  {cert.awardedDate ? new Date(cert.awardedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ""}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No certificates added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ================== LICENSES SECTION ================== */}
      <div className="bg-white rounded-xl shadow-lg border p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Licenses</h2>
          <button
            className="flex items-center gap-2 text-indigo-600 font-semibold"
            onClick={() => {
              setShowModal("licenses");
              setItemForm({});
            }}
          >
            <Plus size={16} /> Add
          </button>
        </div>

        <div className="space-y-4">
          {localCompanyData.licenses?.length ? (
            localCompanyData.licenses.map((lic) => (
              <div
                key={lic._id}
                className="group relative border-l-4 border-green-500 pl-6 py-3"
              >
                <button
                  type="button"
                  onClick={() => handleDeleteCompanyItem("licenses", lic._id)}
                  className="absolute right-0 top-0 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash size={16} />
                </button>

                <h3 className="text-lg font-bold text-gray-900">{lic.name}</h3>
                <p className="text-indigo-600 font-medium">{lic.issuedBy}</p>

                {lic.fileUrl && (
                  <a
                    href={lic.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    <LinkIcon size={14} /> View File
                  </a>
                )}

                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <Calendar size={14} />
                  {lic.issueDate
                    ? `${new Date(lic.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} - ${lic.expiryDate ? new Date(lic.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : "Present"}`
                    : ""}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No licenses added yet</p>
            </div>
          )}
        </div>
      </div>

      {renderModalForm()}
    </div>
  );
};

export default CompanyProfile;
