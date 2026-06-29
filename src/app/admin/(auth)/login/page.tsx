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

 async function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // ✅ GENERIC ERROR MESSAGE (don't leak user existence)
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/admin");
    } else {
      setError("Authentication failed. Please try again.");
      setLoading(false);
    }
  } catch (err) {
    setError("An error occurred. Please try again.");
    setLoading(false);
  }
}

  return (
    <>
      <div className="login-page">
        <div className="bg-gradient">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="logo">
                {/* <span className="logo-icon"></span> */}
                <div className="logo-text">
                  <h1>Sukhakarta Admin</h1>
                  {/* <p>Admin</p> */}
                </div>
              </div>
            </div>

            <div className="welcome-text">
              <h2>Welcome Back</h2>
              <p>Sign in to access the admin dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email Address"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your Password"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon"></span>
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="arrow"></span>
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <p className="footer-text">Authorized personnel only</p>
              <a href="/" className="back-link">
                 Back to Website
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html,
        body {
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }

        .login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 1rem;
          position: relative;
          overflow: hidden;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .bg-gradient {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: #f97316;
          top: -200px;
          right: -200px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: #0ea5e9;
          bottom: -150px;
          left: -150px;
          animation-delay: 10s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: #22c55e;
          top: 50%;
          left: 50%;
          animation-delay: 5s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(100px, -100px) scale(1.1);
          }
          66% {
            transform: translate(-100px, 100px) scale(0.9);
          }
        }

        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 450px;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          margin-bottom: 2rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          justify-content: center;
        }

        .logo-icon {
          font-size: 3rem;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .logo-text {
          text-align: left;
        }

        .logo-text h1 {
          font-size: 2rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #fff, #f97316, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .logo-text p {
          margin: 0;
          font-size: 0.875rem;
          color: #94a3b8;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .welcome-text {
          text-align: center;
          margin-bottom: 2rem;
        }

        .welcome-text h2 {
          font-size: 1.75rem;
          color: white;
          margin: 0 0 0.5rem 0;
        }

        .welcome-text p {
          color: #94a3b8;
          margin: 0;
          font-size: 0.95rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: #cbd5e1;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .form-group input {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #f97316;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        .form-group input::placeholder {
          color: #64748b;
        }

        .form-group input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #fca5a5;
          font-size: 0.95rem;
        }

        .error-icon {
          font-size: 1.25rem;
        }

        .login-btn {
          width: 100%;
          padding: 1.125rem 2rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.5);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .arrow {
          transition: transform 0.3s;
        }

        .login-btn:hover:not(:disabled) .arrow {
          transform: translateX(5px);
        }

        .login-footer {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(249, 115, 22, 0.2);
          text-align: center;
        }

        .footer-text {
          color: #64748b;
          font-size: 0.85rem;
          margin: 0 0 1rem 0;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #f97316;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.3s;
        }

        .back-link:hover {
          gap: 0.75rem;
          color: #fb923c;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 2rem 1.5rem;
          }

          .logo-icon {
            font-size: 2.5rem;
          }

          .logo-text h1 {
            font-size: 1.75rem;
          }

          .welcome-text h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}
