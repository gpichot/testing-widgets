import { createRoot } from "react-dom/client";
import { ContactForm } from "./ContactForm.js";

const root = document.getElementById("root");
if (root) createRoot(root).render(<ContactForm />);
