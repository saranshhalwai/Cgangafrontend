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

const API_BASE = "http://127.0.0.1:8000"; 

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
  const [loading, setLoading] = useState(false); 
  const [posting, setPosting] = useState(false); 

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
        username: currentUser, 
      };

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
    await updatePost(edited.id, edited);
  };

  // --- JSX ---
  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-[#34A0A4] to-[#52B788]">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate("/dashboard")} className="mb-6 px-4 py-2 bg-[#52B788] text-white rounded-lg shadow hover:bg-[#40916C] transition">
          ← Back to Dashboard
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Post creation */}
          <div className="bg-white/95 dark:bg-[#062a3a] p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">Create Post</h3>
            <input className="w-full p-2 border rounded mb-2" placeholder="Title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
            <textarea className="w-full p-2 border rounded mb-2 bg-white dark:bg-[#0b2a36] text-slate-900 dark:text-white" placeholder="Content" value={postContent} onChange={(e) => setPostContent(e.target.value)} />
            <input type="file" accept="image/*" onChange={(e) => setPostImageFile(e.target.files?.[0] ?? null)} />
            <div className="mt-2 flex gap-2">
              <button onClick={addPost} className="px-4 py-2 bg-primary text-white rounded">
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>

          {/* Gallery & Events */}
          <div className="space-y-4">
            <div className="bg-white/95 dark:bg-[#062a3a] p-4 rounded-xl shadow">
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">Upload to Gallery</h3>
              <input type="file" accept="image/*" onChange={(e) => setGalleryFile(e.target.files?.[0] ?? null)} />
              <input className="w-full p-2 border rounded my-2" placeholder="Caption" value={galleryCaption} onChange={(e) => setGalleryCaption(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={addGalleryImage} className="px-3 py-1 bg-primary text-white rounded">
                  Upload
                </button>
              </div>
            </div>

            <div className="bg-white/95 dark:bg-[#062a3a] p-4 rounded-xl shadow">
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">Schedule Event</h3>
              <input className="w-full p-2 border rounded mb-2" placeholder="Event name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
              <input type="datetime-local" className="w-full p-2 border rounded mb-2" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              <input className="w-full p-2 border rounded mb-2" placeholder="Location" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={addEvent} className="px-3 py-1 bg-primary text-white rounded">
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Existing posts list */}
        <div className="mt-6">
          <h3 className="font-semibold text-white">Existing Posts</h3>
          <div className="space-y-3 mt-3">
            {posts.map((p) => (
              <div key={p.id} className="bg-white/95 dark:bg-[#062a3a] p-3 rounded-md shadow flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{p.title}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{p.username} - {p.date}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={() => openModal(p.image ?? '')}>
                    View
                  </button>
                  <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => deletePost(p.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalSrc && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white dark:bg-[#071722] p-4 rounded-md max-w-[90%] max-h-[90%] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button className="float-right text-xl" onClick={closeModal}>
              &times;
            </button>
            {modalSrc && <img src={modalSrc} className="w-full h-auto rounded-md" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatePage;

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
