import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Wifi } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [scripts, setScripts] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("scripts") || "[]");
    setScripts(saved);
  }, []);

  const handleNew = () => {
    const newScript = {
      id: Date.now(),
      title: "Untitled Script",
      content: "",
      updated: new Date().toISOString(),
    };
    const updated = [...scripts, newScript];
    setScripts(updated);
    localStorage.setItem("scripts", JSON.stringify(updated));
    navigate(`/editor/${newScript.id}`);
  };

  const handleDelete = (id) => {
    const updated = scripts.filter((s) => s.id !== id);
    setScripts(updated);
    localStorage.setItem("scripts", JSON.stringify(updated));
  };

  const handleEdit = (id) => navigate(`/editor/${id}`);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-10 pt-8">
        <h1 className="text-4xl font-semibold tracking-tight">My Scripts</h1>
        <div className="flex gap-3">
          <button className="bg-gray-800 hover:bg-gray-700 rounded-full p-2">
            <Wifi size={20} />
          </button>
          <button
            onClick={handleNew}
            className="bg-pink-600 hover:bg-pink-700 rounded-full p-2"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      {/* Scripts Grid */}
      <main className="flex-1 px-10 py-8">
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {scripts.map((script) => (
            <div
              key={script.id}
              className="bg-[#1a1a1a] hover:bg-[#242424] transition rounded-2xl p-4 flex flex-col justify-between cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
              onClick={() => handleEdit(script.id)}
            >
              <div>
                <h2 className="text-lg font-medium truncate mb-1">
                  {script.title}
                </h2>
                <p className="text-gray-400 text-sm line-clamp-3">
                  {script.content || "No content yet"}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(script.id);
                }}
                className="mt-3 text-xs text-red-500 hover:text-red-400"
              >
                Delete
              </button>
            </div>
          ))}

          {/* Remote card */}
          <div className="bg-[#1a1a1a] hover:bg-[#242424] transition rounded-2xl p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
            <Wifi size={28} className="mb-2 text-blue-500" />
            <span>Remote</span>
          </div>

          {/* New script card */}
          <div
            onClick={handleNew}
            className="bg-[#1a1a1a] hover:bg-[#242424] transition rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer text-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
          >
            <Plus size={28} className="mb-2 text-pink-600" />
            <span>New</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 text-sm border-t border-gray-800">
        Tap and hold a script for options
      </footer>
    </div>
  );
}
