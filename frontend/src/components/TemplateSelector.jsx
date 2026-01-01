import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { featuresService } from "../services/api";

const TemplateSelector = ({ onSelect, className = "" }) => {
  const { language } = useLanguage();
  const [templates, setTemplates] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await featuresService.getTemplates();
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (template) => {
    const content = language === "tr" && template.content_tr 
      ? template.content_tr 
      : template.content;
    onSelect(content);
    setIsOpen(false);
  };

  const getIconForTemplate = (icon) => {
    const iconMap = {
      'favorite': 'favorite',
      'self_improvement': 'self_improvement',
      'flag': 'flag',
      'schedule': 'schedule',
      'mood': 'mood',
    };
    return iconMap[icon] || 'article';
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#1c2127] hover:bg-[#283039] border border-[#3b4754] rounded-lg text-[#9dabb9] hover:text-white transition-all"
      >
        <span className="material-symbols-outlined text-[20px]">
          article
        </span>
        <span className="text-sm font-medium">
          {language === "tr" ? "Şablon Kullan" : "Use Template"}
        </span>
        <span className="material-symbols-outlined text-[18px]">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-[#1c2127] border border-[#3b4754] rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-[#283039]">
            <p className="text-white font-medium text-sm">
              {language === "tr" ? "Şablon Seç" : "Select Template"}
            </p>
            <p className="text-[#9dabb9] text-xs mt-1">
              {language === "tr" 
                ? "Hazır bir şablonla başla" 
                : "Start with a ready-made template"}
            </p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <span className="material-symbols-outlined text-[#137fec] animate-spin">
                  progress_activity
                </span>
              </div>
            ) : templates.length === 0 ? (
              <div className="p-4 text-center text-[#9dabb9] text-sm">
                {language === "tr" ? "Şablon bulunamadı" : "No templates found"}
              </div>
            ) : (
              templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelect(template)}
                  className="w-full flex items-start gap-3 p-3 hover:bg-[#283039] transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#137fec]/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#137fec] text-xl">
                      {getIconForTemplate(template.icon)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {language === "tr" && template.name_tr 
                        ? template.name_tr 
                        : template.name}
                    </p>
                    <p className="text-[#9dabb9] text-xs mt-0.5 line-clamp-2">
                      {language === "tr" && template.content_tr 
                        ? template.content_tr.substring(0, 60) + "..."
                        : template.content.substring(0, 60) + "..."}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default TemplateSelector;
