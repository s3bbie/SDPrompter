import { useState, useEffect } from "react";

export default function ScriptEditor({ script, onSave, onDone }) {
  const [text, setText] = useState(script?.content || "");

  useEffect(() => {
    if (script?.content !== undefined) setText(script.content);
  }, [script]);

  const handleDone = () => {
    onSave({ ...script, content: text, updated: new Date().toISOString() });
    onDone();
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col p-4 z-50">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-2">
        <button onClick={handleDone} className="text-blue-400 text-lg font-medium">
          Done
        </button>
      </div>

      {/* Text editor */}
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 w-full bg-black text-white text-3xl leading-relaxed focus:outline-none resize-none"
        placeholder="Start typing your script..."
      />
    </div>
  );
}
