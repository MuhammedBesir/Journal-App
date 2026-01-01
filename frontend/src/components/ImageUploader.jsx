import { useState, useRef } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const ImageUploader = ({ onUpload, existingImages = [], onRemove }) => {
  const { language } = useLanguage();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        if (file.type.startsWith("image/")) {
          // Create preview URL
          const previewUrl = URL.createObjectURL(file);
          onUpload({ file, previewUrl, name: file.name });
        }
      }
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${dragOver 
            ? "border-[#137fec] bg-[#137fec]/10" 
            : "border-[#3b4754] hover:border-[#137fec]/50 hover:bg-[#1c2127]"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-3xl text-[#9dabb9]">
            {uploading ? "progress_activity" : "add_photo_alternate"}
          </span>
          <p className="text-[#9dabb9] text-sm">
            {uploading 
              ? (language === "tr" ? "Yükleniyor..." : "Uploading...")
              : (language === "tr" 
                  ? "Görsel eklemek için tıkla veya sürükle" 
                  : "Click or drag to add images"
                )
            }
          </p>
          <p className="text-[#4e5d6d] text-xs">
            JPG, PNG, GIF, WEBP (max 10MB)
          </p>
        </div>
      </div>

      {/* Image Previews */}
      {existingImages.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {existingImages.map((img, index) => (
            <div 
              key={index}
              className="relative group w-24 h-24 rounded-lg overflow-hidden border border-[#3b4754]"
            >
              <img 
                src={img.previewUrl || img.url} 
                alt={img.name || "Uploaded image"}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onRemove?.(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-white text-sm">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
