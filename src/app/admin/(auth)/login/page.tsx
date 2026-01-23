"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    await supabase.auth.getSession();
router.replace("/admin");
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center bg-slate-950 overflow-hidden text-white">

      {/* Animated background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(249,115,22,0.12)_1px,transparent_1px)] bg-[length:50px_50px] animate-[gridMove_20s_linear_infinite]" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md mx-auto p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-orange-500/20 shadow-2xl">

        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-white via-orange-400 to-yellow-400 bg-clip-text text-transparent">
          Admin Access
        </h1>

        <p className="text-center text-slate-400 mb-8">
          Sukhakarta Holiday Home · Control Panel
        </p>

        {/* Email */}
        <label className="block text-sm text-slate-400 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="admin@sukhakarta.com"
          className="input"
        />

        {/* Password */}
        <label className="block text-sm text-slate-400 mt-4 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input"
        />

        {/* Error */}
        {error && (
          <p className="mt-4 text-sm text-red-400 text-center">
            {error}
          </p>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? "Authenticating…" : "Login"}
        </button>

        <p className="mt-6 text-xs text-center text-slate-500">
          Authorized personnel only
        </p>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes gridMove {
          from { transform: translate(0,0); }
          to { transform: translate(50px,50px); }
        }

        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(249,115,22,0.3);
          color: white;
          outline: none;
          transition: all 0.25s ease;
        }

        .input:focus {
          border-color: rgb(249,115,22);
          box-shadow: 0 0 0 3px rgba(249,115,22,0.15);
          background: rgba(255,255,255,0.12);
        }

        .input::placeholder {
          color: #64748b;
        }
      `}</style>
    </main>
  );
}
