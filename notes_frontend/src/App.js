import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// PUBLIC_INTERFACE
/**
 * Notes App Main Component
 * Implements: list, create, edit, delete, and search notes.
 * Layout: Sidebar (notes + search) and main panel (view/edit note).
 * Theme: Modern, light, color-customizable.
 */
function App() {
  // LocalStorage Note Key
  const STORAGE_KEY = "notes-app-notes-v1";

  // Note structure: { id, title, body, updated }
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const titleInputRef = useRef(null);

  // Theme palette (CSS vars) - modern light using provided spec
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", "#1976d2");
    root.style.setProperty("--secondary", "#424242");
    root.style.setProperty("--accent", "#ffb300");
    root.style.setProperty("--app-bg", "#f8f9fa");
    root.style.setProperty("--sidebar-bg", "#ffffff");
    root.style.setProperty("--sidebar-border", "#e9ecef");
    root.style.setProperty("--note-bg", "#fffde7");
    root.style.setProperty("--text-primary", "#222");
    root.style.setProperty("--text-secondary", "#666");
    root.style.setProperty("--highlight", "#ffe082");
    root.style.setProperty("--danger", "#d32f2f");
  }, []);

  // Save notes to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Computed: filteredNotes by search (in title/body)
  const filteredNotes = notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.body.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.updated - a.updated);

  // Get selected note object (or null)
  const selectedNote = notes.find((n) => n.id === selectedId) || null;

  // PUBLIC_INTERFACE
  // Create a new note
  function handleNewNote() {
    const newNote = {
      id: Date.now().toString(),
      title: "",
      body: "",
      updated: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setSelectedId(newNote.id);
    setEditing(true);
    setTimeout(() => {
      titleInputRef.current && titleInputRef.current.focus();
    }, 0);
  }

  // PUBLIC_INTERFACE
  // Edit existing note
  function handleNoteChange(field, value) {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === selectedId
          ? { ...note, [field]: value, updated: Date.now() }
          : note
      )
    );
  }

  // PUBLIC_INTERFACE
  // Delete note by id
  function handleDeleteNote(id) {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setEditing(false);
    }
  }

  // PUBLIC_INTERFACE
  // Save edited note (done editing)
  function handleSaveNote() {
    setEditing(false);
  }

  // PUBLIC_INTERFACE
  // Select a note by id
  function handleSelectNote(id) {
    setSelectedId(id);
    setEditing(false);
  }

  // PUBLIC_INTERFACE
  // Search notes
  function handleSearch(e) {
    setSearchTerm(e.target.value);
  }

  // Responsive: toggle sidebar (for mobile)
  function handleSidebarToggle() {
    setSidebarOpen((open) => !open);
  }

  /** Sidebar component */
  function Sidebar() {
    return (
      <aside className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
        <div className="sidebar-header">
          <h1 className="app-title">Notes</h1>
          <button
            className="sidebar-toggle"
            onClick={handleSidebarToggle}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? "⏴" : "⏵"}
          </button>
        </div>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search notes..."
            aria-label="Search notes"
          />
          <button className="new-note-btn" onClick={handleNewNote}>
            + New
          </button>
        </div>
        <ul className="notes-list">
          {filteredNotes.length === 0 ? (
            <li className="empty-placeholder">No notes found.</li>
          ) : (
            filteredNotes.map((note) => (
              <li
                key={note.id}
                className={`note-list-item ${selectedId === note.id ? "selected" : ""}`}
                onClick={() => handleSelectNote(note.id)}
                tabIndex={0}
              >
                <div className="note-title-row">
                  <span className="note-title">
                    {note.title ? note.title : <em>(Untitled)</em>}
                  </span>
                  <button
                    className="delete-btn"
                    title="Delete note"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
                <div className="note-snippet">
                  {note.body.slice(0, 32)}
                  {note.body.length > 32 ? "..." : ""}
                </div>
                <span className="note-updated">
                  {new Date(note.updated).toLocaleString()}
                </span>
              </li>
            ))
          )}
        </ul>
      </aside>
    );
  }

  /** Main content panel: Editor or View display */
  function MainPanel() {
    if (!selectedNote) {
      return (
        <main className="main-panel empty">
          <p>
            Select a note from the sidebar or create a <b>new note</b>.
          </p>
        </main>
      );
    }
    return (
      <main className="main-panel">
        <div className="main-header">
          <h2>
            {editing ? (
              <input
                ref={titleInputRef}
                className="note-title-input"
                type="text"
                value={selectedNote.title}
                onChange={(e) => handleNoteChange("title", e.target.value)}
                maxLength={80}
                placeholder="Untitled note"
                aria-label="Note title"
              />
            ) : (
              selectedNote.title ? selectedNote.title : <em>(Untitled)</em>
            )}
          </h2>
          {editing ? (
            <button
              className="save-btn"
              onClick={handleSaveNote}
              aria-label="Save"
              style={{ marginLeft: 16 }}
            >
              💾 Save
            </button>
          ) : (
            <button
              className="edit-btn"
              onClick={() => setEditing(true)}
              aria-label="Edit"
              style={{ marginLeft: 16 }}
            >
              ✏️ Edit
            </button>
          )}
        </div>
        <div className="main-body">
          {editing ? (
            <textarea
              className="note-body-input"
              value={selectedNote.body}
              onChange={(e) => handleNoteChange("body", e.target.value)}
              placeholder="Type your note here..."
              rows={16}
              aria-label="Note body"
            />
          ) : (
            <div className="note-view-body">
              {selectedNote.body ? (
                selectedNote.body.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))
              ) : (
                <em>(No content)</em>
              )}
            </div>
          )}
        </div>
        <div className="main-footer">
          <span className="updated-label">
            Last updated: {new Date(selectedNote.updated).toLocaleString()}
          </span>
        </div>
      </main>
    );
  }

  return (
    <div className="notes-root">
      <Sidebar />
      <MainPanel />
    </div>
  );
}

export default App;
