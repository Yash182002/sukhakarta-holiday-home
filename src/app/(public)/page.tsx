"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type ContentSection = {
  id: string;
  section: string;
  title?: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_link?: string;
  image_url?: string;
  features?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
};

export default function HomePage() {
  const [heroContent, setHeroContent] = useState<ContentSection | null>(null);
  const [featuresContent, setFeaturesContent] = useState<ContentSection | null>(null);
  const [ctaContent, setCtaContent] = useState<ContentSection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();

    const subscription = supabase
      .channel('homepage-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'homepage_content' 
      }, loadContent)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadContent() {
    const { data } = await supabase.from("homepage_content").select("*");

    if (data) {
      setHeroContent(data.find(s => s.section === 'hero') || null);
      setFeaturesContent(data.find(s => s.section === 'features') || null);
      setCtaContent(data.find(s => s.section === 'cta') || null);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="homepage">
      <div className="bg-gradient">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {heroContent && (
        <section className="hero-section">
          {heroContent.image_url && (
            <div className="hero-image">
              <img src={heroContent.image_url} alt="Sukhakarta Holiday Home" loading="eager" />
            </div>
          )}
          <div className="hero-content">
            <h1 className="hero-title">{heroContent.title}</h1>
            {heroContent.subtitle && <p className="hero-subtitle">{heroContent.subtitle}</p>}
            {heroContent.description && <p className="hero-description">{heroContent.description}</p>}
            {heroContent.button_text && heroContent.button_link && (
              <div className="hero-buttons">
                <Link href={heroContent.button_link} className="cta-button">
                  {heroContent.button_text}
                  <span className="arrow">→</span>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {featuresContent && featuresContent.features && (
        <section className="features-section">
          <div className="container">
            {featuresContent.title && (
              <div className="section-header">
                <h2 className="section-title">{featuresContent.title}</h2>
                {featuresContent.subtitle && <p className="section-subtitle">{featuresContent.subtitle}</p>}
              </div>
            )}
            <div className="features-grid">
              {featuresContent.features.map((feature, index) => (
                <div key={index} className="feature-card card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {ctaContent && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              {ctaContent.title && <h2 className="section-title">{ctaContent.title}</h2>}
              {ctaContent.description && <p className="cta-description">{ctaContent.description}</p>}
              {ctaContent.button_text && ctaContent.button_link && (
                <Link href={ctaContent.button_link} className="cta-button">
                  {ctaContent.button_text}
                  <span className="arrow">→</span>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

<style jsx>{`
  .homepage {
    position: relative;
  }

  .bg-gradient {
    position: fixed;
    inset: 0;
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
    left: -200px;
  }

  .orb-2 {
    width: 400px;
    height: 400px;
    background: #ea580c;
    bottom: -150px;
    right: -150px;
    animation-delay: -5s;
  }

  .orb-3 {
    width: 350px;
    height: 350px;
    background: #c2410c;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: -10s;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 30px) scale(0.9); }
  }

  /* ===== HERO ===== */
  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    position: relative;
    overflow: visible;
  }

  .hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    z-index: 1;
  }

  .hero-title {
    font-size: clamp(2.5rem, 6vw, 5rem);
    font-weight: 800;
    background: linear-gradient(135deg, #fff 0%, #f97316 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1.5rem;
  }

  .hero-subtitle {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    color: #cbd5e1;
    margin-bottom: 1rem;
  }

  .hero-description {
    font-size: 1.1rem;
    color: #94a3b8;
    margin-bottom: 2.5rem;
    max-width: 700px;
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.9rem 1.8rem;
    border-radius: 999px;
    font-weight: 700;
    font-size: 1rem;
    color: white;
    background: linear-gradient(135deg, #f97316, #ea580c);
    box-shadow: 0 10px 40px rgba(249, 115, 22, 0.4);
    width: fit-content;
    white-space: nowrap;
  }

  .cta-button:hover {
    transform: translateY(-3px);
  }

  /* ===== FEATURES (ISOLATED) ===== */
  .features {
    padding: 6rem 0;
    position: relative;
    z-index: 1;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(249, 115, 22, 0.2);
    border-radius: 20px;
    padding: 2.5rem;
    text-align: center;
    transition: 0.3s ease;
    min-height: 220px;
  }

  /* ===== MOBILE FIX ===== */
  @media (max-width: 768px) {
    .hero {
      min-height: auto;
      padding-top: 6rem;
      padding-bottom: 6rem;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }
  }
`}</style>
