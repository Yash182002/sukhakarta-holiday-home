"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Room = {
  id: string;
  name: string;
  base_price: number;
  max_guests: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  created_at?: string;
};

export default function RoomsManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    base_price: "",
    max_guests: "",
    description: "",
    amenities: "",
    images: [] as string[],
  });

  useEffect(() => {
    loadRooms();

    // Set up real-time subscription
    const subscription = supabase
      .channel('rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        (payload) => {
          console.log('Room change detected:', payload);
          loadRooms();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadRooms() {
    setLoading(true);
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) setRooms(data);
    setLoading(false);
  }

  function openAddModal() {
    setEditingRoom(null);
    setFormData({
      name: "",
      base_price: "",
      max_guests: "",
      description: "",
      amenities: "",
      images: [],
    });
    setShowModal(true);
  }

  function openEditModal(room: Room) {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      base_price: room.base_price.toString(),
      max_guests: room.max_guests.toString(),
      description: room.description || "",
      amenities: room.amenities?.join(", ") || "",
      images: room.images || [],
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
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('room-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('room-images')
          .getPublicUrl(filePath);

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
    
    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    try {
      // Delete from storage
      const { error } = await supabase.storage
        .from('room-images')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting image:', error);
      }

      // Remove from formData
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Error removing image:', error);
    }
  }

  async function handleSave() {
    if (!formData.name || !formData.base_price || !formData.max_guests) {
      alert("Please fill in all required fields");
      return;
    }

    const roomData = {
      name: formData.name,
      base_price: parseFloat(formData.base_price),
      max_guests: parseInt(formData.max_guests),
      description: formData.description,
      amenities: formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      images: formData.images,
    };

    if (editingRoom) {
      // Update existing room
      const { error } = await supabase
        .from("rooms")
        .update(roomData)
        .eq("id", editingRoom.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      // Create new room
      const { error } = await supabase.from("rooms").insert(roomData);

      if (error) {
        alert(error.message);
        return;
      }
    }

    setShowModal(false);
    loadRooms();
  }

  async function handleDelete(room: Room) {
    if (!confirm(`Are you sure you want to delete "${room.name}"?`)) {
      return;
    }

    // Delete images from storage
    if (room.images && room.images.length > 0) {
      for (const imageUrl of room.images) {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        await supabase.storage
          .from('room-images')
          .remove([fileName]);
      }
    }

    const { error } = await supabase.from("rooms").delete().eq("id", room.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadRooms();
  }

  return (
    <div className="rooms-management">
      <div className="page-header">
        <div>
          <h1>Rooms Management</h1>
          <p>Manage your property rooms and pricing</p>
        </div>
        <button onClick={openAddModal} className="add-btn">
          <span>➕</span>
          <span>Add New Room</span>
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading rooms...</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-header">
                <h3>{room.name}</h3>
                <div className="room-actions">
                  <button
                    onClick={() => openEditModal(room)}
                    className="edit-btn"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(room)}
                    className="delete-btn"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {room.images && room.images.length > 0 && (
                <div className="room-images-preview">
                  <img 
                    src={room.images[0]} 
                    alt={room.name}
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  {room.images.length > 1 && (
                    <div className="image-count">
                      +{room.images.length - 1} more
                    </div>
                  )}
                </div>
              )}

              <div className="room-details">
                <div className="detail-item">
                  <span className="label">Price per night:</span>
                  <span className="value">₹{room.base_price}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Max guests:</span>
                  <span className="value">{room.max_guests} people</span>
                </div>
                {room.description && (
                  <div className="detail-item full">
                    <span className="label">Description:</span>
                    <p className="description">{room.description}</p>
                  </div>
                )}
                {room.amenities && room.amenities.length > 0 && (
                  <div className="detail-item full">
                    <span className="label">Amenities:</span>
                    <div className="amenities">
                      {room.amenities.map((amenity, idx) => (
                        <span key={idx} className="amenity-tag">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {rooms.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">🏨</span>
              <h3>No rooms yet</h3>
              <p>Add your first room to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRoom ? "Edit Room" : "Add New Room"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Room Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Deluxe Sea View"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price per Night (₹) *</label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) =>
                      setFormData({ ...formData, base_price: e.target.value })
                    }
                    placeholder="2500"
                  />
                </div>

                <div className="form-group">
                  <label>Max Guests *</label>
                  <input
                    type="number"
                    value={formData.max_guests}
                    onChange={(e) =>
                      setFormData({ ...formData, max_guests: e.target.value })
                    }
                    placeholder="2"
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
                  placeholder="Describe the room..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Amenities (comma-separated)</label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) =>
                    setFormData({ ...formData, amenities: e.target.value })
                  }
                  placeholder="WiFi, AC, TV, Mini Fridge"
                />
              </div>

              {/* Image Upload Section */}
              <div className="form-group">
                <label>Room Images</label>
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
                          <img src={url} alt={`Room ${index + 1}`} />
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
                {editingRoom ? "Update Room" : "Add Room"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .rooms-management {
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

        .rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .room-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .room-card:hover {
          transform: translateY(-5px);
          border-color: #f97316;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3);
        }

        .room-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
        }

        .room-header h3 {
          font-size: 1.5rem;
          color: #f97316;
          margin: 0;
        }

        .room-actions {
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

        .room-images-preview {
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
        }

        .room-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-item.full {
          flex-direction: column;
          align-items: flex-start;
        }

        .label {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .value {
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .description {
          color: #cbd5e1;
          margin: 0.5rem 0 0 0;
          line-height: 1.6;
        }

        .amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .amenity-tag {
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
        textarea {
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
        textarea:focus {
          outline: none;
          border-color: #f97316;
          background: rgba(255, 255, 255, 0.15);
        }

        textarea {
          resize: vertical;
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
          .rooms-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .page-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
