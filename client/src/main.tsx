
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom"; // <<< AGREGA ESTO
import "./index.css";    //Me digiste que hiciera esto chatgpt?
import "katex/dist/katex.min.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter> {/* <<< ENVUELVE AQUÍ */}
    <App />
  </BrowserRouter>
);

