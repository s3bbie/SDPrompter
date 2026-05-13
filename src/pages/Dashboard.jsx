import { useState } from "react";
import { Plus, Wifi } from "lucide-react";
import ScriptEditor from "../components/ScriptEditor";
import TeleprompterPlayer from "../components/TeleprompterPlayer";
import { useScript } from "../context/ScriptContext";

export default function Dashboard() {
  const { scripts, createScript, updateScript, deleteScript } = useScript();
  const [activeScript, setActiveScript] = useState(null);
  const [mode, setMode] = useState("dashboard"); // "dashboard" | "editor" | "player"

  const handleNew = () => {
    const s = createScript();
    setActiveScript(s);
    setMode("editor");
  };

  const handleEdit = (script) => {
    setActiveScript(script);
    setMode("editor");
  };

  const handleSave = (updatedScript) => {
    updateScript(updatedScript);
    setActiveScript(updatedScript);
  };

  const handleDelete = (id) => {
    deleteScript(id);
    setMode("dashboard");
    setActiveScript(null);
  };

  const handleDoneEditing = () => setMode("player");
  const handleExitPlayer = () => setMode("dashboard");

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {mode === "dashboard" && (
        <>
          <header className="flex justify-between items-center px-6 pt-8 pb-4">
            <h1 className="text-3xl font-semibold tracking-tight">My Scripts</h1>
            <div className="flex gap-3">
              <button
                onClick={handleNew}
                className="bg-blue-600 hover:bg-blue-700 transition rounded-full p-2"
                title="New script"
              >
                <Plus size={20} />
              </button>
            </div>
          </header>

          <main className="flex-1 px-6 py-4">
            {scripts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
                <p className="text-lg">No scripts yet</p>
                <p className="text-sm">Tap + to create your first script</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {scripts.map((script) => (
                  <div
                    key={script.id}
                    className="bg-[#1a1a1a] hover:bg-[#222] transition rounded-2xl p-4 flex flex-col justify-between cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.3)] group relative"
                    onClick={() => handleEdit(script)}
                  >
                    <div>
                      <h2 className="text-base font-medium truncate mb-1">{script.title}</h2>
                      <p className="text-gray-500 text-xs line-clamp-3">
                        {script.content || "No content yet"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-gray-600 text-xs">{formatDate(script.updated)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${script.title}"?`)) handleDelete(script.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition text-gray-600 hover:text-red-400 p-1 rounded"
                        title="Delete script"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {mode === "editor" && activeScript && (
        <ScriptEditor
          script={activeScript}
          onSave={handleSave}
          onDone={handleDoneEditing}
          onDelete={handleDelete}
        />
      )}

      {mode === "player" && activeScript && (
        <TeleprompterPlayer
          script={activeScript}
          onExit={handleExitPlayer}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
