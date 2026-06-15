export function getErrorMessage(
  error,
  fallback = "Ocurrió un error. Intenta nuevamente."
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.mensaje ||
    error?.response?.data?.error ||
    error?.data?.message ||
    error?.data?.mensaje ||
    error?.data?.error ||
    error?.message ||
    fallback
  );
}
