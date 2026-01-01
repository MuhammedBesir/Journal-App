import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, parseISO } from "date-fns";

const CalendarView = ({ entries, onDateSelect, selectedDate }) => {
  const [entryDates, setEntryDates] = useState(new Set());

  useEffect(() => {
    if (entries) {
      const dates = new Set(entries.map((entry) => entry.date));
      setEntryDates(dates);
    }
  }, [entries]);

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = format(date, "yyyy-MM-dd");
      if (entryDates.has(dateStr)) {
        return "has-entry";
      }
    }
    return null;
  };

  const handleDateClick = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    onDateSelect(dateStr);
  };

  return (
    <div className="calendar-container">
      <Calendar
        onChange={handleDateClick}
        value={selectedDate ? parseISO(selectedDate) : new Date()}
        tileClassName={tileClassName}
        maxDate={new Date()}
      />
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-marker has-entry"></span>
          <span>Has entry</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
