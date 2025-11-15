import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE = "http://127.0.0.1:8000"; // ← your backend

// ================= Interfaces ===================
interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  date: string;
  image?: string;
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
// ======================================================
// MAIN PAGE
// ======================================================
const ViewPage: React.FC = () => {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const navigate = useNavigate();
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Utility
  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const truncateContent = (content: string, maxLength = 300) =>
    content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;

  // Delete & Save locally
  const handleDelete = (id: number) => {
    if (!confirm("Delete this post?")) return;
    const updated = allPosts.filter((p) => p.id !== id);
    setAllPosts(updated);
    setFilteredPosts(updated);
  };

  const handleSave = (updatedPost: Post) => {
    const updated = allPosts.map((p) =>
      p.id === updatedPost.id ? updatedPost : p
    );
    setAllPosts(updated);
    setFilteredPosts(updated);
  };

  // Search
  const handleSearch = () => {
    const term = searchTerm.toLowerCase();
    const results = allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(term) ||
        post.username.toLowerCase().includes(term)
    );
    setFilteredPosts(results);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredPosts(allPosts);
  };
 const [currentUser, setCurrentUser] = useState("");

useEffect(() => {
  fetch(`${API_BASE}/simple_user`)
    .then(res => res.json())
    .then(data => setCurrentUser(data.username));
}, []);

  // Modal
  const openModal = (image: string) => setModalImage(image);
  const closeModal = () => setModalImage(null);

  // ================================
  // FETCH GET ENDPOINTS FROM BACKEND
  // ================================
  useEffect(() => {
    // GET POSTS
    fetch(`${API_BASE}/posts`)
      .then((res) => res.json())
      .then((data) => {
        setAllPosts(data);
        setFilteredPosts(data);
      })
      .catch(() => console.log("Error loading posts"));

    // GET GALLERY
    fetch(`${API_BASE}/gallery`)
      .then((res) => res.json())
      .then((data) => setGallery(data))
      .catch(() => console.log("Error loading gallery"));

    // GET EVENTS
    fetch(`${API_BASE}/events`)
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch(() => console.log("Error loading events"));
  }, []);

  return (
    <div className="container">
      {/* INLINE CSS */}
      <style>{`
        body {
          background: linear-gradient(to bottom, #d4f4dd, #ffffff);
          font-family: Arial, sans-serif;
        }
        .container { max-width: 900px; margin: 0 auto; padding: 20px; }

        .header { text-align: center; padding: 20px; }
        .header h1 { font-size: 32px; margin-bottom: 5px; }
        .subtitle { color: gray; }

        .search-section { display: flex; justify-content: center; margin-bottom: 20px; }
        .search-box { display: flex; gap: 10px; }

        .search-input { padding: 10px; width: 250px; border-radius: 5px; border: 1px solid #ccc; }
        .search-btn { padding: 10px 14px; background: #007bff; color: white; border-radius: 5px; border: none; }
        .clear-btn { padding: 10px 14px; background: #ccc; border-radius: 5px; border: none; }

        .posts-container { display: flex; flex-direction: column; gap: 20px; }
        .post-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .gallery-section, .events-section {
          background: white;
          padding: 20px;
          border-radius: 10px;
          margin-top: 30px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
        }

        .gallery-img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 10px;
          cursor: pointer;
        }

        .event-item {
          padding: 10px 0;
          border-bottom: 1px solid #ddd;
        }

        .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; }
        .modal-content {
          background: white; padding: 20px; border-radius: 10px;
          max-width: 90%; max-height: 90%;
        }
        .modal-image { width: 100%; border-radius: 10px; }
        .close-btn { font-size: 28px; cursor: pointer; float: right; }
      `}</style>
    <button
        onClick={() => navigate("/dashboard")}
        className="self-start mb-6 px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
      >
        ← Back to Dashboard
      </button>
      {/* Header */}
      <header className="header">
        <h1>Posts & Updates</h1>
        <p className="subtitle">View posts, gallery & events</p>
      </header>

      {/* Search */}
      <div className="search-section">
        <div className="search-box">
          <input
            className="search-input"
            placeholder="Search by title or username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>Search</button>
          <button className="clear-btn" onClick={clearSearch}>Clear</button>
        </div>
      </div>

      {/* POSTS */}
      <div className="posts-container">
        {filteredPosts.length === 0 ? (
          <p className="empty-state">No posts yet...</p>
        ) : (
          filteredPosts
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((post) => (
              <PostCard
                key={post.id}
                post={post}
                formatDate={formatDate}
                truncateContent={truncateContent}
                isOwner={post.username === currentUser}
                onDelete={handleDelete}
                onSave={handleSave}
                onImageClick={openModal}
              />
            ))
        )}
      </div>

      {/* GALLERY SECTION */}
      <section className="gallery-section">
        <h2>Gallery</h2>
        <div className="gallery-grid">
          {gallery.map((g) => (
            <img
              key={g.id}
              src={g.src}
              className="gallery-img"
              title={g.caption}
              onClick={() => openModal(g.src)}
            />
          ))}
        </div>
      </section>

      {/* EVENTS SECTION */}
      <section className="events-section">
        <h2>Events</h2>
        {events.map((ev) => (
          <div key={ev.id} className="event-item">
            <strong>{ev.name}</strong> — {ev.date} <br />
            📍 {ev.location}
          </div>
        ))}
      </section>

      {/* MODAL */}
      {modalImage && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={closeModal}>&times;</span>
            <img src={modalImage} className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

// ======================================================
// POST CARD COMPONENT
// ======================================================
interface PostCardProps {
  post: Post;
  formatDate: (date: string) => string;
  truncateContent: (content: string) => string;
  isOwner: boolean;
  onDelete: (id: number) => void;
  onSave: (post: Post) => void;
  onImageClick: (img: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  formatDate,
  truncateContent,
  isOwner,
  onDelete,
  onSave,
  onImageClick,
}) => {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert("Title & content cannot be empty");
      return;
    }
    onSave({ ...post, title, content });
    setEditing(false);
  };

  return (
    <div className="post-card">
      <h2>{editing ? "" : title}</h2>

      {editing && (
        <input
          className="post-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      )}

      <div className="post-meta">
        <strong>By:</strong> {post.username} &nbsp; | &nbsp;
        <strong>Date:</strong> {formatDate(post.date)}
      </div>

      {post.image && (
        <img
          src={post.image}
          className="post-image"
          onClick={() => onImageClick(post.image!)}
        />
      )}

      <div className="post-content">
        {!editing ? (
          <>
            <p>{expanded ? content : truncateContent(content)}</p>
            {content.length > 300 && (
              <button className="read-more-btn" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Read Less" : "Read More"}
              </button>
            )}
          </>
        ) : (
          <textarea
            className="post-content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        )}
      </div>

      {isOwner && (
        <>
          {!editing ? (
            <div className="post-actions">
              <button className="action-btn edit-btn" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button className="action-btn delete-btn" onClick={() => onDelete(post.id)}>
                Delete
              </button>
            </div>
          ) : (
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewPage;
