import Dashboard from "./pages/Dashboard";
import { ScriptProvider } from "./context/ScriptContext";

function App() {
  return (
    <ScriptProvider>
      <Dashboard />
    </ScriptProvider>
  );
}

export default App;
