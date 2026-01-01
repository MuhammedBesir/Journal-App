import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    streakReminders: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // API call eklenebilir
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showNotification(
        language === "tr"
          ? "Profil başarıyla güncellendi!"
          : "Profile updated successfully!"
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification(
        language === "tr"
          ? "Profil güncellenemedi"
          : "Failed to update profile",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification(
        language === "tr" ? "Şifreler eşleşmiyor!" : "Passwords do not match!",
        "error"
      );
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showNotification(
        language === "tr"
          ? "Şifre en az 6 karakter olmalı!"
          : "Password must be at least 6 characters!",
        "error"
      );
      return;
    }
    setIsSaving(true);
    try {
      // API call eklenebilir
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showNotification(
        language === "tr"
          ? "Şifre başarıyla güncellendi!"
          : "Password updated successfully!"
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      showNotification(
        language === "tr"
          ? "Şifre güncellenemedi"
          : "Failed to update password",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (key) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className={`flex-1 overflow-y-auto p-4 lg:p-10 ${
        darkMode ? "bg-[#111418]" : "bg-[#fef6e4]"
      }`}
    >
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${
              notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            <span className="material-symbols-outlined">
              {notification.type === "error" ? "error" : "check_circle"}
            </span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1
            className={`${
              darkMode ? "text-white" : "text-[#1a1a1a]"
            } text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]`}
          >
            {language === "tr" ? "Ayarlar" : "Settings"}
          </h1>
          <p
            className={`${
              darkMode ? "text-[#9dabb9]" : "text-[#8b7355]"
            } text-base mt-2`}
          >
            {language === "tr"
              ? "Hesabınızı ve tercihlerinizi yönetin"
              : "Manage your account and preferences"}
          </p>
        </div>

        {/* Tabs */}
        <div
          className={`flex space-x-1 mb-6 ${
            darkMode
              ? "bg-[#1c2127] border-[#283039]"
              : "bg-white border-[#e8dcc8]"
          } rounded-lg p-1 border`}
        >
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? darkMode
                  ? "bg-[#137fec] text-white"
                  : "bg-[#d4691f] text-white"
                : darkMode
                ? "text-[#9dabb9] hover:text-white hover:bg-[#283039]"
                : "text-[#8b7355] hover:text-[#1a1a1a] hover:bg-[#f5ebe0]"
            }`}
          >
            {language === "tr" ? "Profil" : "Profile"}
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "preferences"
                ? darkMode
                  ? "bg-[#137fec] text-white"
                  : "bg-[#d4691f] text-white"
                : darkMode
                ? "text-[#9dabb9] hover:text-white hover:bg-[#283039]"
                : "text-[#8b7355] hover:text-[#1a1a1a] hover:bg-[#f5ebe0]"
            }`}
          >
            {language === "tr" ? "Tercihler" : "Preferences"}
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "security"
                ? darkMode
                  ? "bg-[#137fec] text-white"
                  : "bg-[#d4691f] text-white"
                : darkMode
                ? "text-[#9dabb9] hover:text-white hover:bg-[#283039]"
                : "text-[#8b7355] hover:text-[#1a1a1a] hover:bg-[#f5ebe0]"
            }`}
          >
            {language === "tr" ? "Güvenlik" : "Security"}
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div
            className={`${
              darkMode
                ? "bg-[#1c2127] border-[#283039]"
                : "bg-white border-[#e8dcc8]"
            } rounded-xl border p-6`}
          >
            <h2
              className={`${
                darkMode ? "text-white" : "text-[#1a1a1a]"
              } text-xl font-bold mb-6`}
            >
              {language === "tr" ? "Profil Bilgileri" : "Profile Information"}
            </h2>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <div
                  className="w-20 h-20 rounded-full bg-[#137fec] flex items-center justify-center"
                  style={{
                    backgroundImage: `url('https://ui-avatars.com/api/?name=${
                      user?.name || "User"
                    }&background=137fec&color=fff&size=80')`,
                    backgroundSize: "cover",
                  }}
                />
                <div>
                  <button
                    onClick={() =>
                      alert(
                        language === "tr"
                          ? "Fotoğraf yükleme özelliği yakında!"
                          : "Photo upload feature coming soon!"
                      )
                    }
                    className="px-4 py-2 bg-[#283039] hover:bg-[#2f3841] text-white rounded-lg transition-colors text-sm"
                  >
                    {language === "tr" ? "Fotoğraf Değiştir" : "Change Photo"}
                  </button>
                  <p
                    className={`${
                      darkMode ? "text-[#9dabb9]" : "text-[#8b7355]"
                    } text-xs mt-1`}
                  >
                    {language === "tr"
                      ? "JPG, PNG veya GIF. Maks 2MB."
                      : "JPG, PNG or GIF. Max size 2MB."}
                  </p>
                </div>
              </div>

              <div>
                <label
                  className={`block ${
                    darkMode ? "text-[#9dabb9]" : "text-[#8b7355]"
                  } text-sm font-medium mb-2`}
                >
                  {language === "tr" ? "Ad Soyad" : "Full Name"}
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className={`w-full px-4 py-3 ${
                    darkMode
                      ? "bg-[#111418] border-[#283039] text-white"
                      : "bg-[#fffbf0] border-[#e8dcc8] text-[#1a1a1a]"
                  } border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-[#137fec]" : "focus:ring-[#d4691f]"
                  } focus:border-transparent`}
                  placeholder={language === "tr" ? "Adınız" : "Your name"}
                />
              </div>

              <div>
                <label
                  className={`block ${
                    darkMode ? "text-[#9dabb9]" : "text-[#8b7355]"
                  } text-sm font-medium mb-2`}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className={`w-full px-4 py-3 ${
                    darkMode
                      ? "bg-[#111418] border-[#283039] text-white"
                      : "bg-[#fffbf0] border-[#e8dcc8] text-[#1a1a1a]"
                  } border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-[#137fec]" : "focus:ring-[#d4691f]"
                  } focus:border-transparent`}
                  placeholder="email@ornek.com"
                />
              </div>

              <div>
                <label
                  className={`block ${
                    darkMode ? "text-[#9dabb9]" : "text-[#8b7355]"
                  } text-sm font-medium mb-2`}
                >
                  {language === "tr" ? "Biyografi" : "Bio"}
                </label>
                <textarea
                  rows={4}
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  className={`w-full px-4 py-3 ${
                    darkMode
                      ? "bg-[#111418] border-[#283039] text-white"
                      : "bg-[#fffbf0] border-[#e8dcc8] text-[#1a1a1a]"
                  } border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-[#137fec]" : "focus:ring-[#d4691f]"
                  } focus:border-transparent resize-none`}
                  placeholder={
                    language === "tr"
                      ? "Kendinizden bahsedin..."
                      : "Tell us about yourself..."
                  }
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className={`px-6 py-3 ${
                    darkMode
                      ? "bg-[#137fec] hover:bg-[#0f6acc]"
                      : "bg-[#d4691f] hover:bg-[#b85a1a]"
                  } text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="material-symbols-outlined text-xl">
                    save
                  </span>
                  <span>
                    {isSaving
                      ? language === "tr"
                        ? "Kaydediliyor..."
                        : "Saving..."
                      : language === "tr"
                      ? "Değişiklikleri Kaydet"
                      : "Save Changes"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div
            className={`${
              darkMode
                ? "bg-[#1c2127] border-[#283039]"
                : "bg-white border-[#e8dcc8]"
            } rounded-xl border p-6`}
          >
            <h2
              className={`${
                darkMode ? "text-white" : "text-[#1a1a1a]"
              } text-xl font-bold mb-6`}
            >
              {language === "tr" ? "Tercihler" : "Preferences"}
            </h2>

            <div className="space-y-6">
              <div
                className={`flex items-center justify-between py-4 border-b ${
                  darkMode ? "border-[#283039]" : "border-[#e8dcc8]"
                }`}
              >
                <div>
                  <h3
                    className={`${
                      darkMode ? "text-white" : "text-[#1a1a1a]"
                    } font-medium`}
                  >
                    {language === "tr"
                      ? "E-posta Bildirimleri"
                      : "Email Notifications"}
                  </h3>
                  <p
                    className={`${
                      darkMode ? "text-[#9dabb9]" : "text-[#8b7355]"
                    } text-sm`}
                  >
                    {language === "tr"
                      ? "Yeni özellikler için e-posta bildirimleri alın"
                      : "Receive email notifications for new features"}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.emailNotifications}
                    onChange={() =>
                      handlePreferenceChange("emailNotifications")
                    }
                  />
                  <div
                    className={`w-11 h-6 ${
                      darkMode ? "bg-[#283039]" : "bg-[#e8dcc8]"
                    } peer-focus:outline-none peer-focus:ring-2 ${
                      darkMode
                        ? "peer-focus:ring-[#137fec]"
                        : "peer-focus:ring-[#d4691f]"
                    } rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      darkMode
                        ? "peer-checked:bg-[#137fec]"
                        : "peer-checked:bg-[#d4691f]"
                    }`}
                  ></div>
                </label>
              </div>

              <div
                className={`flex items-center justify-between py-4 border-b ${
                  darkMode ? "border-[#283039]" : "border-[#e8dcc8]"
                }`}
              >
                <div>
                  <h3
                    className={`${
                      darkMode ? "text-white" : "text-[#1a1a1a]"
                    } font-medium`}
                  >
                    {language === "tr"
                      ? "Seri Hatırlatıcıları"
                      : "Streak Reminders"}
                  </h3>
                  <p
                    className={`${
                      darkMode ? "text-[#9dabb9]" : "text-[#8b7355]"
                    } text-sm`}
                  >
                    {language === "tr"
                      ? "Günlük yazmak için hatırlatıcı alın"
                      : "Get reminded to write daily"}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.streakReminders}
                    onChange={() => handlePreferenceChange("streakReminders")}
                  />
                  <div
                    className={`w-11 h-6 ${
                      darkMode ? "bg-[#283039]" : "bg-[#e8dcc8]"
                    } peer-focus:outline-none peer-focus:ring-2 ${
                      darkMode
                        ? "peer-focus:ring-[#137fec]"
                        : "peer-focus:ring-[#d4691f]"
                    } rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      darkMode
                        ? "peer-checked:bg-[#137fec]"
                        : "peer-checked:bg-[#d4691f]"
                    }`}
                  ></div>
                </label>
              </div>

              <div
                className={`flex items-center justify-between py-4 border-b ${
                  darkMode ? "border-[#283039]" : "border-[#e8dcc8]"
                }`}
              >
                <div>
                  <h3
                    className={`${
                      darkMode ? "text-white" : "text-[#1a1a1a]"
                    } font-medium`}
                  >
                    {language === "tr" ? "Karanlık Mod" : "Dark Mode"}
                  </h3>
                  <p
                    className={`${
                      darkMode ? "text-[#9dabb9]" : "text-[#8b7355]"
                    } text-sm`}
                  >
                    {language === "tr"
                      ? "Karanlık temayı kullan"
                      : "Use dark theme"}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                  />
                  <div
                    className={`w-11 h-6 ${
                      darkMode ? "bg-[#283039]" : "bg-[#e8dcc8]"
                    } peer-focus:outline-none peer-focus:ring-2 ${
                      darkMode
                        ? "peer-focus:ring-[#137fec]"
                        : "peer-focus:ring-[#d4691f]"
                    } rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      darkMode
                        ? "peer-checked:bg-[#137fec]"
                        : "peer-checked:bg-[#d4691f]"
                    }`}
                  ></div>
                </label>
              </div>

              <div>
                <label
                  className={`block ${
                    darkMode ? "text-[#9dabb9]" : "text-[#8b7355]"
                  } text-sm font-medium mb-2`}
                >
                  {language === "tr" ? "Dil" : "Language"}
                </label>
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className={`w-full px-4 py-3 ${
                    darkMode
                      ? "bg-[#111418] border-[#283039] text-white"
                      : "bg-[#fffbf0] border-[#e8dcc8] text-[#1a1a1a]"
                  } border rounded-lg focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-[#137fec]" : "focus:ring-[#d4691f]"
                  } focus:border-transparent cursor-pointer`}
                >
                  <option value="en">English</option>
                  <option value="tr">Türkçe</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div
              className={`${
                darkMode
                  ? "bg-[#1c2127] border-[#283039]"
                  : "bg-white border-[#e8dcc8]"
              } rounded-xl border p-6`}
            >
              <h2
                className={`${
                  darkMode ? "text-white" : "text-[#1a1a1a]"
                } text-xl font-bold mb-6`}
              >
                {language === "tr" ? "Şifre Değiştir" : "Change Password"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block ${
                      darkMode ? "text-[#9dabb9]" : "text-[#8b7355]"
                    } text-sm font-medium mb-2`}
                  >
                    {language === "tr" ? "Mevcut Şifre" : "Current Password"}
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 ${
                      darkMode
                        ? "bg-[#111418] border-[#283039] text-white"
                        : "bg-[#fffbf0] border-[#e8dcc8] text-[#1a1a1a]"
                    } border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 ${
                      darkMode ? "focus:ring-[#137fec]" : "focus:ring-[#d4691f]"
                    } focus:border-transparent`}
                    placeholder={
                      language === "tr"
                        ? "Mevcut şifrenizi girin"
                        : "Enter current password"
                    }
                  />
                </div>

                <div>
                  <label
                    className={`block ${
                      darkMode ? "text-[#9dabb9]" : "text-[#8b7355]"
                    } text-sm font-medium mb-2`}
                  >
                    {language === "tr" ? "Yeni Şifre" : "New Password"}
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 ${
                      darkMode
                        ? "bg-[#111418] border-[#283039] text-white"
                        : "bg-[#fffbf0] border-[#e8dcc8] text-[#1a1a1a]"
                    } border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 ${
                      darkMode ? "focus:ring-[#137fec]" : "focus:ring-[#d4691f]"
                    } focus:border-transparent`}
                    placeholder={
                      language === "tr"
                        ? "Yeni şifrenizi girin"
                        : "Enter new password"
                    }
                  />
                </div>

                <div>
                  <label
                    className={`block ${
                      darkMode ? "text-[#9dabb9]" : "text-[#8b7355]"
                    } text-sm font-medium mb-2`}
                  >
                    {language === "tr"
                      ? "Yeni Şifreyi Onayla"
                      : "Confirm New Password"}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 ${
                      darkMode
                        ? "bg-[#111418] border-[#283039] text-white"
                        : "bg-[#fffbf0] border-[#e8dcc8] text-[#1a1a1a]"
                    } border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 ${
                      darkMode ? "focus:ring-[#137fec]" : "focus:ring-[#d4691f]"
                    } focus:border-transparent`}
                    placeholder={
                      language === "tr"
                        ? "Yeni şifrenizi onaylayın"
                        : "Confirm new password"
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleUpdatePassword}
                    disabled={
                      isSaving ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword
                    }
                    className={`px-6 py-3 ${
                      darkMode
                        ? "bg-[#137fec] hover:bg-[#0f6acc]"
                        : "bg-[#d4691f] hover:bg-[#b85a1a]"
                    } text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSaving
                      ? language === "tr"
                        ? "Güncelleniyor..."
                        : "Updating..."
                      : language === "tr"
                      ? "Şifreyi Güncelle"
                      : "Update Password"}
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`${
                darkMode
                  ? "bg-[#1c2127] border-red-900/30"
                  : "bg-white border-red-200"
              } rounded-xl border p-6`}
            >
              <h2
                className={`${
                  darkMode ? "text-white" : "text-[#1a1a1a]"
                } text-xl font-bold mb-4`}
              >
                {language === "tr" ? "Tehlikeli Bölge" : "Danger Zone"}
              </h2>
              <p
                className={`${
                  darkMode ? "text-[#9dabb9]" : "text-[#8b7355]"
                } text-sm mb-4`}
              >
                {language === "tr"
                  ? "Çıkış yaptığınızda, hesabınıza erişmek için tekrar giriş yapmanız gerekecek."
                  : "Once you logout, you'll need to log in again to access your account."}
              </p>

              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <span className="material-symbols-outlined text-xl">
                  logout
                </span>
                <span>{language === "tr" ? "Çıkış Yap" : "Logout"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
