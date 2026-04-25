import { useEffect, useState } from "react";
import "./profile-panel.css";

function ProfilePanel({ apiBase }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    contactNumber: "",
    department: "",
    designation: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/profile`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to load profile");
      }
      const data = await response.json();
      setProfile(data);
      setForm({
        fullName: data.fullName || "",
        contactNumber: data.contactNumber || "",
        department: data.department || "",
        designation: data.designation || "",
        bio: data.bio || "",
      });
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [apiBase]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      const data = await response.json();
      setProfile(data);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="profile-panel">
      <header>
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Personal details</h1>
          <p className="lead">Update your name, contact number, and details.</p>
        </div>
        {/* {profile ? (
          <div className="profile-meta">
            <span className="label">Email</span>
            <span>{profile.email}</span>
          </div>
        ) : null} */}
      </header>

      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="status">{message}</p> : null}

      {loading ? (
        <p className="status">Loading profile...</p>
      ) : (
        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Contact number
            <input
              name="contactNumber"
              value={form.contactNumber}
              onChange={handleChange}
              placeholder="+94 77 123 4567"
            />
          </label>
          {/* <label>
            Department
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
            />
          </label> */}
          {/* <label>
            Designation
            <input
              name="designation"
              value={form.designation}
              onChange={handleChange}
            />
          </label> */}
          <label>
            Bio
            <textarea
              name="bio"
              rows="4"
              value={form.bio}
              onChange={handleChange}
              placeholder="Share a short bio"
            />
          </label>
          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      )}
    </section>
  );
}

export default ProfilePanel;
