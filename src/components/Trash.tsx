import React from 'react';
import type { Note, Course, Task } from '../types';
import './Trash.css';

interface TrashProps {
    notes: Note[];
    courses: Course[]; // All courses for lookup
    deletedCourses: Course[];
    deletedTasks: Task[];
    onRestoreNote: (id: string) => void;
    onRestoreCourse: (id: string) => void;
    onRestoreTask: (id: string) => void;
    onDeleteForever: (id: string, type: 'note' | 'course' | 'task') => void;
}

export const Trash: React.FC<TrashProps> = ({
    notes,
    courses,
    deletedCourses,
    deletedTasks,
    onRestoreNote,
    onRestoreCourse,
    onRestoreTask,
    onDeleteForever
}) => {
    const getCourseName = (courseId: string) => {
        return courses.find(c => c.id === courseId)?.name || 'Unknown Course';
    };

    return (
        <div className="trash-container">
            <div className="trash-header">
                <h2>Trash</h2>
                <p>Items in trash can be restored or permanently deleted.</p>
            </div>

            <div className="trash-section">
                <h3>Courses</h3>
                <div className="trash-grid">
                    {deletedCourses.map(course => (
                        <div key={course.id} className="trash-card course-card" style={{ borderLeft: `4px solid ${course.color}` }}>
                            <h4>{course.name}</h4>
                            <p className="trash-preview">{course.credits || 4} Credits</p>
                            <div className="trash-actions">
                                <button className="restore-btn" onClick={() => onRestoreCourse(course.id)}>Restore</button>
                                <button className="delete-forever-btn" onClick={() => onDeleteForever(course.id, 'course')}>Delete Forever</button>
                            </div>
                        </div>
                    ))}
                    {deletedCourses.length === 0 && <p className="empty-text">No deleted courses.</p>}
                </div>
            </div>

            <div className="trash-section">
                <h3>Assignments</h3>
                <div className="trash-grid">
                    {deletedTasks.map(task => (
                        <div key={task.id} className="trash-card">
                            <div className="trash-card-header">
                                <span className="course-tag">{getCourseName(task.courseId)}</span>
                                <span className="date-tag">{task.dueDate}</span>
                            </div>
                            <h4>{task.text}</h4>
                            <div className="trash-actions">
                                <button className="restore-btn" onClick={() => onRestoreTask(task.id)}>Restore</button>
                                <button className="delete-forever-btn" onClick={() => onDeleteForever(task.id, 'task')}>Delete Forever</button>
                            </div>
                        </div>
                    ))}
                    {deletedTasks.length === 0 && <p className="empty-text">No deleted assignments.</p>}
                </div>
            </div>

            <div className="trash-section">
                <h3>Notes</h3>
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
                                <button className="delete-forever-btn" onClick={() => onDeleteForever(note.id, 'note')}>Delete Forever</button>
                            </div>
                        </div>
                    ))}
                    {notes.length === 0 && <p className="empty-text">No deleted notes.</p>}
                </div>
            </div>
        </div>
    );
};
