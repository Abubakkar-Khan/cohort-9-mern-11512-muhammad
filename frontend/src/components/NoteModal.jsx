import { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { X, Save, Edit3 } from "lucide-react";

export default function NoteModal({ isOpen, onClose, onSave, editingNote, isViewOnly, onSwitchToEdit }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title || "");
      setContent(editingNote.content || "");
    } else {
      setTitle("");
      setContent("");
    }
    setError("");
    setIsSaving(false);
  }, [editingNote, isOpen]);

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
    toolbar: {
      container: "#note-editor-toolbar"
    }
  };

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
            <h1 className="note-view-title">{title}</h1>
            <div
              className="note-view-content"
              dangerouslySetInnerHTML={{ __html: content }}
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
              <div id="note-editor-toolbar" className="custom-quill-toolbar">
                <span className="ql-formats">
                  <button type="button" className="ql-header ql-btn-text" value="" title="Normal text">
                    Normal
                  </button>
                  <button type="button" className="ql-header ql-btn-text" value="1" title="Heading 1">
                    H1
                  </button>
                  <button type="button" className="ql-header ql-btn-text" value="2" title="Heading 2">
                    H2
                  </button>
                </span>
                <span className="ql-formats">
                  <button type="button" className="ql-bold" aria-label="Bold" />
                  <button type="button" className="ql-italic" aria-label="Italic" />
                  <button type="button" className="ql-underline" aria-label="Underline" />
                </span>
                <span className="ql-formats">
                  <button type="button" className="ql-list" value="ordered" aria-label="Numbered List" />
                  <button type="button" className="ql-list" value="bullet" aria-label="Bullet List" />
                </span>
              </div>

              <ReactQuill
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
