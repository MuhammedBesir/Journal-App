import { format, parseISO } from "date-fns";

export const formatDate = (date, formatStr = "MMM dd, yyyy") => {
  try {
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    return format(parsedDate, formatStr);
  } catch (error) {
    console.error("Date formatting error:", error);
    return date;
  }
};

export const formatDateForInput = (date) => {
  try {
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    return format(parsedDate, "yyyy-MM-dd");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
};

export const getCurrentDate = () => {
  return format(new Date(), "yyyy-MM-dd");
};
