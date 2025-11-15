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
    <div className="min-h-screen p-6 bg-gradient-to-b from-[#34A0A4] to-[#52B788]">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 px-4 py-2 bg-[#52B788] text-white rounded-lg shadow hover:bg-[#40916C] transition"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">Posts & Updates</h1>
          <p className="text-white/90">View posts, gallery & events</p>
        </header>

        {/* Search */}
        <div className="mb-6 flex gap-2">
          <input
            className="flex-1 p-2 rounded-md border border-transparent bg-white/90 dark:bg-[#0b2a36]"
            placeholder="Search by title or username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="px-4 py-2 bg-white text-slate-800 rounded-md shadow" onClick={handleSearch}>Search</button>
          <button className="px-4 py-2 bg-white/70 text-slate-700 rounded-md" onClick={clearSearch}>Clear</button>
        </div>

        {/* POSTS */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <p className="text-white">No posts yet...</p>
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

        {/* GALLERY */}
        <section className="mt-8 bg-white/90 dark:bg-[#062a3a] p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((g) => (
              <img
                key={g.id}
                src={g.src}
                className="w-full h-32 object-cover rounded-md cursor-pointer"
                title={g.caption}
                onClick={() => openModal(g.src)}
              />
            ))}
          </div>
        </section>

        {/* EVENTS */}
        <section className="mt-8 bg-white/90 dark:bg-[#062a3a] p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">Events</h2>
          <div className="flex flex-col divide-y">
            {events.map((ev) => (
              <div key={ev.id} className="py-2">
                <strong className="text-slate-800 dark:text-white">{ev.name}</strong> — <span className="text-sm text-slate-600 dark:text-slate-300">{ev.date}</span> <br />
                <span className="text-sm text-slate-600 dark:text-slate-300">📍 {ev.location}</span>
              </div>
            ))}
          </div>
        </section>

        {/* MODAL */}
        {modalImage && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={closeModal}>
            <div className="bg-white dark:bg-[#071722] p-4 rounded-md max-w-[90%] max-h-[90%] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <button className="float-right text-xl" onClick={closeModal}>&times;</button>
              <img src={modalImage} className="w-full h-auto rounded-md" />
            </div>
          </div>
        )}
      </div>
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
    <div className="bg-white/95 dark:bg-[#062a3a] p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{editing ? "" : title}</h2>

      {editing && (
        <input
          className="w-full p-2 border rounded my-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      )}

      <div className="text-sm text-slate-600 dark:text-slate-300 my-2">
        <strong>By:</strong> {post.username} &nbsp; | &nbsp;
        <strong>Date:</strong> {formatDate(post.date)}
      </div>

      {post.image && (
        <img
          src={post.image}
          className="w-full max-h-64 object-cover rounded my-3 cursor-pointer"
          onClick={() => onImageClick(post.image!)}
        />
      )}

      <div className="text-slate-800 dark:text-slate-100">
        {!editing ? (
          <>
            <p>{expanded ? content : truncateContent(content)}</p>
            {content.length > 300 && (
              <button className="mt-2 text-sm text-primary" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Read Less" : "Read More"}
              </button>
            )}
          </>
        ) : (
          <textarea
            className="w-full p-2 border rounded my-2 bg-white dark:bg-[#0b2a36] text-slate-900 dark:text-slate-100"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        )}
      </div>

      {isOwner && (
        <div className="mt-3 flex gap-2">
          {!editing ? (
            <>
              <button className="px-3 py-1 bg-primary text-white rounded" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => onDelete(post.id)}>
                Delete
              </button>
            </>
          ) : (
            <>
              <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={handleSave}>Save</button>
              <button className="px-3 py-1 bg-gray-300 text-slate-800 rounded" onClick={() => setEditing(false)}>Cancel</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewPage;
