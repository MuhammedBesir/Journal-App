import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { journalService, analyticsService, featuresService, aiService } from "../services/api";
import { getMoodColor, getMoodEmoji, MOODS } from "../utils/constants";

const Analytics = () => {
  const { language } = useLanguage();
  const [moodStats, setMoodStats] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  
  // New states for enhanced analytics
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [wordCloud, setWordCloud] = useState([]);
  const [writingFrequency, setWritingFrequency] = useState([]);
  const [moodTrends, setMoodTrends] = useState([]);
  const [badges, setBadges] = useState([]);
  const [summary, setSummary] = useState({});
  const [quote, setQuote] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [aiWeeklySummary, setAiWeeklySummary] = useState(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchEnhancedAnalytics();
    fetchAiWeeklySummary();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [moodResponse, entriesResponse] = await Promise.all([
        journalService.getMoodStats(dateRange),
        journalService.getEntries({ ...dateRange, limit: 1 }),
      ]);

      setMoodStats(moodResponse.data.moodStats);
      setTotalEntries(entriesResponse.data.total);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnhancedAnalytics = async () => {
    try {
      const [streakRes, wordCloudRes, frequencyRes, trendsRes, badgesRes, summaryRes, quoteRes] = await Promise.all([
        analyticsService.getStreak().catch(() => ({ data: { currentStreak: 0, longestStreak: 0 } })),
        analyticsService.getWordCloud(30).catch(() => ({ data: { words: [] } })),
        analyticsService.getWritingFrequency().catch(() => ({ data: { frequency: [] } })),
        analyticsService.getMoodTrends('month').catch(() => ({ data: { trends: [] } })),
        featuresService.getBadges().catch(() => ({ data: { badges: [], availableBadges: [] } })),
        analyticsService.getSummary().catch(() => ({ data: {} })),
        featuresService.getQuoteOfTheDay().catch(() => ({ data: { quote: null } })),
      ]);

      setStreak(streakRes.data);
      setWordCloud(wordCloudRes.data.words || []);
      setWritingFrequency(frequencyRes.data.frequency || []);
      setMoodTrends(trendsRes.data.trends || []);
      setBadges(badgesRes.data.availableBadges || []);
      setSummary(summaryRes.data);
      setQuote(quoteRes.data.quote);
    } catch (error) {
      console.error("Error fetching enhanced analytics:", error);
    }
  };

  const fetchAiWeeklySummary = async () => {
    try {
      setLoadingAiSummary(true);
      const response = await aiService.getWeeklySummary();
      setAiWeeklySummary(response.data);
    } catch (error) {
      console.error("Error fetching AI weekly summary:", error);
    } finally {
      setLoadingAiSummary(false);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  const handleReset = () => {
    setDateRange({ startDate: "", endDate: "" });
  };

  // Calculate max frequency for bar chart scaling
  const maxFrequency = useMemo(() => {
    if (!writingFrequency.length) return 1;
    return Math.max(...writingFrequency.map(f => f.count), 1);
  }, [writingFrequency]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#111418]">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-[#137fec] animate-spin">
            progress_activity
          </span>
          <p className="mt-4 text-[#9dabb9]">
            {language === "tr"
              ? "Analitikler yükleniyor..."
              : "Loading analytics..."}
          </p>
        </div>
      </div>
    );
  }

  const totalMoodEntries = moodStats.reduce(
    (sum, stat) => sum + parseInt(stat.count),
    0
  );

  const topMood = moodStats.length > 0 ? moodStats[0] : null;

  // Tab items
  const tabs = [
    { id: "overview", label: language === "tr" ? "Genel Bakış" : "Overview", icon: "space_dashboard" },
    { id: "moods", label: language === "tr" ? "Ruh Hali" : "Moods", icon: "mood" },
    { id: "patterns", label: language === "tr" ? "Yazma Alışkanlıkları" : "Writing Patterns", icon: "insights" },
    { id: "achievements", label: language === "tr" ? "Başarılar" : "Achievements", icon: "emoji_events" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#111418]">
      <div className="max-w-7xl mx-auto">
        {/* Header with Quote */}
        <div className="mb-8">
          <h1 className="text-white text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]">
            {language === "tr" ? "Günlük Analitiği" : "Journal Analytics"}
          </h1>
          <p className="text-[#9dabb9] text-base mt-2">
            {language === "tr"
              ? "Ruh halinizi ve yazma alışkanlıklarınızı takip edin"
              : "Track your moods and journaling patterns"}
          </p>
          
          {/* Motivational Quote Card */}
          {quote && (
            <div className="mt-4 p-4 bg-gradient-to-r from-[#137fec]/10 to-[#8b5cf6]/10 rounded-xl border border-[#137fec]/20">
              <p className="text-white/90 italic text-sm lg:text-base">
                "{language === "tr" && quote.quote_tr ? quote.quote_tr : quote.quote}"
              </p>
              <p className="text-[#9dabb9] text-xs mt-2">— {quote.author}</p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#137fec] text-white shadow-lg shadow-[#137fec]/20"
                  : "bg-[#1c2127] text-[#9dabb9] hover:bg-[#283039] hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="bg-[#1c2127]/50 backdrop-blur-xl rounded-xl border border-[#283039] p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#9dabb9] text-sm font-medium mb-2">
                {language === "tr" ? "Başlangıç Tarihi" : "Start Date"}
              </label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="w-full px-4 py-2.5 bg-[#111418] border border-[#283039] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-[#9dabb9] text-sm font-medium mb-2">
                {language === "tr" ? "Bitiş Tarihi" : "End Date"}
              </label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="w-full px-4 py-2.5 bg-[#111418] border border-[#283039] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleReset}
                className="w-full px-4 py-2.5 bg-[#283039] hover:bg-[#2f3841] text-white rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {language === "tr" ? "Sıfırla" : "Reset"}
              </button>
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Streak & Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Current Streak */}
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl border border-orange-500/30 p-5">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-orange-400 text-2xl animate-pulse">
                    local_fire_department
                  </span>
                  <span className="text-[#9dabb9] text-xs uppercase tracking-wider">
                    {language === "tr" ? "Mevcut Seri" : "Current Streak"}
                  </span>
                </div>
                <p className="text-white text-4xl font-black">{streak.currentStreak}</p>
                <p className="text-orange-300/70 text-sm mt-1">
                  {language === "tr" ? "gün" : "days"}
                </p>
              </div>

              {/* Longest Streak */}
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 p-5">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-purple-400 text-2xl">
                    whatshot
                  </span>
                  <span className="text-[#9dabb9] text-xs uppercase tracking-wider">
                    {language === "tr" ? "En Uzun Seri" : "Longest Streak"}
                  </span>
                </div>
                <p className="text-white text-4xl font-black">{streak.longestStreak}</p>
                <p className="text-purple-300/70 text-sm mt-1">
                  {language === "tr" ? "gün" : "days"}
                </p>
              </div>

              {/* Total Entries */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#137fec]/20 to-cyan-500/20 rounded-2xl border border-[#137fec]/30 p-5">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#137fec]/10 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-[#137fec] text-2xl">
                    book
                  </span>
                  <span className="text-[#9dabb9] text-xs uppercase tracking-wider">
                    {language === "tr" ? "Toplam Günlük" : "Total Entries"}
                  </span>
                </div>
                <p className="text-white text-4xl font-black">{totalEntries}</p>
                <p className="text-cyan-300/70 text-sm mt-1">
                  {language === "tr" ? "giriş" : "entries"}
                </p>
              </div>

              {/* Top Mood */}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/30 p-5">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-emerald-400 text-2xl">
                    mood
                  </span>
                  <span className="text-[#9dabb9] text-xs uppercase tracking-wider">
                    {language === "tr" ? "En Yaygın" : "Top Mood"}
                  </span>
                </div>
                <p className="text-white text-2xl font-bold">
                  {topMood ? `${getMoodEmoji(topMood.mood)}` : "N/A"}
                </p>
                <p className="text-emerald-300/70 text-sm mt-1">
                  {topMood?.mood || "-"}
                </p>
              </div>
            </div>

            {/* AI Weekly Summary */}
            {aiWeeklySummary && aiWeeklySummary.hasData && (
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-purple-400 text-xl">auto_awesome</span>
                  <h2 className="text-white text-xl font-bold">
                    {language === "tr" ? "Haftalık AI Özeti" : "AI Weekly Summary"}
                  </h2>
                  {loadingAiSummary && (
                    <span className="material-symbols-outlined text-purple-400 text-sm animate-spin">progress_activity</span>
                  )}
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-4">
                  {aiWeeklySummary.summary}
                </p>
                <div className="flex items-center gap-4 text-xs text-purple-300/70">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">edit_note</span>
                    {aiWeeklySummary.entryCount} {language === "tr" ? "giriş" : "entries"}
                  </span>
                  {aiWeeklySummary.moodBreakdown && Object.keys(aiWeeklySummary.moodBreakdown).length > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">mood</span>
                      {Object.entries(aiWeeklySummary.moodBreakdown).map(([mood, count]) => (
                        <span key={mood}>{getMoodEmoji(mood)} {count}</span>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Word Cloud Section */}
            {wordCloud.length > 0 && (
              <div className="bg-[#1c2127]/50 backdrop-blur-xl rounded-2xl border border-[#283039] p-6 mb-6">
                <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#137fec]">cloud</span>
                  {language === "tr" ? "Kelime Bulutu" : "Word Cloud"}
                </h2>
                <div className="flex flex-wrap gap-2 items-center justify-center py-4">
                  {wordCloud.map((word, index) => {
                    const size = Math.max(12, Math.min(36, 12 + (word.value / wordCloud[0].value) * 24));
                    const opacity = 0.5 + (word.value / wordCloud[0].value) * 0.5;
                    const colors = ['#137fec', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
                    const color = colors[index % colors.length];
                    
                    return (
                      <span
                        key={word.text}
                        className="cursor-default hover:scale-110 transition-transform"
                        style={{
                          fontSize: `${size}px`,
                          color: color,
                          opacity: opacity,
                          fontWeight: size > 20 ? 700 : 500,
                        }}
                      >
                        {word.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Writing Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* This Week */}
              <div className="bg-[#1c2127]/50 backdrop-blur-xl rounded-2xl border border-[#283039] p-6">
                <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#137fec]">calendar_today</span>
                  {language === "tr" ? "Bu Hafta" : "This Week"}
                </h3>
                <div className="text-center py-4">
                  <p className="text-5xl font-black text-white">{summary.entriesThisWeek || 0}</p>
                  <p className="text-[#9dabb9] mt-2">
                    {language === "tr" ? "giriş yazıldı" : "entries written"}
                  </p>
                  <div className="mt-4 bg-[#283039] rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#137fec] to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((summary.entriesThisWeek || 0) / 7) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#9dabb9] mt-2">
                    {summary.entriesThisWeek || 0}/7 {language === "tr" ? "gün" : "days"}
                  </p>
                </div>
              </div>

              {/* This Month */}
              <div className="bg-[#1c2127]/50 backdrop-blur-xl rounded-2xl border border-[#283039] p-6">
                <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-400">date_range</span>
                  {language === "tr" ? "Bu Ay" : "This Month"}
                </h3>
                <div className="text-center py-4">
                  <p className="text-5xl font-black text-white">{summary.entriesThisMonth || 0}</p>
                  <p className="text-[#9dabb9] mt-2">
                    {language === "tr" ? "giriş yazıldı" : "entries written"}
                  </p>
                  <div className="mt-4 bg-[#283039] rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((summary.entriesThisMonth || 0) / 30) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#9dabb9] mt-2">
                    {summary.entriesThisMonth || 0}/30 {language === "tr" ? "gün" : "days"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Moods Tab */}
        {activeTab === "moods" && (
          <div className="space-y-6">
            {/* Mood Distribution */}
            <div className="bg-[#1c2127]/50 backdrop-blur-xl rounded-2xl border border-[#283039] p-6">
              <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#137fec]">donut_small</span>
                {language === "tr" ? "Ruh Hali Dağılımı" : "Mood Distribution"}
              </h2>

              {moodStats.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">
                    sentiment_satisfied
                  </span>
                  <p className="text-[#9dabb9]">
                    {language === "tr"
                      ? "Ruh hali verisi bulunamadı"
                      : "No mood data available"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {moodStats.map((stat) => {
                    const percentage = totalMoodEntries
                      ? ((parseInt(stat.count) / totalMoodEntries) * 100).toFixed(1)
                      : 0;

                    return (
                      <div key={stat.mood} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl group-hover:scale-125 transition-transform">
                              {getMoodEmoji(stat.mood)}
                            </span>
                            <span className="text-white font-medium">
                              {stat.mood}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-[#9dabb9] text-sm">
                              {stat.count}{" "}
                              {language === "tr" ? "günlük" : "entries"}
                            </span>
                            <span className="text-white font-bold text-sm min-w-[50px] text-right">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-[#283039] rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: getMoodColor(stat.mood),
                              boxShadow: `0 0 12px ${getMoodColor(stat.mood)}40`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mood Emoji Summary */}
            <div className="bg-[#1c2127]/50 backdrop-blur-xl rounded-2xl border border-[#283039] p-6">
              <h3 className="text-white text-lg font-bold mb-4">
                {language === "tr" ? "Ruh Hali Özeti" : "Mood Summary"}
              </h3>
              <div className="flex justify-around py-4">
                {['Happy', 'Neutral', 'Sad', 'Energetic', 'Calm'].map((mood) => {
                  const stat = moodStats.find(s => s.mood === mood);
                  const count = stat ? parseInt(stat.count) : 0;
                  
                  return (
                    <div key={mood} className="text-center">
                      <span className="text-4xl block mb-2">{getMoodEmoji(mood)}</span>
                      <p className="text-white font-bold text-lg">{count}</p>
                      <p className="text-[#9dabb9] text-xs">{mood}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === "patterns" && (
          <div className="space-y-6">
            {/* Writing Frequency by Day */}
            <div className="bg-[#1c2127]/50 backdrop-blur-xl rounded-2xl border border-[#283039] p-6">
              <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#137fec]">bar_chart</span>
                {language === "tr" ? "Haftalık Yazma Dağılımı" : "Weekly Writing Distribution"}
              </h2>
              
              <div className="flex justify-between items-end h-48 gap-2 px-4">
                {writingFrequency.map((day) => {
                  const height = maxFrequency > 0 ? (day.count / maxFrequency) * 100 : 0;
                  const isHighest = day.count === maxFrequency && day.count > 0;
                  
                  return (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[#9dabb9] text-xs">{day.count}</span>
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 ${
                            isHighest 
                              ? "bg-gradient-to-t from-[#137fec] to-cyan-400" 
                              : "bg-gradient-to-t from-[#283039] to-[#3b4754]"
                          }`}
                          style={{ height: `${Math.max(4, height)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${isHighest ? "text-[#137fec]" : "text-[#9dabb9]"}`}>
                        {language === "tr" ? day.dayNameTr.substring(0, 3) : day.dayName.substring(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {writingFrequency.length > 0 && (
                <div className="mt-6 text-center">
                  <p className="text-[#9dabb9]">
                    {language === "tr" ? "En aktif gün:" : "Most active day:"}{" "}
                    <span className="text-[#137fec] font-bold">
                      {language === "tr" 
                        ? writingFrequency.reduce((max, d) => d.count > max.count ? d : max, writingFrequency[0]).dayNameTr
                        : writingFrequency.reduce((max, d) => d.count > max.count ? d : max, writingFrequency[0]).dayName
                      }
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Writing Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1c2127]/50 backdrop-blur-xl rounded-2xl border border-[#283039] p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-[#137fec] mb-3">
                  edit_note
                </span>
                <p className="text-3xl font-black text-white">{summary.avgWordsPerEntry || 0}</p>
                <p className="text-[#9dabb9] text-sm mt-1">
                  {language === "tr" ? "Ort. Kelime/Giriş" : "Avg Words/Entry"}
                </p>
              </div>

              <div className="bg-[#1c2127]/50 backdrop-blur-xl rounded-2xl border border-[#283039] p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-purple-400 mb-3">
                  timeline
                </span>
                <p className="text-3xl font-black text-white">{streak.longestStreak}</p>
                <p className="text-[#9dabb9] text-sm mt-1">
                  {language === "tr" ? "En Uzun Seri" : "Longest Streak"}
                </p>
              </div>

              <div className="bg-[#1c2127]/50 backdrop-blur-xl rounded-2xl border border-[#283039] p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-emerald-400 mb-3">
                  calendar_month
                </span>
                <p className="text-3xl font-black text-white">{totalEntries}</p>
                <p className="text-[#9dabb9] text-sm mt-1">
                  {language === "tr" ? "Toplam Giriş" : "Total Entries"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="space-y-6">
            <div className="bg-[#1c2127]/50 backdrop-blur-xl rounded-2xl border border-[#283039] p-6">
              <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-400">emoji_events</span>
                {language === "tr" ? "Başarı Rozetleri" : "Achievement Badges"}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.type}
                    className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                      badge.earned
                        ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50"
                        : "bg-[#1c2127] border-[#283039] opacity-50 grayscale"
                    }`}
                  >
                    {badge.earned && (
                      <div className="absolute -top-2 -right-2">
                        <span className="material-symbols-outlined text-yellow-400 text-xl">
                          verified
                        </span>
                      </div>
                    )}
                    <span className={`material-symbols-outlined text-4xl mb-2 ${
                      badge.earned ? "text-yellow-400" : "text-gray-500"
                    }`}>
                      {badge.icon || "military_tech"}
                    </span>
                    <p className={`font-bold text-sm ${badge.earned ? "text-white" : "text-gray-400"}`}>
                      {language === "tr" ? badge.nameTr : badge.name}
                    </p>
                    <p className="text-[#9dabb9] text-xs mt-1">
                      {language === "tr" ? badge.descriptionTr : badge.description}
                    </p>
                  </div>
                ))}
              </div>

              {badges.length === 0 && (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">
                    military_tech
                  </span>
                  <p className="text-[#9dabb9]">
                    {language === "tr"
                      ? "Henüz rozet kazanılmadı. Yazmaya devam edin!"
                      : "No badges earned yet. Keep writing!"}
                  </p>
                </div>
              )}
            </div>

            {/* Progress to Next Badge */}
            <div className="bg-[#1c2127]/50 backdrop-blur-xl rounded-2xl border border-[#283039] p-6">
              <h3 className="text-white text-lg font-bold mb-4">
                {language === "tr" ? "Sonraki Hedefler" : "Next Goals"}
              </h3>
              <div className="space-y-4">
                {/* Streak Goal */}
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-orange-400 text-2xl">
                    local_fire_department
                  </span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {language === "tr" ? "7 Günlük Seri" : "7 Day Streak"}
                    </p>
                    <div className="mt-2 bg-[#283039] rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (streak.currentStreak / 7) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[#9dabb9] text-xs mt-1">
                      {streak.currentStreak}/7 {language === "tr" ? "gün" : "days"}
                    </p>
                  </div>
                </div>

                {/* Entry Goal */}
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-[#137fec] text-2xl">
                    book
                  </span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {language === "tr" ? "10 Giriş" : "10 Entries"}
                    </p>
                    <div className="mt-2 bg-[#283039] rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#137fec] to-cyan-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (totalEntries / 10) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[#9dabb9] text-xs mt-1">
                      {totalEntries}/10 {language === "tr" ? "giriş" : "entries"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
