"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ContentSection = {
  id: string;
  page: 'home' | 'about';
  section_key: string;
  section_type: string;
  title: string;
  subtitle: string;
  content: string;
  images: string[];
  data: any;
  is_active: boolean;
  display_order: number;
};

export default function ContentManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'about'>('home');
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadSections();

    // Real-time subscription
    const subscription = supabase
      .channel('content-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'content_sections'
      }, loadSections)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadSections() {
    setLoading(true);
    const { data, error } = await supabase
      .from('content_sections')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error loading sections:', error);
    } else if (data) {
      setSections(data);
    }
    setLoading(false);
  }

  async function saveSection(section: ContentSection) {
    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('content_sections')
      .update({
        title: section.title,
        subtitle: section.subtitle,
        content: section.content,
        images: section.images,
        data: section.data,
        is_active: section.is_active
      })
      .eq('id', section.id);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Section saved successfully!');
      setEditingSection(null);
    }

    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, sectionId: string) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('content-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('content-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      if (editingSection && editingSection.id === sectionId) {
        setEditingSection({
          ...editingSection,
          images: [...(editingSection.images || []), ...uploadedUrls]
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(sectionId: string, index: number) {
    if (!editingSection || editingSection.id !== sectionId) return;

    const imageUrl = editingSection.images[index];
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    try {
      await supabase.storage
        .from('content-images')
        .remove([fileName]);

      setEditingSection({
        ...editingSection,
        images: editingSection.images.filter((_, i) => i !== index)
      });
    } catch (error) {
      console.error('Error removing image:', error);
    }
  }

  const currentSections = sections.filter(s => s.page === activeTab);

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
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="content-management">
      <div className="page-header">
        <div>
          <h1>Page Content Management</h1>
          <p>Customize homepage and about page content</p>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          🏠 Homepage
        </button>
        <button
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          📖 About Page
        </button>
      </div>

      {/* Sections Grid */}
      <div className="sections-grid">
        {currentSections.map((section) => (
          <div key={section.id} className="section-card">
            <div className="section-header">
              <div>
                <h3>{section.title || section.section_key}</h3>
                <span className="section-type">{section.section_type}</span>
              </div>
              <div className="section-actions">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={section.is_active}
                    onChange={async (e) => {
                      await supabase
                        .from('content_sections')
                        .update({ is_active: e.target.checked })
                        .eq('id', section.id);
                      loadSections();
                    }}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <button
                  onClick={() => setEditingSection(section)}
                  className="edit-btn"
                >
                  ✏️ Edit
                </button>
              </div>
            </div>

            <div className="section-preview">
              {section.title && <p className="preview-title">{section.title}</p>}
              {section.subtitle && <p className="preview-subtitle">{section.subtitle}</p>}
              {section.content && (
                <p className="preview-content">
                  {section.content.substring(0, 150)}
                  {section.content.length > 150 ? '...' : ''}
                </p>
              )}
              {section.images && section.images.length > 0 && (
                <div className="preview-images">
                  {section.images.slice(0, 3).map((img, i) => (
                    <img key={i} src={img} alt="" />
                  ))}
                  {section.images.length > 3 && (
                    <div className="more-images">+{section.images.length - 3}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <div className="modal-overlay" onClick={() => setEditingSection(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit {editingSection.section_key}</h2>
              <button className="close-btn" onClick={() => setEditingSection(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingSection.title || ''}
                  onChange={(e) => setEditingSection({
                    ...editingSection,
                    title: e.target.value
                  })}
                  placeholder="Section title"
                />
              </div>

              <div className="form-group">
                <label>Subtitle</label>
                <input
                  type="text"
                  value={editingSection.subtitle || ''}
                  onChange={(e) => setEditingSection({
                    ...editingSection,
                    subtitle: e.target.value
                  })}
                  placeholder="Section subtitle"
                />
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={editingSection.content || ''}
                  onChange={(e) => setEditingSection({
                    ...editingSection,
                    content: e.target.value
                  })}
                  placeholder="Main content"
                  rows={6}
                />
              </div>

              {/* Features/Stats/Team Editor */}
              {(editingSection.section_type === 'features' || 
                editingSection.section_type === 'stats' || 
                editingSection.section_type === 'team') && (
                <div className="form-group">
                  <label>Items (JSON)</label>
                  <textarea
                    value={JSON.stringify(editingSection.data, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setEditingSection({
                          ...editingSection,
                          data: parsed
                        });
                      } catch (err) {
                        // Invalid JSON, ignore
                      }
                    }}
                    rows={10}
                    className="json-editor"
                  />
                  <small className="hint">Edit the JSON data carefully</small>
                </div>
              )}

              {/* Image Upload */}
              <div className="form-group">
                <label>Images</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, editingSection.id)}
                    disabled={uploading}
                    id={`image-upload-${editingSection.id}`}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor={`image-upload-${editingSection.id}`}
                    className="upload-btn"
                  >
                    {uploading ? '⏳ Uploading...' : '📤 Upload Images'}
                  </label>

                  {editingSection.images && editingSection.images.length > 0 && (
                    <div className="uploaded-images">
                      {editingSection.images.map((url, index) => (
                        <div key={index} className="image-preview">
                          <img src={url} alt={`Image ${index + 1}`} />
                          <button
                            onClick={() => removeImage(editingSection.id, index)}
                            className="remove-image-btn"
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setEditingSection(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => saveSection(editingSection)}
                disabled={saving}
                className="save-btn"
              >
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .content-management {
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
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

        .message {
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .message.success {
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: #22c55e;
        }

        .message.error {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #ef4444;
        }

        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid rgba(249, 115, 22, 0.2);
        }

        .tab {
          padding: 1rem 2rem;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 1.1rem;
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

        .sections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .section-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .section-card:hover {
          transform: translateY(-5px);
          border-color: #f97316;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
        }

        .section-header h3 {
          font-size: 1.25rem;
          color: #f97316;
          margin: 0 0 0.5rem 0;
        }

        .section-type {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          font-size: 0.75rem;
          color: #3b82f6;
          text-transform: uppercase;
          font-weight: 600;
        }

        .section-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .toggle {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(100, 116, 139, 0.3);
          transition: 0.4s;
          border-radius: 26px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        .toggle input:checked + .toggle-slider {
          background-color: #22c55e;
        }

        .toggle input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }

        .edit-btn {
          padding: 0.5rem 1rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          color: #3b82f6;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .edit-btn:hover {
          background: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
        }

        .section-preview {
          color: #cbd5e1;
        }

        .preview-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: white;
        }

        .preview-subtitle {
          font-size: 0.95rem;
          color: #94a3b8;
          margin-bottom: 0.75rem;
        }

        .preview-content {
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .preview-images {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          position: relative;
        }

        .preview-images img {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
        }

        .more-images {
          position: absolute;
          top: 0;
          right: 0;
          width: calc(33.333% - 0.333rem);
          height: 80px;
          background: rgba(15, 23, 42, 0.9);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 20px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
        }

        .modal-header h2 {
          color: #f97316;
          margin: 0;
        }

        .close-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .close-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        input,
        textarea {
          width: 100%;
          padding: 0.875rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s;
          font-family: inherit;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #f97316;
          background: rgba(255, 255, 255, 0.15);
        }

        textarea {
          resize: vertical;
          line-height: 1.6;
        }

        .json-editor {
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }

        .hint {
          display: block;
          margin-top: 0.5rem;
          color: #64748b;
          font-size: 0.85rem;
          font-style: italic;
        }

        .image-upload-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .upload-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.875rem 1.5rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          color: #3b82f6;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .upload-btn:hover {
          background: rgba(59, 130, 246, 0.3);
        }

        .uploaded-images {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
        }

        .image-preview {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(249, 115, 22, 0.3);
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image-btn {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .remove-image-btn:hover {
          background: #ef4444;
          transform: scale(1.1);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid rgba(249, 115, 22, 0.2);
        }

        .cancel-btn,
        .save-btn {
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cancel-btn {
          background: rgba(100, 116, 139, 0.2);
          color: #cbd5e1;
        }

        .cancel-btn:hover {
          background: rgba(100, 116, 139, 0.3);
        }

        .save-btn {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(34, 197, 94, 0.4);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .sections-grid {
            grid-template-columns: 1fr;
          }

          .tabs {
            flex-direction: column;
          }

          .tab {
            border-bottom: 1px solid rgba(249, 115, 22, 0.2);
            margin-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
}
