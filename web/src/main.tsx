import React from "react";
import ReactDOM from "react-dom/client";

function App(): React.JSX.Element {
  return <div>EcoTrack Web</div>;
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Missing #root element");
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

