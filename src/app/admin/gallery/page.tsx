'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url: string | null;
  category: string;
  tags: string[];
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

type UploadStep = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

interface BulkFile {
  id: string;
  file: File;
  preview: string;
  title: string;
  category: string;
  status: 'pending' | 'converting' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
  webpBlob?: Blob;
  convertedSize?: number;
  originalSize: number;
}

const CATEGORIES = ['rooms', 'surroundings', 'amenities', 'property', 'other'];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── WebP Converter ────────────────────────────────────────────────────────────
async function convertToWebP(file: File, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        blob => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error('WebP conversion failed'));
        },
        'image/webp',
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

// ─── Bulk Upload Modal ─────────────────────────────────────────────────────────
function BulkUploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<BulkFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [globalCategory, setGlobalCategory] = useState('rooms');
  const [isRunning, setIsRunning] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [webpQuality, setWebpQuality] = useState(85);

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    const newItems: BulkFile[] = arr.map(f => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      preview: URL.createObjectURL(f),
      title: f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      category: globalCategory,
      status: 'pending',
      progress: 0,
      originalSize: f.size,
    }));
    setFiles(prev => [...prev, ...newItems]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const updateFile = (id: string, patch: Partial<BulkFile>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  };

  const applyGlobalCategory = () => {
    setFiles(prev => prev.map(f => ({ ...f, category: globalCategory })));
  };

  const handleUploadAll = async () => {
    const pending = files.filter(f => f.status === 'pending' || f.status === 'error');
    if (pending.length === 0) return;
    setIsRunning(true);

    for (const item of pending) {
      // Step 1: Convert to WebP
      updateFile(item.id, { status: 'converting', progress: 20 });
      let uploadBlob: Blob;
      let finalSize: number;
      try {
        const webp = await convertToWebP(item.file, webpQuality / 100);
        uploadBlob = webp;
        finalSize = webp.size;
        updateFile(item.id, { webpBlob: webp, convertedSize: webp.size, progress: 45 });
      } catch {
        updateFile(item.id, { status: 'error', error: 'WebP conversion failed' });
        continue;
      }

      // Step 2: Upload to Supabase
      updateFile(item.id, { status: 'uploading', progress: 60 });
      try {
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
        const { error: uploadErr } = await supabase.storage
          .from('gallery-images')
          .upload(path, uploadBlob, { contentType: 'image/webp', cacheControl: '3600', upsert: false });
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from('gallery-images').getPublicUrl(path);
        updateFile(item.id, { progress: 85 });

        // Step 3: Insert to DB
        const { error: dbErr } = await supabase.from('gallery_items').insert([{
          title: item.title.trim() || item.file.name,
          description: null,
          media_url: urlData.publicUrl,
          media_type: 'image',
          category: item.category,
          tags: [],
          is_featured: false,
          sort_order: 0,
        }]);
        if (dbErr) throw dbErr;

        updateFile(item.id, { status: 'done', progress: 100 });
      } catch (err: any) {
        updateFile(item.id, { status: 'error', error: err.message ?? 'Upload failed' });
      }
    }

    setIsRunning(false);
    setAllDone(true);
    onSuccess();
  };

  const stats = {
    pending: files.filter(f => f.status === 'pending').length,
    done: files.filter(f => f.status === 'done').length,
    error: files.filter(f => f.status === 'error').length,
    converting: files.filter(f => f.status === 'converting').length,
    uploading: files.filter(f => f.status === 'uploading').length,
  };

  const totalSaved = files
    .filter(f => f.convertedSize !== undefined)
    .reduce((acc, f) => acc + (f.originalSize - (f.convertedSize ?? 0)), 0);

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget && !isRunning) onClose(); }}>
      <div className="bulk-panel">
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">Bulk Upload</div>
            <h2 className="modal-title">Add Multiple Images</h2>
          </div>
          <button className="modal-close" onClick={onClose} disabled={isRunning} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {/* Drop Zone */}
          <div
            className={`bulk-drop ${dragOver ? 'drag-active' : ''} ${files.length > 0 ? 'compact' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => !isRunning && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files) addFiles(e.target.files); }}
            />
            {files.length === 0 ? (
              <div className="drop-content">
                <div className="drop-icon-wrap">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9l4-4 4 4 4-4 4 4"/>
                    <path d="M12 12v6"/>
                  </svg>
                </div>
                <p className="drop-text">Drop multiple images here</p>
                <p className="drop-sub">JPG, PNG, WEBP, AVIF · All images auto-converted to WebP</p>
                <div className="webp-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  Auto WebP Conversion
                </div>
              </div>
            ) : (
              <div className="drop-add-more">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
                Add more images
              </div>
            )}
          </div>

          {files.length > 0 && (
            <>
              {/* Settings Bar */}
              <div className="bulk-settings">
                <div className="settings-group">
                  <label className="settings-label">Apply category to all</label>
                  <div className="settings-row">
                    <select
                      className="input select settings-select"
                      value={globalCategory}
                      onChange={e => setGlobalCategory(e.target.value)}
                      disabled={isRunning}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                    <button className="btn-apply-cat" onClick={applyGlobalCategory} disabled={isRunning}>
                      Apply All
                    </button>
                  </div>
                </div>
                <div className="settings-group">
                  <label className="settings-label">WebP Quality: <strong>{webpQuality}%</strong></label>
                  <input
                    type="range" min="50" max="100" step="5"
                    value={webpQuality}
                    onChange={e => setWebpQuality(Number(e.target.value))}
                    disabled={isRunning}
                    className="quality-slider"
                  />
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bulk-stats">
                <span className="bstat total">{files.length} files</span>
                {stats.done > 0 && <span className="bstat done">✓ {stats.done} done</span>}
                {stats.error > 0 && <span className="bstat error">✗ {stats.error} failed</span>}
                {(stats.converting + stats.uploading) > 0 && (
                  <span className="bstat running">⟳ {stats.converting + stats.uploading} processing</span>
                )}
                {totalSaved > 0 && (
                  <span className="bstat saved">↓ {formatBytes(totalSaved)} saved via WebP</span>
                )}
              </div>

              {/* File List */}
              <div className="file-list">
                {files.map(item => (
                  <div key={item.id} className={`file-row status-${item.status}`}>
                    {/* Thumbnail */}
                    <div className="file-thumb">
                      <img src={item.preview} alt={item.title} />
                      {item.status === 'done' && <div className="thumb-done">✓</div>}
                      {item.status === 'error' && <div className="thumb-err">✗</div>}
                      {(item.status === 'converting' || item.status === 'uploading') && (
                        <div className="thumb-spin"><div className="mini-spinner" /></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="file-info">
                      <input
                        type="text"
                        className="file-title-input"
                        value={item.title}
                        onChange={e => updateFile(item.id, { title: e.target.value })}
                        disabled={isRunning}
                        placeholder="Image title…"
                      />
                      <div className="file-meta-row">
                        <select
                          className="file-cat-select"
                          value={item.category}
                          onChange={e => updateFile(item.id, { category: e.target.value })}
                          disabled={isRunning}
                        >
                          {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                          ))}
                        </select>
                        <span className="file-size">
                          {formatBytes(item.originalSize)}
                          {item.convertedSize !== undefined && (
                            <span className="size-webp"> → {formatBytes(item.convertedSize)} WebP</span>
                          )}
                        </span>
                      </div>
                      {item.status === 'error' && item.error && (
                        <div className="file-error">{item.error}</div>
                      )}
                      {(item.status === 'converting' || item.status === 'uploading') && (
                        <div className="file-progress-bar">
                          <div className="file-progress-fill" style={{ width: `${item.progress}%` }} />
                          <span className="file-progress-label">
                            {item.status === 'converting' ? 'Converting to WebP…' : 'Uploading…'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {!isRunning && item.status !== 'done' && (
                      <button className="file-remove" onClick={() => removeFile(item.id)} aria-label="Remove">✕</button>
                    )}
                    {item.status === 'done' && (
                      <span className="file-done-badge">Uploaded</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isRunning}>
            {allDone ? 'Close' : 'Cancel'}
          </button>
          {files.length > 0 && !allDone && (
            <button
              className="btn-submit"
              onClick={handleUploadAll}
              disabled={isRunning || files.filter(f => f.status === 'pending' || f.status === 'error').length === 0}
            >
              {isRunning ? (
                <>
                  <div className="btn-spinner" />
                  Processing {stats.converting + stats.uploading} of {files.length}…
                </>
              ) : (
                <>
                  Upload {files.filter(f => f.status === 'pending' || f.status === 'error').length} Images as WebP
                </>
              )}
            </button>
          )}
          {allDone && stats.error === 0 && (
            <button className="btn-submit btn-done" onClick={onClose}>✓ All Uploaded!</button>
          )}
          {allDone && stats.error > 0 && (
            <button className="btn-submit" onClick={handleUploadAll}>
              Retry {stats.error} Failed
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(4,7,15,0.88); backdrop-filter: blur(14px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem; animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .bulk-panel {
          background: #0d1117; border: 1px solid rgba(249,115,22,0.2);
          border-radius: 1.25rem; width: 100%; max-width: 720px;
          max-height: 92vh; overflow-y: auto;
          display: flex; flex-direction: column;
          box-shadow: 0 0 80px rgba(249,115,22,0.08), 0 32px 80px rgba(0,0,0,0.6);
          animation: slideUp 0.3s cubic-bezier(.22,1,.36,1);
        }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: none; opacity: 1 } }
        .modal-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 1.75rem 2rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky; top: 0; background: #0d1117; z-index: 10; border-radius: 1.25rem 1.25rem 0 0;
        }
        .modal-eyebrow { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #f97316; margin-bottom: 0.25rem; }
        .modal-title { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 600; color: #f5f0e8; margin: 0; }
        .modal-close {
          background: rgba(255,255,255,0.06); border: none; color: rgba(255,255,255,0.5);
          width: 2rem; height: 2rem; border-radius: 50%; cursor: pointer; font-size: 0.85rem;
          display: flex; align-items: center; justify-content: center; transition: all 0.2s;
        }
        .modal-close:hover:not(:disabled) { background: rgba(249,115,22,0.2); color: #f97316; }
        .modal-close:disabled { opacity: 0.3; cursor: not-allowed; }
        .modal-body { padding: 1.5rem 2rem; flex: 1; display: flex; flex-direction: column; gap: 1rem; }
        .modal-footer {
          display: flex; gap: 0.75rem; justify-content: flex-end;
          padding: 1.25rem 2rem; border-top: 1px solid rgba(255,255,255,0.06);
          position: sticky; bottom: 0; background: #0d1117; border-radius: 0 0 1.25rem 1.25rem;
        }

        /* Drop Zone */
        .bulk-drop {
          border: 2px dashed rgba(249,115,22,0.25); border-radius: 0.875rem;
          background: rgba(249,115,22,0.03); cursor: pointer; transition: all 0.25s;
          min-height: 160px; display: flex; align-items: center; justify-content: center;
        }
        .bulk-drop.compact { min-height: 56px; border-style: dashed; }
        .bulk-drop:hover, .bulk-drop.drag-active {
          border-color: rgba(249,115,22,0.6); background: rgba(249,115,22,0.07);
        }
        .drop-content { text-align: center; padding: 2.5rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        .drop-icon-wrap { color: rgba(249,115,22,0.5); margin-bottom: 0.5rem; }
        .drop-text { font-family: 'Outfit', sans-serif; color: #f5f0e8; font-size: 1rem; margin: 0; font-weight: 500; }
        .drop-sub { font-family: 'Outfit', sans-serif; color: rgba(245,240,232,0.35); font-size: 0.78rem; margin: 0; }
        .webp-badge {
          display: inline-flex; align-items: center; gap: 0.35rem;
          background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.25);
          color: #f97316; padding: 0.3rem 0.75rem; border-radius: 999px;
          font-family: 'Outfit', sans-serif; font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.04em; margin-top: 0.5rem;
        }
        .drop-add-more {
          display: flex; align-items: center; gap: 0.5rem;
          font-family: 'Outfit', sans-serif; color: rgba(249,115,22,0.7); font-size: 0.85rem; font-weight: 500;
          padding: 1rem;
        }

        /* Settings */
        .bulk-settings {
          display: flex; gap: 1.5rem; flex-wrap: wrap;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.75rem; padding: 1rem 1.25rem;
        }
        .settings-group { display: flex; flex-direction: column; gap: 0.4rem; flex: 1; min-width: 180px; }
        .settings-label { font-family: 'Outfit', sans-serif; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(245,240,232,0.4); }
        .settings-row { display: flex; gap: 0.5rem; }
        .settings-select { flex: 1; }
        .btn-apply-cat {
          background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.3);
          color: #f97316; padding: 0.6rem 0.875rem; border-radius: 0.4rem;
          font-family: 'Outfit', sans-serif; font-size: 0.78rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .btn-apply-cat:hover:not(:disabled) { background: rgba(249,115,22,0.25); }
        .btn-apply-cat:disabled { opacity: 0.4; cursor: not-allowed; }
        .quality-slider {
          width: 100%; accent-color: #f97316; cursor: pointer; height: 4px;
        }

        /* Stats Bar */
        .bulk-stats {
          display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;
        }
        .bstat {
          font-family: 'Outfit', sans-serif; font-size: 0.75rem; font-weight: 600;
          padding: 0.2rem 0.6rem; border-radius: 999px;
        }
        .bstat.total { background: rgba(255,255,255,0.07); color: rgba(245,240,232,0.6); }
        .bstat.done { background: rgba(34,197,94,0.12); color: #4ade80; }
        .bstat.error { background: rgba(239,68,68,0.12); color: #f87171; }
        .bstat.running { background: rgba(249,115,22,0.12); color: #f97316; }
        .bstat.saved { background: rgba(99,102,241,0.12); color: #a5b4fc; }

        /* File List */
        .file-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 400px; overflow-y: auto; padding-right: 4px; }
        .file-list::-webkit-scrollbar { width: 4px; }
        .file-list::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.3); border-radius: 2px; }

        .file-row {
          display: flex; align-items: flex-start; gap: 0.875rem;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.625rem; padding: 0.75rem; transition: all 0.2s;
        }
        .file-row.status-done { border-color: rgba(34,197,94,0.2); background: rgba(34,197,94,0.04); }
        .file-row.status-error { border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.05); }
        .file-row.status-converting, .file-row.status-uploading { border-color: rgba(249,115,22,0.25); }

        /* Thumbnail */
        .file-thumb {
          width: 60px; height: 60px; flex-shrink: 0; border-radius: 0.4rem;
          overflow: hidden; position: relative; background: #0d1117;
        }
        .file-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .thumb-done, .thumb-err, .thumb-spin {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-size: 1.25rem; font-weight: 700;
        }
        .thumb-done { background: rgba(34,197,94,0.75); color: white; }
        .thumb-err { background: rgba(239,68,68,0.75); color: white; }
        .thumb-spin { background: rgba(4,7,15,0.6); }
        .mini-spinner {
          width: 1.25rem; height: 1.25rem; border: 2px solid rgba(249,115,22,0.3);
          border-top-color: #f97316; border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* File Info */
        .file-info { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; min-width: 0; }
        .file-title-input {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.375rem; color: #f5f0e8; padding: 0.4rem 0.65rem;
          font-family: 'Outfit', sans-serif; font-size: 0.875rem; outline: none;
          transition: border-color 0.2s; width: 100%; box-sizing: border-box;
        }
        .file-title-input:focus { border-color: rgba(249,115,22,0.5); }
        .file-title-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .file-meta-row { display: flex; gap: 0.5rem; align-items: center; }
        .file-cat-select {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(245,240,232,0.6); padding: 0.3rem 0.5rem; border-radius: 0.3rem;
          font-family: 'Outfit', sans-serif; font-size: 0.72rem; outline: none; cursor: pointer;
        }
        .file-cat-select:disabled { opacity: 0.4; cursor: not-allowed; }
        .file-cat-select option { background: #0d1117; }
        .file-size { font-family: 'Outfit', sans-serif; font-size: 0.7rem; color: rgba(245,240,232,0.3); }
        .size-webp { color: #a5b4fc; font-weight: 600; }
        .file-error { font-family: 'Outfit', sans-serif; font-size: 0.72rem; color: #f87171; }
        .file-progress-bar {
          height: 3px; background: rgba(255,255,255,0.08); border-radius: 999px;
          overflow: hidden; position: relative; margin-top: 2px;
        }
        .file-progress-fill {
          height: 100%; background: linear-gradient(90deg, #f97316, #ea580c);
          border-radius: 999px; transition: width 0.3s ease;
        }
        .file-progress-label {
          display: block; font-family: 'Outfit', sans-serif; font-size: 0.68rem;
          color: rgba(245,240,232,0.4); margin-top: 3px;
        }

        /* File actions */
        .file-remove {
          background: none; border: none; color: rgba(245,240,232,0.25); cursor: pointer;
          font-size: 0.85rem; padding: 0.25rem; transition: color 0.2s; flex-shrink: 0; align-self: center;
        }
        .file-remove:hover { color: #f87171; }
        .file-done-badge {
          font-family: 'Outfit', sans-serif; font-size: 0.7rem; font-weight: 600;
          color: #4ade80; background: rgba(34,197,94,0.1); padding: 0.2rem 0.5rem;
          border-radius: 999px; align-self: center; flex-shrink: 0;
        }

        /* Form elements reused */
        .input {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.5rem; color: #f5f0e8; padding: 0.65rem 0.875rem;
          font-family: 'Outfit', sans-serif; font-size: 0.9rem;
          transition: border-color 0.2s; outline: none; width: 100%; box-sizing: border-box;
        }
        .input:focus { border-color: rgba(249,115,22,0.5); }
        .select { appearance: none; cursor: pointer; }
        .select option { background: #0d1117; color: #f5f0e8; }

        /* Buttons */
        .btn-cancel {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(245,240,232,0.7); padding: 0.7rem 1.5rem; border-radius: 0.5rem;
          font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-cancel:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
        .btn-cancel:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-submit {
          background: linear-gradient(135deg, #f97316, #ea580c); border: none;
          color: white; padding: 0.7rem 1.5rem; border-radius: 0.5rem;
          font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 600;
          cursor: pointer; transition: all 0.25s; display: flex; align-items: center; gap: 0.5rem;
        }
        .btn-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(249,115,22,0.4); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-done { background: linear-gradient(135deg, #22c55e, #16a34a); }
        .btn-spinner {
          width: 1rem; height: 1rem; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
        }
      `}</style>
    </div>
  );
}

