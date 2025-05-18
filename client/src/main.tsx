
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom"; // <<< AGREGA ESTO
import "./index.css";
import "katex/dist/katex.min.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter> {/* <<< ENVUELVE AQUÍ */}
    <App />
  </BrowserRouter>
);

