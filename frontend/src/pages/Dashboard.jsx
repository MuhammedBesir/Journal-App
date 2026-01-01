import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { journalService, analyticsService, featuresService, aiService } from "../services/api";
import { formatDate } from "../utils/dateUtils";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from "date-fns";

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [quote, setQuote] = useState(null);
  const [newBadges, setNewBadges] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    fetchEntries();
    fetchEnhancements();
    fetchAiSuggestions();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await journalService.getEntries({ limit: 100 });
      setEntries(response.data.entries || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnhancements = async () => {
    try {
      const [streakRes, quoteRes, badgesRes] = await Promise.all([
        analyticsService.getStreak().catch(() => ({ data: { currentStreak: 0, longestStreak: 0 } })),
        featuresService.getQuoteOfTheDay().catch(() => ({ data: { quote: null } })),
        featuresService.checkBadges().catch(() => ({ data: { newBadges: [] } })),
      ]);
      setStreak(streakRes.data);
      setQuote(quoteRes.data.quote);
      if (badgesRes.data.newBadges?.length > 0) {
        setNewBadges(badgesRes.data.newBadges);
      }
    } catch (error) {
      console.error("Error fetching enhancements:", error);
    }
  };

  const fetchAiSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const response = await aiService.getSuggestions(language);
      setAiSuggestions(response.data.prompts || []);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      // Fallback suggestions
      setAiSuggestions([
        { title: language === "tr" ? "Günlük Yansıma" : "Daily Reflection", prompt: language === "tr" ? "Bugün seni en çok ne mutlu etti?" : "What made you happiest today?", type: "reflection" },
        { title: language === "tr" ? "Şükran" : "Gratitude", prompt: language === "tr" ? "Bugün için minnettar olduğun 3 şey nedir?" : "What 3 things are you grateful for today?", type: "gratitude" },
        { title: language === "tr" ? "Gelişim" : "Growth", prompt: language === "tr" ? "Bu hafta kendini nasıl geliştirdin?" : "How did you grow this week?", type: "growth" }
      ]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const getMoodIcon = (mood) => {
    const moodIcons = {
      Happy: "sentiment_satisfied",
      Neutral: "sentiment_neutral",
      Sad: "sentiment_dissatisfied",
      Energetic: "bolt",
      Calm: "cloud",
      Excited: "bolt",
      Grateful: "favorite",
    };
    return moodIcons[mood] || "sentiment_satisfied";
  };

  const getMoodColor = (mood) => {
    const colors = {
      Happy: "bg-green-500/20 text-green-400",
      Neutral: "bg-orange-500/20 text-orange-400",
      Sad: "bg-blue-500/20 text-blue-400",
      Energetic: "bg-red-500/20 text-red-400",
      Calm: "bg-blue-500/20 text-blue-400",
      Excited: "bg-yellow-500/20 text-yellow-400",
      Grateful: "bg-purple-500/20 text-purple-400",
    };
    return colors[mood] || "bg-[#283039] text-[#9dabb9]";
  };

  const getEntryTypeStyle = (index) => {
    const styles = [
      "bg-[#137fec]/20 text-[#137fec]",
      "bg-purple-500/20 text-purple-400",
      "bg-emerald-500/20 text-emerald-400",
    ];
    return styles[index % styles.length];
  };

  const getEntryTypeLabel = (index) => {
    const labels = ["Journal", "Idea", "Gratitude"];
    return labels[index % labels.length];
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
  });

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();

  const hasEntryOnDate = (date) => {
    return entries.some((entry) => {
      const entryDate = parseISO(entry.date);
      return isSameDay(entryDate, date);
    });
  };

  const isToday = (date) => isSameDay(date, new Date());

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === "tr") {
      if (hour < 12) return "Günaydın";
      if (hour < 18) return "İyi günler";
      return "İyi akşamlar";
    } else {
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex-1 flex items-center justify-center bg-[#111418]">
  //       <div className="text-center">
  //         <span className="material-symbols-outlined text-5xl text-[#137fec] animate-spin">
  //           progress_activity
  //         </span>
  //         <p className="mt-4 text-[#9dabb9]">
  //           {language === "tr"
  //             ? "Günlüğün yükleniyor..."
  //             : "Loading your journal..."}
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-10 bg-[#111418]">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-white text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]">
            {getGreeting()}, {user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-[#9dabb9] text-base mt-2">
            {streak.currentStreak > 0
              ? language === "tr"
                ? `${streak.currentStreak} ${
                    streak.currentStreak === 1 ? "gündür" : "gündür"
                  } art arda yazıyorsun. Devam et! 🔥`
                : `You have written ${streak.currentStreak} ${
                    streak.currentStreak === 1 ? "day" : "days"
                  } in a row. Keep it up! 🔥`
              : language === "tr"
              ? "Günlük yazma yolculuğuna bugün başla!"
              : "Start your journaling journey today!"}
          </p>
        </div>

        {/* Streak Badge & Quote Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Streak Card */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl px-5 py-4">
            <div className="relative">
              <span className="material-symbols-outlined text-4xl text-orange-400 animate-pulse">
                local_fire_department
              </span>
              {streak.currentStreak >= 7 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-[8px]">⭐</span>
                </span>
              )}
            </div>
            <div>
              <p className="text-white font-black text-2xl">{streak.currentStreak}</p>
              <p className="text-orange-300/70 text-xs">
                {language === "tr" ? "gün seri" : "day streak"}
              </p>
            </div>
            <div className="w-px h-10 bg-orange-500/30 mx-2"></div>
            <div>
              <p className="text-white font-bold text-lg">{streak.longestStreak}</p>
              <p className="text-orange-300/70 text-xs">
                {language === "tr" ? "en iyi" : "best"}
              </p>
            </div>
          </div>

          {/* Quote Card */}
          {quote && (
            <div className="flex-1 bg-gradient-to-r from-[#137fec]/10 to-purple-500/10 border border-[#137fec]/20 rounded-xl px-5 py-4">
              <p className="text-white/90 italic text-sm line-clamp-2">
                "{language === "tr" && quote.quote_tr ? quote.quote_tr : quote.quote}"
              </p>
              <p className="text-[#9dabb9] text-xs mt-1">— {quote.author}</p>
            </div>
          )}
        </div>

        {/* AI Writing Suggestions */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-purple-400">auto_awesome</span>
            <h3 className="text-white font-semibold">
              {language === "tr" ? "AI Yazma Önerileri" : "AI Writing Prompts"}
            </h3>
            {loadingSuggestions && (
              <span className="material-symbols-outlined text-purple-400 text-sm animate-spin">progress_activity</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiSuggestions.map((suggestion, index) => {
              const gradients = [
                "from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-400/50",
                "from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400/50",
                "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-400/50"
              ];
              const icons = ["self_improvement", "favorite", "trending_up"];
              return (
                <button
                  key={index}
                  onClick={() => navigate("/new-entry", { state: { prompt: suggestion.prompt } })}
                  className={`text-left p-4 rounded-xl bg-gradient-to-br ${gradients[index % 3]} border transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-white/70 text-lg">{icons[index % 3]}</span>
                    <span className="text-white/90 font-medium text-sm">{suggestion.title}</span>
                  </div>
                  <p className="text-white/70 text-xs line-clamp-2">{suggestion.prompt}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* New Badge Notification */}
        {newBadges.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-yellow-400 animate-bounce">
                emoji_events
              </span>
              <div>
                <p className="text-white font-bold">
                  {language === "tr" ? "Yeni Rozet Kazandın! 🎉" : "New Badge Earned! 🎉"}
                </p>
                <p className="text-yellow-300/70 text-sm">
                  {newBadges.map(b => language === "tr" ? b.nameTr : b.name).join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Calendar Widget */}
          <section className="lg:w-[380px] shrink-0 flex flex-col gap-6">
            {/* Calendar Card */}
            <div className="bg-[#1c2127] rounded-2xl p-5 shadow-sm border border-[#283039]">
              <div className="flex items-center justify-between mb-4 px-2">
                <button
                  onClick={previousMonth}
                  className="p-1 hover:bg-[#283039] rounded-full transition-colors text-[#9dabb9]"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px" }}
                  >
                    chevron_left
                  </span>
                </button>
                <h2 className="text-base font-bold text-white">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-[#283039] rounded-full transition-colors text-[#9dabb9]"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px" }}
                  >
                    chevron_right
                  </span>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-y-2 mb-2">
                {/* Weekdays */}
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-xs font-bold text-[#9dabb9] py-2"
                  >
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-1"></div>
                ))}

                {/* Days */}
                {daysInMonth.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={async () => {
                      const dateStr = format(date, "yyyy-MM-dd");
                      setSelectedDate(dateStr);
                      try {
                        const response = await journalService.getEntryByDate(
                          dateStr
                        );
                        setSelectedEntry(response.data.entry);
                      } catch (error) {
                        if (error.response?.status === 404) {
                          setSelectedEntry(null);
                        }
                      }
                    }}
                    className={`aspect-square flex flex-col items-center justify-center rounded-full text-sm relative group ${
                      isToday(date)
                        ? "text-white bg-[#137fec] shadow-lg shadow-[#137fec]/30 font-bold"
                        : "text-white hover:bg-[#283039]"
                    }`}
                  >
                    {format(date, "d")}
                    {hasEntryOnDate(date) && !isToday(date) && (
                      <span className="w-1 h-1 rounded-full bg-[#137fec] absolute bottom-1.5"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Entry Detail Sidebar */}
            {selectedDate && (
              <div className="bg-[#1c2127] rounded-2xl p-5 shadow-sm border border-[#283039]">
                {selectedEntry ? (
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-white flex-1">
                        {selectedEntry.title}
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedDate(null);
                          setSelectedEntry(null);
                        }}
                        className="text-[#9dabb9] hover:text-white"
                      >
                        <span className="material-symbols-outlined text-xl">
                          close
                        </span>
                      </button>
                    </div>
                    <div className="text-xs text-[#9dabb9] mb-4 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        calendar_today
                      </span>
                      {format(parseISO(selectedEntry.date), "MMM dd, yyyy")}
                    </div>
                    <p className="text-[#9dabb9] text-sm leading-relaxed mb-4 line-clamp-4">
                      {selectedEntry.content}
                    </p>
                    {selectedEntry.mood && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${getMoodColor(
                          selectedEntry.mood
                        )} text-xs mb-4`}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "14px" }}
                        >
                          {getMoodIcon(selectedEntry.mood)}
                        </span>
                        {selectedEntry.mood}
                      </span>
                    )}
                    <button
                      onClick={() => navigate(`/entry/${selectedEntry.id}`)}
                      className="w-full bg-[#137fec] hover:bg-[#0f6acc] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {language === "tr"
                        ? "Tam Günlüğü Görüntüle"
                        : "View Full Entry"}
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-[#9dabb9] mb-3">
                      note_add
                    </span>
                    <h3 className="text-base font-semibold text-white mb-2">
                      {language === "tr" ? "Günlük Yok" : "No Entry"}
                    </h3>
                    <p className="text-xs text-[#9dabb9] mb-4">
                      {format(parseISO(selectedDate), "MMM dd, yyyy")}
                    </p>
                    <button
                      onClick={() =>
                        navigate(`/new-entry?date=${selectedDate}`)
                      }
                      className="w-full bg-[#137fec] hover:bg-[#0f6acc] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {language === "tr" ? "Günlük Oluştur" : "Create Entry"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Stats / Mood Widget */}
            <div className="bg-gradient-to-br from-[#137fec]/80 to-[#0f6acc] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden hidden lg:block">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-1">
                  {language === "tr" ? "Haftalık Ruh Hali" : "Weekly Mood"}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl font-bold">4.8</span>
                  <span className="text-sm opacity-80">
                    {language === "tr" ? "/ 5.0 ort" : "/ 5.0 avg"}
                  </span>
                </div>
                <div className="flex justify-between items-end h-16 gap-2">
                  {[40, 60, 30, 80, 90, 70, 100].map((height, i) => (
                    <div
                      key={i}
                      className={`w-full rounded-t-sm ${
                        i === 6
                          ? "bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                          : "bg-white/20"
                      }`}
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] mt-2 opacity-70 font-medium">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                    <span key={i}>{day}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Recent Entries Feed */}
          <section className="flex-1 flex flex-col min-w-0 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {language === "tr" ? "Son Günlükler" : "Recent Entries"}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Filter işlevi eklenebilir
                  }}
                  className="p-2 text-[#9dabb9] hover:text-[#137fec] transition-colors bg-[#1c2127] rounded-lg border border-[#283039] shadow-sm"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px" }}
                  >
                    filter_list
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Sort işlevi eklenebilir
                  }}
                  className="p-2 text-[#9dabb9] hover:text-[#137fec] transition-colors bg-[#1c2127] rounded-lg border border-[#283039] shadow-sm"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px" }}
                  >
                    sort
                  </span>
                </button>
              </div>
            </div>

            {/* Scrollable Container */}
            <div className="overflow-y-auto flex-1 pr-2 pb-10 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <span className="material-symbols-outlined text-4xl text-[#137fec] animate-spin mb-4">
                    progress_activity
                  </span>
                  <p className="text-[#9dabb9] text-sm">
                    {language === "tr" ? "Son kayıtlar getiriliyor..." : "Fetching recent entries..."}
                  </p>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="p-12 rounded-2xl border-2 border-dashed border-[#283039] flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-[#1c2127] rounded-full flex items-center justify-center mb-4 text-[#9dabb9]">
                    <span className="material-symbols-outlined text-3xl">
                      history_edu
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {language === "tr" ? "Henüz günlük yok" : "No entries yet"}
                  </h3>
                  <p className="text-sm text-[#9dabb9] mb-4">
                    {language === "tr"
                      ? "Günlüklerini görmek için yazmaya başla"
                      : "Start journaling to see your entries here"}
                  </p>
                  <button
                    onClick={() => navigate("/new-entry")}
                    className="text-[#137fec] text-sm font-bold hover:underline"
                  >
                    {language === "tr"
                      ? "İlk Günlüğünü Oluştur"
                      : "Create Your First Entry"}
                  </button>
                </div>
              ) : (
                <>
                  {filteredEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      onClick={() => navigate(`/entry/${entry.id}`)}
                      className={`group relative bg-[#1c2127] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
                        index === 0
                          ? "border-l-4 border-l-[#137fec]"
                          : "border border-[#283039] hover:border-[#137fec]/50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`${getEntryTypeStyle(
                              index
                            )} text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide`}
                          >
                            {getEntryTypeLabel(index)}
                          </span>
                          <span className="text-[#9dabb9] text-xs font-medium flex items-center gap-1">
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "14px" }}
                            >
                              {index === 0 ? "schedule" : "calendar_today"}
                            </span>
                            {index === 0
                              ? format(parseISO(entry.date), "p")
                              : format(parseISO(entry.date), "MMM dd")}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Entry menüsü eklenebilir
                          }}
                          className="text-[#9dabb9] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "20px" }}
                          >
                            more_horiz
                          </span>
                        </button>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#137fec] transition-colors flex items-center gap-2">
                        {entry.is_encrypted ? (
                          <>
                            <span className="material-symbols-outlined text-red-400">lock</span>
                            {language === "tr" ? "Kilitli Giriş" : "Locked Entry"}
                          </>
                        ) : (
                          entry.title
                        )}
                      </h3>
                      <p className="text-[#9dabb9] text-sm leading-relaxed line-clamp-2">
                        {entry.is_encrypted 
                          ? (language === "tr" ? "Bu giriş şifre ile korunmaktadır." : "This entry is password protected.") 
                          : entry.content
                        }
                      </p>

                      <div className="flex gap-2 mt-4 flex-wrap">
                        {entry.mood && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${getMoodColor(
                              entry.mood
                            )} text-xs`}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "14px" }}
                            >
                              {getMoodIcon(entry.mood)}
                            </span>
                            {entry.mood}
                          </span>
                        )}
                        {entry.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#283039] text-[#9dabb9] text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* End of entries prompt */}
                  <div className="p-8 rounded-2xl border-2 border-dashed border-[#283039] flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-[#1c2127] rounded-full flex items-center justify-center mb-3 text-[#9dabb9]">
                      <span className="material-symbols-outlined">
                        history_edu
                      </span>
                    </div>
                    <p className="text-white font-medium">
                      End of recent entries
                    </p>
                    <p className="text-xs text-[#9dabb9] mb-4">
                      Why not write about something from the past?
                    </p>
                    <button
                      onClick={() => navigate("/calendar")}
                      className="text-[#137fec] text-sm font-bold hover:underline"
                    >
                      View All History
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
