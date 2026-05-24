import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource-variable/inter";
import "./index.css";
import { initDeviceSync } from "./lib/device-sync";

// Cross-device project sync: auto-pull on login, debounced auto-push on
// localStorage changes. No-op for logged-out users.
initDeviceSync();

createRoot(document.getElementById("root")!).render(<App />);
