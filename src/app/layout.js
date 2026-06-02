import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";
import DynamicFavicon from "@/components/DynamicFavicon";
import SiteTheme from "@/components/SiteTheme";

export const metadata = {
  title: "Bonnys",
  description: "Sistema web para salón de belleza",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <SiteTheme />
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}
