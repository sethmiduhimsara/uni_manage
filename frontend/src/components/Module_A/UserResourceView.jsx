import { useEffect, useMemo, useState } from "react";
import "./user-resource-view.css";
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

function UserResourceView({ apiBase, onNavigateToBooking }) {
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    minCapacity: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filterQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.location) params.set("location", filters.location);
    if (filters.minCapacity) params.set("minCapacity", filters.minCapacity);
    params.set("status", "ACTIVE"); // Users should only see active resources
    return params.toString();
  }, [filters]);

  const loadResources = async () => {
    setLoading(true);
    setError("");
    try {
      const url = `${apiBase}/api/resources/filter?${filterQuery}`;
      const response = await fetch(url, { credentials: "include" });
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [filterQuery]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="user-resource-view">
      <header className="view-header">
        <div className="title-group">
          <p className="eyebrow">Module A</p>
          <h1>Explore Campus Resources</h1>
          <p className="lead">
            Discover available lecture halls, labs, and equipment for your needs.
          </p>
        </div>
        <button className="button ghost" onClick={loadResources}>
          Refresh
        </button>
      </header>

      <div className="filters-bar">
        <div className="filter-item">
          <label htmlFor="type">Resource Type</label>
          <select
            id="type"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Laboratory</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            placeholder="Search by building..."
          />
        </div>
        <div className="filter-item">
          <label htmlFor="minCapacity">Min Capacity</label>
          <input
            id="minCapacity"
            name="minCapacity"
            type="number"
            min="1"
            value={filters.minCapacity}
            onChange={handleFilterChange}
            placeholder="Capacity"
          />
        </div>
      </div>

      {error ? <div className="error-alert">{error}</div> : null}

      {loading ? (
        <div className="resource-list loading">
          <SkeletonBlocks rows={8} columns={1} compact />
        </div>
      ) : (
        <div className="resource-list">
          {resources.length === 0 ? (
            <div className="empty-state">
              <p>No resources found matching your criteria.</p>
            </div>
          ) : (
            resources.map((resource) => (
              <article key={resource.id} className="resource-row">
                <div className="row-main">
                  <div className="row-info">
                    <span className={`type-badge ${resource.type.toLowerCase()}`}>
                      {resource.type.replace("_", " ")}
                    </span>
                    <h3>{resource.name}</h3>
                  </div>
                  <div className="location-info">
                    <span className="loc-label">Location:</span> {resource.location}
                  </div>
                </div>
                
                <div className="row-meta">
                  <div className="meta-block">
                    <span className="meta-label">Capacity</span>
                    <span className="meta-value">{resource.capacity}</span>
                  </div>
                  <div className="meta-block">
                    <span className="meta-label">Availability</span>
                    <span className="status-pill available">Available</span>
                  </div>
                </div>

                <div className="row-details">
                  <p className="description-text">
                    {resource.description ||
                      "Detailed facility information not available."}
                  </p>
                </div>

                <div className="row-actions">
                  <button
                    className="button primary sm"
                    onClick={() => onNavigateToBooking(resource.id)}
                  >
                    Request Booking
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}

export default UserResourceView;
