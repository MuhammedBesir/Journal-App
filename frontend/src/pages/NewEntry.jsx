import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { journalService, featuresService, aiService, mediaService } from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import TemplateSelector from "../components/TemplateSelector";
import ImageUploader from "../components/ImageUploader";
import AudioRecorder from "../components/AudioRecorder";
import CryptoJS from "crypto-js";

const NewEntry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const textareaRef = useRef(null);
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    mood: "Happy",
    tags: ["personal", "reflection"],
  });
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(null);
  const [images, setImages] = useState([]);
  const [audioData, setAudioData] = useState(null);
  const [showMediaSection, setShowMediaSection] = useState(false);
  
  // Security state
  const [isLocked, setIsLocked] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockPassword, setLockPassword] = useState("");
  const [encryptionHint, setEncryptionHint] = useState("");

  // Check for AI prompt from Dashboard navigation
  useEffect(() => {
    if (location.state?.prompt) {
      setAiPrompt(location.state.prompt);
    }
  }, [location]);

  const handleMoodChange = (mood) => {
    setFormData((prev) => ({ ...prev, mood }));
  };

  const handleAnalyzeMood = async () => {
    if (!formData.content.trim()) return;
    
    setIsAnalyzingMood(true);
    try {
      const response = await aiService.analyzeMood(formData.content, formData.title);
      if (response.data.mood) {
        handleMoodChange(response.data.mood);
      }
    } catch (error) {
      console.error("Mood analysis error:", error);
    } finally {
      setIsAnalyzingMood(false);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.type === "blur") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tag],
        }));
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const applyFormat = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);

    let formattedText = "";
    let newCursorPos = end;
    let beforeText = formData.content.substring(0, start);
    let afterText = formData.content.substring(end);

    // If no text is selected, insert placeholder or format at cursor
    if (!selectedText) {
      switch (format) {
        case "bold":
          formattedText = "**kalın metin**";
          newCursorPos = start + 2;
          break;
        case "italic":
          formattedText = "*italik metin*";
          newCursorPos = start + 1;
          break;
        case "underline":
          formattedText = "<u>altı çizili metin</u>";
          newCursorPos = start + 3;
          break;
        case "bullet":
          formattedText = "\n• ";
          newCursorPos = start + formattedText.length;
          break;
        case "numbered":
          formattedText = "\n1. ";
          newCursorPos = start + formattedText.length;
          break;
        default:
          return;
      }
    } else {
      // Format selected text
      switch (format) {
        case "bold":
          formattedText = `**${selectedText}**`;
          newCursorPos = end + 4;
          break;
        case "italic":
          formattedText = `*${selectedText}*`;
          newCursorPos = end + 2;
          break;
        case "underline":
          formattedText = `<u>${selectedText}</u>`;
          newCursorPos = end + 7;
          break;
        case "bullet":
          formattedText = selectedText
            .split("\n")
            .map((line) => `• ${line}`)
            .join("\n");
          newCursorPos = start + formattedText.length;
          break;
        case "numbered":
          formattedText = selectedText
            .split("\n")
            .map((line, i) => `${i + 1}. ${line}`)
            .join("\n");
          newCursorPos = start + formattedText.length;
          break;
        default:
          return;
      }
    }

    const newContent = beforeText + formattedText + afterText;
    setFormData((prev) => ({ ...prev, content: newContent }));

    // Focus and set cursor position after state update
    setTimeout(() => {
      textarea.focus();
      if (
        !selectedText &&
        (format === "bold" || format === "italic" || format === "underline")
      ) {
        // Select the placeholder text
        const selectStart =
          start + (format === "bold" ? 2 : format === "italic" ? 1 : 3);
        const selectEnd =
          selectStart +
          (format === "bold" ? 11 : format === "italic" ? 12 : 17);
        textarea.setSelectionRange(selectStart, selectEnd);
      } else {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert(
        language === "tr"
          ? "Lütfen başlık ve içeriği doldurun"
          : "Please fill in title and content"
      );
      return;
    }

    setIsSaving(true);
    try {
      let finalContent = formData.content;
      let finalTitle = formData.title;
      let isEncrypted = false;
      let finalHint = null;

      // Encrypt if locked
      if (isLocked && lockPassword) {
        finalContent = CryptoJS.AES.encrypt(formData.content, lockPassword).toString();
        finalTitle = CryptoJS.AES.encrypt(formData.title, lockPassword).toString();
        isEncrypted = true;
        finalHint = encryptionHint;
      }

      // Create entry
      const entryResponse = await journalService.createEntry({
        ...formData,
        title: finalTitle,
        content: finalContent,
        is_encrypted: isEncrypted,
        encryption_hint: finalHint
      });
      
      const entryId = entryResponse.data.id;

      // Upload media
      if (images.length > 0) {
        await Promise.all(images.map(img => mediaService.upload(img.file, entryId)));
      }
      if (audioData) {
        await mediaService.upload(audioData.blob, entryId);
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating entry:", error);
      
      let errorMessage = language === "tr"
        ? "Günlük kaydedilemedi. Lütfen tekrar deneyin."
        : "Failed to save entry. Please try again.";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map(e => e.msg).join(", ");
      }

      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-[#111418] flex justify-center pt-16 lg:pt-4">
      <div className="w-full max-w-[960px] flex flex-col pb-20">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]">
                {language === "tr" ? "Yeni Günlük Oluştur" : "Create New Entry"}
              </h1>
              <p className="text-[#9dabb9] text-sm sm:text-base mt-2">
                {language === "tr"
                  ? "Bugünün düşüncelerini, hislerini ve anılarını kaydet."
                  : "Capture your thoughts, feelings, and memories for today."}
              </p>
            </div>
            <TemplateSelector 
              onSelect={(content) => setFormData(prev => ({ ...prev, content }))}
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="flex flex-col gap-8">
          {/* Row 1: Date and Mood */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Date Picker */}
            <div className="flex-1">
              <label className="block text-white text-base font-medium mb-2">
                {language === "tr" ? "Tarih" : "Date"}
              </label>
              <div className="relative group">
                <input
                  className="w-full h-12 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white px-4 pr-12 focus:outline-none focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] transition-all placeholder-[#5e6b79]"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  max={new Date().toISOString().split("T")[0]}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9dabb9] pointer-events-none group-focus-within:text-[#137fec] transition-colors">
                  <span className="material-symbols-outlined">
                    calendar_today
                  </span>
                </div>
              </div>
            </div>

            {/* Mood Selector */}
            <div className="flex-[1.5]">
              <label className="block text-white text-base font-medium mb-2">
                {language === "tr"
                  ? "Nasıl hissediyorsun?"
                  : "How are you feeling?"}
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { mood: "Happy", icon: "sentiment_satisfied" },
                  { mood: "Neutral", icon: "sentiment_neutral" },
                  { mood: "Sad", icon: "sentiment_dissatisfied" },
                  { mood: "Energetic", icon: "bolt" },
                  { mood: "Calm", icon: "spa" },
                ].map(({ mood, icon }) => (
                  <label key={mood} className="cursor-pointer touch-manipulation">
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="mood"
                      checked={formData.mood === mood}
                      onChange={() => handleMoodChange(mood)}
                    />
                    <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#3b4754] bg-[#1c2127] min-w-[80px] peer-checked:border-[#137fec] peer-checked:bg-[#137fec]/10 peer-checked:text-[#137fec] text-[#9dabb9] hover:border-[#4e5d6d] transition-all">
                      <span className="material-symbols-outlined text-[28px]">
                        {icon}
                      </span>
                      <span className="text-xs font-medium">{mood}</span>
                    </div>
                  </label>
                ))}
                
                {/* AI Mood Analyze Button */}
                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.content || formData.content.length < 20) {
                      return;
                    }
                    try {
                      setIsAnalyzingMood(true);
                      const response = await aiService.analyzeMood(formData.content, formData.title);
                      if (response.data.mood) {
                        handleMoodChange(response.data.mood);
                      }
                    } catch (error) {
                      console.error("AI mood analysis error:", error);
                    } finally {
                      setIsAnalyzingMood(false);
                    }
                  }}
                  disabled={isAnalyzingMood || !formData.content || formData.content.length < 20}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-dashed border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10 min-w-[80px] text-purple-400 hover:border-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title={language === "tr" ? "Gemini AI ile ruh halini analiz et" : "Analyze mood with Gemini AI"}
                >
                  <span className={`material-symbols-outlined text-[28px] ${isAnalyzingMood ? 'animate-spin' : ''}`}>
                    {isAnalyzingMood ? 'progress_activity' : 'auto_awesome'}
                  </span>
                  <span className="text-xs font-medium">
                    {isAnalyzingMood 
                      ? (language === "tr" ? "Analiz..." : "Analyzing...") 
                      : "AI ✨"
                    }
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div className="flex flex-col gap-2">
            <label className="sr-only">Entry Title</label>
            <input
              className="w-full bg-transparent text-3xl font-bold text-white placeholder-[#4e5d6d] border-0 border-b-2 border-[#283039] focus:border-[#137fec] focus:ring-0 px-0 py-4 transition-colors"
              placeholder={
                language === "tr"
                  ? "Gününe bir başlık ver..."
                  : "Give your day a headline..."
              }
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>

          {/* Rich Content Editor */}
          <div className="flex flex-col rounded-xl border border-[#3b4754] bg-[#1c2127] overflow-hidden focus-within:ring-1 focus-within:ring-[#137fec] focus-within:border-[#137fec] transition-all">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-[#3b4754] bg-[#222831]">
              <button
                onClick={() => applyFormat("bold")}
                className="p-2 text-[#9dabb9] hover:text-white hover:bg-[#283039] rounded transition-colors"
                title="Bold"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  format_bold
                </span>
              </button>
              <button
                onClick={() => applyFormat("italic")}
                className="p-2 text-[#9dabb9] hover:text-white hover:bg-[#283039] rounded transition-colors"
                title="Italic"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  format_italic
                </span>
              </button>
              <button
                onClick={() => applyFormat("underline")}
                className="p-2 text-[#9dabb9] hover:text-white hover:bg-[#283039] rounded transition-colors"
                title="Underline"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  format_underlined
                </span>
              </button>
              <div className="w-px h-5 bg-[#3b4754] mx-1"></div>
              <button
                onClick={() => applyFormat("bullet")}
                className="p-2 text-[#9dabb9] hover:text-white hover:bg-[#283039] rounded transition-colors"
                title="Bullet List"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  format_list_bulleted
                </span>
              </button>
              <button
                onClick={() => applyFormat("numbered")}
                className="p-2 text-[#9dabb9] hover:text-white hover:bg-[#283039] rounded transition-colors"
                title="Numbered List"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  format_list_numbered
                </span>
              </button>
              <div className="w-px h-5 bg-[#3b4754] mx-1"></div>
              <button
                onClick={() => setShowMediaSection(!showMediaSection)}
                className={`p-2 rounded transition-colors ${
                  showMediaSection 
                    ? "text-[#137fec] bg-[#137fec]/20" 
                    : "text-[#9dabb9] hover:text-white hover:bg-[#283039]"
                }`}
                title={language === "tr" ? "Medya Ekle" : "Add Media"}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showMediaSection ? "perm_media" : "add_photo_alternate"}
                </span>
              </button>
              
              <div className="w-px h-5 bg-[#3b4754] mx-1"></div>
              
              <button
                type="button"
                onClick={() => {
                  if (isLocked) {
                    setIsLocked(false);
                    setLockPassword("");
                    setEncryptionHint("");
                  } else {
                    setShowLockModal(true);
                  }
                }}
                className={`p-2 rounded transition-colors ${
                  isLocked
                    ? "text-red-400 bg-red-500/20"
                    : "text-[#9dabb9] hover:text-white hover:bg-[#283039]"
                }`}
                title={language === "tr" ? "Girişi Kilitle" : "Lock Entry"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isLocked ? "lock" : "lock_open"}
                </span>
              </button>
            </div>

            {/* Media Upload Section */}
            {showMediaSection && (
              <div className="bg-[#1c2127] rounded-xl border border-[#3b4754] p-4 mb-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#137fec]">perm_media</span>
                  <h4 className="text-white font-medium text-sm">
                    {language === "tr" ? "Medya Ekle" : "Add Media"}
                  </h4>
                </div>
                
                {/* Image Uploader */}
                <div>
                  <p className="text-[#9dabb9] text-xs mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">image</span>
                    {language === "tr" ? "Görseller" : "Images"}
                  </p>
                  <ImageUploader
                    existingImages={images}
                    onUpload={(img) => setImages((prev) => [...prev, img])}
                    onRemove={(index) => setImages((prev) => prev.filter((_, i) => i !== index))}
                  />
                </div>

                {/* Audio Recorder */}
                <div>
                  <p className="text-[#9dabb9] text-xs mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">mic</span>
                    {language === "tr" ? "Ses Kaydı" : "Voice Memo"}
                  </p>
                  <AudioRecorder
                    existingAudio={audioData}
                    onRecordingComplete={(audio) => setAudioData(audio)}
                    onRemove={() => setAudioData(null)}
                  />
                </div>
              </div>
            )}

            {/* AI Prompt Banner */}
            {aiPrompt && (
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-purple-400 text-lg mt-0.5">auto_awesome</span>
                  <div className="flex-1">
                    <p className="text-white/90 text-sm font-medium mb-1">
                      {language === "tr" ? "AI Yazma Önerisi:" : "AI Writing Prompt:"}
                    </p>
                    <p className="text-purple-300 text-sm italic">"{aiPrompt}"</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setAiPrompt(null)}
                    className="text-purple-400 hover:text-white p-1"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>
            )}

            {/* Text Area */}
            <textarea
              ref={textareaRef}
              className="w-full h-80 bg-[#1c2127] text-white p-4 resize-none border-0 focus:ring-0 text-lg leading-relaxed placeholder-[#4e5d6d]"
              placeholder={t("writeThoughts")}
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  content: e.target.value,
                }))
              }
            ></textarea>
          </div>

          {/* Tags Input */}
          <div className="flex flex-col gap-2">
            <label className="block text-white text-base font-medium">
              {language === "tr" ? "Etiketler" : "Tags"}
            </label>
            <div className="flex items-center flex-wrap gap-2 w-full min-h-[56px] bg-[#1c2127] border border-[#3b4754] rounded-lg px-4 py-2 focus-within:border-[#137fec] focus-within:ring-1 focus-within:ring-[#137fec] transition-all">
              {/* Existing Tag Pills */}
              {formData.tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 bg-[#137fec]/20 text-[#137fec] px-3 py-1 rounded-full text-sm font-medium"
                >
                  <span>#{tag}</span>
                  <button
                    className="hover:text-white"
                    onClick={() => handleRemoveTag(tag)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">
                      close
                    </span>
                  </button>
                </div>
              ))}
              {/* Input */}
              <input
                className="flex-1 bg-transparent border-0 text-white placeholder-[#5e6b79] focus:ring-0 p-0 text-base"
                placeholder={
                  language === "tr"
                    ? "Etiket ekle ve Enter'a bas..."
                    : "Add tags and press Enter..."
                }
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                onBlur={handleAddTag}
              />
            </div>
            <p className="text-xs text-[#9dabb9]">
              {language === "tr"
                ? "Etiketleri virgülle ayırın veya Enter'a basın."
                : "Separate tags with commas or press Enter."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 mt-4 pt-6 border-t border-[#283039]">
            <button
              className="w-full sm:w-auto px-6 h-12 rounded-lg text-white font-bold hover:bg-[#283039] transition-colors text-sm"
              onClick={() => navigate("/")}
              type="button"
            >
              {language === "tr" ? "İptal" : "Cancel"}
            </button>
            <button
              className="w-full sm:w-auto px-8 h-12 bg-[#137fec] hover:bg-blue-600 rounded-lg text-white font-bold shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isSaving}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                save
              </span>
              {isSaving
                ? language === "tr"
                  ? "Kaydediliyor..."
                  : "Saving..."
                : language === "tr"
                ? "Günlüğü Kaydet"
                : "Save Entry"}
            </button>
          </div>
        </div>
      </div>

      {/* Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c2127] rounded-2xl border border-[#3b4754] max-w-md w-full p-6">
            <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400">lock</span>
              {language === "tr" ? "Girişi Kilitle" : "Lock Entry"}
            </h3>
            <p className="text-[#9dabb9] text-sm mb-6">
              {language === "tr"
                ? "Bu giriş için bir şifre belirleyin. Şifreyi unutursanız içeriğe erişemezsiniz!"
                : "Set a password for this entry. If you forget it, you won't be able to access the content!"}
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[#9dabb9] text-xs font-medium mb-1">
                  {language === "tr" ? "Şifre" : "Password"}
                </label>
                <input
                  type="password"
                  value={lockPassword}
                  onChange={(e) => setLockPassword(e.target.value)}
                  className="w-full bg-[#111418] border border-[#3b4754] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#137fec]"
                  placeholder="****"
                />
              </div>
              <div>
                <label className="block text-[#9dabb9] text-xs font-medium mb-1">
                  {language === "tr" ? "Şifre İpucu (Opsiyonel)" : "Password Hint (Optional)"}
                </label>
                <input
                  type="text"
                  value={encryptionHint}
                  onChange={(e) => setEncryptionHint(e.target.value)}
                  className="w-full bg-[#111418] border border-[#3b4754] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#137fec]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowLockModal(false);
                  setLockPassword("");
                }}
                className="px-4 py-2 text-[#9dabb9] hover:text-white"
              >
                {language === "tr" ? "İptal" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (lockPassword) {
                    setIsLocked(true);
                    setShowLockModal(false);
                  }
                }}
                disabled={!lockPassword}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                {language === "tr" ? "Kilitle" : "Lock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewEntry;
