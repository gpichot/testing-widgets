import { createRoot } from "react-dom/client";
import { ContactPage } from "./ContactPage.js";

const root = document.getElementById("root");
if (root) createRoot(root).render(<ContactPage />);
