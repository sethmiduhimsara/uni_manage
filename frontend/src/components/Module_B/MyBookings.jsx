import { useEffect, useState } from "react";
import "./user-booking.css";
import SkeletonBlocks from "../common/SkeletonBlocks";

async function parseApiError(response, fallbackMessage) {
  try {
    const data = await response.json();
    if (data?.message) return data.message;
    if (data?.error) return data.error;
  } catch {
    // Ignore JSON parse errors and use fallback.
  }
  return fallbackMessage;
}

function MyBookings({ apiBase }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resources, setResources] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/bookings/me`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to load bookings"),
        );
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch(`${apiBase}/api/resources`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (err) {
      console.error("Failed to load resources", err);
    }
  };

  useEffect(() => {
    loadBookings();
    fetchResources();
  }, [apiBase]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?"))
      return;
    try {
      const response = await fetch(`${apiBase}/api/bookings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to delete booking"),
        );
      }
      loadBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingBooking((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const now = new Date();
    const selectedDate = new Date(editingBooking.date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const bookingDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );

    if (bookingDate < today) {
      alert("Booking date cannot be in the past.");
      return;
    }

    if (bookingDate.getTime() === today.getTime()) {
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startH, startM] = editingBooking.startTime.split(":").map(Number);
      const startTime = startH * 60 + startM;

      if (startTime < currentTime) {
        alert("Booking time cannot be in the past for today.");
        return;
      }
    }

    try {
      const response = await fetch(
        `${apiBase}/api/bookings/${editingBooking.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...editingBooking,
            expectedAttendees: Number(editingBooking.expectedAttendees),
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to update booking"),
        );
      }
      setEditingBooking(null);
      loadBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  const todayStr = new Date().toLocaleDateString("en-CA");

  return (
    <section className="user-booking">
      <header>
        <div>
          <p className="eyebrow">Module B</p>
          <h1>My Bookings</h1>
          <p className="lead">Track your booking requests and status.</p>
        </div>
        <button className="btn ghost" type="button" onClick={loadBookings}>
          Refresh
        </button>
      </header>

      {error ? <p className="error">{error}</p> : null}
      {loading ? (
        <div className="table-card">
          <SkeletonBlocks rows={4} columns={1} compact />
        </div>
      ) : null}

      {!loading ? (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Resource</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="5">No bookings yet.</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.resourceName || booking.resourceId}</td>
                    <td>{booking.date}</td>
                    <td>
                      {booking.startTime} - {booking.endTime}
                    </td>
                    <td>{booking.status}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn ghost sm"
                          onClick={() => setEditingBooking(booking)}
                          disabled={booking.status !== "PENDING"}
                        >
                          Edit
                        </button>
                        <button
                          className="btn ghost sm danger"
                          onClick={() => handleDelete(booking.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {editingBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Booking</h2>
            <form onSubmit={handleUpdate}>
              <div className="grid" style={{ marginBottom: "1rem" }}>
                <label>
                  Resource
                  <select
                    name="resourceId"
                    value={editingBooking.resourceId}
                    onChange={handleEditChange}
                    required
                  >
                    {resources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Date
                  <input
                    name="date"
                    type="date"
                    min={todayStr}
                    value={editingBooking.date}
                    onChange={handleEditChange}
                    required
                  />
                </label>
                <label>
                  Start Time
                  <input
                    name="startTime"
                    type="time"
                    value={editingBooking.startTime}
                    onChange={handleEditChange}
                    required
                  />
                </label>
                <label>
                  End Time
                  <input
                    name="endTime"
                    type="time"
                    value={editingBooking.endTime}
                    onChange={handleEditChange}
                    required
                  />
                </label>
                <label>
                  Attendees
                  <input
                    name="expectedAttendees"
                    type="number"
                    min="1"
                    value={editingBooking.expectedAttendees}
                    onChange={handleEditChange}
                    required
                  />
                </label>
                <label>
                  Purpose
                  <input
                    name="purpose"
                    value={editingBooking.purpose}
                    onChange={handleEditChange}
                    required
                  />
                </label>
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => setEditingBooking(null)}
                >
                  Cancel
                </button>
                <button className="btn primary" type="submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default MyBookings;
