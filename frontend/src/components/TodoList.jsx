import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useLanguage } from "../contexts/LanguageContext";
import { todoService } from "../services/api";

const TodoList = ({ selectedDate }) => {
  const { language } = useLanguage();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      loadTodos();
    }
  }, [selectedDate]);

  const loadTodos = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await todoService.getTodos(dateStr);
      setTodos(response.data.todos || []);
    } catch (error) {
      console.error("Failed to load todos:", error);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim() || !selectedDate) return;

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      await todoService.createTodo({
        title: newTodo,
        date: dateStr,
      });
      setNewTodo("");
      loadTodos();
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  };

  const handleToggleTodo = async (id, completed) => {
    try {
      await todoService.updateTodo(id, { completed: !completed });
      loadTodos();
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await todoService.deleteTodo(id);
      loadTodos();
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  if (!selectedDate) {
    return (
      <div className="text-center py-8 text-[#9dabb9]">
        {language === "tr"
          ? "Yapılacakları görmek için bir tarih seçin"
          : "Select a date to view todos"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {language === "tr"
            ? `${format(selectedDate, "d MMM yyyy")} için Yapılacaklar`
            : `Todos for ${format(selectedDate, "MMM d, yyyy")}`}
        </h3>
        <span className="text-sm text-[#9dabb9]">
          {todos.filter((t) => t.completed).length} / {todos.length}{" "}
          {language === "tr" ? "tamamlandı" : "completed"}
        </span>
      </div>

      <form onSubmit={handleAddTodo} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder={
            language === "tr" ? "Yeni bir görev ekle..." : "Add a new todo..."
          }
          className="flex-1 px-4 py-2 bg-[#1c2127] border border-[#283039] rounded-lg focus:outline-none focus:border-[#137fec] text-white"
        />
        <button
          type="submit"
          disabled={!newTodo.trim()}
          className="px-6 py-2 bg-[#137fec] text-white rounded-lg hover:bg-[#137fec]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {language === "tr" ? "Ekle" : "Add"}
        </button>
      </form>

      {loading ? (
        <div className="text-center py-8 text-[#9dabb9]">
          {language === "tr"
            ? "Yapılacaklar yükleniyor..."
            : "Loading todos..."}
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-8 text-[#9dabb9]">
          {language === "tr"
            ? "Bu tarih için yapılacak yok. Yukarıdan ekle!"
            : "No todos for this date. Add one above!"}
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-3 bg-[#1c2127] border border-[#283039] rounded-lg group hover:border-[#137fec]/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo.id, todo.completed)}
                className="w-5 h-5 rounded border-[#283039] text-[#137fec] focus:ring-[#137fec] focus:ring-offset-0 bg-[#111418] cursor-pointer"
              />
              <span
                className={`flex-1 ${
                  todo.completed
                    ? "line-through text-[#9dabb9]/50"
                    : "text-white"
                }`}
              >
                {todo.title}
              </span>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
              >
                <span className="material-symbols-outlined text-xl">
                  delete
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;
