import { useState } from "react";
import { MOODS } from "../utils/constants";

const JournalForm = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      mood: "",
      tags: [],
    }
  );
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
    if (!formData.date) newErrors.date = "Date is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="journal-form">
      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={errors.date ? "error" : ""}
          max={new Date().toISOString().split("T")[0]}
        />
        {errors.date && <span className="error-message">{errors.date}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="What's on your mind?"
          className={errors.title ? "error" : ""}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="mood">Mood</label>
        <div className="mood-selector">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              className={`mood-option ${
                formData.mood === mood.value ? "selected" : ""
              }`}
              onClick={() =>
                setFormData((prev) => ({ ...prev, mood: mood.value }))
              }
              title={mood.value}
              style={{
                backgroundColor:
                  formData.mood === mood.value ? mood.color : "transparent",
              }}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.value}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Write your thoughts..."
          rows="12"
          className={errors.content ? "error" : ""}
        />
        {errors.content && (
          <span className="error-message">{errors.content}</span>
        )}
      </div>

      <div className="form-group">
        <label>Tags</label>
        <div className="tag-input-container">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTag(e)}
            placeholder="Add a tag..."
          />
          <button type="button" onClick={handleAddTag} className="btn-add-tag">
            Add
          </button>
        </div>
        <div className="tags-list">
          {formData.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="tag-remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? "Saving..." : isEditing ? "Update Entry" : "Create Entry"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default JournalForm;
