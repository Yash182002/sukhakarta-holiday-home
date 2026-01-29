"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* =========================
   Types
========================= */
type ContentSection = {
  id: string;
  page: "home" | "about";
  section_key: string;
  section_title: string | null;
  section_content: string | null;
  section_data: {
    items?: any[];
    members?: any[];
    stats?: any[];
  } | null;
  images: string[];
  display_order: number;
  is_active: boolean;
};

/* =========================
   Page
========================= */
export default function AboutPage() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     Load content
  ========================= */
  useEffect(() => {
    loadSections();

    const channel = supabase
      .channel("about-content-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "content_sections",
        },
        () => loadSections()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadSections() {
    const { data, error } = await supabase
      .from("content_sections")
      .select("*")
      .eq("page", "about")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!error && data) {
      setSections(data);
    } else {
      console.error("Error loading about sections:", error);
    }

    setLoading(false);
  }

  /* =========================
     Section helpers
  ========================= */
  const heroSection = sections.find((s) => s.section_key === "hero");
  const storySection = sections.find((s) => s.section_key === "story");
  const statsSection = sections.find((s) => s.section_key === "stats");
  const valuesSection = sections.find((s) => s.section_key === "values");
  const teamSection = sections.find((s) => s.section_key === "team");

  const stats = statsSection?.section_data?.stats || [];
  const values = valuesSection?.section_data?.items || [];
  const team = teamSection?.section_data?.members || [];

  /* =========================
     Loading state
  ========================= */
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>

        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0f172a;
            color: white;
            gap: 1rem;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(249, 115, 22, 0.2);
            border-top-color: #f97316;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  /* =========================
     Render
  ========================= */
  return (
    <div className="about-page">
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>{heroSection?.section_title || "Our Story"}</h1>
          <p>
            {heroSection?.section_content ||
              "Creating Unforgettable Memories"}
          </p>
        </div>
      </section>

      {/* ================= STATS ================= */}
      {stats.length > 0 && (
        <section className="stats-section">
          <div className="container stats-grid">
            {stats.map((stat: any, i: number) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="container">
        {/* ================= STORY ================= */}
        {storySection && (
          <section className="story-section">
            <h2>{storySection.section_title}</h2>

            {storySection.section_content
              ?.split("\n\n")
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}

            {storySection.images?.length > 0 && (
              <div className="story-images">
                {storySection.images.map((img, i) => (
                  <img key={i} src={img} alt={`Story ${i + 1}`} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================= VALUES ================= */}
        {values.length > 0 && (
          <section className="values-section">
            <h2>
              {valuesSection?.section_title || "Our Values"}
            </h2>

            {valuesSection?.section_content && (
              <p className="section-subtitle">
                {valuesSection.section_content}
              </p>
            )}

            <div className="values-grid">
              {values.map((value: any, i: number) => (
                <div key={i} className="value-card">
                  <div className="value-icon">{value.icon}</div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= TEAM ================= */}
        {team.length > 0 && (
          <section className="team-section">
            <h2>
              {teamSection?.section_title || "Meet Our Team"}
            </h2>

            {teamSection?.section_content && (
              <p className="section-subtitle">
                {teamSection.section_content}
              </p>
            )}

            <div className="team-grid">
              {team.map((member: any, i: number) => (
                <div key={i} className="team-card">
                  <div className="team-avatar">
                    {member.icon}
                  </div>
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= CTA ================= */}
        <section className="cta-section">
          <h2>Experience Sukhakarta</h2>
          <p>
            Join our family of happy guests and create your own
            unforgettable memories.
          </p>
          <div className="cta-buttons">
            <a href="/book" className="cta-btn primary">
              Book Your Stay
            </a>
            <a href="/contact" className="cta-btn secondary">
              Contact Us
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}


      <style jsx>{`
        .about-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .particles {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #f97316;
          border-radius: 50%;
          animation: rise linear infinite;
        }

        @keyframes rise {
          0% {
            bottom: -10px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            bottom: 100vh;
            opacity: 0;
          }
        }

        .hero {
          position: relative;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(249, 115, 22, 0.2), transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(14, 165, 233, 0.2), transparent 50%);
          animation: pulse 10s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 2rem;
        }

        .hero h1 {
          font-size: clamp(4rem, 10vw, 7rem);
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff 0%, #f97316 50%, #0ea5e9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeInUp 1s ease-out;
        }

        .hero p {
          font-size: clamp(1.2rem, 3vw, 2rem);
          color: #cbd5e1;
          animation: fadeInUp 1s ease-out 0.3s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stats-section {
          position: relative;
          z-index: 1;
          padding: 4rem 2rem;
          margin-top: -5rem;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem 4rem;
          position: relative;
          z-index: 1;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .stat-card {
          text-align: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 20px;
          transition: all 0.4s;
          animation: slideUp 0.6s ease-out both;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-card:hover {
          transform: translateY(-10px);
          border-color: #f97316;
          box-shadow: 0 20px 50px rgba(249, 115, 22, 0.3);
        }

        .stat-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #f97316;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #cbd5e1;
          font-size: 1.1rem;
        }

        .content-panel {
          margin: 4rem 0;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 3rem;
        }

        .content-text h2 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .content-text p {
          line-height: 1.8;
          color: #cbd5e1;
          margin-bottom: 1.5rem;
        }

        .content-visual {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .visual-card {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(249, 115, 22, 0.2);
        }

        .visual-card img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .section-title {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-subtitle {
          text-align: center;
          color: #94a3b8;
          margin-bottom: 3rem;
        }

        .values-section, .team-section {
          margin: 5rem 0;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .value-card {
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 20px;
          text-align: center;
          transition: all 0.4s;
          animation: fadeIn 0.6s ease-out both;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .value-card:hover {
          transform: translateY(-10px);
          border-color: #f97316;
          box-shadow: 0 20px 50px rgba(249, 115, 22, 0.3);
        }

        .value-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
        }

        .value-card h3 {
          color: #f97316;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .value-card p {
          color: #cbd5e1;
          line-height: 1.6;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .team-card {
          text-align: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 20px;
          transition: all 0.4s;
          animation: slideUp 0.6s ease-out both;
        }

        .team-card:hover {
          transform: scale(1.05);
          border-color: #f97316;
          box-shadow: 0 20px 50px rgba(249, 115, 22, 0.3);
        }

        .team-avatar {
          width: 100px;
          height: 100px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(14, 165, 233, 0.2));
          border: 2px solid #f97316;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
        }

        .team-card h3 {
          color: #f8fafc;
          margin-bottom: 0.5rem;
        }

        .team-card p {
          color: #94a3b8;
        }

        .cta-section {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 30px;
          margin: 5rem 0;
        }

        .cta-section h2 {
          font-size: 3rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cta-section p {
          font-size: 1.2rem;
          color: #cbd5e1;
          margin-bottom: 2rem;
        }

        .cta-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-btn {
          padding: 1.2rem 3rem;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
          display: inline-block;
        }

        .cta-btn.primary {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
        }

        .cta-btn.primary:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.6);
        }

        .cta-btn.secondary {
          background: transparent;
          color: #f97316;
          border: 2px solid #f97316;
        }

        .cta-btn.secondary:hover {
          background: rgba(249, 115, 22, 0.1);
          transform: translateY(-5px);
        }

        @media (max-width: 968px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
