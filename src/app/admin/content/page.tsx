"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  images?: string[]; // NEW — hero slideshow images
  features?: any;
  team_members?: any;
  values_list?: any;
  stats?: any;
};

export default function ContentManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"homepage" | "about">("homepage");
  const [homepageContent, setHomepageContent] = useState<ContentSection[]>([]);
  const [aboutContent, setAboutContent] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadContent();

    const homepageChannel = supabase
      .channel('homepage-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homepage_content' }, () => {
        loadContent();
      })
      .subscribe();

    const aboutChannel = supabase
      .channel('about-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'about_content' }, () => {
        loadContent();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(homepageChannel);
      supabase.removeChannel(aboutChannel);
    };
  }, []);

  async function loadContent() {
    setLoading(true);
    try {
      const { data: homepageData, error: homepageError } = await supabase
        .from("homepage_content")
        .select("*")
        .order("section");

      const { data: aboutData, error: aboutError } = await supabase
        .from("about_content")
        .select("*")
        .order("section");

      if (homepageError) console.error("Error loading homepage content:", homepageError);
      else if (homepageData) setHomepageContent(homepageData);

      if (aboutError) console.error("Error loading about content:", aboutError);
      else if (aboutData) setAboutContent(aboutData);
    } catch (error) {
      console.error("Unexpected error loading content:", error);
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(section: ContentSection) {
    setEditingSection({ ...section });
    setShowModal(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('content-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) { alert(`Upload failed: ${uploadError.message}`); return; }
      const { data: { publicUrl } } = supabase.storage.from('content-images').getPublicUrl(fileName);
      setEditingSection(prev => prev ? { ...prev, image_url: publicUrl } : null);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function handleHeroImagesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `hero-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('content-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });
        if (uploadError) { alert(`Upload failed: ${uploadError.message}`); continue; }
        const { data: { publicUrl } } = supabase.storage.from('content-images').getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }
      setEditingSection(prev => prev ? { ...prev, images: [...(prev.images || []), ...uploadedUrls] } : null);
    } catch (error) {
      console.error('Error uploading hero images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeHeroImage(index: number) {
    if (!editingSection) return;
    const updated = [...(editingSection.images || [])];
    updated.splice(index, 1);
    setEditingSection({ ...editingSection, images: updated });
  }

  function moveHeroImage(index: number, direction: -1 | 1) {
    if (!editingSection) return;
    const updated = [...(editingSection.images || [])];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= updated.length) return;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setEditingSection({ ...editingSection, images: updated });
  }

  async function deleteImageFromStorage(imageUrl: string) {
    try {
      const urlParts = imageUrl.split('/content-images/');
      if (urlParts.length < 2) return;
      await supabase.storage.from('content-images').remove([urlParts[1]]);
    } catch (err) {
      console.error("Delete image error:", err);
    }
  }

  async function handleRemoveImage() {
    if (!editingSection?.id || !editingSection.image_url) { alert("No image to remove"); return; }
    if (!confirm("Are you sure you want to remove this image?")) return;
    const table = activeTab === "homepage" ? "homepage_content" : "about_content";
    const imageUrl = editingSection.image_url;
    try {
      const { error } = await supabase.from(table).update({ image_url: null }).eq("id", editingSection.id);
      if (error) { alert("Failed to remove image from database"); return; }
      await deleteImageFromStorage(imageUrl);
      setEditingSection({ ...editingSection, image_url: undefined });
      await loadContent();
      router.refresh();
      alert("Image removed successfully");
    } catch (error) {
      console.error("Error removing image:", error);
      alert("Failed to remove image");
    }
  }

  async function handleSave() {
    if (!editingSection) return;
    const table = activeTab === "homepage" ? "homepage_content" : "about_content";
    try {
      const updateData = {
        title: editingSection.title || null,
        subtitle: editingSection.subtitle || null,
        description: editingSection.description || null,
        button_text: editingSection.button_text || null,
        button_link: editingSection.button_link || null,
        image_url: editingSection.image_url || null,
        images: editingSection.images || null,
        features: editingSection.features || null,
        team_members: editingSection.team_members || null,
        values_list: editingSection.values_list || null,
        stats: editingSection.stats || null,
      };

      const { error, data } = await supabase
        .from(table)
        .update(updateData)
        .eq("id", editingSection.id)
        .select();

      if (error) { alert(`Failed to update: ${error.message}`); return; }

      console.log("Update successful:", data);
      setShowModal(false);
      setEditingSection(null);
      await loadContent();
      router.refresh(); // ← forces Next.js to bust server cache so homepage shows fresh data immediately
      alert("Content updated successfully!");
    } catch (error) {
      console.error("Unexpected error saving:", error);
      alert("An unexpected error occurred");
    }
  }

  const contentSections = activeTab === "homepage" ? homepageContent : aboutContent;

  return (
    <div className="content-management">
      <div className="page-header">
        <div>
          <h1>Content Management</h1>
          <p>Customize your homepage and about page</p>
        </div>
      </div>

      <div className="tabs">
        <button onClick={() => setActiveTab("homepage")} className={activeTab === "homepage" ? "tab active" : "tab"}>
          🏠 Homepage
        </button>
        <button onClick={() => setActiveTab("about")} className={activeTab === "about" ? "tab active" : "tab"}>
          ℹ️ About Page
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading content...</p>
        </div>
      ) : (
        <div className="sections-grid">
          {contentSections.map((section) => (
            <div key={section.id} className="section-card">
              <div className="section-header">
                <h3>{section.section.charAt(0).toUpperCase() + section.section.slice(1)} Section</h3>
                <button onClick={() => openEditModal(section)} className="edit-btn">✏️ Edit</button>
              </div>
              {section.image_url && (
                <div className="section-image">
                  <img src={section.image_url} alt={section.section} />
                </div>
              )}
              <div className="section-content">
                {section.title && <div className="content-item"><span className="label">Title:</span><p className="value">{section.title}</p></div>}
                {section.subtitle && <div className="content-item"><span className="label">Subtitle:</span><p className="value">{section.subtitle}</p></div>}
                {section.description && <div className="content-item"><span className="label">Description:</span><p className="value">{section.description}</p></div>}
                {section.button_text && <div className="content-item"><span className="label">Button:</span><span className="badge">{section.button_text} → {section.button_link}</span></div>}
                {section.images && section.images.length > 0 && <div className="content-item"><span className="label">Slideshow:</span><span className="badge">{section.images.length} images</span></div>}
                {section.features && <div className="content-item"><span className="label">Features:</span><span className="badge">{section.features.length} items</span></div>}
                {section.stats && <div className="content-item"><span className="label">Stats:</span><span className="badge">{section.stats.length} stats</span></div>}
                {section.values_list && <div className="content-item"><span className="label">Values:</span><span className="badge">{section.values_list.length} values</span></div>}
              </div>
            </div>
          ))}
          {contentSections.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📝</span>
              <h3>No content sections yet</h3>
              <p>Run the database migration to create default content</p>
            </div>
          )}
        </div>
      )}

      {showModal && editingSection && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit {editingSection.section} Section</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">×</button>
            </div>

            <div className="modal-body">
              {editingSection.section === 'hero' && (
                <div className="form-group">
                  <label>Hero Slideshow Images</label>
                  <input
                    type="file" accept="image/*" multiple
                    onChange={handleHeroImagesUpload} disabled={uploading}
                    id="hero-images-upload" style={{ display: 'none' }}
                  />
                  <label htmlFor="hero-images-upload" className="upload-btn">
                    {uploading ? '⏳ Uploading...' : '📤 Add Slideshow Image(s)'}
                  </label>
                  {editingSection.images && editingSection.images.length > 0 ? (
                    <div className="hero-images-grid">
                      {editingSection.images.map((img, i) => (
                        <div key={i} className="hero-image-item">
                          <img src={img} alt={`Slide ${i + 1}`} />
                          <div className="hero-image-controls">
                            <button type="button" onClick={() => moveHeroImage(i, -1)} disabled={i === 0} title="Move earlier">←</button>
                            <span className="hero-image-index">{i + 1}</span>
                            <button type="button" onClick={() => moveHeroImage(i, 1)} disabled={i === (editingSection.images?.length ?? 0) - 1} title="Move later">→</button>
                            <button type="button" onClick={() => removeHeroImage(i)} className="hero-image-remove" title="Remove">×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="hero-images-empty">No slideshow images yet — add at least one. Until then the single image below is used as a static fallback.</p>
                  )}
                  <small>Images play in this order on the homepage. Adding any image here switches the hero into slideshow mode.</small>
                </div>
              )}

              <div className="form-group">
                <label>Section Image{editingSection.section === 'hero' ? ' (fallback, used only if no slideshow images above)' : ''}</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} id="image-upload" style={{ display: 'none' }} />
                <label htmlFor="image-upload" className="upload-btn">
                  {uploading ? '⏳ Uploading...' : '📤 Upload Image'}
                </label>
                {editingSection.image_url && (
                  <div className="image-preview">
                    <img src={editingSection.image_url} alt="Preview" />
                    <button onClick={handleRemoveImage} className="remove-btn" type="button">× Remove Image</button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingSection.title || ""}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  placeholder="Enter title"
                />
              </div>

              <div className="form-group">
                <label>Subtitle</label>
                <input
                  type="text"
                  value={editingSection.subtitle || ""}
                  onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                  placeholder="Enter subtitle"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingSection.description || ""}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                  placeholder="Enter description"
                  rows={4}
                />
              </div>

              {(editingSection.section === 'hero' || editingSection.section === 'cta') && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Button Text</label>
                    <input
                      type="text"
                      value={editingSection.button_text || ""}
                      onChange={(e) => setEditingSection({ ...editingSection, button_text: e.target.value })}
                      placeholder="e.g., Book Now"
                    />
                  </div>
                  <div className="form-group">
                    <label>Button Link</label>
                    <input
                      type="text"
                      value={editingSection.button_link || ""}
                      onChange={(e) => setEditingSection({ ...editingSection, button_link: e.target.value })}
                      placeholder="e.g., /booking"
                    />
                  </div>
                </div>
              )}

              {editingSection.section === 'features' && (
                <div className="form-group">
                  <label>Features (JSON)</label>
                  <textarea
                    value={JSON.stringify(editingSection.features, null, 2)}
                    onChange={(e) => { try { setEditingSection({ ...editingSection, features: JSON.parse(e.target.value) }); } catch {} }}
                    rows={10}
                    className="json-editor"
                  />
                  <small>Format: [{"{"}"icon": "🏖️", "title": "...", "description": "..."{"}"}]</small>
                </div>
              )}

              {editingSection.stats && (
                <div className="form-group">
                  <label>Stats (JSON)</label>
                  <textarea
                    value={JSON.stringify(editingSection.stats, null, 2)}
                    onChange={(e) => { try { setEditingSection({ ...editingSection, stats: JSON.parse(e.target.value) }); } catch {} }}
                    rows={6}
                    className="json-editor"
                  />
                  <small>Format: [{"{"}"label": "...", "value": "..."{"}"}]</small>
                </div>
              )}

              {editingSection.values_list && (
                <div className="form-group">
                  <label>Values (JSON)</label>
                  <textarea
                    value={JSON.stringify(editingSection.values_list, null, 2)}
                    onChange={(e) => { try { setEditingSection({ ...editingSection, values_list: JSON.parse(e.target.value) }); } catch {} }}
                    rows={10}
                    className="json-editor"
                  />
                  <small>Format: [{"{"}"title": "...", "description": "...", "icon": "..."{"}"}]</small>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleSave} className="save-btn" disabled={uploading}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .content-management { max-width: 1400px; margin: 0 auto; }
        .page-header { margin-bottom: 2rem; }
        .page-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, #fff, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .page-header p { color: #94a3b8; font-size: 1.1rem; }
        .tabs { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 2px solid rgba(249, 115, 22, 0.2); }
        .tab { padding: 1rem 2rem; background: transparent; border: none; color: #cbd5e1; font-weight: 600; cursor: pointer; transition: all 0.3s; border-bottom: 3px solid transparent; position: relative; bottom: -2px; }
        .tab:hover { color: #f97316; }
        .tab.active { color: #f97316; border-bottom-color: #f97316; }
        .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 1rem; }
        .spinner { width: 50px; height: 50px; border: 4px solid rgba(249, 115, 22, 0.2); border-top-color: #f97316; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sections-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 1.5rem; }
        .section-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(249, 115, 22, 0.2); border-radius: 16px; padding: 1.5rem; transition: all 0.3s; }
        .section-card:hover { transform: translateY(-5px); border-color: #f97316; box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3); }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(249, 115, 22, 0.2); }
        .section-header h3 { font-size: 1.3rem; color: #f97316; margin: 0; }
        .edit-btn { padding: 0.5rem 1rem; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; color: #3b82f6; cursor: pointer; transition: all 0.3s; font-weight: 600; }
        .edit-btn:hover { background: rgba(59, 130, 246, 0.3); transform: scale(1.05); }
        .section-image { margin-bottom: 1rem; border-radius: 8px; overflow: hidden; }
        .section-image img { width: 100%; height: 200px; object-fit: cover; }
        .section-content { display: flex; flex-direction: column; gap: 1rem; }
        .content-item { display: flex; flex-direction: column; gap: 0.5rem; }
        .label { color: #94a3b8; font-size: 0.9rem; font-weight: 600; }
        .value { color: #cbd5e1; margin: 0; line-height: 1.6; }
        .badge { display: inline-block; padding: 0.375rem 0.75rem; background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 12px; color: #f97316; font-size: 0.85rem; width: fit-content; }
        .empty-state { grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; }
        .empty-icon { font-size: 5rem; display: block; margin-bottom: 1rem; opacity: 0.5; }
        .empty-state h3 { color: white; margin-bottom: 0.5rem; }
        .empty-state p { color: #94a3b8; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
        .modal { background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 20px; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid rgba(249, 115, 22, 0.2); }
        .modal-header h2 { color: #f97316; margin: 0; }
        .close-btn { width: 40px; height: 40px; border-radius: 50%; border: none; background: rgba(239, 68, 68, 0.2); color: #ef4444; font-size: 1.5rem; cursor: pointer; transition: all 0.3s; }
        .close-btn:hover { background: rgba(239, 68, 68, 0.3); transform: rotate(90deg); }
        .modal-body { padding: 1.5rem; }
        .form-group { margin-bottom: 1.5rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        label { display: block; margin-bottom: 0.5rem; color: #cbd5e1; font-weight: 500; }
        input, textarea { width: 100%; padding: 0.875rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 8px; color: white; font-size: 1rem; transition: border-color 0.3s; font-family: inherit; box-sizing: border-box; }
        input:focus, textarea:focus { outline: none; border-color: #f97316; background: rgba(255, 255, 255, 0.15); }
        textarea { resize: vertical; }
        .json-editor { font-family: 'Courier New', monospace; font-size: 0.9rem; }
        small { color: #94a3b8; font-size: 0.85rem; display: block; margin-top: 0.5rem; }
        .upload-btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.875rem 1.5rem; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; color: #3b82f6; font-weight: 600; cursor: pointer; transition: all 0.3s; margin-bottom: 1rem; }
        .upload-btn:hover { background: rgba(59, 130, 246, 0.3); }
        .image-preview { position: relative; width: 100%; max-width: 400px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(249, 115, 22, 0.3); margin-bottom: 1rem; }
        .image-preview img { width: 100%; height: auto; display: block; }
        .remove-btn { width: 100%; padding: 0.75rem; margin-top: 0.5rem; border-radius: 8px; border: none; background: rgba(239, 68, 68, 0.2); color: #ef4444; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .remove-btn:hover { background: rgba(239, 68, 68, 0.3); }
        .hero-images-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem; }
        .hero-image-item { position: relative; border-radius: 10px; overflow: hidden; border: 1px solid rgba(249, 115, 22, 0.25); background: rgba(255,255,255,0.03); }
        .hero-image-item img { width: 100%; height: 90px; object-fit: cover; display: block; }
        .hero-image-controls { display: flex; align-items: center; justify-content: space-between; gap: 4px; padding: 4px 6px; background: rgba(15, 23, 42, 0.85); }
        .hero-image-controls button { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; border-radius: 5px; width: 22px; height: 22px; font-size: 0.75rem; cursor: pointer; line-height: 1; }
        .hero-image-controls button:disabled { opacity: 0.3; cursor: not-allowed; }
        .hero-image-controls button:hover:not(:disabled) { background: rgba(249,115,22,0.3); border-color: #f97316; color: #fff; }
        .hero-image-index { font-size: 0.7rem; color: #94a3b8; }
        .hero-image-remove { color: #ef4444 !important; }
        .hero-image-remove:hover { background: rgba(239, 68, 68, 0.25) !important; border-color: #ef4444 !important; color: #fff !important; }
        .hero-images-empty { color: #64748b; font-size: 0.85rem; margin: 0.5rem 0; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem; border-top: 1px solid rgba(249, 115, 22, 0.2); }
        .cancel-btn, .save-btn { padding: 0.875rem 1.5rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .cancel-btn { background: rgba(100, 116, 139, 0.2); color: #cbd5e1; }
        .cancel-btn:hover { background: rgba(100, 116, 139, 0.3); }
        .save-btn { background: linear-gradient(135deg, #f97316, #ea580c); color: white; }
        .save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 768px) {
          .sections-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .tabs { overflow-x: auto; }
        }
      `}</style>
    </div>
  );
}
