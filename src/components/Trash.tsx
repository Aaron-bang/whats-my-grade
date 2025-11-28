import React from 'react';
import type { Note, Course } from '../types';
import './Trash.css';

interface TrashProps {
    notes: Note[];
    courses: Course[];
    onRestoreNote: (id: string) => void;
    onDeleteForever: (id: string) => void;
}

export const Trash: React.FC<TrashProps> = ({ notes, courses, onRestoreNote, onDeleteForever }) => {
    const getCourseName = (courseId: string) => {
        return courses.find(c => c.id === courseId)?.name || 'Unknown Course';
    };

    return (
        <div className="trash-container">
            <div className="trash-header">
                <h2>Trash</h2>
                <p>Notes in trash can be restored or permanently deleted.</p>
            </div>

            <div className="trash-grid">
                {notes.map(note => (
                    <div key={note.id} className="trash-card">
                        <div className="trash-card-header">
                            <span className="course-tag">{getCourseName(note.courseId)}</span>
                            <span className="date-tag">{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4>{note.title || 'Untitled Note'}</h4>
                        <p className="trash-preview">{note.content.substring(0, 100)}...</p>
                        <div className="trash-actions">
                            <button className="restore-btn" onClick={() => onRestoreNote(note.id)}>Restore</button>
                            <button className="delete-forever-btn" onClick={() => onDeleteForever(note.id)}>Delete Forever</button>
                        </div>
                    </div>
                ))}
                {notes.length === 0 && (
                    <div className="empty-state">
                        <p>Trash is empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
