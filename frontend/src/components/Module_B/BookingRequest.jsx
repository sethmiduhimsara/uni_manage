import { useEffect, useState } from "react";
import "./user-booking.css";

const emptyForm = {
  resourceId: "",
  date: "",
  startTime: "",
  endTime: "",
  purpose: "",
  expectedAttendees: 1,
};

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

function BookingRequest({ apiBase }) {
  const [form, setForm] = useState(emptyForm);
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResources = async () => {
      setLoadingResources(true);
      try {
        const response = await fetch(`${apiBase}/api/resources`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(
            await parseApiError(response, "Failed to load resources"),
          );
        }
        const data = await response.json();
        setResources(data);
      } catch (err) {
        setError(err.message || "Failed to load resources");
      } finally {
        setLoadingResources(false);
      }
    };
    loadResources();
  }, [apiBase]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");
    const now = new Date();
    const selectedDate = new Date(form.date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const bookingDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    if (bookingDate < today) {
      setError("Booking date cannot be in the past.");
      return;
    }

    if (bookingDate.getTime() === today.getTime()) {
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startH, startM] = form.startTime.split(":").map(Number);
      const startTime = startH * 60 + startM;

      if (startTime < currentTime) {
        setError("Booking time cannot be in the past for today.");
        return;
      }
    }

    try {
      const response = await fetch(`${apiBase}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          expectedAttendees: Number(form.expectedAttendees),
        }),
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to submit booking"),
        );
      }
      setForm(emptyForm);
      setStatus("Booking request submitted successfully.");
    } catch (err) {
      setError(err.message || "Failed to submit booking");
    }
  };

  const todayStr = new Date().toLocaleDateString("en-CA");

  return (
    <section className="user-booking">
      <header>
        <div>
          <p className="eyebrow">Module B</p>
          <h1>Request a Booking</h1>
          <p className="lead">Submit a booking request for a resource.</p>
        </div>
      </header>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="grid">
          <label>
            Resource
            <select
              name="resourceId"
              value={form.resourceId}
              onChange={handleChange}
              required
            >
              <option value="">
                {loadingResources ? "Loading resources..." : "Select a resource"}
              </option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} ({resource.type}) - {resource.location}
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
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Start Time
            <input
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            End Time
            <input
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Expected Attendees
            <input
              name="expectedAttendees"
              type="number"
              min="1"
              value={form.expectedAttendees}
              onChange={handleChange}
              placeholder="Expected attendees"
            />
          </label>
          <label>
            Purpose
            <input
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              placeholder="Purpose"
              required
            />
          </label>
        </div>
        {error ? <p className="error">{error}</p> : null}
        {status ? <p className="status">{status}</p> : null}
        <button className="btn primary" type="submit">
          Submit booking
        </button>
      </form>
    </section>
  );
}

export default BookingRequest;
