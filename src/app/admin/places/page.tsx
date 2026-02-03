"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Place = {
  id: string;
  name: string;
  category: 'beach' | 'historical' | 'spiritual' | 'adventure' | 'nature';
  distance: string;
  time: string;
  description: string;
  images: string[];
  rating: number;
  highlights: string[];
  location_url?: string;
  created_at?: string;
  updated_at?: string;
};

const CATEGORIES = [
  { id: 'beach', name: 'Beach' },
  { id: 'historical', name: 'Historical' },
  { id: 'spiritual', name: 'Spiritual' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'nature', name: 'Nature' }
] as const;

export default function PlacesManagement() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "beach" as Place['category'],
    distance: "",
    time: "",
    description: "",
    rating: "4.5",
    highlights: "",
    location_url: "",
    images: [] as string[],
  });

  useEffect(() => {
    loadPlaces();

    const subscription = supabase
      .channel('places-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'places'
        },
        (payload) => {
          console.log('Place change detected:', payload);
          loadPlaces();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadPlaces() {
    setLoading(true);
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading places:", error);
    } else if (data) {
      setPlaces(data);
    }
    setLoading(false);
  }

  function openAddModal() {
    setEditingPlace(null);
    setFormData({
      name: "",
      category: "beach",
      distance: "",
      time: "",
      description: "",
      rating: "4.5",
      highlights: "",
      location_url: "",
      images: [],
    });
    setShowModal(true);
  }

  function openEditModal(place: Place) {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      category: place.category,
      distance: place.distance,
      time: place.time,
      description: place.description,
      rating: place.rating.toString(),
      highlights: place.highlights.join(", "),
      location_url: place.location_url || "",
      images: place.images || [],
    });
    setShowModal(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('place-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('place-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(index: number) {
    const imageUrl = formData.images[index];
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    try {
      const { error } = await supabase.storage
        .from('place-images')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting image:', error);
      }

      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Error removing image:', error);
    }
  }

  async function handleSave() {
    if (!formData.name || !formData.distance || !formData.time) {
      alert("Please fill in all required fields");
      return;
    }

    const placeData = {
      name: formData.name,
      category: formData.category,
      distance: formData.distance,
      time: formData.time,
      description: formData.description,
      rating: parseFloat(formData.rating),
      highlights: formData.highlights
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
      location_url: formData.location_url,
      images: formData.images,
    };

    if (editingPlace) {
      const { error } = await supabase
        .from("places")
        .update(placeData)
        .eq("id", editingPlace.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("places").insert(placeData);

      if (error) {
        alert(error.message);
        return;
      }
    }

    setShowModal(false);
    loadPlaces();
  }

  async function handleDelete(place: Place) {
    if (!confirm(`Are you sure you want to delete "${place.name}"?`)) {
      return;
    }

    // Delete images from storage
    if (place.images && place.images.length > 0) {
      for (const imageUrl of place.images) {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        await supabase.storage
          .from('place-images')
          .remove([fileName]);
      }
    }

    const { error } = await supabase.from("places").delete().eq("id", place.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadPlaces();
  }

  return (
    <div className="places-management">
      <div className="page-header">
        <div>
          <h1>Places Management</h1>
          <p>Manage tourist attractions and places to visit</p>
        </div>
        <button onClick={openAddModal} className="add-btn">
          Add New Place
        </button>
      </div>

      {/* Category Stats */}
      <div className="stats-grid">
        {CATEGORIES.map((cat) => {
          const count = places.filter(p => p.category === cat.id).length;
          return (
            <div key={cat.id} className="stat-card">
              <div className="stat-content">
                <p className="stat-label">{cat.name}</p>
                <h3 className="stat-value">{count}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading places...</p>
        </div>
      ) : (
        <div className="places-grid">
          {places.map((place) => (
            <div key={place.id} className="place-card">
              <div className="place-header">
                <div className="place-title">
                  <h3>{place.name}</h3>
                </div>
                <div className="place-actions">
                  <button
                    onClick={() => openEditModal(place)}
                    className="edit-btn"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(place)}
                    className="delete-btn"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {place.images && place.images.length > 0 && (
                <div className="place-images-preview">
                  <img 
                    src={place.images[0]} 
                    alt={place.name}
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  {place.images.length > 1 && (
                    <div className="image-count">
                      {place.images.length} photos
                    </div>
                  )}
                </div>
              )}

              <div className="place-details">
                <div className="detail-row">
                  <span className="detail-badge category">{place.category}</span>
                  <span className="detail-badge rating">Rating: {place.rating}</span>
                </div>

                <div className="detail-item">
                  <span className="label">Distance:</span>
                  <span className="value">{place.distance}</span>
                </div>

                <div className="detail-item">
                  <span className="label">Travel Time:</span>
                  <span className="value">{place.time}</span>
                </div>

                {place.description && (
                  <p className="description">{place.description.slice(0, 100)}...</p>
                )}

                {place.highlights && place.highlights.length > 0 && (
                  <div className="highlights">
                    {place.highlights.slice(0, 3).map((highlight, idx) => (
                      <span key={idx} className="highlight-tag">
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {places.length === 0 && (
            <div className="empty-state">
              <h3>No places yet</h3>
              <p>Add your first place to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlace ? "Edit Place" : "Add New Place"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Place Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Alibag Beach"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as Place['category'] })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Rating (0-5) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    placeholder="4.5"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Distance *</label>
                  <input
                    type="text"
                    value={formData.distance}
                    onChange={(e) =>
                      setFormData({ ...formData, distance: e.target.value })
                    }
                    placeholder="e.g., 3 km"
                  />
                </div>

                <div className="form-group">
                  <label>Travel Time *</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    placeholder="e.g., 10 min"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the place..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Highlights (comma-separated)</label>
                <input
                  type="text"
                  value={formData.highlights}
                  onChange={(e) =>
                    setFormData({ ...formData, highlights: e.target.value })
                  }
                  placeholder="Sunset Views, Water Sports, Horse Riding"
                />
              </div>

              <div className="form-group">
                <label>Google Maps URL</label>
                <input
                  type="url"
                  value={formData.location_url}
                  onChange={(e) =>
                    setFormData({ ...formData, location_url: e.target.value })
                  }
                  placeholder="https://maps.google.com/..."
                />
              </div>

              {/* Image Upload Section */}
              <div className="form-group">
                <label>Place Images</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    id="image-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" className="upload-btn">
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </label>
                  
                  {formData.images.length > 0 && (
                    <div className="uploaded-images">
                      {formData.images.map((url, index) => (
                        <div key={index} className="image-preview">
                          <img src={url} alt={`Place ${index + 1}`} />
                          <button
                            onClick={() => removeImage(index)}
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
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="save-btn" disabled={uploading}>
                {editingPlace ? "Update Place" : "Add Place"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Place = {
  id: string;
  name: string;
  category: 'beach' | 'historical' | 'spiritual' | 'adventure' | 'nature';
  distance: string;
  time: string;
  description: string;
  images: string[];
  rating: number;
  highlights: string[];
  location_url?: string;
  created_at?: string;
  updated_at?: string;
};

const CATEGORIES = [
  { id: 'beach', name: 'Beach' },
  { id: 'historical', name: 'Historical' },
  { id: 'spiritual', name: 'Spiritual' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'nature', name: 'Nature' }
] as const;

export default function PlacesManagement() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "beach" as Place['category'],
    distance: "",
    time: "",
    description: "",
    rating: "4.5",
    highlights: "",
    location_url: "",
    images: [] as string[],
  });

  useEffect(() => {
    loadPlaces();

    const subscription = supabase
      .channel('places-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'places'
        },
        (payload) => {
          console.log('Place change detected:', payload);
          loadPlaces();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadPlaces() {
    setLoading(true);
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading places:", error);
    } else if (data) {
      setPlaces(data);
    }
    setLoading(false);
  }

  function openAddModal() {
    setEditingPlace(null);
    setFormData({
      name: "",
      category: "beach",
      distance: "",
      time: "",
      description: "",
      rating: "4.5",
      highlights: "",
      location_url: "",
      images: [],
    });
    setShowModal(true);
  }

  function openEditModal(place: Place) {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      category: place.category,
      distance: place.distance,
      time: place.time,
      description: place.description,
      rating: place.rating.toString(),
      highlights: place.highlights.join(", "),
      location_url: place.location_url || "",
      images: place.images || [],
    });
    setShowModal(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('place-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('place-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(index: number) {
    const imageUrl = formData.images[index];
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    try {
      const { error } = await supabase.storage
        .from('place-images')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting image:', error);
      }

      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Error removing image:', error);
    }
  }

  async function handleSave() {
    if (!formData.name || !formData.distance || !formData.time) {
      alert("Please fill in all required fields");
      return;
    }

    const placeData = {
      name: formData.name,
      category: formData.category,
      distance: formData.distance,
      time: formData.time,
      description: formData.description,
      rating: parseFloat(formData.rating),
      highlights: formData.highlights
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
      location_url: formData.location_url,
      images: formData.images,
    };

    if (editingPlace) {
      const { error } = await supabase
        .from("places")
        .update(placeData)
        .eq("id", editingPlace.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("places").insert(placeData);

      if (error) {
        alert(error.message);
        return;
      }
    }

    setShowModal(false);
    loadPlaces();
  }

  async function handleDelete(place: Place) {
    if (!confirm(`Are you sure you want to delete "${place.name}"?`)) {
      return;
    }

    // Delete images from storage
    if (place.images && place.images.length > 0) {
      for (const imageUrl of place.images) {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        await supabase.storage
          .from('place-images')
          .remove([fileName]);
      }
    }

    const { error } = await supabase.from("places").delete().eq("id", place.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadPlaces();
  }

  return (
    <div className="places-management">
      <div className="page-header">
        <div>
          <h1>Places Management</h1>
          <p>Manage tourist attractions and places to visit</p>
        </div>
        <button onClick={openAddModal} className="add-btn">
          Add New Place
        </button>
      </div>

      {/* Category Stats */}
      <div className="stats-grid">
        {CATEGORIES.map((cat) => {
          const count = places.filter(p => p.category === cat.id).length;
          return (
            <div key={cat.id} className="stat-card">
              <div className="stat-content">
                <p className="stat-label">{cat.name}</p>
                <h3 className="stat-value">{count}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading places...</p>
        </div>
      ) : (
        <div className="places-grid">
          {places.map((place) => (
            <div key={place.id} className="place-card">
              <div className="place-header">
                <div className="place-title">
                  <h3>{place.name}</h3>
                </div>
                <div className="place-actions">
                  <button
                    onClick={() => openEditModal(place)}
                    className="edit-btn"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(place)}
                    className="delete-btn"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {place.images && place.images.length > 0 && (
                <div className="place-images-preview">
                  <img 
                    src={place.images[0]} 
                    alt={place.name}
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  {place.images.length > 1 && (
                    <div className="image-count">
                      {place.images.length} photos
                    </div>
                  )}
                </div>
              )}

              <div className="place-details">
                <div className="detail-row">
                  <span className="detail-badge category">{place.category}</span>
                  <span className="detail-badge rating">Rating: {place.rating}</span>
                </div>

                <div className="detail-item">
                  <span className="label">Distance:</span>
                  <span className="value">{place.distance}</span>
                </div>

                <div className="detail-item">
                  <span className="label">Travel Time:</span>
                  <span className="value">{place.time}</span>
                </div>

                {place.description && (
                  <p className="description">{place.description.slice(0, 100)}...</p>
                )}

                {place.highlights && place.highlights.length > 0 && (
                  <div className="highlights">
                    {place.highlights.slice(0, 3).map((highlight, idx) => (
                      <span key={idx} className="highlight-tag">
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {places.length === 0 && (
            <div className="empty-state">
              <h3>No places yet</h3>
              <p>Add your first place to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlace ? "Edit Place" : "Add New Place"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Place Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Alibag Beach"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as Place['category'] })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Rating (0-5) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    placeholder="4.5"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Distance *</label>
                  <input
                    type="text"
                    value={formData.distance}
                    onChange={(e) =>
                      setFormData({ ...formData, distance: e.target.value })
                    }
                    placeholder="e.g., 3 km"
                  />
                </div>

                <div className="form-group">
                  <label>Travel Time *</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    placeholder="e.g., 10 min"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the place..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Highlights (comma-separated)</label>
                <input
                  type="text"
                  value={formData.highlights}
                  onChange={(e) =>
                    setFormData({ ...formData, highlights: e.target.value })
                  }
                  placeholder="Sunset Views, Water Sports, Horse Riding"
                />
              </div>

              <div className="form-group">
                <label>Google Maps URL</label>
                <input
                  type="url"
                  value={formData.location_url}
                  onChange={(e) =>
                    setFormData({ ...formData, location_url: e.target.value })
                  }
                  placeholder="https://maps.google.com/..."
                />
              </div>

              {/* Image Upload Section */}
              <div className="form-group">
                <label>Place Images</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    id="image-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" className="upload-btn">
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </label>
                  
                  {formData.images.length > 0 && (
                    <div className="uploaded-images">
                      {formData.images.map((url, index) => (
                        <div key={index} className="image-preview">
                          <img src={url} alt={`Place ${index + 1}`} />
                          <button
                            onClick={() => removeImage(index)}
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
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="save-btn" disabled={uploading}>
                {editingPlace ? "Update Place" : "Add Place"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Place = {
  id: string;
  name: string;
  category: 'beach' | 'historical' | 'spiritual' | 'adventure' | 'nature';
  distance: string;
  time: string;
  description: string;
  images: string[];
  rating: number;
  highlights: string[];
  location_url?: string;
  created_at?: string;
  updated_at?: string;
};

const CATEGORIES = [
  { id: 'beach', name: 'Beach' },
  { id: 'historical', name: 'Historical' },
  { id: 'spiritual', name: 'Spiritual' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'nature', name: 'Nature' }
] as const;

export default function PlacesManagement() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "beach" as Place['category'],
    distance: "",
    time: "",
    description: "",
    rating: "4.5",
    highlights: "",
    location_url: "",
    images: [] as string[],
  });

  useEffect(() => {
    loadPlaces();

    const subscription = supabase
      .channel('places-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'places'
        },
        (payload) => {
          console.log('Place change detected:', payload);
          loadPlaces();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadPlaces() {
    setLoading(true);
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading places:", error);
    } else if (data) {
      setPlaces(data);
    }
    setLoading(false);
  }

  function openAddModal() {
    setEditingPlace(null);
    setFormData({
      name: "",
      category: "beach",
      distance: "",
      time: "",
      description: "",
      rating: "4.5",
      highlights: "",
      location_url: "",
      images: [],
    });
    setShowModal(true);
  }

  function openEditModal(place: Place) {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      category: place.category,
      distance: place.distance,
      time: place.time,
      description: place.description,
      rating: place.rating.toString(),
      highlights: place.highlights.join(", "),
      location_url: place.location_url || "",
      images: place.images || [],
    });
    setShowModal(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('place-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('place-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(index: number) {
    const imageUrl = formData.images[index];
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    try {
      const { error } = await supabase.storage
        .from('place-images')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting image:', error);
      }

      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Error removing image:', error);
    }
  }

  async function handleSave() {
    if (!formData.name || !formData.distance || !formData.time) {
      alert("Please fill in all required fields");
      return;
    }

    const placeData = {
      name: formData.name,
      category: formData.category,
      distance: formData.distance,
      time: formData.time,
      description: formData.description,
      rating: parseFloat(formData.rating),
      highlights: formData.highlights
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
      location_url: formData.location_url,
      images: formData.images,
    };

    if (editingPlace) {
      const { error } = await supabase
        .from("places")
        .update(placeData)
        .eq("id", editingPlace.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("places").insert(placeData);

      if (error) {
        alert(error.message);
        return;
      }
    }

    setShowModal(false);
    loadPlaces();
  }

  async function handleDelete(place: Place) {
    if (!confirm(`Are you sure you want to delete "${place.name}"?`)) {
      return;
    }

    // Delete images from storage
    if (place.images && place.images.length > 0) {
      for (const imageUrl of place.images) {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        await supabase.storage
          .from('place-images')
          .remove([fileName]);
      }
    }

    const { error } = await supabase.from("places").delete().eq("id", place.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadPlaces();
  }

  return (
    <div className="places-management">
      <div className="page-header">
        <div>
          <h1>Places Management</h1>
          <p>Manage tourist attractions and places to visit</p>
        </div>
        <button onClick={openAddModal} className="add-btn">
          Add New Place
        </button>
      </div>

      {/* Category Stats */}
      <div className="stats-grid">
        {CATEGORIES.map((cat) => {
          const count = places.filter(p => p.category === cat.id).length;
          return (
            <div key={cat.id} className="stat-card">
              <div className="stat-content">
                <p className="stat-label">{cat.name}</p>
                <h3 className="stat-value">{count}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading places...</p>
        </div>
      ) : (
        <div className="places-grid">
          {places.map((place) => (
            <div key={place.id} className="place-card">
              <div className="place-header">
                <div className="place-title">
                  <h3>{place.name}</h3>
                </div>
                <div className="place-actions">
                  <button
                    onClick={() => openEditModal(place)}
                    className="edit-btn"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(place)}
                    className="delete-btn"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {place.images && place.images.length > 0 && (
                <div className="place-images-preview">
                  <img 
                    src={place.images[0]} 
                    alt={place.name}
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  {place.images.length > 1 && (
                    <div className="image-count">
                      {place.images.length} photos
                    </div>
                  )}
                </div>
              )}

              <div className="place-details">
                <div className="detail-row">
                  <span className="detail-badge category">{place.category}</span>
                  <span className="detail-badge rating">Rating: {place.rating}</span>
                </div>

                <div className="detail-item">
                  <span className="label">Distance:</span>
                  <span className="value">{place.distance}</span>
                </div>

                <div className="detail-item">
                  <span className="label">Travel Time:</span>
                  <span className="value">{place.time}</span>
                </div>

                {place.description && (
                  <p className="description">{place.description.slice(0, 100)}...</p>
                )}

                {place.highlights && place.highlights.length > 0 && (
                  <div className="highlights">
                    {place.highlights.slice(0, 3).map((highlight, idx) => (
                      <span key={idx} className="highlight-tag">
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {places.length === 0 && (
            <div className="empty-state">
              <h3>No places yet</h3>
              <p>Add your first place to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlace ? "Edit Place" : "Add New Place"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Place Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Alibag Beach"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as Place['category'] })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Rating (0-5) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    placeholder="4.5"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Distance *</label>
                  <input
                    type="text"
                    value={formData.distance}
                    onChange={(e) =>
                      setFormData({ ...formData, distance: e.target.value })
                    }
                    placeholder="e.g., 3 km"
                  />
                </div>

                <div className="form-group">
                  <label>Travel Time *</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    placeholder="e.g., 10 min"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the place..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Highlights (comma-separated)</label>
                <input
                  type="text"
                  value={formData.highlights}
                  onChange={(e) =>
                    setFormData({ ...formData, highlights: e.target.value })
                  }
                  placeholder="Sunset Views, Water Sports, Horse Riding"
                />
              </div>

              <div className="form-group">
                <label>Google Maps URL</label>
                <input
                  type="url"
                  value={formData.location_url}
                  onChange={(e) =>
                    setFormData({ ...formData, location_url: e.target.value })
                  }
                  placeholder="https://maps.google.com/..."
                />
              </div>

              {/* Image Upload Section */}
              <div className="form-group">
                <label>Place Images</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    id="image-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" className="upload-btn">
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </label>
                  
                  {formData.images.length > 0 && (
                    <div className="uploaded-images">
                      {formData.images.map((url, index) => (
                        <div key={index} className="image-preview">
                          <img src={url} alt={`Place ${index + 1}`} />
                          <button
                            onClick={() => removeImage(index)}
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
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="save-btn" disabled={uploading}>
                {editingPlace ? "Update Place" : "Add Place"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Place = {
  id: string;
  name: string;
  category: 'beach' | 'historical' | 'spiritual' | 'adventure' | 'nature';
  distance: string;
  time: string;
  description: string;
  images: string[];
  rating: number;
  highlights: string[];
  location_url?: string;
  created_at?: string;
  updated_at?: string;
};

const CATEGORIES = [
  { id: 'beach', name: 'Beach' },
  { id: 'historical', name: 'Historical' },
  { id: 'spiritual', name: 'Spiritual' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'nature', name: 'Nature' }
] as const;

export default function PlacesManagement() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "beach" as Place['category'],
    distance: "",
    time: "",
    description: "",
    rating: "4.5",
    highlights: "",
    location_url: "",
    images: [] as string[],
  });

  useEffect(() => {
    loadPlaces();

    const subscription = supabase
      .channel('places-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'places'
        },
        (payload) => {
          console.log('Place change detected:', payload);
          loadPlaces();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadPlaces() {
    setLoading(true);
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading places:", error);
    } else if (data) {
      setPlaces(data);
    }
    setLoading(false);
  }

  function openAddModal() {
    setEditingPlace(null);
    setFormData({
      name: "",
      category: "beach",
      distance: "",
      time: "",
      description: "",
      rating: "4.5",
      highlights: "",
      location_url: "",
      images: [],
    });
    setShowModal(true);
  }

  function openEditModal(place: Place) {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      category: place.category,
      distance: place.distance,
      time: place.time,
      description: place.description,
      rating: place.rating.toString(),
      highlights: place.highlights.join(", "),
      location_url: place.location_url || "",
      images: place.images || [],
    });
    setShowModal(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('place-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('place-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(index: number) {
    const imageUrl = formData.images[index];
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    try {
      const { error } = await supabase.storage
        .from('place-images')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting image:', error);
      }

      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Error removing image:', error);
    }
  }

  async function handleSave() {
    if (!formData.name || !formData.distance || !formData.time) {
      alert("Please fill in all required fields");
      return;
    }

    const placeData = {
      name: formData.name,
      category: formData.category,
      distance: formData.distance,
      time: formData.time,
      description: formData.description,
      rating: parseFloat(formData.rating),
      highlights: formData.highlights
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
      location_url: formData.location_url,
      images: formData.images,
    };

    if (editingPlace) {
      const { error } = await supabase
        .from("places")
        .update(placeData)
        .eq("id", editingPlace.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("places").insert(placeData);

      if (error) {
        alert(error.message);
        return;
      }
    }

    setShowModal(false);
    loadPlaces();
  }

  async function handleDelete(place: Place) {
    if (!confirm(`Are you sure you want to delete "${place.name}"?`)) {
      return;
    }

    // Delete images from storage
    if (place.images && place.images.length > 0) {
      for (const imageUrl of place.images) {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        await supabase.storage
          .from('place-images')
          .remove([fileName]);
      }
    }

    const { error } = await supabase.from("places").delete().eq("id", place.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadPlaces();
  }

  return (
    <div className="places-management">
      <div className="page-header">
        <div>
          <h1>Places Management</h1>
          <p>Manage tourist attractions and places to visit</p>
        </div>
        <button onClick={openAddModal} className="add-btn">
          Add New Place
        </button>
      </div>

      {/* Category Stats */}
      <div className="stats-grid">
        {CATEGORIES.map((cat) => {
          const count = places.filter(p => p.category === cat.id).length;
          return (
            <div key={cat.id} className="stat-card">
              <div className="stat-content">
                <p className="stat-label">{cat.name}</p>
                <h3 className="stat-value">{count}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading places...</p>
        </div>
      ) : (
        <div className="places-grid">
          {places.map((place) => (
            <div key={place.id} className="place-card">
              <div className="place-header">
                <div className="place-title">
                  <h3>{place.name}</h3>
                </div>
                <div className="place-actions">
                  <button
                    onClick={() => openEditModal(place)}
                    className="edit-btn"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(place)}
                    className="delete-btn"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {place.images && place.images.length > 0 && (
                <div className="place-images-preview">
                  <img 
                    src={place.images[0]} 
                    alt={place.name}
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  {place.images.length > 1 && (
                    <div className="image-count">
                      {place.images.length} photos
                    </div>
                  )}
                </div>
              )}

              <div className="place-details">
                <div className="detail-row">
                  <span className="detail-badge category">{place.category}</span>
                  <span className="detail-badge rating">Rating: {place.rating}</span>
                </div>

                <div className="detail-item">
                  <span className="label">Distance:</span>
                  <span className="value">{place.distance}</span>
                </div>

                <div className="detail-item">
                  <span className="label">Travel Time:</span>
                  <span className="value">{place.time}</span>
                </div>

                {place.description && (
                  <p className="description">{place.description.slice(0, 100)}...</p>
                )}

                {place.highlights && place.highlights.length > 0 && (
                  <div className="highlights">
                    {place.highlights.slice(0, 3).map((highlight, idx) => (
                      <span key={idx} className="highlight-tag">
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {places.length === 0 && (
            <div className="empty-state">
              <h3>No places yet</h3>
              <p>Add your first place to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlace ? "Edit Place" : "Add New Place"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Place Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Alibag Beach"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as Place['category'] })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Rating (0-5) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    placeholder="4.5"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Distance *</label>
                  <input
                    type="text"
                    value={formData.distance}
                    onChange={(e) =>
                      setFormData({ ...formData, distance: e.target.value })
                    }
                    placeholder="e.g., 3 km"
                  />
                </div>

                <div className="form-group">
                  <label>Travel Time *</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    placeholder="e.g., 10 min"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the place..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Highlights (comma-separated)</label>
                <input
                  type="text"
                  value={formData.highlights}
                  onChange={(e) =>
                    setFormData({ ...formData, highlights: e.target.value })
                  }
                  placeholder="Sunset Views, Water Sports, Horse Riding"
                />
              </div>

              <div className="form-group">
                <label>Google Maps URL</label>
                <input
                  type="url"
                  value={formData.location_url}
                  onChange={(e) =>
                    setFormData({ ...formData, location_url: e.target.value })
                  }
                  placeholder="https://maps.google.com/..."
                />
              </div>

              {/* Image Upload Section */}
              <div className="form-group">
                <label>Place Images</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    id="image-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" className="upload-btn">
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </label>
                  
                  {formData.images.length > 0 && (
                    <div className="uploaded-images">
                      {formData.images.map((url, index) => (
                        <div key={index} className="image-preview">
                          <img src={url} alt={`Place ${index + 1}`} />
                          <button
                            onClick={() => removeImage(index)}
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
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="save-btn" disabled={uploading}>
                {editingPlace ? "Update Place" : "Add Place"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Place = {
  id: string;
  name: string;
  category: 'beach' | 'historical' | 'spiritual' | 'adventure' | 'nature';
  distance: string;
  time: string;
  description: string;
  images: string[];
  rating: number;
  highlights: string[];
  location_url?: string;
  created_at?: string;
  updated_at?: string;
};

const CATEGORIES = [
  { id: 'beach', name: 'Beach' },
  { id: 'historical', name: 'Historical' },
  { id: 'spiritual', name: 'Spiritual' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'nature', name: 'Nature' }
] as const;

export default function PlacesManagement() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "beach" as Place['category'],
    distance: "",
    time: "",
    description: "",
    rating: "4.5",
    highlights: "",
    location_url: "",
    images: [] as string[],
  });

  useEffect(() => {
    loadPlaces();

    const subscription = supabase
      .channel('places-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'places'
        },
        (payload) => {
          console.log('Place change detected:', payload);
          loadPlaces();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadPlaces() {
    setLoading(true);
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading places:", error);
    } else if (data) {
      setPlaces(data);
    }
    setLoading(false);
  }

  function openAddModal() {
    setEditingPlace(null);
    setFormData({
      name: "",
      category: "beach",
      distance: "",
      time: "",
      description: "",
      rating: "4.5",
      highlights: "",
      location_url: "",
      images: [],
    });
    setShowModal(true);
  }

  function openEditModal(place: Place) {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      category: place.category,
      distance: place.distance,
      time: place.time,
      description: place.description,
      rating: place.rating.toString(),
      highlights: place.highlights.join(", "),
      location_url: place.location_url || "",
      images: place.images || [],
    });
    setShowModal(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('place-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('place-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(index: number) {
    const imageUrl = formData.images[index];
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    try {
      const { error } = await supabase.storage
        .from('place-images')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting image:', error);
      }

      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Error removing image:', error);
    }
  }

  async function handleSave() {
    if (!formData.name || !formData.distance || !formData.time) {
      alert("Please fill in all required fields");
      return;
    }

    const placeData = {
      name: formData.name,
      category: formData.category,
      distance: formData.distance,
      time: formData.time,
      description: formData.description,
      rating: parseFloat(formData.rating),
      highlights: formData.highlights
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
      location_url: formData.location_url,
      images: formData.images,
    };

    if (editingPlace) {
      const { error } = await supabase
        .from("places")
        .update(placeData)
        .eq("id", editingPlace.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("places").insert(placeData);

      if (error) {
        alert(error.message);
        return;
      }
    }

    setShowModal(false);
    loadPlaces();
  }

  async function handleDelete(place: Place) {
    if (!confirm(`Are you sure you want to delete "${place.name}"?`)) {
      return;
    }

    // Delete images from storage
    if (place.images && place.images.length > 0) {
      for (const imageUrl of place.images) {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        await supabase.storage
          .from('place-images')
          .remove([fileName]);
      }
    }

    const { error } = await supabase.from("places").delete().eq("id", place.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadPlaces();
  }

  return (
    <div className="places-management">
      <div className="page-header">
        <div>
          <h1>Places Management</h1>
          <p>Manage tourist attractions and places to visit</p>
        </div>
        <button onClick={openAddModal} className="add-btn">
          Add New Place
        </button>
      </div>

      {/* Category Stats */}
      <div className="stats-grid">
        {CATEGORIES.map((cat) => {
          const count = places.filter(p => p.category === cat.id).length;
          return (
            <div key={cat.id} className="stat-card">
              <div className="stat-content">
                <p className="stat-label">{cat.name}</p>
                <h3 className="stat-value">{count}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading places...</p>
        </div>
      ) : (
        <div className="places-grid">
          {places.map((place) => (
            <div key={place.id} className="place-card">
              <div className="place-header">
                <div className="place-title">
                  <h3>{place.name}</h3>
                </div>
                <div className="place-actions">
                  <button
                    onClick={() => openEditModal(place)}
                    className="edit-btn"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(place)}
                    className="delete-btn"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {place.images && place.images.length > 0 && (
                <div className="place-images-preview">
                  <img 
                    src={place.images[0]} 
                    alt={place.name}
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  {place.images.length > 1 && (
                    <div className="image-count">
                      {place.images.length} photos
                    </div>
                  )}
                </div>
              )}

              <div className="place-details">
                <div className="detail-row">
                  <span className="detail-badge category">{place.category}</span>
                  <span className="detail-badge rating">Rating: {place.rating}</span>
                </div>

                <div className="detail-item">
                  <span className="label">Distance:</span>
                  <span className="value">{place.distance}</span>
                </div>

                <div className="detail-item">
                  <span className="label">Travel Time:</span>
                  <span className="value">{place.time}</span>
                </div>

                {place.description && (
                  <p className="description">{place.description.slice(0, 100)}...</p>
                )}

                {place.highlights && place.highlights.length > 0 && (
                  <div className="highlights">
                    {place.highlights.slice(0, 3).map((highlight, idx) => (
                      <span key={idx} className="highlight-tag">
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {places.length === 0 && (
            <div className="empty-state">
              <h3>No places yet</h3>
              <p>Add your first place to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlace ? "Edit Place" : "Add New Place"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Place Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Alibag Beach"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as Place['category'] })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Rating (0-5) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    placeholder="4.5"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Distance *</label>
                  <input
                    type="text"
                    value={formData.distance}
                    onChange={(e) =>
                      setFormData({ ...formData, distance: e.target.value })
                    }
                    placeholder="e.g., 3 km"
                  />
                </div>

                <div className="form-group">
                  <label>Travel Time *</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    placeholder="e.g., 10 min"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the place..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Highlights (comma-separated)</label>
                <input
                  type="text"
                  value={formData.highlights}
                  onChange={(e) =>
                    setFormData({ ...formData, highlights: e.target.value })
                  }
                  placeholder="Sunset Views, Water Sports, Horse Riding"
                />
              </div>

              <div className="form-group">
                <label>Google Maps URL</label>
                <input
                  type="url"
                  value={formData.location_url}
                  onChange={(e) =>
                    setFormData({ ...formData, location_url: e.target.value })
                  }
                  placeholder="https://maps.google.com/..."
                />
              </div>

              {/* Image Upload Section */}
              <div className="form-group">
                <label>Place Images</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    id="image-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" className="upload-btn">
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </label>
                  
                  {formData.images.length > 0 && (
                    <div className="uploaded-images">
                      {formData.images.map((url, index) => (
                        <div key={index} className="image-preview">
                          <img src={url} alt={`Place ${index + 1}`} />
                          <button
                            onClick={() => removeImage(index)}
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
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="save-btn" disabled={uploading}>
                {editingPlace ? "Update Place" : "Add Place"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlace ? "Edit Place" : "Add New Place"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Place Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Alibag Beach"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as Place['category'] })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Rating (0-5) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    placeholder="4.5"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Distance *</label>
                  <input
                    type="text"
                    value={formData.distance}
                    onChange={(e) =>
                      setFormData({ ...formData, distance: e.target.value })
                    }
                    placeholder="e.g., 3 km"
                  />
                </div>

                <div className="form-group">
                  <label>Travel Time *</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    placeholder="e.g., 10 min"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the place..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Highlights (comma-separated)</label>
                <input
                  type="text"
                  value={formData.highlights}
                  onChange={(e) =>
                    setFormData({ ...formData, highlights: e.target.value })
                  }
                  placeholder="Sunset Views, Water Sports, Horse Riding"
                />
              </div>

              <div className="form-group">
                <label>Google Maps URL</label>
                <input
                  type="url"
                  value={formData.location_url}
                  onChange={(e) =>
                    setFormData({ ...formData, location_url: e.target.value })
                  }
                  placeholder="https://maps.google.com/..."
                />
              </div>

              {/* Image Upload Section */}
              <div className="form-group">
                <label>Place Images</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    id="image-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" className="upload-btn">
                    {uploading ? '⏳ Uploading...' : '📤 Upload Images'}
                  </label>
                  
                  {formData.images.length > 0 && (
                    <div className="uploaded-images">
                      {formData.images.map((url, index) => (
                        <div key={index} className="image-preview">
                          <img src={url} alt={`Place ${index + 1}`} />
                          <button
                            onClick={() => removeImage(index)}
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
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="save-btn" disabled={uploading}>
                {editingPlace ? "Update Place" : "Add Place"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .places-management {
          max-width: 1400px;
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

        .add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3);
        }

        .add-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.5);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 16px;
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .stat-icon {
          font-size: 2.5rem;
        }

        .stat-label {
          color: #94a3b8;
          font-size: 0.875rem;
          margin: 0 0 0.25rem 0;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

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

        .places-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .place-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .place-card:hover {
          transform: translateY(-5px);
          border-color: #f97316;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3);
        }

        .place-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
        }

        .place-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .category-icon {
          font-size: 2rem;
        }

        .place-title h3 {
          font-size: 1.5rem;
          color: #f97316;
          margin: 0;
        }

        .place-actions {
          display: flex;
          gap: 0.5rem;
        }

        .edit-btn,
        .delete-btn {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s;
        }

        .edit-btn {
          background: rgba(59, 130, 246, 0.2);
        }

        .edit-btn:hover {
          background: rgba(59, 130, 246, 0.3);
          transform: scale(1.1);
        }

        .delete-btn {
          background: rgba(239, 68, 68, 0.2);
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          transform: scale(1.1);
        }

        .place-images-preview {
          position: relative;
          margin-bottom: 1rem;
        }

        .image-count {
          position: absolute;
          bottom: 0.5rem;
          right: 0.5rem;
          background: rgba(15, 23, 42, 0.9);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          color: white;
          backdrop-filter: blur(10px);
        }

        .place-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .detail-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .detail-badge.category {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          text-transform: capitalize;
        }

        .detail-badge.rating {
          background: rgba(234, 179, 8, 0.2);
          color: #fbbf24;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.95rem;
        }

        .label {
          color: #94a3b8;
        }

        .value {
          color: white;
          font-weight: 600;
        }

        .description {
          color: #cbd5e1;
          line-height: 1.6;
          margin: 0.5rem 0;
        }

        .highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .highlight-tag {
          padding: 0.375rem 0.75rem;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 12px;
          color: #f97316;
          font-size: 0.85rem;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          font-size: 5rem;
          display: block;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          color: white;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #94a3b8;
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
          max-width: 600px;
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        input,
        textarea,
        select {
          width: 100%;
          padding: 0.875rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s;
        }

        input:focus,
        textarea:focus,
        select:focus {
          outline: none;
          border-color: #f97316;
          background: rgba(255, 255, 255, 0.15);
        }

        textarea {
          resize: vertical;
        }

        select option {
          background: #1e293b;
          color: white;
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
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .places-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .page-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
