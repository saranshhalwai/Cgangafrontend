import React, { useEffect, useState } from "react";
import "../styles/style.css";

interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  date: string;
  image?: string;
}

const currentUser = "Harsh"; // 🔒 Replace with your auth system later

const ViewPage: React.FC = () => {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalImage, setModalImage] = useState<string | null>(null);

  // --------------------------------------------
  // 🔹 Utility Functions
  // --------------------------------------------
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

  const truncateContent = (content: string, maxLength = 300) => {
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
  };

  // --------------------------------------------
  // 🔹 Edit / Delete Functions
  // --------------------------------------------
  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;
    const updated = allPosts.filter((p) => p.id !== id);
    setAllPosts(updated);
    setFilteredPosts(updated);
    // TODO: Add API delete logic here
  };

  const handleSave = (updatedPost: Post) => {
    const updatedPosts = allPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p));
    setAllPosts(updatedPosts);
    setFilteredPosts(updatedPosts);
    // TODO: Add API save logic here
  };

  // --------------------------------------------
  // 🔹 Search / Filter
  // --------------------------------------------
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

  // --------------------------------------------
  // 🔹 Modal
  // --------------------------------------------
  const openModal = (image: string) => setModalImage(image);
  const closeModal = () => setModalImage(null);

  // --------------------------------------------
  // 🔹 Initial Data (placeholder)
  // --------------------------------------------
  useEffect(() => {
    // TODO: Replace this section with data-fetching logic (from backend or Update Page)
    // For now, this will remain empty until data is provided
    setAllPosts([]);
    setFilteredPosts([]);
  }, []);

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>Posts & Updates</h1>
        <p className="subtitle">View all posts, updates, and announcements</p>
      </header>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by title or username..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
          <button className="clear-btn" onClick={clearSearch}>
            Clear
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="posts-container" id="postsContainer">
        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <p>No posts yet. Check back soon!</p>
          </div>
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

      {/* Modal */}
      {modalImage && (
        <div className="modal active" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={closeModal}>
              &times;
            </span>
            <img src={modalImage} alt="Full-size" className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

// --------------------------------------------
// 🔹 PostCard Component
// --------------------------------------------
interface PostCardProps {
  post: Post;
  formatDate: (date: string) => string;
  truncateContent: (content: string) => string;
  isOwner: boolean;
  onDelete: (id: number) => void;
  onSave: (post: Post) => void;
  onImageClick: (image: string) => void;
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

  const toggleExpand = () => setExpanded(!expanded);
  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content cannot be empty!");
      return;
    }
    onSave({ ...post, title, content });
    setEditing(false);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        {!editing ? (
          <h2 className="post-title">{title}</h2>
        ) : (
          <input
            type="text"
            className="post-title-input editing"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        )}
      </div>

      <div className="post-meta">
        <div className="meta-item">
          <strong>Posted by:</strong> <span>{post.username}</span>
        </div>
        <div className="meta-item">
          <strong>Date:</strong> <span>{formatDate(post.date)}</span>
        </div>
      </div>

      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="post-image"
          onClick={() => onImageClick(post.image!)}
        />
      )}

      <div className="post-content">
        {!editing ? (
          <div className="post-content-display">
            <span className="content-text">
              {expanded ? post.content : truncateContent(post.content)}
            </span>
            {post.content.length > 300 && (
              <button className="read-more-btn" onClick={toggleExpand}>
                {expanded ? "Read Less" : "Read More"}
              </button>
            )}
          </div>
        ) : (
          <textarea
            className="post-content-input editing"
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
            <div className="edit-actions editing">
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
              <button className="cancel-btn" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewPage;
