import React from "react";
import ReactDOM from "react-dom/client";
import { Dicom3DViewer } from "./components/Dicom3DViewer";
import "./style.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Dicom3DViewer />);
