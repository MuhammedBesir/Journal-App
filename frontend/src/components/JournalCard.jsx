import { formatDate } from "../utils/dateUtils";
import { getMoodEmoji, getMoodColor } from "../utils/constants";

const JournalCard = ({ entry, onClick, onDelete, onEdit }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this entry?")) {
      onDelete(entry.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(entry);
  };

  return (
    <div className="journal-card" onClick={onClick}>
      <div className="journal-card-header">
        <h3 className="journal-card-title">{entry.title}</h3>
        <div className="journal-card-actions">
          <button onClick={handleEdit} className="btn-icon" title="Edit">
            ✏️
          </button>
          <button onClick={handleDelete} className="btn-icon" title="Delete">
            🗑️
          </button>
        </div>
      </div>

      <div className="journal-card-meta">
        <span className="date">{formatDate(entry.date)}</span>
        {entry.mood && (
          <span className="mood" style={{ color: getMoodColor(entry.mood) }}>
            {getMoodEmoji(entry.mood)} {entry.mood}
          </span>
        )}
      </div>

      <p className="journal-card-content">
        {entry.content.substring(0, 150)}
        {entry.content.length > 150 ? "..." : ""}
      </p>

      {entry.tags && entry.tags.length > 0 && (
        <div className="journal-card-tags">
          {entry.tags.map((tag) => (
            <span key={tag} className="tag-small">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalCard;
