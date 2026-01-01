import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const BuddyWidget = ({ buddies, pendingRequests, onInvite, onAccept, onDecline }) => {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setSending(true);
    try {
      await onInvite(email);
      setEmail("");
    } catch (error) {
      console.error("Invite error:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#1c2127]/50 backdrop-blur-xl rounded-2xl border border-[#283039] p-5">
      <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#137fec]">group</span>
        {language === "tr" ? "Günlük Arkadaşlarım" : "Journal Buddies"}
      </h3>

      {/* Invite Form */}
      <form onSubmit={handleInvite} className="mb-4">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={language === "tr" ? "Arkadaşının emaili..." : "Friend's email..."}
            className="flex-1 bg-[#283039] text-white text-sm rounded-lg px-3 py-2 border border-[#3b4754] focus:border-[#137fec] focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 bg-[#137fec] hover:bg-[#137fec]/80 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {sending ? (
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            ) : (
              language === "tr" ? "Davet Et" : "Invite"
            )}
          </button>
        </div>
      </form>

      {/* Pending Requests */}
      {pendingRequests?.length > 0 && (
        <div className="mb-4">
          <p className="text-[#9dabb9] text-xs uppercase tracking-wider mb-2">
            {language === "tr" ? "Bekleyen Davetler" : "Pending Requests"}
          </p>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between bg-[#283039] rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    {request.requester_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{request.requester_name}</p>
                    <p className="text-[#9dabb9] text-xs">{request.requester_email}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onAccept(request.id)}
                    className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">check</span>
                  </button>
                  <button
                    onClick={() => onDecline(request.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buddies List */}
      {buddies?.length > 0 ? (
        <div className="space-y-2">
          {buddies.map((buddy) => (
            <div
              key={buddy.id}
              className="flex items-center justify-between bg-[#283039] rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#137fec] to-cyan-500 flex items-center justify-center text-white font-bold">
                  {buddy.buddy_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{buddy.buddy_name}</p>
                  <p className="text-[#9dabb9] text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">edit_note</span>
                    {buddy.entries_this_week || 0} {language === "tr" ? "bu hafta" : "this week"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {buddy.entries_this_week > 0 && (
                  <span className="material-symbols-outlined text-green-400 text-lg">local_fire_department</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-4xl text-[#4e5d6d] mb-2">group_add</span>
          <p className="text-[#9dabb9] text-sm">
            {language === "tr" 
              ? "Henüz günlük arkadaşın yok. Yukarıdan davet gönder!" 
              : "No buddies yet. Invite someone above!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default BuddyWidget;
