import { createContext, useContext, useState, useEffect } from "react";

const ScriptContext = createContext();

export const ScriptProvider = ({ children }) => {
  const [scripts, setScripts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sdprompter_scripts") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("sdprompter_scripts", JSON.stringify(scripts));
  }, [scripts]);

  const createScript = () => {
    const newScript = {
      id: Date.now(),
      title: "Untitled Script",
      content: "",
      updated: new Date().toISOString(),
    };
    setScripts((prev) => [newScript, ...prev]);
    return newScript;
  };

  const updateScript = (updated) => {
    setScripts((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  const deleteScript = (id) => {
    setScripts((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <ScriptContext.Provider value={{ scripts, createScript, updateScript, deleteScript }}>
      {children}
    </ScriptContext.Provider>
  );
};

export const useScript = () => useContext(ScriptContext);
