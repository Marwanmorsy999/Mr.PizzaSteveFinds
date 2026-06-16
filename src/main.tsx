import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { getRouter } from "./router";
import { RouterProvider } from "@tanstack/react-router";
import { CartProvider } from "./context/CartContext";

const router = getRouter();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  </StrictMode>
);
