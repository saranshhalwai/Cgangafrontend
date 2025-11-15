import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
interface Post {
  id: number;
  title: string;
  content: string;
  image: string | null;
  date: string;
  username?: string;
}

interface GalleryItem {
  id: number;
  src: string;
  caption: string;
}

interface EventItem {
  id: number;
  name: string;
  date: string;
  location: string;
}

const API_BASE = "http://127.0.0.1:8000"; // set to your API base if needed, e.g. "https://api.example.com"

const UpdatePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const navigate = useNavigate();
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImageFile, setPostImageFile] = useState<File | null>(null);

  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryCaption, setGalleryCaption] = useState("");

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [currentUser, setCurrentUser] = useState("");

useEffect(() => {
  fetch(`${API_BASE}/simple_user`)
    .then(res => res.json())
    .then(data => setCurrentUser(data.username));
}, []);

  // UI state
  const [loading, setLoading] = useState(false); // global network activity
  const [posting, setPosting] = useState(false); // posting-specific flag

  // stable min heights to avoid layout shift
  const containerMinHeight = { minHeight: "180px" };

  // Escape html utility
  const escapeHtml = (text: string) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  // --- Fetch initial data from server ---
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Posts (GET /posts) — assumed endpoint
        const postsRes = await fetch(`${API_BASE}/posts`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(Array.isArray(postsData) ? postsData : []);
        } else {
          // fallback: keep empty
          console.warn("GET /posts failed", postsRes.status);
        }

        // Gallery (GET /gallery)
        const galleryRes = await fetch(`${API_BASE}/gallery`);
        if (galleryRes.ok) {
          const galleryData = await galleryRes.json();
          setGalleryImages(Array.isArray(galleryData) ? galleryData : []);
        }

        // Events (GET /events)
        const eventsRes = await fetch(`${API_BASE}/events`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(Array.isArray(eventsData) ? eventsData : []);
        }
      } catch (err) {
        console.error("Initial fetch failed", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- Helpers for converting File -> base64 data URL ---
  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });

  // -------------------------
  // POSTS: create / update / delete
  // -------------------------
  const addPost = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      alert("Please enter both title and content");
      return;
    }
    setPosting(true);
    setLoading(true);

    try {
      const newPost: Partial<Post> = {
        title: postTitle.trim(),
        content: postContent.trim(),
        date: new Date().toISOString(),
        image: null,
        username: currentUser, // change or make dynamic
      };

      // If user selected file, convert to base64 (assumption: backend accepts base64 string in `image`)
      if (postImageFile) {
        const dataUrl = await fileToDataUrl(postImageFile);
        newPost.image = dataUrl;
      }

      // POST /posts
      const res = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Create post failed: ${res.status} ${JSON.stringify(err)}`);
      }

      const created = await res.json();
      // prepend to UI list (created should be server object with id/date)
      setPosts((p) => [created, ...p]);
      alert("Post created");
      // clear form
      setPostTitle("");
      setPostContent("");
      setPostImageFile(null);
    } catch (err: any) {
      console.error(err);
      alert("Failed to create post. See console for details.");
    } finally {
      setPosting(false);
      setLoading(false);
    }
  };

  const updatePost = async (postId: number, changes: Partial<Post>) => {
    setLoading(true);
    try {
      // PUT /posts/{id}
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      alert("Post updated");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: number) => {
    if (!confirm("Delete this post? This action cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      // server returns maybe string; remove locally
      setPosts((prev) => prev.filter((p) => p.id !== id));
      alert("Deleted");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // GALLERY
  // -------------------------
  const addGalleryImage = async () => {
    if (!galleryFile) {
      alert("Please select an image");
      return;
    }
    setLoading(true);
    try {
      const src = await fileToDataUrl(galleryFile);
      const payload = { src, caption: galleryCaption.trim() || "Untitled" };

      const res = await fetch(`${API_BASE}/gallery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gallery upload failed");
      const created = await res.json();
      setGalleryImages((g) => [created, ...g]);
      setGalleryFile(null);
      setGalleryCaption("");
      alert("Uploaded to gallery");
    } catch (err) {
      console.error(err);
      alert("Gallery upload failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // EVENTS
  // -------------------------
  const addEvent = async () => {
    if (!eventName.trim() || !eventDate || !eventLocation.trim()) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const payload = { name: eventName.trim(), date: eventDate, location: eventLocation.trim() };
      const res = await fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Add event failed");
      const created = await res.json();
      setEvents((ev) => [...ev, created].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setEventName("");
      setEventDate("");
      setEventLocation("");
      alert("Event added");
    } catch (err) {
      console.error(err);
      alert("Add event failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm("Delete this event?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete event failed");
      setEvents((prev) => prev.filter((e) => e.id !== id));
      alert("Event deleted");
    } catch (err) {
      console.error(err);
      alert("Delete event failed");
    } finally {
      setLoading(false);
    }
  };

  // Modal
  const openModal = (src: string) => setModalSrc(src);
  const closeModal = () => setModalSrc(null);

  // Local edit/save for posts (client-side editing UI)
  const handleSaveEditedPost = async (edited: Post) => {
    // If image is not changed we can send the same object. For larger changes you'd convert file -> base64 and include.
    await updatePost(edited.id, edited);
  };

  // --- JSX ---
  return (
    <>
      {/* Inline CSS: gradient background and layout */}
     <style>{`
  /* Global reset */
  * {
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    background: linear-gradient(to bottom, #d4f4dd, #ffffff) !important;
    background-attachment: fixed;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }

  /* Page wrapper */
  .page {
    min-height: 100vh;
    padding: 28px 12px;
    width: 100%;
    background: transparent !important; /* ensure Gradient shows behind */
  }

  /* Layout containers */
  .container {
    max-width: 1100px;
    margin: 0 auto;
    width: 100%;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    gap: 12px;
  }

  .header h1 {
    margin: 0;
    font-size: 1.6rem;
    color: #12411b;
  }

  .subtitle {
    color: #4b5563;
  }

  .layout {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 20px;
  }

  @media (max-width: 980px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }

  /* Cards */
  .card {
    background: #fff;
    border-radius: 10px;
    min-height: 10vh;
    padding: 16px;
    box-shadow: 0 6px 18px rgba(12, 20, 15, 0.06);
  }

  .section-title {
    font-weight: 600;
    margin-bottom: 12px;
    color: #0b3920;
  }

  /* Form elements */
  .form-row {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }

  .full {
    width: 100%;
  }

  input[type="text"],
  textarea,
  input[type="datetime-local"] {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    font-size: 14px;
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }

  /* Buttons */
  .btn {
    padding: 10px 14px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
  }

  .btn-primary {
    background: #0b8a4a;
    color: white;
  }

  .btn-secondary {
    background: #edf2f7;
    color: #111;
  }

  .small {
    padding: 8px 10px;
    font-size: 13px;
  }

  /* Posts */
  .posts-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 220px;
  }

  .post-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .post-meta {
    display: flex;
    gap: 10px;
    color: #6b7280;
    font-size: 13px;
  }

  .post-image {
    width: 100%;
    max-height: 360px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
  }

  /* Gallery */
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
    min-height: 120px;
  }

  .gallery-thumb {
    width: 100%;
    height: 100px;
    object-fit: cover;
    border-radius: 6px;
    cursor: pointer;
  }

  /* Events */
  .events-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 120px;
  }

  .event-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  .muted {
    color: #6b7280;
    font-size: 13px;
  }

  /* Spinner overlay — hidden by default */
  .overlay {
    position: fixed;
    inset: 0;
    display: none; /* ONLY visible when you add .active */
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.25);
    z-index: 1200;
  }

  .overlay.active {
    display: flex;
  }

  .spinner {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 6px solid rgba(255,255,255,0.25);
    border-top-color: white;
    animation: spin 1s linear infinite;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Helpers */
  .right-column-fix {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .caption {
    font-size: 13px;
    color: #374151;
  }

  .controls-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .danger {
    background: #ef4444;
    color: white;
  }
`}</style>
 <button
        onClick={() => navigate("/dashboard")}
        className="self-start mb-6 px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
      >
        ← Back to Dashboard
      </button>
      <div className="page">
        <div className="container">
          <div className="header">
            <div>
              <h1>Update Info Here!</h1>
              <div className="subtitle">Collaborate, share and make a difference</div>
            </div>
          </div>

          <div className="layout">
            {/* Left: main (posts, gallery, events list) */}
            <div>
              {/* POSTS card */}
              <div className="card" style={containerMinHeight}>
                <div className="section-title">Environmental Updates</div>

                <div style={{ marginBottom: 12 }}>
                  <input
                    className="full"
                    type="text"
                    placeholder="Post title"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    disabled={loading || posting}
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <textarea
                    className="full"
                    placeholder="Share environmental news or updates..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    disabled={loading || posting}
                  />
                </div>

                <div className="form-row" style={{ alignItems: "center", marginBottom: 12 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPostImageFile(e.target.files?.[0] || null)}
                    disabled={loading || posting}
                  />
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-primary"
                      onClick={addPost}
                      disabled={loading || posting}
                    >
                      Post Update
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setPostTitle("");
                        setPostContent("");
                        setPostImageFile(null);
                      }}
                      disabled={loading || posting}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="posts-list" aria-live="polite">
                  {posts.length === 0 ? (
                    <div className="muted">No posts yet.</div>
                  ) : (
                    posts
                      .slice()
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((p) => (
                        <PostCardCompact
                          key={p.id}
                          post={p}
                          onDelete={deletePost}
                          onSave={handleSaveEditedPost}
                          onImageClick={openModal}
                        />
                      ))
                  )}
                </div>
              </div>

              {/* GALLERY card */}
              <div className="card" style={{ marginTop: 16 }}>
                <div className="section-title">Activity Gallery</div>

                <div className="form-row" style={{ marginBottom: 12 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setGalleryFile(e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    className="full"
                    value={galleryCaption}
                    onChange={(e) => setGalleryCaption(e.target.value)}
                    disabled={loading}
                  />
                  <button className="btn btn-primary" onClick={addGalleryImage} disabled={loading}>
                    Upload
                  </button>
                </div>

                <div className="gallery-grid">
                  {galleryImages.length === 0 ? (
                    <div className="muted">No images yet</div>
                  ) : (
                    galleryImages.map((g) => (
                      <div key={g.id}>
                        <img
                          src={g.src}
                          alt={g.caption}
                          className="gallery-thumb"
                          onClick={() => openModal(g.src)}
                        />
                        <div className="caption">{g.caption}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* EVENTS card */}
              <div className="card" style={{ marginTop: 16 }}>
                <div className="section-title">Upcoming Events</div>

                <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
                  <input
                    type="text"
                    placeholder="Event name"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    disabled={loading}
                  />
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Location"
                    className="full"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    disabled={loading}
                  />
                  <button className="btn btn-primary" onClick={addEvent} disabled={loading}>
                    Add
                  </button>
                </div>

                <div className="events-list" style={{ marginTop: 12 }}>
                  {events.length === 0 ? (
                    <div className="muted">No upcoming events</div>
                  ) : (
                    events
                      .slice()
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((ev) => (
                        <div className="event-row card" key={ev.id}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{escapeHtml(ev.name)}</div>
                            <div className="muted">{new Date(ev.date).toLocaleString()}</div>
                            <div className="muted">📍 {escapeHtml(ev.location)}</div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              className="btn small"
                              onClick={() => {
                                // quick add to calendar or copy link - placeholder
                                alert("Not implemented");
                              }}
                            >
                              Details
                            </button>
                            <button className="btn danger small" onClick={() => deleteEvent(ev.id)}>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Right column: control panel (keeps stable white area) */}
            <aside className="right-column-fix">
              <div className="card">
                <div className="section-title">Status</div>
                <div className="caption">Network: {loading ? "Busy" : "Idle"}</div>
                <div style={{ marginTop: 12 }}>
                  <div className="caption">Quick actions</div>
                  <div style={{ marginTop: 8 }} className="controls-row">
                    <button
                      className="btn small"
                      onClick={() => {
                        // refresh lists
                        (async () => {
                          setLoading(true);
                          try {
                            const [pRes, gRes, eRes] = await Promise.all([
                              fetch(`${API_BASE}/posts`),
                              fetch(`${API_BASE}/gallery`),
                              fetch(`${API_BASE}/events`),
                            ]);
                            if (pRes.ok) setPosts(await pRes.json());
                            if (gRes.ok) setGalleryImages(await gRes.json());
                            if (eRes.ok) setEvents(await eRes.json());
                            alert("Refreshed");
                          } catch (err) {
                            console.error(err);
                            alert("Refresh failed");
                          } finally {
                            setLoading(false);
                          }
                        })();
                      }}
                    >
                      Refresh
                    </button>

                    <button
                      className="btn small"
                      onClick={() => {
                        setPosts([]);
                        setGalleryImages([]);
                        setEvents([]);
                        alert("Cleared UI (not server)");
                      }}
                    >
                      Clear UI
                    </button>
                  </div>
                </div>
              </div>

            </aside>
          </div>
        </div>

        {/* Modal for viewing images */}
        {modalSrc && (
          <div
            className="overlay"
            onClick={() => {
              closeModal();
            }}
          >
            <div
              className="card"
              style={{ maxWidth: 920, width: "92%", padding: 12 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setModalSrc(null)}>
                  Close
                </button>
              </div>
              <img src={modalSrc} alt="full" style={{ width: "100%", borderRadius: 8 }} />
            </div>
          </div>
        )}

        {/* Loading overlay spinner */}
        {loading && (
          <div className="overlay" aria-hidden>
            <div className="spinner" />
          </div>
        )}
      </div>
    </>
  );
};

export default UpdatePage;

/* --------------------------
   Compact PostCard component
   (keeps code inline below)
   -------------------------- */

interface PostCardProps {
  post: Post;
  onDelete: (id: number) => void;
  onSave: (post: Post) => void;
  onImageClick: (src: string) => void;
}

const PostCardCompact: React.FC<PostCardProps> = ({ post, onDelete, onSave, onImageClick }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setTitle(post.title);
    setContent(post.content);
  }, [post]);

  const save = () => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content required");
      return;
    }
    onSave({ ...post, title, content });
    setEditing(false);
  };

  return (
    <div className="post-item card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        {editing ? (
          <input className="full" value={title} onChange={(e) => setTitle(e.target.value)} />
        ) : (
          <div style={{ fontWeight: 700 }}>{title}</div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          {!editing ? (
            <>
              <button className="btn small" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button
                className="btn small"
                onClick={() => {
                  onDelete(post.id);
                }}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button className="btn small" onClick={save}>
                Save
              </button>
              <button className="btn small" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="post-meta">
        <div>By: {post.username ?? "Unknown"}</div>
        <div>{new Date(post.date).toLocaleString()}</div>
      </div>

      {post.image && (
        <img src={post.image} alt="post" className="post-image" onClick={() => onImageClick(post.image!)} />
      )}

      <div style={{ marginTop: 6 }}>
        {editing ? (
          <textarea className="full" value={content} onChange={(e) => setContent(e.target.value)} />
        ) : (
          <>
            <div>
              {expanded || post.content.length < 300 ? post.content : post.content.slice(0, 300) + "..."}
            </div>
            {post.content.length > 300 && (
              <button className="btn small" onClick={() => setExpanded((s) => !s)}>
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
