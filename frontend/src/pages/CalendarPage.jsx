import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import TodoList from "../components/TodoList";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { language } = useLanguage();

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-10 bg-[#111418]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-white text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]">
            {language === "tr" ? "Yapılacaklar Takvimi" : "Todo Calendar"}
          </h1>
          <p className="text-[#9dabb9] text-base mt-2">
            {language === "tr"
              ? "Günlük görevlerinizi ve yapılacaklarınızı yönetin"
              : "Manage your daily tasks and todos"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-[#1c2127] rounded-xl border border-[#283039] p-6">
              <Calendar
                value={selectedDate}
                onChange={handleDateSelect}
                className="w-full"
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#1c2127] rounded-xl border border-[#283039] p-6">
              <TodoList selectedDate={selectedDate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
