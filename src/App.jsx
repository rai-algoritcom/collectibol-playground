import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Builder from "./Builder.jsx";
import Gameplay from "./Gameplay.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Builder />} />
        
        <Route path="/builder" element={<Builder />} />
        <Route path="/gameplay" element={<Gameplay />} />
      </Routes>
    </Router>
  );
}

export default App;
