import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css"; // Si tienes un archivo de estilos globales

// Crear un contenedor de la aplicación
const root = ReactDOM.createRoot(document.getElementById("root"));

// Renderizar el componente App en el contenedor
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
