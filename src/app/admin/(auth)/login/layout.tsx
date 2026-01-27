// This empty layout prevents the admin sidebar from showing on the login page
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

