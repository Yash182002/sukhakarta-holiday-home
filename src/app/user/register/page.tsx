"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function UserRegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Sign up the user with full_name in metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: "https://sukhakartaholidayhome.in/user/login",
          data: {
            full_name: formData.name,
          },
        },
      });

      if (signUpError) throw signUpError;

      const userId = data?.user?.id;

      if (userId) {
        // Step 2: Upsert full_name and phone into user_profiles
        const { error: profileError } = await supabase
          .from("user_profiles")
          .upsert({
            id: userId,
            email: formData.email,
            full_name: formData.name,
            phone: formData.phone,
          });

        if (profileError) {
          console.error("Profile upsert error:", profileError);
        }
      }

      alert("Registration successful! Please check your email to verify your account.");
      router.push("/user/login");
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="register-page">
        <div className="bg-gradient">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="register-container">
          <div className="register-card">
            <div className="register-header">
              <div className="logo">
                <span className="logo-icon"></span>
                <div className="logo-text">
                  <h1>Sukhakarta Holiday Home</h1>
                </div>
              </div>
            </div>

            <div className="welcome-text">
              <h2>Join Us</h2>
              <p>Create your account to start booking</p>
            </div>

            <form onSubmit={handleRegister} className="register-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your Full Name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter your Email address"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Enter your Mobile number"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Create Password"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Re-Confirm Password"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon"></span>
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="register-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="register-footer">
              <p className="footer-text">
                Already have an account?{" "}
                <Link href="/user/login" className="login-link">
                  Sign in here
                </Link>
              </p>
              <Link href="/" className="back-link">
                ← Back to Website
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow-x: hidden; }

        .register-page {
          min-height: 100vh; width: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 2rem 1rem; position: relative; overflow: hidden;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .bg-gradient {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          overflow: hidden; z-index: 0; pointer-events: none;
        }
        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(100px); opacity: 0.3;
          animation: float 20s ease-in-out infinite;
        }
        .orb-1 { width: 500px; height: 500px; background: #f97316; top: -200px; right: -200px; }
        .orb-2 { width: 400px; height: 400px; background: #0ea5e9; bottom: -150px; left: -150px; animation-delay: 10s; }
        .orb-3 { width: 350px; height: 350px; background: #22c55e; top: 50%; left: 50%; animation-delay: 5s; }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(100px, -100px) scale(1.1); }
          66% { transform: translate(-100px, 100px) scale(0.9); }
        }
        .register-container { position: relative; z-index: 1; width: 100%; max-width: 500px; }
        .register-card {
          background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px);
          border: 1px solid rgba(249, 115, 22, 0.2); border-radius: 24px;
          padding: 2.5rem; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.6s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .register-header { margin-bottom: 2rem; }
        .logo { display: flex; align-items: center; gap: 1rem; justify-content: center; }
        .logo-icon { font-size: 3rem; animation: bounce 2s ease-in-out infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .logo-text { text-align: left; }
        .logo-text h1 {
          font-size: 2rem; font-weight: 800; margin: 0;
          background: linear-gradient(135deg, #fff, #f97316, #fbbf24);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; letter-spacing: -0.02em;
        }
        .logo-text p { margin: 0; font-size: 0.875rem; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; }
        .welcome-text { text-align: center; margin-bottom: 2rem; }
        .welcome-text h2 { font-size: 1.75rem; color: white; margin: 0 0 0.5rem 0; }
        .welcome-text p { color: #94a3b8; margin: 0; font-size: 0.95rem; }
        .register-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { color: #cbd5e1; font-weight: 500; font-size: 0.95rem; }
        .form-group input {
          width: 100%; padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 12px; color: white; font-size: 1rem; transition: all 0.3s;
        }
        .form-group input:focus {
          outline: none; border-color: #f97316;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }
        .form-group input::placeholder { color: #64748b; }
        .form-group input:disabled { opacity: 0.6; cursor: not-allowed; }
        .error-message {
          display: flex; align-items: center; gap: 0.75rem; padding: 1rem;
          background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px; color: #fca5a5; font-size: 0.95rem;
        }
        .error-icon { font-size: 1.25rem; }
        .register-btn {
          width: 100%; padding: 1.125rem 2rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none; border-radius: 12px; color: white;
          font-size: 1.05rem; font-weight: 600; cursor: pointer;
          transition: all 0.3s; box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3);
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem; margin-top: 0.5rem;
        }
        .register-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(249, 115, 22, 0.5); }
        .register-btn:active:not(:disabled) { transform: translateY(0); }
        .register-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .arrow { transition: transform 0.3s; }
        .register-btn:hover:not(:disabled) .arrow { transform: translateX(5px); }
        .register-footer {
          margin-top: 2rem; padding-top: 2rem;
          border-top: 1px solid rgba(249, 115, 22, 0.2); text-align: center;
        }
        .footer-text { color: #94a3b8; font-size: 0.95rem; margin: 0 0 1rem 0; }
        .login-link { color: #f97316; text-decoration: none; font-weight: 600; transition: color 0.3s; }
        .login-link:hover { color: #fb923c; }
        .back-link {
          display: inline-flex; align-items: center; gap: 0.5rem;
          color: #f97316; text-decoration: none; font-weight: 500;
          font-size: 0.95rem; transition: all 0.3s;
        }
        .back-link:hover { gap: 0.75rem; color: #fb923c; }
        @media (max-width: 480px) {
          .register-card { padding: 2rem 1.5rem; }
          .logo-icon { font-size: 2.5rem; }
          .logo-text h1 { font-size: 1.75rem; }
          .welcome-text h2 { font-size: 1.5rem; }
        }
      `}</style>
    </>
  );
}
