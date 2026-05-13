import { useState } from "react";
import { Plus, MoreVertical, Trash2, ChevronRight } from "lucide-react";
import TeleprompterPlayer from "../components/TeleprompterPlayer";
import { useScript } from "../context/ScriptContext";

export default function Dashboard() {
  const { scripts, createScript, updateScript, deleteScript } = useScript();
  const [activeScript, setActiveScript] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const handleNew = () => {
    const s = createScript();
    setActiveScript(s);
  };

  const handleOpen = (script) => {
    setMenuOpenId(null);
    setActiveScript(script);
  };

  const handleSave = (updated) => {
    updateScript(updated);
    setActiveScript(updated);
  };

  const handleExit = () => setActiveScript(null);

  const handleDelete = (id) => {
    deleteScript(id);
    setMenuOpenId(null);
    if (activeScript?.id === id) setActiveScript(null);
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  if (activeScript) {
    return (
      <TeleprompterPlayer
        script={activeScript}
        onExit={handleExit}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0f0f0f", color: "#fff" }}
      onClick={() => setMenuOpenId(null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>My Scripts</h1>
        <button
          onClick={(e) => { e.stopPropagation(); handleNew(); }}
          style={{
            background: "#2563eb",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={20} color="#fff" />
        </button>
      </div>

      {/* Script count */}
      {scripts.length > 0 && (
        <p style={{ color: "#666", fontSize: 13, paddingLeft: 20, marginBottom: 8 }}>
          {scripts.length} {scripts.length === 1 ? "script" : "scripts"}
        </p>
      )}

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {scripts.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: 320, gap: 10, color: "#444",
          }}>
            <div style={{ fontSize: 48 }}>📄</div>
            <p style={{ fontSize: 17, fontWeight: 500, color: "#555" }}>No scripts yet</p>
            <p style={{ fontSize: 14, color: "#444" }}>Tap + to create your first script</p>
          </div>
        ) : (
          <div style={{ padding: "0 16px" }}>
            {scripts.map((script, i) => (
              <div key={script.id} style={{ position: "relative" }}>
                <div
                  onClick={() => handleOpen(script)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#1c1c1e",
                    borderRadius: 14,
                    padding: "14px 16px",
                    marginBottom: 10,
                    cursor: "pointer",
                    gap: 12,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#242426"}
                  onMouseLeave={e => e.currentTarget.style.background = "#1c1c1e"}
                >
                  {/* Script icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: "#2563eb22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 20 }}>📝</span>
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 600, fontSize: 15, margin: 0,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{script.title}</p>
                    <p style={{
                      color: "#666", fontSize: 12, margin: "3px 0 0",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {script.content?.trim()
                        ? script.content.trim().slice(0, 60) + (script.content.length > 60 ? "…" : "")
                        : "No content yet"}
                    </p>
                    <p style={{ color: "#444", fontSize: 11, margin: "3px 0 0" }}>
                      {formatDate(script.updated)}
                    </p>
                  </div>

                  {/* Right side */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <ChevronRight size={16} color="#444" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === script.id ? null : script.id);
                      }}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        padding: 4, color: "#555",
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                {/* Context menu */}
                {menuOpenId === script.id && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{
                      position: "absolute", right: 16, top: 56, zIndex: 50,
                      background: "#2c2c2e", borderRadius: 12, overflow: "hidden",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.6)", minWidth: 160,
                    }}
                  >
                    <button
                      onClick={() => handleOpen(script)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "12px 16px",
                        background: "none", border: "none", color: "#fff",
                        cursor: "pointer", fontSize: 14, textAlign: "left",
                      }}
                    >
                      <span>✏️</span> Edit Script
                    </button>
                    <div style={{ height: 1, background: "#3a3a3c" }} />
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${script.title}"?`)) handleDelete(script.id);
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "12px 16px",
                        background: "none", border: "none", color: "#ff453a",
                        cursor: "pointer", fontSize: 14, textAlign: "left",
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
