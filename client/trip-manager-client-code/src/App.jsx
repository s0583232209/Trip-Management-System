import { useState } from "react";
import Auth from "./pages/Auth.jsx"
import { BrowserRouter } from "react-router-dom";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return <BrowserRouter><Auth /></BrowserRouter>;
}

export default App;
