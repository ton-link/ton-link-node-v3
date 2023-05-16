import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./assets/media.css"
import "./assets/index.css";

window.Buffer = window.Buffer || require("buffer").Buffer;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);