import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Prompter from "./pages/Prompter";
import { ScriptProvider } from "./context/ScriptContext";

function App() {
  return (
    <ScriptProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor/:id" element={<Editor />} />
          <Route path="/prompter" element={<Prompter />} />
        </Routes>
      </Router>
    </ScriptProvider>
  );
}

export default App;


