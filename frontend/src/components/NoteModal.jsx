import { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { X, Save, Edit3 } from "lucide-react";

export default function NoteModal({ isOpen, onClose, onSave, editingNote, isViewOnly, onSwitchToEdit }) {
  const [title, setTitle] = useState(editingNote?.title || "");
  const [content, setContent] = useState(editingNote?.content || "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingNote) {
        setTitle(editingNote.title || "");
        setContent(editingNote.content || "");
      } else {
        setTitle("");
        setContent("");
      }
      setError("");
      setIsSaving(false);
    }
  }, [editingNote, isOpen, isViewOnly]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!content.trim() || content === "<p><br></p>") {
      setError("Content is required");
      return;
    }

    try {
      setIsSaving(true);
      await onSave({ title, content });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  let modalTitle = "New Note";
  if (isViewOnly) {
    modalTitle = "View Note";
  } else if (editingNote) {
    modalTitle = "Edit Note";
  }

  let submitLabel = "Create";
  if (isSaving) {
    submitLabel = "Saving...";
  } else if (editingNote) {
    submitLabel = "Save Changes";
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }]
    ]
  };

  const currentDisplayTitle = editingNote?.title || title;
  const currentDisplayContent = editingNote?.content || content;

  return (
    <dialog open className="modal-dialog-root" aria-labelledby="note-modal-heading">
      <button
        type="button"
        className="modal-backdrop-btn"
        onClick={onClose}
        aria-label="Close background overlay"
      />
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="note-modal-heading">{modalTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        {isViewOnly ? (
          <div className="modal-view-body">
            <h1 className="note-view-title">{currentDisplayTitle}</h1>
            <div
              className="note-view-content"
              dangerouslySetInnerHTML={{ __html: currentDisplayContent }}
            />
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                Close
              </button>
              <button
                type="button"
                onClick={() => onSwitchToEdit(editingNote)}
                className="btn-primary"
              >
                <Edit3 size={14} />
                <span>Edit Note</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <input
              type="text"
              placeholder="NOTE TITLE"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="title-input"
              autoFocus
              disabled={isSaving}
            />

            <div className="editor-container">
              <ReactQuill
                key={editingNote ? `${editingNote.id}-${isViewOnly}` : "new-note"}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                placeholder="Write your note here..."
                readOnly={isSaving}
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} disabled={isSaving} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="btn-primary">
                <Save size={14} />
                <span>{submitLabel}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
