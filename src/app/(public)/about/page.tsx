"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ContentSection = {
  id: string;
  section: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  stats?: Array<{
    label: string;
    value: string;
  }>;
  values_list?: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
};

export default function AboutPage() {
  const [heroContent, setHeroContent] = useState<ContentSection | null>(null);
  const [storyContent, setStoryContent] = useState<ContentSection | null>(null);
  const [valuesContent, setValuesContent] = useState<ContentSection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();

    // Real-time subscription
    const subscription = supabase
      .channel('about-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'about_content' }, loadContent)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadContent() {
    const { data } = await supabase
      .from("about_content")
      .select("*");

    if (data) {
      setHeroContent(data.find(s => s.section === 'hero') || null);
      setStoryContent(data.find(s => s.section === 'story') || null);
      setValuesContent(data.find(s => s.section === 'values') || null);
    }

    setLoading(false);
  }

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
            gap: 1rem;
            background: #0f172a;
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(249, 115, 22, 0.2);
            border-top-color: #f97316;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          p {
            color: #94a3b8;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="about-page">
      {/* Background Effects */}
      <div className="bg-gradient">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Hero Section */}
      {heroContent && (
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">{heroContent.title}</h1>
              {heroContent.subtitle && (
                <p className="hero-subtitle">{heroContent.subtitle}</p>
              )}
              {heroContent.description && (
                <p className="hero-description">{heroContent.description}</p>
              )}

              {/* Stats */}
              {heroContent.stats && heroContent.stats.length > 0 && (
                <div className="stats-grid">
                  {heroContent.stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {heroContent.image_url && (
              <div className="hero-image">
                <img src={heroContent.image_url} alt="About us" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Story Section */}
      {storyContent && (
        <section className="story-section">
          <div className="container">
            <div className="story-content">
              <div className="story-text">
                {storyContent.title && <h2>{storyContent.title}</h2>}
                {storyContent.subtitle && (
                  <p className="story-subtitle">{storyContent.subtitle}</p>
                )}
                {storyContent.description && (
                  <p className="story-description">{storyContent.description}</p>
                )}
              </div>
              {storyContent.image_url && (
                <div className="story-image">
                  <img src={storyContent.image_url} alt="Our story" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Values Section */}
      {valuesContent && valuesContent.values_list && (
        <section className="values-section">
          <div className="container">
            {valuesContent.title && (
              <div className="section-header">
                <h2>{valuesContent.title}</h2>
                {valuesContent.subtitle && (
                  <p className="subtitle">{valuesContent.subtitle}</p>
                )}
              </div>
            )}

            <div className="values-grid">
              {valuesContent.values_list.map((value, index) => (
                <div key={index} className="value-card">
                  <div className="value-icon">{value.icon}</div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <style jsx>{`
        .about-page {
          position: relative;
          min-height: 100vh;
        }

        .bg-gradient {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: -1;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
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
          background: #ea580c;
          bottom: -150px;
          left: -150px;
          animation-delay: -5s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: #c2410c;
          top: 50%;
          right: 30%;
          animation-delay: -10s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 30px) scale(0.9);
          }
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .hero {
          padding: 6rem 0;
          min-height: 80vh;
          display: flex;
          align-items: center;
        }

        .hero .container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-content {
          animation: fadeInLeft 1s ease-out;
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #f97316 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: clamp(1.2rem, 2.5vw, 1.6rem);
          color: #cbd5e1;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .hero-description {
          font-size: clamp(1rem, 2vw, 1.15rem);
          color: #94a3b8;
          line-height: 1.8;
          margin-bottom: 3rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 2rem;
        }

        .stat-card {
          text-align: center;
        }

        .stat-value {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: #f97316;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .hero-image {
          animation: fadeInRight 1s ease-out;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(249, 115, 22, 0.3);
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .hero-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .story-section {
          padding: 6rem 0;
          background: rgba(249, 115, 22, 0.05);
          border-top: 1px solid rgba(249, 115, 22, 0.2);
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
        }

        .story-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .story-text h2 {
          font-size: clamp(2rem, 4vw, 3rem);
          color: white;
          margin-bottom: 1rem;
          font-weight: 800;
        }

        .story-subtitle {
          font-size: clamp(1.1rem, 2vw, 1.4rem);
          color: #f97316;
          margin-bottom: 1.5rem;
          font-weight: 600;
        }

        .story-description {
          font-size: clamp(1rem, 2vw, 1.15rem);
          color: #cbd5e1;
          line-height: 1.8;
        }

        .story-image {
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .story-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .values-section {
          padding: 6rem 0;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-header h2 {
          font-size: clamp(2rem, 4vw, 3rem);
          color: white;
          margin-bottom: 1rem;
          font-weight: 800;
        }

        .subtitle {
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: #94a3b8;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .value-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 20px;
          padding: 2.5rem;
          text-align: center;
          transition: all 0.4s ease;
        }

        .value-card:hover {
          transform: translateY(-10px);
          border-color: #f97316;
          box-shadow: 0 20px 60px rgba(249, 115, 22, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }

        .value-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .value-card:hover .value-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .value-card h3 {
          font-size: 1.5rem;
          color: white;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .value-card p {
          color: #94a3b8;
          line-height: 1.7;
          font-size: 1.05rem;
        }

        @media (max-width: 968px) {
          .hero .container,
          .story-content {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .hero-image,
          .story-image {
            order: -1;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .values-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
