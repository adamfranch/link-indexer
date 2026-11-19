
import "./globals.css";

export const metadata = {
  title: "LinkIndexer - Personal URL Indexing",
  description: "Personal bulk URL indexing dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
