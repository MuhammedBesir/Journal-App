import { useState } from "react";
import { MOODS } from "../utils/constants";

const SearchFilter = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    search: "",
    mood: "",
    tags: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      search: "",
      mood: "",
      tags: "",
      startDate: "",
      endDate: "",
    };
    setFilters(emptyFilters);
    onFilter(emptyFilters);
  };

  return (
    <div className="search-filter">
      <div className="filter-row">
        <div className="filter-group">
          <input
            type="text"
            name="search"
            placeholder="Search entries..."
            value={filters.search}
            onChange={handleChange}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <select
            name="mood"
            value={filters.mood}
            onChange={handleChange}
            className="filter-select"
          >
            <option value="">All Moods</option>
            {MOODS.map((mood) => (
              <option key={mood.value} value={mood.value}>
                {mood.emoji} {mood.value}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <input
            type="text"
            name="tags"
            placeholder="Filter by tags (comma-separated)"
            value={filters.tags}
            onChange={handleChange}
            className="filter-input"
          />
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label>From:</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>To:</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
            className="filter-input"
          />
        </div>

        <button onClick={handleReset} className="btn btn-outline">
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
