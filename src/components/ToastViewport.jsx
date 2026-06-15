"use client";

import { useEffect, useState } from "react";
import { TOAST_EVENT } from "@/utils/toast";

const AUTO_CLOSE_MS = 4500;

export default function ToastViewport() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handleToast(event) {
      const { type = "info", message } = event.detail || {};

      if (!message) return;

      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prevToasts) => [...prevToasts, { id, type, message }]);

      window.setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.filter((toast) => toast.id !== id)
        );
      }, AUTO_CLOSE_MS);
    }

    window.addEventListener(TOAST_EVENT, handleToast);

    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bonnys-toast alert alert-${toast.type}`}
          role="status"
        >
          <span>{toast.message}</span>
          <button
            type="button"
            className="bonnys-toast-close"
            aria-label="Cerrar mensaje"
            onClick={() =>
              setToasts((prevToasts) =>
                prevToasts.filter((item) => item.id !== toast.id)
              )
            }
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
