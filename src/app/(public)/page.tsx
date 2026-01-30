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

    // Real-time subscription
    const subscription = supabase
      .channel('homepage-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homepage_content' }, loadContent)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadContent() {
    const { data } = await supabase
      .from("homepage_content")
      .select("*");

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
    <div className="homepage">
      {/* Background Effects */}
      <div className="bg-gradient">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Hero Section */}
      {heroContent && (
        <section className="hero">
          {heroContent.image_url && (
            <div className="hero-image">
              <img src={heroContent.image_url} alt="Hero" />
            </div>
          )}
          <div className="hero-content">
            <h1 className="hero-title">{heroContent.title}</h1>
            {heroContent.subtitle && (
              <p className="hero-subtitle">{heroContent.subtitle}</p>
            )}
            {heroContent.description && (
              <p className="hero-description">{heroContent.description}</p>
            )}
            {heroContent.button_text && heroContent.button_link && (
              <Link href={heroContent.button_link} className="cta-button">
                {heroContent.button_text}
                <span className="arrow">→</span>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      {featuresContent && featuresContent.features && (
        <section className="features">
          <div className="container">
            {featuresContent.title && (
              <div className="section-header">
                <h2>{featuresContent.title}</h2>
                {featuresContent.subtitle && (
                  <p className="subtitle">{featuresContent.subtitle}</p>
                )}
              </div>
            )}

            <div className="features-grid">
              {featuresContent.features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {ctaContent && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              {ctaContent.title && <h2>{ctaContent.title}</h2>}
              {ctaContent.description && <p>{ctaContent.description}</p>}
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

      <style jsx>{`
        .homepage {
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

        .hero {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
        }

        .hero-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }

        .hero-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.3;
        }

        .hero-content {
          text-align: center;
          max-width: 900px;
          animation: fadeInUp 1s ease-out;
          display: flex;
          flex-direction: column;
          align-items: center;    
        }

        .hero-title {
          font-size: clamp(2.5rem, 6vw, 5rem);
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #f97316 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: clamp(1.2rem, 3vw, 1.8rem);
          color: #cbd5e1;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .hero-description {
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: #94a3b8;
          margin-bottom: 2.5rem;
          line-height: 1.8;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        
          padding: 0.9rem 1.8rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          text-decoration: none;
        
          border-radius: 999px;
          font-weight: 700;
          font-size: 1rem;
        
          transition: all 0.3s ease;
          box-shadow: 0 10px 40px rgba(249, 115, 22, 0.4);
        
          width: fit-content;          
          max-width: fit-content;      
          white-space: nowrap;
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 50px rgba(249, 115, 22, 0.6);
        }

        .cta-button .arrow {
          transition: transform 0.3s ease;
        }

        .cta-button:hover .arrow {
          transform: translateX(5px);
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .features {
          padding: 6rem 0;
          position: relative;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-header h2 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
        }

        .subtitle {
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: #94a3b8;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 20px;
          padding: 2.5rem;
          text-align: center;
          transition: all 0.4s ease;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          border-color: #f97316;
          box-shadow: 0 20px 60px rgba(249, 115, 22, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }

        .feature-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .feature-card h3 {
          font-size: 1.5rem;
          color: white;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .feature-card p {
          color: #94a3b8;
          line-height: 1.7;
          font-size: 1.05rem;
        }

        .cta-section {
          padding: 6rem 0;
          background: rgba(249, 115, 22, 0.05);
          border-top: 1px solid rgba(249, 115, 22, 0.2);
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
        }

        .cta-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-content h2 {
          font-size: clamp(2rem, 4vw, 3rem);
          color: white;
          margin-bottom: 1.5rem;
          font-weight: 800;
        }

        .cta-content p {
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: #cbd5e1;
          margin-bottom: 2.5rem;
          line-height: 1.8;
        }

        .cta-button.secondary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.4);
          max-width: 220px;
        }

        .cta-button.secondary:hover {
          box-shadow: 0 15px 50px rgba(59, 130, 246, 0.6);
        }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .feature-card {
            padding: 2rem;
          }
        }

      @media (max-width: 640px) {
        .cta-button {
          max-width: 180px;
          padding: 0.875rem 1.5rem;
          font-size: 1rem;
        }
        
        .cta-btn {
          max-width: 200px;
          padding: 1rem 2rem;
          font-size: 1rem;
        }
      }
      @media (max-width: 768px) {
            .hero {
              min-height: auto !important;
              height: auto !important;
              padding-top: 6rem;
              padding-bottom: 6rem;
              overflow: visible !important;
            }
                
        .cta-button {
            margin-top: 1.5rem;
            z-index: 10;
              }
           }
              
      `}</style>
    </div>
  );
}
