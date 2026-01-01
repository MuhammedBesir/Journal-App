import { createContext, useState, useContext, useEffect } from "react";

const LanguageContext = createContext(null);

const translations = {
  en: {
    // Sidebar
    dashboard: "Dashboard",
    entries: "Entries",
    calendar: "Calendar",
    analytics: "Analytics",
    settings: "Settings",
    newEntry: "New Entry",

    // Dashboard
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    writingStreak: "You have written {{count}} days in a row. Keep it up!",
    startJourney: "Start your journaling journey today!",
    recentEntries: "Recent Entries",
    noEntriesYet: "No entries yet",
    startJournaling: "Start journaling to see your entries here",
    createFirstEntry: "Create Your First Entry",
    endOfEntries: "End of recent entries",
    viewAllHistory: "View All History",

    // Calendar
    todoCalendar: "Todo Calendar",
    manageTasks: "Manage your daily tasks and todos",
    selectDate: "Select a date to view todos",
    todosFor: "Todos for",
    completed: "completed",
    addNewTodo: "Add a new todo...",
    add: "Add",
    noTodos: "No todos for this date. Add one above!",
    loadingTodos: "Loading todos...",

    // Analytics
    journalAnalytics: "Journal Analytics",
    trackMoods: "Track your moods and journaling patterns",
    startDate: "Start Date",
    endDate: "End Date",
    reset: "Reset",
    totalEntries: "Total Entries",
    topMood: "Top Mood",
    avgPerDay: "Avg/Day",
    moodDistribution: "Mood Distribution",
    noMoodData: "No mood data available",
    entriesLabel: "entries",
    writingPatterns: "Writing Patterns",
    timeAnalysis: "Time Analysis",
    mostActiveDay: "Most Active Day",
    avgWordsPerEntry: "Avg Words/Entry",
    longestStreak: "Longest Streak",
    days: "days",
    favoriteTime: "Favorite Time",
    totalTimeSpent: "Total Time Spent",
    avgSession: "Avg Session",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",

    // Settings
    settingsTitle: "Settings",
    manageAccount: "Manage your account and preferences",
    profile: "Profile",
    preferences: "Preferences",
    security: "Security",
    profileInfo: "Profile Information",
    changePhoto: "Change Photo",
    photoUploadSoon: "Photo upload feature coming soon!",
    fullName: "Full Name",
    yourName: "Your name",
    email: "Email",
    yourEmail: "your@email.com",
    bio: "Bio",
    tellAboutYourself: "Tell us about yourself...",
    saveChanges: "Save Changes",
    saving: "Saving...",
    emailNotifications: "Email Notifications",
    emailNotificationsDesc: "Receive email notifications for new features",
    streakReminders: "Streak Reminders",
    streakRemindersDesc: "Get reminded to write daily",
    darkMode: "Dark Mode",
    darkModeDesc: "Use dark theme",
    language: "Language",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    enterCurrentPassword: "Enter current password",
    newPassword: "New Password",
    enterNewPassword: "Enter new password",
    confirmNewPassword: "Confirm New Password",
    confirmPassword: "Confirm new password",
    updatePassword: "Update Password",
    updating: "Updating...",
    dangerZone: "Danger Zone",
    logoutDesc:
      "Once you logout, you'll need to log in again to access your account.",
    logout: "Logout",

    // New Entry
    createNewEntry: "Create New Entry",
    captureThoughts: "Capture your thoughts, feelings, and memories for today.",
    date: "Date",
    howFeeling: "How are you feeling?",
    giveHeadline: "Give your day a headline...",
    writeThoughts: "Write your thoughts here...",
    tags: "Tags",
    addTags: "Add tags and press Enter...",
    separateTags: "Separate tags with commas or press Enter.",
    cancel: "Cancel",
    saveEntry: "Save Entry",

    // Moods
    happy: "Happy",
    neutral: "Neutral",
    sad: "Sad",
    energetic: "Energetic",
    calm: "Calm",
    excited: "Excited",
    grateful: "Grateful",
  },
  tr: {
    // Sidebar
    dashboard: "Gösterge Paneli",
    entries: "Günlükler",
    calendar: "Takvim",
    analytics: "Analitik",
    settings: "Ayarlar",
    newEntry: "Yeni Günlük",

    // Dashboard
    goodMorning: "Günaydın",
    goodAfternoon: "İyi günler",
    goodEvening: "İyi akşamlar",
    writingStreak: "{{count}} gün üst üste yazdınız. Böyle devam!",
    startJourney: "Günlük yazma yolculuğunuza bugün başlayın!",
    recentEntries: "Son Günlükler",
    noEntriesYet: "Henüz günlük yok",
    startJournaling: "Günlüklerinizi görmek için yazmaya başlayın",
    createFirstEntry: "İlk Günlüğünüzü Oluşturun",
    endOfEntries: "Son günlüklerin sonu",
    viewAllHistory: "Tüm Geçmişi Görüntüle",

    // Calendar
    todoCalendar: "Yapılacaklar Takvimi",
    manageTasks: "Günlük görevlerinizi ve yapılacaklarınızı yönetin",
    selectDate: "Yapılacakları görmek için bir tarih seçin",
    todosFor: "Yapılacaklar -",
    completed: "tamamlandı",
    addNewTodo: "Yeni yapılacak ekle...",
    add: "Ekle",
    noTodos: "Bu tarih için yapılacak yok. Yukarıdan ekleyin!",
    loadingTodos: "Yapılacaklar yükleniyor...",

    // Analytics
    journalAnalytics: "Günlük Analizi",
    trackMoods: "Ruh halinizi ve yazma alışkanlıklarınızı takip edin",
    startDate: "Başlangıç Tarihi",
    endDate: "Bitiş Tarihi",
    reset: "Sıfırla",
    totalEntries: "Toplam Günlük",
    topMood: "En Çok Ruh Hali",
    avgPerDay: "Günlük Ort.",
    moodDistribution: "Ruh Hali Dağılımı",
    noMoodData: "Ruh hali verisi yok",
    entriesLabel: "günlük",
    writingPatterns: "Yazma Alışkanlıkları",
    timeAnalysis: "Zaman Analizi",
    mostActiveDay: "En Aktif Gün",
    avgWordsPerEntry: "Ort. Kelime/Günlük",
    longestStreak: "En Uzun Seri",
    days: "gün",
    favoriteTime: "Favori Zaman",
    totalTimeSpent: "Toplam Süre",
    avgSession: "Ort. Oturum",
    morning: "Sabah",
    afternoon: "Öğlen",
    evening: "Akşam",

    // Settings
    settingsTitle: "Ayarlar",
    manageAccount: "Hesabınızı ve tercihlerinizi yönetin",
    profile: "Profil",
    preferences: "Tercihler",
    security: "Güvenlik",
    profileInfo: "Profil Bilgileri",
    changePhoto: "Fotoğraf Değiştir",
    photoUploadSoon: "Fotoğraf yükleme özelliği yakında!",
    fullName: "Ad Soyad",
    yourName: "Adınız",
    email: "E-posta",
    yourEmail: "eposta@ornek.com",
    bio: "Biyografi",
    tellAboutYourself: "Kendiniz hakkında bilgi verin...",
    saveChanges: "Değişiklikleri Kaydet",
    saving: "Kaydediliyor...",
    emailNotifications: "E-posta Bildirimleri",
    emailNotificationsDesc: "Yeni özellikler için e-posta bildirimleri al",
    streakReminders: "Seri Hatırlatıcıları",
    streakRemindersDesc: "Günlük yazmak için hatırlatıcı al",
    darkMode: "Karanlık Mod",
    darkModeDesc: "Karanlık tema kullan",
    language: "Dil",
    changePassword: "Şifre Değiştir",
    currentPassword: "Mevcut Şifre",
    enterCurrentPassword: "Mevcut şifrenizi girin",
    newPassword: "Yeni Şifre",
    enterNewPassword: "Yeni şifrenizi girin",
    confirmNewPassword: "Yeni Şifreyi Onayla",
    confirmPassword: "Yeni şifrenizi onaylayın",
    updatePassword: "Şifreyi Güncelle",
    updating: "Güncelleniyor...",
    dangerZone: "Tehlike Bölgesi",
    logoutDesc:
      "Çıkış yaptığınızda, hesabınıza erişmek için tekrar giriş yapmanız gerekecek.",
    logout: "Çıkış Yap",

    // New Entry
    createNewEntry: "Yeni Günlük Oluştur",
    captureThoughts:
      "Bugünkü düşüncelerinizi, hislerinizi ve anılarınızı kaydedin.",
    date: "Tarih",
    howFeeling: "Nasıl hissediyorsun?",
    giveHeadline: "Gününüze bir başlık verin...",
    writeThoughts: "Düşüncelerinizi buraya yazın...",
    tags: "Etiketler",
    addTags: "Etiket ekleyin ve Enter'a basın...",
    separateTags: "Etiketleri virgül ile ayırın veya Enter'a basın.",
    cancel: "İptal",
    saveEntry: "Günlüğü Kaydet",

    // Moods
    happy: "Mutlu",
    neutral: "Nötr",
    sad: "Üzgün",
    energetic: "Enerjik",
    calm: "Sakin",
    excited: "Heyecanlı",
    grateful: "Minnettar",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    return saved || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key, params = {}) => {
    let text = translations[language][key] || translations.en[key] || key;

    // Replace parameters like {{count}}
    Object.keys(params).forEach((param) => {
      text = text.replace(`{{${param}}}`, params[param]);
    });

    return text;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
