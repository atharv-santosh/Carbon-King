import "./globals.css";

export const metadata = {
  title: "Carbon King",
  description: "Carbon King",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
