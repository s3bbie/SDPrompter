import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

export default function ScriptEditor({ script, onSave, onDone, onDelete }) {
  const [title, setTitle] = useState(script?.title || "Untitled Script");
  const [text, setText] = useState(script?.content || "");

  useEffect(() => {
    if (script) {
      setTitle(script.title || "Untitled Script");
      setText(script.content || "");
    }
  }, [script]);

  const handleDone = () => {
    onSave({
      ...script,
      title: title.trim() || "Untitled Script",
      content: text,
      updated: new Date().toISOString(),
    });
    onDone();
  };

  const handleDelete = () => {
    if (confirm(`Delete "${title}"?`)) {
      onDelete(script.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-50">
      {/* Top bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
        <button
          onClick={handleDelete}
          className="text-gray-500 hover:text-red-400 transition p-1"
          title="Delete script"
        >
          <Trash2 size={18} />
        </button>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 mx-4 bg-transparent text-center text-white font-medium text-base focus:outline-none border-b border-transparent focus:border-gray-600 transition"
          placeholder="Script title"
        />

        <button
          onClick={handleDone}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium rounded-full px-3 py-1 border border-blue-400 transition"
        >
          Done
        </button>
      </div>

      {/* Text editor */}
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 w-full bg-black text-white text-2xl leading-relaxed focus:outline-none resize-none p-6"
        placeholder="Start typing your script..."
      />
    </div>
  );
}