// ─── Upload Form Modal ─────────────────────────────────────────────────────────
interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
  editItem?: GalleryItem | null;
}

function UploadModal({ onClose, onSuccess, editItem }: UploadModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(editItem?.media_url ?? null);
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<UploadStep>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [replaceImage, setReplaceImage] = useState(false);
  const [convertingWebP, setConvertingWebP] = useState(false);

  const [form, setForm] = useState({
    title: editItem?.title ?? '',
    description: editItem?.description ?? '',
    category: editItem?.category ?? 'rooms',
    tags: editItem?.tags ?? [] as string[],
    is_featured: editItem?.is_featured ?? false,
    sort_order: editItem?.sort_order ?? 0,
  });

  const handleFile = (f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setError(null);
    if (editItem) setReplaceImage(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    setTagInput('');
  };

  const removeTag = (tag: string) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  const handleSubmit = async () => {
    if (!editItem && !file) { setError('Please select a file to upload.'); return; }
    if (!form.title.trim()) { setError('Title is required.'); return; }

    try {
      setStep('uploading');
      setProgress(10);
      let media_url = editItem?.media_url ?? '';
      let media_type: 'image' | 'video' = editItem?.media_type ?? 'image';
      const oldMediaUrl = editItem?.media_url;

      if (file) {
        media_type = file.type.startsWith('video/') ? 'video' : 'image';
        const bucket = media_type === 'video' ? 'gallery-videos' : 'gallery-images';

        let uploadBlob: Blob = file;
        let ext = file.name.split('.').pop();

        // Convert image to WebP
        if (media_type === 'image') {
          setConvertingWebP(true);
          setProgress(20);
          try {
            uploadBlob = await convertToWebP(file);
            ext = 'webp';
          } catch {
            // fallback to original if conversion fails
          }
          setConvertingWebP(false);
        }

        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        setProgress(40);

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, uploadBlob, {
            contentType: media_type === 'image' ? 'image/webp' : file.type,
            cacheControl: '3600',
            upsert: false
          });
        if (uploadError) throw uploadError;
        setProgress(70);

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        media_url = urlData.publicUrl;

        if (editItem && oldMediaUrl && replaceImage) {
          const oldBucket = editItem.media_type === 'video' ? 'gallery-videos' : 'gallery-images';
          const oldPath = oldMediaUrl.split('/').pop();
          if (oldPath) await supabase.storage.from(oldBucket).remove([oldPath]);
        }
      }

      setStep('processing');
      setProgress(85);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        media_url,
        media_type,
        category: form.category,
        tags: form.tags,
        is_featured: form.is_featured,
        sort_order: form.sort_order,
      };

      if (editItem) {
        const { error: dbError } = await supabase.from('gallery_items').update(payload).eq('id', editItem.id);
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase.from('gallery_items').insert([payload]);
        if (dbError) throw dbError;
      }

      setProgress(100);
      setStep('done');
      setTimeout(() => { onSuccess(); onClose(); }, 800);
    } catch (err: any) {
      setStep('error');
      setConvertingWebP(false);
      setError(err.message ?? 'Upload failed. Please try again.');
    }
  };

  const isVideo = file ? file.type.startsWith('video/') : editItem?.media_type === 'video';

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-panel">
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">{editItem ? 'Edit Item' : 'Upload Media'}</div>
            <h2 className="modal-title">{editItem ? editItem.title : 'Add to Gallery'}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <div
            className={`drop-zone ${dragOver ? 'drag-active' : ''} ${preview ? 'has-preview' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {preview ? (
              <div className="preview-container">
                {isVideo
                  ? <video src={preview} className="preview-media" muted loop playsInline />
                  : <img src={preview} alt="Preview" className="preview-media" />
                }
                <div className="preview-overlay">
                  <span className="preview-change">{editItem ? (replaceImage ? '✓ Will replace' : 'Click to replace') : 'Click to change'}</span>
                  {file && <span className="preview-meta">{file.name} · {formatBytes(file.size)}</span>}
                  {file && !isVideo && <span className="preview-webp-note">Will be converted to WebP</span>}
                </div>
              </div>
            ) : (
              <div className="drop-content">
                <div className="drop-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                </div>
                <p className="drop-text">Drop image or video here</p>
                <p className="drop-sub">Images auto-converted to WebP · JPG, PNG, WEBP, MP4, MOV</p>
              </div>
            )}
          </div>

          <div className="form-grid">
            <div className="field full">
              <label className="label">Title <span className="required">*</span></label>
              <input type="text" className="input" placeholder="e.g. Master Bedroom at Dusk" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="field full">
              <label className="label">Description</label>
              <textarea className="input textarea" placeholder="Optional caption…" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="field">
              <label className="label">Category</label>
              <select className="input select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Sort Order</label>
              <input type="number" className="input" placeholder="0" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="field full">
              <label className="label">Tags</label>
              <div className="tag-input-row">
                <input type="text" className="input tag-input" placeholder="Add a tag and press Enter…" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                <button className="btn-tag-add" onClick={addTag} type="button">Add</button>
              </div>
              {form.tags.length > 0 && (
                <div className="tags-list">
                  {form.tags.map(tag => (
                    <span key={tag} className="tag">{tag}<button onClick={() => removeTag(tag)} className="tag-remove">×</button></span>
                  ))}
                </div>
              )}
            </div>
            <div className="field full">
              <label className="featured-toggle">
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="toggle-checkbox" />
                <span className="toggle-track"><span className="toggle-thumb" /></span>
                <span className="toggle-label">Feature this item <span className="toggle-sub">(shown prominently)</span></span>
              </label>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
          {(step === 'uploading' || step === 'processing' || step === 'done') && (
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
              <span className="progress-label">
                {convertingWebP ? 'Converting to WebP…'
                  : step === 'uploading' ? 'Uploading file…'
                  : step === 'processing' ? 'Saving to database…'
                  : '✓ Done'}
              </span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className={`btn-submit ${step === 'done' ? 'btn-done' : ''}`} onClick={handleSubmit} disabled={step === 'uploading' || step === 'processing' || step === 'done'}>
            {step === 'uploading' ? (convertingWebP ? 'Converting…' : 'Uploading…')
              : step === 'processing' ? 'Saving…'
              : step === 'done' ? '✓ Saved!'
              : editItem ? (replaceImage ? 'Save & Replace' : 'Save Changes')
              : 'Upload to Gallery'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(4,7,15,0.85); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .modal-panel { background: #0d1117; border: 1px solid rgba(249,115,22,0.2); border-radius: 1.25rem; width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; box-shadow: 0 0 80px rgba(249,115,22,0.08), 0 32px 80px rgba(0,0,0,0.6); animation: slideUp 0.3s cubic-bezier(.22,1,.36,1); }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .modal-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.75rem 2rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .modal-eyebrow { font-family: 'Outfit', sans-serif; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #f97316; margin-bottom: 0.25rem; }
        .modal-title { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 600; color: #f5f0e8; margin: 0; }
        .modal-close { background: rgba(255,255,255,0.06); border: none; color: rgba(255,255,255,0.5); width: 2rem; height: 2rem; border-radius: 50%; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .modal-close:hover { background: rgba(249,115,22,0.2); color: #f97316; }
        .modal-body { padding: 1.5rem 2rem; flex: 1; display: flex; flex-direction: column; gap: 1.25rem; }
        .modal-footer { display: flex; gap: 0.75rem; justify-content: flex-end; padding: 1.25rem 2rem; border-top: 1px solid rgba(255,255,255,0.06); }
        .drop-zone { border: 2px dashed rgba(249,115,22,0.25); border-radius: 0.75rem; background: rgba(249,115,22,0.03); cursor: pointer; transition: all 0.25s; overflow: hidden; min-height: 160px; display: flex; align-items: center; justify-content: center; }
        .drop-zone:hover, .drop-zone.drag-active { border-color: rgba(249,115,22,0.6); background: rgba(249,115,22,0.07); }
        .drop-zone.has-preview { border-style: solid; }
        .drop-content { text-align: center; padding: 2rem; }
        .drop-icon { color: rgba(249,115,22,0.5); margin-bottom: 0.75rem; display: flex; justify-content: center; }
        .drop-text { font-family: 'Outfit', sans-serif; color: #f5f0e8; font-size: 0.95rem; margin: 0 0 0.25rem; }
        .drop-sub { font-family: 'Outfit', sans-serif; color: rgba(245,240,232,0.4); font-size: 0.78rem; margin: 0; }
        .preview-container { position: relative; width: 100%; }
        .preview-media { width: 100%; max-height: 240px; object-fit: cover; display: block; }
        .preview-overlay { position: absolute; inset: 0; background: rgba(4,7,15,0.6); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
        .preview-container:hover .preview-overlay { opacity: 1; }
        .preview-change { font-family: 'Outfit', sans-serif; color: #f5f0e8; font-size: 0.9rem; font-weight: 500; }
        .preview-meta { font-family: 'Outfit', sans-serif; color: rgba(245,240,232,0.5); font-size: 0.75rem; margin-top: 0.25rem; }
        .preview-webp-note { font-family: 'Outfit', sans-serif; color: #a5b4fc; font-size: 0.72rem; margin-top: 0.2rem; font-weight: 600; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .field { display: flex; flex-direction: column; gap: 0.4rem; }
        .field.full { grid-column: 1 / -1; }
        .label { font-family: 'Outfit', sans-serif; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(245,240,232,0.5); }
        .required { color: #f97316; }
        .input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem; color: #f5f0e8; padding: 0.65rem 0.875rem; font-family: 'Outfit', sans-serif; font-size: 0.9rem; transition: border-color 0.2s; outline: none; width: 100%; box-sizing: border-box; }
        .input::placeholder { color: rgba(245,240,232,0.2); }
        .input:focus { border-color: rgba(249,115,22,0.5); background: rgba(249,115,22,0.04); }
        .textarea { resize: vertical; min-height: 80px; }
        .select { appearance: none; cursor: pointer; }
        .select option { background: #0d1117; color: #f5f0e8; }
        .tag-input-row { display: flex; gap: 0.5rem; }
        .tag-input { flex: 1; }
        .btn-tag-add { background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.3); color: #f97316; padding: 0.65rem 1rem; border-radius: 0.5rem; font-family: 'Outfit', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .btn-tag-add:hover { background: rgba(249,115,22,0.25); }
        .tags-list { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem; }
        .tag { display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.25); color: #f97316; padding: 0.2rem 0.6rem; border-radius: 999px; font-family: 'Outfit', sans-serif; font-size: 0.75rem; font-weight: 500; }
        .tag-remove { background: none; border: none; color: rgba(249,115,22,0.6); cursor: pointer; padding: 0; font-size: 1rem; line-height: 1; }
        .tag-remove:hover { color: #f97316; }
        .featured-toggle { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
        .toggle-checkbox { position: absolute; opacity: 0; width: 0; height: 0; }
        .toggle-track { width: 2.5rem; height: 1.4rem; background: rgba(255,255,255,0.1); border-radius: 999px; position: relative; transition: background 0.25s; flex-shrink: 0; }
        .toggle-checkbox:checked ~ .toggle-track { background: #f97316; }
        .toggle-thumb { position: absolute; top: 0.2rem; left: 0.2rem; width: 1rem; height: 1rem; background: white; border-radius: 50%; transition: transform 0.25s; }
        .toggle-checkbox:checked ~ .toggle-track .toggle-thumb { transform: translateX(1.1rem); }
        .toggle-label { font-family: 'Outfit', sans-serif; font-size: 0.9rem; color: #f5f0e8; }
        .toggle-sub { color: rgba(245,240,232,0.4); font-size: 0.78rem; }
        .form-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; border-radius: 0.5rem; padding: 0.75rem 1rem; font-family: 'Outfit', sans-serif; font-size: 0.85rem; }
        .progress-bar-wrap { height: 4px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; position: relative; margin-top: 0.25rem; }
        .progress-bar { height: 100%; background: linear-gradient(90deg, #f97316, #ea580c); border-radius: 999px; transition: width 0.4s ease; }
        .progress-label { display: block; font-family: 'Outfit', sans-serif; font-size: 0.75rem; color: rgba(245,240,232,0.5); margin-top: 0.4rem; text-align: right; }
        .btn-cancel { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(245,240,232,0.7); padding: 0.7rem 1.5rem; border-radius: 0.5rem; font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn-cancel:hover { background: rgba(255,255,255,0.1); }
        .btn-submit { background: linear-gradient(135deg, #f97316, #ea580c); border: none; color: white; padding: 0.7rem 2rem; border-radius: 0.5rem; font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.25s; }
        .btn-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(249,115,22,0.4); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-done { background: linear-gradient(135deg, #22c55e, #16a34a); }
      `}</style>
    </div>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ item, onClose, onConfirm }: { item: GalleryItem; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="delete-panel">
        <div className="delete-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
        </div>
        <h3 className="delete-title">Delete "{item.title}"?</h3>
        <p className="delete-sub">This action cannot be undone. The media file and all metadata will be permanently removed.</p>
        <div className="delete-actions">
          <button className="btn-cancel-sm" onClick={onClose}>Cancel</button>
          <button className="btn-delete" onClick={onConfirm}>Delete Permanently</button>
        </div>
      </div>
      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; z-index: 1100; background: rgba(4,7,15,0.85); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: fadeIn 0.15s ease; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .delete-panel { background: #0d1117; border: 1px solid rgba(239,68,68,0.3); border-radius: 1.25rem; padding: 2.5rem; max-width: 420px; width: 100%; text-align: center; animation: scaleIn 0.25s cubic-bezier(.22,1,.36,1); box-shadow: 0 0 60px rgba(239,68,68,0.08), 0 24px 60px rgba(0,0,0,0.6); }
        @keyframes scaleIn { from { transform: scale(0.92); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        .delete-icon { width: 3.5rem; height: 3.5rem; border-radius: 50%; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; color: #f87171; }
        .delete-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: #f5f0e8; margin: 0 0 0.75rem; }
        .delete-sub { font-family: 'Outfit', sans-serif; font-size: 0.85rem; color: rgba(245,240,232,0.45); line-height: 1.6; margin: 0 0 2rem; }
        .delete-actions { display: flex; gap: 0.75rem; justify-content: center; }
        .btn-cancel-sm { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(245,240,232,0.7); padding: 0.65rem 1.5rem; border-radius: 0.5rem; font-family: 'Outfit', sans-serif; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
        .btn-cancel-sm:hover { background: rgba(255,255,255,0.1); }
        .btn-delete { background: linear-gradient(135deg, #ef4444, #dc2626); border: none; color: white; padding: 0.65rem 1.5rem; border-radius: 0.5rem; font-family: 'Outfit', sans-serif; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-delete:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}

// ─── Gallery Item Card ─────────────────────────────────────────────────────────
function ItemCard({ item, onEdit, onDelete }: { item: GalleryItem; onEdit: (i: GalleryItem) => void; onDelete: (i: GalleryItem) => void }) {
  return (
    <div className="card">
      <div className="card-media">
        {item.media_type === 'video'
          ? <video src={item.media_url} className="media" muted loop playsInline />
          : <img src={item.thumbnail_url ?? item.media_url} alt={item.title} className="media" loading="lazy" />
        }
        <div className="card-overlay">
          {item.media_type === 'video' && <span className="badge-type video"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>Video</span>}
          {item.is_featured && <span className="badge-type featured">★ Featured</span>}
          <div className="card-actions">
            <button className="card-btn edit" onClick={() => onEdit(item)} aria-label="Edit"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button className="card-btn delete" onClick={() => onDelete(item)} aria-label="Delete"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="card-top">
          <h3 className="card-title">{item.title}</h3>
          <span className="card-category">{item.category}</span>
        </div>
        {item.description && <p className="card-desc">{item.description}</p>}
        {item.tags.length > 0 && (
          <div className="card-tags">
            {item.tags.slice(0, 3).map(t => <span key={t} className="ctag">{t}</span>)}
            {item.tags.length > 3 && <span className="ctag more">+{item.tags.length - 3}</span>}
          </div>
        )}
        <div className="card-meta">Sort: {item.sort_order}</div>
      </div>
      <style jsx>{`
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.875rem; overflow: hidden; transition: all 0.25s; }
        .card:hover { border-color: rgba(249,115,22,0.25); transform: translateY(-2px); box-shadow: 0 8px 40px rgba(0,0,0,0.4); }
        .card-media { position: relative; aspect-ratio: 16/10; overflow: hidden; background: #0d1117; }
        .media { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.35s; }
        .card:hover .media { transform: scale(1.04); }
        .card-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(4,7,15,0.3) 0%, transparent 40%, transparent 60%, rgba(4,7,15,0.85) 100%); display: flex; flex-direction: column; justify-content: space-between; padding: 0.6rem; opacity: 0; transition: opacity 0.2s; }
        .card:hover .card-overlay { opacity: 1; }
        .badge-type { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.6rem; border-radius: 999px; font-family: 'Outfit', sans-serif; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.05em; align-self: flex-start; }
        .badge-type.video { background: rgba(4,7,15,0.7); color: rgba(245,240,232,0.9); }
        .badge-type.featured { background: rgba(249,115,22,0.85); color: white; margin-top: 0.25rem; }
        .card-actions { display: flex; gap: 0.4rem; align-self: flex-end; margin-top: auto; }
        .card-btn { width: 2rem; height: 2rem; border-radius: 0.4rem; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .card-btn.edit { background: rgba(249,115,22,0.85); color: white; }
        .card-btn.edit:hover { background: #f97316; }
        .card-btn.delete { background: rgba(239,68,68,0.8); color: white; }
        .card-btn.delete:hover { background: #ef4444; }
        .card-body { padding: 0.875rem; }
        .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.35rem; }
        .card-title { font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 600; color: #f5f0e8; margin: 0; }
        .card-category { font-family: 'Outfit', sans-serif; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #f97316; white-space: nowrap; background: rgba(249,115,22,0.1); padding: 0.15rem 0.5rem; border-radius: 999px; }
        .card-desc { font-family: 'Outfit', sans-serif; font-size: 0.78rem; color: rgba(245,240,232,0.4); margin: 0 0 0.5rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .card-tags { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 0.5rem; }
        .ctag { font-family: 'Outfit', sans-serif; font-size: 0.65rem; color: rgba(245,240,232,0.45); background: rgba(255,255,255,0.05); padding: 0.15rem 0.5rem; border-radius: 999px; }
        .ctag.more { color: rgba(249,115,22,0.6); }
        .card-meta { font-family: 'Outfit', sans-serif; font-size: 0.7rem; color: rgba(245,240,232,0.25); }
      `}</style>
    </div>
  );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────────
export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<GalleryItem | null>(null);
  const [sortBy, setSortBy] = useState<'sort_order' | 'created_at' | 'title'>('sort_order');

  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from('gallery_items').select('*').order(sortBy, { ascending: sortBy !== 'created_at' });
    setItems(data ?? []);
    setLoading(false);
  }, [sortBy]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async () => {
    if (!deleteItem) return;
    const bucket = deleteItem.media_type === 'video' ? 'gallery-videos' : 'gallery-images';
    const path = deleteItem.media_url.split('/').pop();
    if (path) await supabase.storage.from(bucket).remove([path]);
    await supabase.from('gallery_items').delete().eq('id', deleteItem.id);
    setDeleteItem(null);
    fetchItems();
  };

  const filtered = items.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterType !== 'all' && item.media_type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !(item.description?.toLowerCase().includes(q)) && !item.tags.some(t => t.includes(q))) return false;
    }
    return true;
  });

  const stats = {
    total: items.length,
    images: items.filter(i => i.media_type === 'image').length,
    videos: items.filter(i => i.media_type === 'video').length,
    featured: items.filter(i => i.is_featured).length,
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div className="admin-root">
        <div className="bg-layer" aria-hidden>
          <div className="orb orb1" /><div className="orb orb2" />
          <div className="grid-overlay" />
        </div>

        <header className="admin-header">
          <div className="header-inner">
            <div className="header-brand">
              <div className="brand-dot" />
              <div>
                <div className="brand-label">Gallery Management</div>
                <h1 className="brand-title">Admin Dashboard</h1>
              </div>
            </div>
            <div className="header-right">
              <a href="/gallery" className="btn-preview" target="_blank" rel="noopener">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                View Gallery
              </a>
              {/* Bulk Upload Button */}
              <button className="btn-bulk" onClick={() => setShowBulk(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9l4-4 4 4 4-4 4 4"/>
                  <path d="M12 12v6"/>
                </svg>
                Bulk Upload
              </button>
              <button className="btn-upload" onClick={() => setShowUpload(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
                Upload Media
              </button>
            </div>
          </div>
        </header>

        <main className="admin-main">
          <div className="stats-row">
            {[
              { label: 'Total Items', value: stats.total, icon: '◈' },
              { label: 'Images', value: stats.images, icon: '◻' },
              { label: 'Videos', value: stats.videos, icon: '▶' },
              { label: 'Featured', value: stats.featured, icon: '★' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <span className="stat-icon">{s.icon}</span>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="toolbar">
            <div className="search-wrap">
              <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" className="search-input" placeholder="Search by title, description, or tag…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {searchQuery && <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>}
            </div>
            <div className="filter-group">
              {['all', ...CATEGORIES].map(cat => (
                <button key={cat} className={`filter-btn ${filterCategory === cat ? 'active' : ''}`} onClick={() => setFilterCategory(cat)}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
            <div className="toolbar-right">
              <div className="type-filter">
                {(['all', 'image', 'video'] as const).map(t => (
                  <button key={t} className={`type-btn ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                <option value="sort_order">Sort: Order</option>
                <option value="created_at">Sort: Newest</option>
                <option value="title">Sort: A–Z</option>
              </select>
            </div>
          </div>

          {(filterCategory !== 'all' || filterType !== 'all' || searchQuery) && (
            <div className="results-info">Showing <strong>{filtered.length}</strong> of {items.length} items{searchQuery && <> matching "<em>{searchQuery}</em>"</>}</div>
          )}

          {loading ? (
            <div className="loading-state"><div className="spinner" /><span>Loading gallery…</span></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◈</div>
              <h3 className="empty-title">No items found</h3>
              <p className="empty-sub">{items.length === 0 ? 'Your gallery is empty. Upload media to get started.' : 'Try adjusting your filters.'}</p>
              {items.length === 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button className="btn-bulk" onClick={() => setShowBulk(true)}>Bulk Upload</button>
                  <button className="btn-upload" onClick={() => setShowUpload(true)}>Single Upload</button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid">
              {filtered.map(item => <ItemCard key={item.id} item={item} onEdit={setEditItem} onDelete={setDeleteItem} />)}
            </div>
          )}
        </main>

        {(showUpload || editItem) && (
          <UploadModal onClose={() => { setShowUpload(false); setEditItem(null); }} onSuccess={fetchItems} editItem={editItem} />
        )}
        {showBulk && (
          <BulkUploadModal onClose={() => setShowBulk(false)} onSuccess={fetchItems} />
        )}
        {deleteItem && (
          <DeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} />
        )}
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #04070f; color: #f5f0e8; }
        ::selection { background: rgba(249,115,22,0.3); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.3); border-radius: 3px; }
        .admin-root { min-height: 100vh; font-family: 'Outfit', sans-serif; position: relative; }
        .bg-layer { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .orb { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.07; animation: drift 20s infinite alternate ease-in-out; }
        .orb1 { width: 700px; height: 700px; background: #f97316; top: -200px; right: -100px; }
        .orb2 { width: 500px; height: 500px; background: #7c3aed; bottom: -100px; left: -100px; animation-delay: -10s; }
        @keyframes drift { from { transform: translate(0,0) scale(1); } to { transform: translate(40px,30px) scale(1.1); } }
        .grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px); background-size: 60px 60px; }
        .admin-header { position: sticky; top: 0; z-index: 100; background: rgba(4,7,15,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(249,115,22,0.12); }
        .header-inner { max-width: 1400px; margin: 0 auto; padding: 1.25rem 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
        .header-brand { display: flex; align-items: center; gap: 1rem; }
        .brand-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: #f97316; box-shadow: 0 0 8px #f97316; flex-shrink: 0; }
        .brand-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(249,115,22,0.7); }
        .brand-title { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 600; color: #f5f0e8; margin: 0; }
        .header-right { display: flex; align-items: center; gap: 0.75rem; }
        .btn-preview { display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(245,240,232,0.7); padding: 0.55rem 1.1rem; border-radius: 0.5rem; font-family: 'Outfit', sans-serif; font-size: 0.85rem; font-weight: 500; text-decoration: none; transition: all 0.2s; }
        .btn-preview:hover { background: rgba(255,255,255,0.1); color: #f5f0e8; }
        .btn-bulk { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.3); color: #f97316; padding: 0.6rem 1.25rem; border-radius: 0.5rem; font-family: 'Outfit', sans-serif; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.25s; }
        .btn-bulk:hover { background: rgba(249,115,22,0.2); transform: translateY(-1px); }
        .btn-upload { display: inline-flex; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, #f97316, #ea580c); border: none; color: white; padding: 0.6rem 1.4rem; border-radius: 0.5rem; font-family: 'Outfit', sans-serif; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.25s; }
        .btn-upload:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(249,115,22,0.4); }
        .admin-main { position: relative; z-index: 1; max-width: 1400px; margin: 0 auto; padding: 2rem; }
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.875rem; padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1rem; transition: all 0.25s; }
        .stat-card:hover { border-color: rgba(249,115,22,0.2); }
        .stat-icon { font-size: 1.1rem; color: rgba(249,115,22,0.6); flex-shrink: 0; }
        .stat-value { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 600; color: #f5f0e8; line-height: 1; flex-shrink: 0; }
        .stat-label { font-size: 0.75rem; color: rgba(245,240,232,0.4); text-transform: uppercase; letter-spacing: 0.1em; }
        .toolbar { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-bottom: 1rem; }
        .search-wrap { position: relative; flex: 1; min-width: 240px; }
        .search-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: rgba(245,240,232,0.3); pointer-events: none; }
        .search-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem; color: #f5f0e8; padding: 0.65rem 2.25rem 0.65rem 2.4rem; font-family: 'Outfit', sans-serif; font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
        .search-input::placeholder { color: rgba(245,240,232,0.25); }
        .search-input:focus { border-color: rgba(249,115,22,0.4); }
        .search-clear { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: rgba(245,240,232,0.3); cursor: pointer; font-size: 0.85rem; }
        .search-clear:hover { color: rgba(245,240,232,0.7); }
        .filter-group { display: flex; gap: 0.35rem; flex-wrap: wrap; }
        .filter-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(245,240,232,0.5); padding: 0.45rem 0.9rem; border-radius: 0.375rem; font-family: 'Outfit', sans-serif; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.2s; text-transform: capitalize; }
        .filter-btn:hover, .filter-btn.active { background: rgba(249,115,22,0.12); border-color: rgba(249,115,22,0.3); color: #f97316; }
        .toolbar-right { display: flex; gap: 0.5rem; margin-left: auto; align-items: center; }
        .type-filter { display: flex; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.4rem; overflow: hidden; }
        .type-btn { background: none; border: none; color: rgba(245,240,232,0.45); padding: 0.45rem 0.75rem; font-family: 'Outfit', sans-serif; font-size: 0.78rem; cursor: pointer; transition: all 0.2s; }
        .type-btn.active { background: rgba(249,115,22,0.15); color: #f97316; }
        .sort-select { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(245,240,232,0.6); padding: 0.45rem 0.75rem; border-radius: 0.4rem; font-family: 'Outfit', sans-serif; font-size: 0.78rem; outline: none; cursor: pointer; }
        .sort-select option { background: #0d1117; }
        .results-info { font-size: 0.8rem; color: rgba(245,240,232,0.4); margin-bottom: 1rem; }
        .results-info strong { color: rgba(245,240,232,0.7); }
        .results-info em { font-style: italic; color: #f97316; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
        .loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6rem 2rem; text-align: center; gap: 1rem; }
        .spinner { width: 2rem; height: 2rem; border: 2px solid rgba(249,115,22,0.2); border-top-color: #f97316; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .empty-icon { font-size: 3rem; color: rgba(249,115,22,0.3); }
        .empty-title { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; color: #f5f0e8; margin: 0; }
        .empty-sub { font-size: 0.875rem; color: rgba(245,240,232,0.4); max-width: 380px; line-height: 1.6; margin: 0; }
        @media (max-width: 900px) { .stats-row { grid-template-columns: repeat(2, 1fr); } .header-inner { padding: 1rem; } }
        @media (max-width: 600px) { .admin-main { padding: 1rem; } .brand-title { font-size: 1.2rem; } .toolbar { flex-direction: column; } .search-wrap { min-width: 100%; } .header-right { gap: 0.4rem; } .btn-bulk span, .btn-upload span { display: none; } }
      `}</style>
    </>
  );
}
