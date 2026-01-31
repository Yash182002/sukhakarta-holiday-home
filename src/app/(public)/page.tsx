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
