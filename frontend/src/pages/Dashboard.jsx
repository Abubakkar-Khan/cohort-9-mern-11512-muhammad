import { useState, useEffect } from "react";
import API from "../api/client";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import NoteModal from "../components/NoteModal";
import ConfirmModal from "../components/ConfirmModal";
import { Search, FileText } from "lucide-react";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notes");
      setNotes(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleOpenView = (note) => {
    setEditingNote(note);
    setIsViewOnly(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleSwitchToEdit = (note) => {
    setEditingNote(note);
    setIsViewOnly(false);
  };

  const handleSaveNote = async ({ title, content }) => {
    if (editingNote) {
      const res = await API.put(`/notes/${editingNote.id}`, { title, content });
      setNotes(notes.map((n) => (n.id === editingNote.id ? res.data : n)));
    } else {
      const res = await API.post("/notes", { title, content });
      setNotes([res.data.note, ...notes]);
    }
    setIsModalOpen(false);
  };

  const handleDeletePrompt = (id) => {
    setDeletingNoteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingNoteId) return;
    try {
      await API.delete(`/notes/${deletingNoteId}`);
      setNotes(notes.filter((n) => n.id !== deletingNoteId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingNoteId(null);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const titleMatch = note.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch = note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || contentMatch;
  });

  const emptyHeading = searchQuery ? "NO MATCHING NOTES" : "NO NOTES FOUND";
  const emptyDescription = searchQuery
    ? "Try searching with a different keyword"
    : "Create your first note to start your workspace.";

  let contentArea;
  if (loading) {
    contentArea = <div className="loading-state">FETCHING NOTES...</div>;
  } else if (filteredNotes.length === 0) {
    contentArea = (
      <div className="empty-state">
        <FileText size={40} className="empty-icon" />
        <h3>{emptyHeading}</h3>
        <p>{emptyDescription}</p>
      </div>
    );
  } else {
    contentArea = (
      <div className="notes-grid">
        {filteredNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onDelete={handleDeletePrompt}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Navbar onNewNote={handleOpenCreate} />

      <main className="dashboard-main">
        <div className="dashboard-toolbar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="SEARCH NOTES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {contentArea}
      </main>

      {isModalOpen && (
        <NoteModal
          key={editingNote ? `${editingNote.id}-${isViewOnly}` : "new-note"}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveNote}
          editingNote={editingNote}
          isViewOnly={isViewOnly}
          onSwitchToEdit={handleSwitchToEdit}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingNoteId}
        onClose={() => setDeletingNoteId(null)}
        onConfirm={handleConfirmDelete}
        title="DELETE NOTE"
        message="Are you sure you want to delete this note? This action cannot be undone."
      />
    </div>
  );
}
