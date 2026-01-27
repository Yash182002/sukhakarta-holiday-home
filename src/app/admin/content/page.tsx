"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type ContentItem = {
  id?: string;
  key: string;
  value: string;
  type: "text" | "textarea" | "json";
  label: string;
  description?: string;
};

export default function ContentManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  const [aboutContent, setAboutContent] = useState({
    ourStory: "",
    vision: "",
    mission: "",
    values: "",
  });

  const [contactContent, setContactContent] = useState({
    phone: "",
    email: "",
    address: "",
    whatsapp: "",
  });

  const [homeContent, setHomeContent] = useState({
    heroTitle: "",
    heroSubtitle: "",
    welcomeMessage: "",
  });

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    setLoading(true);

    const { data } = await supabase.from("site_content").select("*");

    if (data) {
      data.forEach((item) => {
        const parsedValue =
          item.type === "json" ? JSON.parse(item.value) : item.value;

        // Populate content based on key
        if (item.key === "about_our_story")
          setAboutContent((prev) => ({ ...prev, ourStory: parsedValue }));
        if (item.key === "about_vision")
          setAboutContent((prev) => ({ ...prev, vision: parsedValue }));
        if (item.key === "about_mission")
          setAboutContent((prev) => ({ ...prev, mission: parsedValue }));
        if (item.key === "about_values")
          setAboutContent((prev) => ({ ...prev, values: parsedValue }));

        if (item.key === "contact_phone")
          setContactContent((prev) => ({ ...prev, phone: parsedValue }));
        if (item.key === "contact_email")
          setContactContent((prev) => ({ ...prev, email: parsedValue }));
        if (item.key === "contact_address")
          setContactContent((prev) => ({ ...prev, address: parsedValue }));
        if (item.key === "contact_whatsapp")
          setContactContent((prev) => ({ ...prev, whatsapp: parsedValue }));

        if (item.key === "home_hero_title")
          setHomeContent((prev) => ({ ...prev, heroTitle: parsedValue }));
        if (item.key === "home_hero_subtitle")
          setHomeContent((prev) => ({ ...prev, heroSubtitle: parsedValue }));
        if (item.key === "home_welcome_message")
          setHomeContent((prev) => ({ ...prev, welcomeMessage: parsedValue }));
      });
    }

    setLoading(false);
  }

  async function saveContent() {
    setSaving(true);

    const updates = [
      // About content
      {
        key: "about_our_story",
        value: aboutContent.ourStory,
        type: "textarea",
      },
      { key: "about_vision", value: aboutContent.vision, type: "textarea" },
      { key: "about_mission", value: aboutContent.mission, type: "textarea" },
      { key: "about_values", value: aboutContent.values, type: "textarea" },

      // Contact content
      { key: "contact_phone", value: contactContent.phone, type: "text" },
      { key: "contact_email", value: contactContent.email, type: "text" },
      { key: "contact_address", value: contactContent.address, type: "text" },
      {
        key: "contact_whatsapp",
        value: contactContent.whatsapp,
        type: "text",
      },

      // Home content
      { key: "home_hero_title", value: homeContent.heroTitle, type: "text" },
      {
        key: "home_hero_subtitle",
        value: homeContent.heroSubtitle,
        type: "text",
      },
      {
        key: "home_welcome_message",
        value: homeContent.welcomeMessage,
        type: "textarea",
      },
    ];

    for (const update of updates) {
      await supabase.from("site_content").upsert(
        {
          key: update.key,
          value: update.value,
          type: update.type,
        },
        { onConflict: "key" }
      );
    }

    setSaving(false);
    alert("Content saved successfully!");
  }

  const tabs = [
    { id: "about", label: "About Us", icon: "📖" },
    { id: "home", label: "Home Page", icon: "🏠" },
    { id: "contact", label: "Contact Info", icon: "📞" },
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading content...</p>
        <style jsx>{`
          .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 1rem;
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
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="content-management">
      <div className="page-header">
        <div>
          <h1>Content Management</h1>
          <p>Edit website content and information</p>
        </div>
        <button onClick={saveContent} disabled={saving} className="save-btn">
          {saving ? "Saving..." : "💾 Save All Changes"}
        </button>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="content-section">
        {activeTab === "about" && (
          <div className="content-form">
            <h2>About Us Content</h2>

            <div className="form-group">
              <label>Our Story</label>
              <textarea
                value={aboutContent.ourStory}
                onChange={(e) =>
                  setAboutContent({ ...aboutContent, ourStory: e.target.value })
                }
                rows={8}
                placeholder="Tell your story..."
              />
              <span className="hint">
                This appears on the About page in the "Our Story" section
              </span>
            </div>

            <div className="form-group">
              <label>Vision</label>
              <textarea
                value={aboutContent.vision}
                onChange={(e) =>
                  setAboutContent({ ...aboutContent, vision: e.target.value })
                }
                rows={5}
                placeholder="Your vision statement..."
              />
            </div>

            <div className="form-group">
              <label>Mission</label>
              <textarea
                value={aboutContent.mission}
                onChange={(e) =>
                  setAboutContent({ ...aboutContent, mission: e.target.value })
                }
                rows={5}
                placeholder="Your mission statement..."
              />
            </div>

            <div className="form-group">
              <label>Core Values</label>
              <textarea
                value={aboutContent.values}
                onChange={(e) =>
                  setAboutContent({ ...aboutContent, values: e.target.value })
                }
                rows={6}
                placeholder="List your core values (one per line or comma-separated)..."
              />
            </div>
          </div>
        )}

        {activeTab === "home" && (
          <div className="content-form">
            <h2>Home Page Content</h2>

            <div className="form-group">
              <label>Hero Title</label>
              <input
                type="text"
                value={homeContent.heroTitle}
                onChange={(e) =>
                  setHomeContent({ ...homeContent, heroTitle: e.target.value })
                }
                placeholder="Welcome to Paradise"
              />
              <span className="hint">
                Main headline on the home page hero section
              </span>
            </div>

            <div className="form-group">
              <label>Hero Subtitle</label>
              <input
                type="text"
                value={homeContent.heroSubtitle}
                onChange={(e) =>
                  setHomeContent({
                    ...homeContent,
                    heroSubtitle: e.target.value,
                  })
                }
                placeholder="Discover luxury coastal living..."
              />
              <span className="hint">Subtitle below the main headline</span>
            </div>

            <div className="form-group">
              <label>Welcome Message</label>
              <textarea
                value={homeContent.welcomeMessage}
                onChange={(e) =>
                  setHomeContent({
                    ...homeContent,
                    welcomeMessage: e.target.value,
                  })
                }
                rows={6}
                placeholder="Welcome message for visitors..."
              />
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="content-form">
            <h2>Contact Information</h2>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={contactContent.phone}
                onChange={(e) =>
                  setContactContent({ ...contactContent, phone: e.target.value })
                }
                placeholder="+91 80875 41496"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={contactContent.email}
                onChange={(e) =>
                  setContactContent({ ...contactContent, email: e.target.value })
                }
                placeholder="sukhakartaholidayhome@gmail.com"
              />
            </div>

            <div className="form-group">
              <label>WhatsApp Number</label>
              <input
                type="text"
                value={contactContent.whatsapp}
                onChange={(e) =>
                  setContactContent({
                    ...contactContent,
                    whatsapp: e.target.value,
                  })
                }
                placeholder="+918087541496"
              />
              <span className="hint">Include country code without spaces</span>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                value={contactContent.address}
                onChange={(e) =>
                  setContactContent({
                    ...contactContent,
                    address: e.target.value,
                  })
                }
                rows={4}
                placeholder="Alibag Beach Road, Alibag, Maharashtra 402201, India"
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .content-management {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .page-header p {
          color: #94a3b8;
          font-size: 1.1rem;
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(34, 197, 94, 0.5);
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid rgba(249, 115, 22, 0.2);
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
        }

        .tab:hover {
          color: #f97316;
        }

        .tab.active {
          color: #f97316;
          border-bottom-color: #f97316;
        }

        .tab-icon {
          font-size: 1.5rem;
        }

        .content-section {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 16px;
          padding: 2rem;
        }

        .content-form h2 {
          font-size: 1.75rem;
          color: #f97316;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 2rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #cbd5e1;
          font-weight: 600;
          font-size: 1rem;
        }

        input,
        textarea {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.3s;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #f97316;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        textarea {
          resize: vertical;
          line-height: 1.6;
        }

        .hint {
          display: block;
          margin-top: 0.5rem;
          color: #64748b;
          font-size: 0.875rem;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 2rem;
          }

          .tabs {
            flex-wrap: wrap;
          }

          .content-section {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
