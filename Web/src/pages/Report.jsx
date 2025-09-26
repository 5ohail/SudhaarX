import { useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
export default function Report() {
  const location=useLocation();
  const [title, setTitle] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState("");

  const issues = [
    "Potholes",
    "Overflowing Dustbins",
    "Malfunctioning Street Lights",
    "Pathogenic WaterBodies",
    "Miscellaneous",
  ];

  useEffect(() => {
    if (location?.state?.issueTitle) setTitle(location.state.issueTitle);
  }, [location]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhoto(URL.createObjectURL(file));
    setPhotoName(file.name);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoName("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Report submitted (demo)");
  };

  return (
    <div className="page report">
      <header className="report-header">
        <h1 className="report-title">Report an Issue</h1>
        <p className="report-sub">
       Help us keep the city clean and functional. 
       report potholes, broken streetlights,
        garbage, or any civic problem here. Provide 
        maximum details faster 
        resolution.
        </p>
      </header>

      <form className="report-form" onSubmit={handleSubmit}>
        <select
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        >
          <option value="" disabled>
            Select an issue
          </option>
          {issues.map((issue, idx) => (
            <option key={idx} value={issue}>
              {issue}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Describe the issue in detail"
          required
        />

        <label className="file-upload">
          <span>📷 Upload or take a photo</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
          />
        </label>

        {photoName && <p className="file-name">{photoName}</p>}

        {photo && (
          <div className="photo-preview">
            <img src={photo} alt="Preview" />
            <button
              type="button"
              className="remove-btn"
              onClick={removePhoto}
            >
              ❌
            </button>
          </div>
        )}

        <input
          type="text"
          placeholder="📍 Enter location/address"
          required
        />

        <button type="submit" className="btn-submit">
          Submit Report
        </button>
      </form>
    </div>
  );
}