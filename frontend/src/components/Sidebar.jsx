import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { darkMode } = useTheme();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`hidden lg:flex w-[280px] flex-col border-r ${darkMode ? 'border-[#283039] bg-[#111418]' : 'border-[#e8dcc8] bg-[#fffbf0]'} h-full flex-shrink-0`}>
      <div className="p-4 flex flex-col gap-4 h-full">
        <div className="flex flex-col px-2">
          <h1 className={`${darkMode ? 'text-white' : 'text-[#1a1a1a]'} text-xl font-bold leading-normal tracking-tight`}>
            Sevgili Ben
          </h1>
          <p className={`${darkMode ? 'text-[#9dabb9]' : 'text-[#8b7355]'} text-sm font-normal mt-1`}>
            Keep your memories safe
          </p>
        </div>
        <nav className="flex flex-col gap-2 mt-4 flex-1">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer ${
              isActive("/")
                ? darkMode ? "bg-[#283039] text-white" : "bg-[#f5ebe0] text-[#1a1a1a]"
                : darkMode ? "text-[#9dabb9] hover:bg-[#283039] hover:text-white" : "text-[#8b7355] hover:bg-[#f5ebe0] hover:text-[#1a1a1a]"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              book_2
            </span>
            <span className="text-sm font-medium">
              {language === "tr" ? "Günlükler" : "Entries"}
            </span>
          </Link>
          <Link
            to="/new-entry"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer ${
              isActive("/new-entry")
                ? darkMode ? "bg-[#283039] text-white" : "bg-[#f5ebe0] text-[#1a1a1a]"
                : darkMode ? "text-[#9dabb9] hover:bg-[#283039] hover:text-white" : "text-[#8b7355] hover:bg-[#f5ebe0] hover:text-[#1a1a1a]"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              edit_square
            </span>
            <span className="text-sm font-medium">
              {language === "tr" ? "Yeni Günlük" : "New Entry"}
            </span>
          </Link>
          <Link
            to="/calendar"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer ${
              isActive("/calendar")
                ? darkMode ? "bg-[#283039] text-white" : "bg-[#f5ebe0] text-[#1a1a1a]"
                : darkMode ? "text-[#9dabb9] hover:bg-[#283039] hover:text-white" : "text-[#8b7355] hover:bg-[#f5ebe0] hover:text-[#1a1a1a]"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              calendar_month
            </span>
            <span className="text-sm font-medium">
              {language === "tr" ? "Takvim" : "Calendar"}
            </span>
          </Link>
          <Link
            to="/analytics"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer ${
              isActive("/analytics")
                ? darkMode ? "bg-[#283039] text-white" : "bg-[#f5ebe0] text-[#1a1a1a]"
                : darkMode ? "text-[#9dabb9] hover:bg-[#283039] hover:text-white" : "text-[#8b7355] hover:bg-[#f5ebe0] hover:text-[#1a1a1a]"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              analytics
            </span>
            <span className="text-sm font-medium">
              {language === "tr" ? "Analitik" : "Analytics"}
            </span>
          </Link>
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer ${
              isActive("/settings")
                ? darkMode ? "bg-[#283039] text-white" : "bg-[#f5ebe0] text-[#1a1a1a]"
                : darkMode ? "text-[#9dabb9] hover:bg-[#283039] hover:text-white" : "text-[#8b7355] hover:bg-[#f5ebe0] hover:text-[#1a1a1a]"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              settings
            </span>
            <span className="text-sm font-medium">
              {language === "tr" ? "Ayarlar" : "Settings"}
            </span>
          </Link>
        </nav>
        <div className="mt-auto px-2 pb-4">
          <div className={`flex items-center gap-3 p-2 rounded-lg border ${darkMode ? 'border-[#283039] bg-[#1c2127]' : 'border-[#e8dcc8] bg-white'}`}>
            <div
              className="size-10 rounded-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://ui-avatars.com/api/?name=" +
                  (user?.name || "User") +
                  "&background=137fec&color=fff')",
              }}
            ></div>
            <div className="flex flex-col">
              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>
                {user?.name || "User"}
              </p>
              <p className={`text-xs ${darkMode ? 'text-[#9dabb9]' : 'text-[#8b7355]'}`}>{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
