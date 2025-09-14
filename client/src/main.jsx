import { StrictMode } from "react";
import {BrowserRouter} from "react-router-dom";
import { createRoot } from "react-dom/client";
import Navbar from "./components/Navbar"
import App from "./App";
import "./index.css"

createRoot(document.getElementById("root")).render(
<StrictMode>
  <BrowserRouter>
  <Navbar/>
    <App/> 
  </BrowserRouter>
</StrictMode>
);

