"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="bg-white/5 p-8 rounded-xl w-full max-w-sm">
          <h2 className="text-xl font-semibold mb-4">Admin Access</h2>

          <input
            type="password"
            placeholder="Admin password"
            className="input"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button
            onClick={() => {
              if (
                password ===
                process.env.NEXT_PUBLIC_ADMIN_PASSWORD
              ) {
                setAuthorized(true);
              } else {
                alert("Incorrect password");
              }
            }}
            className="mt-4 w-full py-3 rounded bg-orange-500"
          >
            Enter
          </button>

          <style jsx>{`
            .input {
              width: 100%;
              padding: 0.75rem;
              border-radius: 10px;
              background: rgba(255,255,255,0.1);
              border: 1px solid rgba(249,115,22,0.3);
              color: white;
            }
          `}</style>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
