import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";
import DynamicFavicon from "@/components/DynamicFavicon";

export const metadata = {
  title: "Bonnys",
  description: "Sistema web para salón de belleza",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}
