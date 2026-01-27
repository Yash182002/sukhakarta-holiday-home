export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0f172a", color: "white" }}>
        {children}
      </body>
    </html>
  );
}
