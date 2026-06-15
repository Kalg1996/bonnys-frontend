export const TOAST_EVENT = "bonnys:toast";

function emitirToast(type, message) {
  if (typeof window === "undefined" || !message) return;

  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: { type, message },
    })
  );
}

export function toastSuccess(message) {
  emitirToast("success", message);
}

export function toastError(message) {
  emitirToast("danger", message);
}
