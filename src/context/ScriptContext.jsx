import { createContext, useContext, useState } from "react";

const ScriptContext = createContext();

export const ScriptProvider = ({ children }) => {
  const [scriptText, setScriptText] = useState("");
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [mirrorHorizontal, setMirrorHorizontal] = useState(false);
  const [mirrorVertical, setMirrorVertical] = useState(false);

  return (
    <ScriptContext.Provider
      value={{
        scriptText,
        setScriptText,
        scrollSpeed,
        setScrollSpeed,
        mirrorHorizontal,
        setMirrorHorizontal,
        mirrorVertical,
        setMirrorVertical,
      }}
    >
      {children}
    </ScriptContext.Provider>
  );
};

export const useScript = () => useContext(ScriptContext);
