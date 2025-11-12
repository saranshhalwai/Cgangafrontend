import React, { useState, useEffect } from "react"
import "../styles/style.css"

interface Post {
  id: number
  title: string
  content: string
  image: string | null
  date: string
}

interface GalleryItem {
  id: number
  src: string
  caption: string
}

interface EventItem {
  id: number
  name: string
  date: string
  location: string
}

const UpdatePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [modalSrc, setModalSrc] = useState<string | null>(null)

  const [postTitle, setPostTitle] = useState("")
  const [postContent, setPostContent] = useState("")
  const [postImage, setPostImage] = useState<File | null>(null)

  const [galleryFile, setGalleryFile] = useState<File | null>(null)
  const [galleryCaption, setGalleryCaption] = useState("")

  const [eventName, setEventName] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventLocation, setEventLocation] = useState("")

  // Load from localStorage
  useEffect(() => {
    const storedPosts = JSON.parse(localStorage.getItem("posts") || "[]") as Post[]
    const storedGallery = JSON.parse(localStorage.getItem("galleryImages") || "[]") as GalleryItem[]
    const storedEvents = JSON.parse(localStorage.getItem("events") || "[]") as EventItem[]
    setPosts(storedPosts)
    setGalleryImages(storedGallery)
    setEvents(storedEvents)
  }, [])

  // Utility
  const escapeHtml = (text: string) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  // Add Post
  const addPost = () => {
    if (!postTitle.trim() || !postContent.trim()) {
      alert("Please enter both title and content")
      return
    }

    const newPost: Post = {
      id: Date.now(),
      title: postTitle.trim(),
      content: postContent.trim(),
      image: null,
      date: new Date().toLocaleDateString(),
    }

    if (postImage) {
      const reader = new FileReader()
      reader.onload = (e) => {
        newPost.image = e.target?.result as string
        const updated = [newPost, ...posts]
        setPosts(updated)
        localStorage.setItem("posts", JSON.stringify(updated))
        clearPostForm()
      }
      reader.readAsDataURL(postImage)
    } else {
      const updated = [newPost, ...posts]
      setPosts(updated)
      localStorage.setItem("posts", JSON.stringify(updated))
      clearPostForm()
    }
  }

  const clearPostForm = () => {
    setPostTitle("")
    setPostContent("")
    setPostImage(null)
  }

  const deletePost = (id: number) => {
    const updated = posts.filter((p) => p.id !== id)
    setPosts(updated)
    localStorage.setItem("posts", JSON.stringify(updated))
  }

  // Add Gallery Image
  const addGalleryImage = () => {
    if (!galleryFile) {
      alert("Please select an image")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const newImage: GalleryItem = {
        id: Date.now(),
        src: e.target?.result as string,
        caption: galleryCaption.trim() || "Untitled",
      }
      const updated = [newImage, ...galleryImages]
      setGalleryImages(updated)
      localStorage.setItem("galleryImages", JSON.stringify(updated))
      setGalleryFile(null)
      setGalleryCaption("")
    }
    reader.readAsDataURL(galleryFile)
  }

  // Add Event
  const addEvent = () => {
    if (!eventName.trim() || !eventDate || !eventLocation.trim()) {
      alert("Please fill in all event fields")
      return
    }

    const newEvent: EventItem = {
      id: Date.now(),
      name: eventName.trim(),
      date: eventDate,
      location: eventLocation.trim(),
    }

    const updated = [...events, newEvent].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    setEvents(updated)
    localStorage.setItem("events", JSON.stringify(updated))
    setEventName("")
    setEventDate("")
    setEventLocation("")
  }

  const deleteEvent = (id: number) => {
    const updated = events.filter((e) => e.id !== id)
    setEvents(updated)
    localStorage.setItem("events", JSON.stringify(updated))
  }

  // Modal
  const openModal = (src: string) => setModalSrc(src)
  const closeModal = () => setModalSrc(null)

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>Update Info Here!</h1>
            <p className="tagline">Collaborate, Share, and Make a Difference</p>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Environmental Updates */}
        <section className="section">
          <h2>Environmental Updates</h2>
          <div className="form-group">
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Post title"
              className="input-field"
            />
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share environmental news or updates..."
              className="textarea-field"
            />
            <input
              type="file"
              accept="image/*"
              className="input-field"
              onChange={(e) => setPostImage(e.target.files?.[0] || null)}
            />
            <button onClick={addPost} className="btn btn-primary">
              Post Update
            </button>
          </div>

          <div className="posts-container">
            {posts.map((post) => (
              <div key={post.id} className="post">
                <div className="post-header">
                  <div>
                    <h3 className="post-title">{escapeHtml(post.title)}</h3>
                    <p className="post-date">{post.date}</p>
                  </div>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="btn btn-secondary"
                  >
                    Delete
                  </button>
                </div>
                <p className="post-content">{escapeHtml(post.content)}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="post-image"
                    onClick={() => openModal(post.image!)}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Gallery */}
        <section className="section">
          <h2>Activity Gallery</h2>
          <div className="form-group">
            <input
              type="file"
              accept="image/*"
              className="input-field"
              onChange={(e) => setGalleryFile(e.target.files?.[0] || null)}
            />
            <input
              type="text"
              value={galleryCaption}
              onChange={(e) => setGalleryCaption(e.target.value)}
              placeholder="Image caption (optional)"
              className="input-field"
            />
            <button onClick={addGalleryImage} className="btn btn-primary">
              Upload Image
            </button>
          </div>

          <div className="gallery-grid">
            {galleryImages.map((img) => (
              <div key={img.id} className="gallery-item">
                <img
                  src={img.src}
                  alt="Gallery"
                  onClick={() => openModal(img.src)}
                />
                <div className="gallery-caption">{escapeHtml(img.caption)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Events */}
        <section className="section">
          <h2>Upcoming Events</h2>
          <div className="form-group">
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Event name"
              className="input-field"
            />
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="Location"
              className="input-field"
            />
            <button onClick={addEvent} className="btn btn-primary">
              Add Event
            </button>
          </div>

          <div className="events-container">
            {events.map((event) => {
              const formattedDate = new Date(event.date).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
              return (
                <div key={event.id} className="event-card">
                  <div className="event-details">
                    <h3>{escapeHtml(event.name)}</h3>
                    <div className="event-info event-date">{formattedDate}</div>
                    <div className="event-info">📍 {escapeHtml(event.location)}</div>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="btn btn-secondary"
                  >
                    Delete
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {modalSrc && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <img src={modalSrc} alt="Modal" />
          </div>
        </div>
      )}
    </div>
  )
}

export default UpdatePage
