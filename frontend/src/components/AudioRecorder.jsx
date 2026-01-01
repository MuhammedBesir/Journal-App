import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const AudioRecorder = ({ onRecordingComplete, existingAudio, onRemove }) => {
  const { language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(existingAudio?.url || null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl && !existingAudio) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl, existingAudio]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete?.({ blob, url, duration });
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert(language === "tr" ? "Mikrofon erişimi reddedildi" : "Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleRemove = () => {
    if (audioUrl && !existingAudio) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    onRemove?.();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3">
      {/* Recording Controls */}
      <div className="flex items-center gap-4">
        {!audioUrl ? (
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-[#1c2127] hover:bg-[#283039] text-[#9dabb9] border border-[#3b4754]"
            }`}
          >
            <span className={`material-symbols-outlined ${isRecording ? "animate-pulse" : ""}`}>
              {isRecording ? "stop" : "mic"}
            </span>
            <span>
              {isRecording
                ? `${language === "tr" ? "Durdur" : "Stop"} (${formatTime(duration)})`
                : language === "tr"
                ? "Ses Kaydet"
                : "Record Audio"}
            </span>
          </button>
        ) : (
          <div className="flex-1 flex items-center gap-3 bg-[#1c2127] rounded-xl border border-[#3b4754] p-3">
            <span className="material-symbols-outlined text-[#137fec]">audio_file</span>
            <audio src={audioUrl} controls className="flex-1 h-10" />
            <span className="text-[#9dabb9] text-sm">{formatTime(duration)}</span>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          {language === "tr" ? "Kayıt yapılıyor..." : "Recording..."}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
