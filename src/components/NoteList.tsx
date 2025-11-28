import React from 'react';
import type { Note } from '../types';
import './NoteList.css';

interface NoteListProps {
    notes: Note[];
    onAddNote: () => void;
    onUpdateNote: (id: string, content: string, title: string) => void;
    onDeleteNote: (id: string) => void;
}

export const NoteList: React.FC<NoteListProps> = ({ notes, onAddNote, onUpdateNote, onDeleteNote }) => {
    return (
        <div className="note-list-container">
            <div className="section-header">
                <h3>Notes</h3>
                <button className="add-btn" onClick={onAddNote}>+ New Note</button>
            </div>
            <div className="notes-grid">
                {notes.map(note => (
                    <div key={note.id} className="note-card">
                        <div className="note-header-row">
                            <input
                                className="note-title-input"
                                value={note.title}
                                onChange={(e) => onUpdateNote(note.id, note.content, e.target.value)}
                                placeholder="Untitled Note"
                            />
                            <button className="delete-note-btn" onClick={() => onDeleteNote(note.id)}>×</button>
                        </div>
                        <textarea
                            className="note-content-input"
                            value={note.content}
                            onChange={(e) => onUpdateNote(note.id, e.target.value, note.title)}
                            placeholder="Start typing..."
                        />
                        <div className="note-footer">
                            {new Date(note.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                ))}
                {notes.length === 0 && (
                    <div className="empty-state">
                        <p>No notes yet. Click "+ New Note" to start.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
