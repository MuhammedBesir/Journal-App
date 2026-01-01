import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { journalService } from "../services/api";
import { formatDate } from "../utils/dateUtils";
import { getMoodEmoji, getMoodColor, MOODS } from "../utils/constants";

const EntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    date: "",
    mood: "Happy",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const response = await journalService.getEntryById(id);
      setEntry(response.data.entry);
      setFormData({
        title: response.data.entry.title || "",
        content: response.data.entry.content || "",
        date: response.data.entry.date || "",
        mood: response.data.entry.mood || "Happy",
        tags: response.data.entry.tags || [],
      });
    } catch (error) {
      console.error("Error fetching entry:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      await journalService.deleteEntry(id);
      navigate("/");
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry");
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await journalService.updateEntry(id, formData);
      await fetchEntry();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating entry:", error);
      alert("Failed to update entry");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()],
        });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#111418]">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-[#137fec] animate-spin">
            progress_activity
          </span>
          <p className="mt-4 text-[#9dabb9]">Loading entry...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#111418]">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">
            error_outline
          </span>
          <p className="text-[#9dabb9] mb-4">Entry not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 bg-[#137fec] hover:bg-[#0f6acc] text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-10 bg-[#111418]">
      <div className="max-w-4xl mx-auto">
        {!isEditing ? (
          <div className="bg-[#1c2127] rounded-xl border border-[#283039] p-8">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-white text-3xl font-bold flex-1 pr-4">
                  {entry.title}
                </h1>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2.5 hover:bg-[#283039] rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#137fec]">
                      edit
                    </span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2.5 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-red-500">
                      delete
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <span className="text-[#9dabb9] flex items-center space-x-1">
                  <span className="material-symbols-outlined text-base">
                    calendar_today
                  </span>
                  <span>{formatDate(entry.date, "MMMM dd, yyyy")}</span>
                </span>
                {entry.mood && (
                  <span
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg"
                    style={{
                      backgroundColor: `${getMoodColor(entry.mood)}20`,
                      color: getMoodColor(entry.mood),
                    }}
                  >
                    <span>{getMoodEmoji(entry.mood)}</span>
                    <span className="text-sm font-medium">{entry.mood}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[#9dabb9] text-base leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>

            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-[#283039] text-[#137fec] text-sm rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#1c2127] rounded-xl border border-[#283039] p-8">
            <div className="mb-6">
              <h2 className="text-white text-2xl font-bold mb-6">Edit Entry</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-[#9dabb9] text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#111418] border border-[#283039] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent"
                    placeholder="Entry title..."
                  />
                </div>

                <div>
                  <label className="block text-[#9dabb9] text-sm font-medium mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#111418] border border-[#283039] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-[#9dabb9] text-sm font-medium mb-2">
                    Mood
                  </label>
                  <select
                    name="mood"
                    value={formData.mood}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#111418] border border-[#283039] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent"
                  >
                    {MOODS.map((mood) => (
                      <option key={mood.value} value={mood.value}>
                        {mood.emoji} {mood.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#9dabb9] text-sm font-medium mb-2">
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={12}
                    className="w-full px-4 py-3 bg-[#111418] border border-[#283039] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent resize-none"
                    placeholder="Write your thoughts..."
                  />
                </div>

                <div>
                  <label className="block text-[#9dabb9] text-sm font-medium mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="w-full px-4 py-3 bg-[#111418] border border-[#283039] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent"
                    placeholder="Type and press Enter to add tags..."
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 bg-[#283039] text-[#137fec] text-sm rounded-lg flex items-center space-x-2"
                        >
                          <span>#{tag}</span>
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">
                              close
                            </span>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-[#283039] hover:bg-[#2f3841] text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-[#137fec] hover:bg-[#0f6acc] text-white rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined">save</span>
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryDetail;
