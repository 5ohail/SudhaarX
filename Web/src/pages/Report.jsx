import { useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";

export default function Report() {
  const location = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const issues = [
    "Potholes",
    "Overflowing Dustbins",
    "Malfunctioning Street Lights",
    "Pathogenic WaterBodies",
    "Illegal Dumping",
    "Water Leakage",
    "Blocked Drains",
    "Noise Pollution",
    "Miscellaneous",
  ];

  // Fetch location: GPS → IP fallback
  useEffect(() => {
    const getLocation = async () => {
      setLoadingLocation(true);
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            setCoords({ latitude, longitude });
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
              const data = await res.json();
              setAddress(data.display_name || `${latitude}, ${longitude}`);
            } catch {
              setAddress(`${latitude}, ${longitude}`);
            }
            setLoadingLocation(false);
          },
          async () => {
            try {
              const res = await fetch("https://ipapi.co/json/");
              const data = await res.json();
              setAddress(
                data.city && data.region && data.country_name
                  ? `${data.city}, ${data.region}, ${data.country_name}`
                  : "Location unavailable"
              );
            } catch {
              setAddress("Location unavailable");
            }
            setLoadingLocation(false);
          }
        );
      }
    };
    getLocation();
  }, []);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newPhotos = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Report submitted for: ${title}\nLocation: ${address}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl p-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            🚨 Civic Issue Report
          </h1>
          <p className="text-gray-500 mt-2">
            Submit civic issues with details & photos for faster resolution.
          </p>
        </header>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Issue Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Type
            </label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3"
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
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              required
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3"
              rows="4"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photos
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="cursor-pointer text-indigo-600 font-medium"
              >
                Click to upload or drag & drop
              </label>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG up to 5MB each
              </p>
            </div>

            {photos.length > 0 && (
              <div className="flex gap-3 flex-wrap mt-4">
                {photos.map((p, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 border rounded-lg overflow-hidden shadow-md"
                  >
                    <img
                      src={p.url}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs shadow"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={loadingLocation ? "Fetching location..." : address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3"
            />
            {coords && (
              <p className="text-xs text-gray-500 mt-1">
                Lat: {coords.latitude}, Lng: {coords.longitude}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 shadow-md transition"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
