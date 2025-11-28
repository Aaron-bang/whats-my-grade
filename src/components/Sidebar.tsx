import React, { useState } from 'react';
import type { Course } from '../types';
import './Sidebar.css';

interface SidebarProps {
    courses: Course[];
    selectedCourseId: string | null;
    onSelectCourse: (id: string) => void;
    onAddCourse: (name: string, color: string) => void;
    onEditCourse: (id: string, name: string, color: string) => void;
    getCourseGrade?: (courseId: string) => number | undefined;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#2EC4B6', '#E71D36', '#7209B7'];

export const Sidebar: React.FC<SidebarProps> = ({ courses, selectedCourseId, onSelectCourse, onAddCourse, onEditCourse, getCourseGrade }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newCourseName, setNewCourseName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
    const [editCourseName, setEditCourseName] = useState('');
    const [editCourseColor, setEditCourseColor] = useState('');

    const handleAdd = () => {
        if (newCourseName.trim()) {
            onAddCourse(newCourseName, selectedColor);
            setNewCourseName('');
            setIsAdding(false);
        }
    };

    const handleStartEdit = (course: Course) => {
        setEditingCourseId(course.id);
        setEditCourseName(course.name);
        setEditCourseColor(course.color);
    };

    const handleSaveEdit = () => {
        if (editingCourseId && editCourseName.trim()) {
            onEditCourse(editingCourseId, editCourseName, editCourseColor);
            setEditingCourseId(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingCourseId(null);
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>My Classes</h2>
            </div>

            <div className="course-list">
                <div
                    className={`course-item special-item ${selectedCourseId === 'all-tasks' ? 'active' : ''}`}
                    onClick={() => onSelectCourse('all-tasks')}
                >
                    <span className="course-icon">📋</span>
                    All Tasks
                </div>
                <div
                    className={`course-item special-item ${selectedCourseId === 'trash' ? 'active' : ''}`}
                    onClick={() => onSelectCourse('trash')}
                >
                    <span className="course-icon">🗑️</span>
                    Trash
                </div>

                <div className="divider"></div>

                {courses.map(course => (
                    editingCourseId === course.id ? (
                        <div key={course.id} className="edit-course-form">
                            <input
                                type="text"
                                value={editCourseName}
                                onChange={(e) => setEditCourseName(e.target.value)}
                                autoFocus
                            />
                            <div className="color-picker">
                                {COLORS.map(color => (
                                    <div
                                        key={color}
                                        className={`color-option ${editCourseColor === color ? 'selected' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setEditCourseColor(color)}
                                    />
                                ))}
                            </div>
                            <div className="edit-actions">
                                <button onClick={handleCancelEdit}>Cancel</button>
                                <button className="confirm-btn" onClick={handleSaveEdit}>Save</button>
                            </div>
                        </div>
                    ) : (
                        <div
                            key={course.id}
                            className={`course-item ${selectedCourseId === course.id ? 'active' : ''}`}
                            onClick={() => onSelectCourse(course.id)}
                            style={{ borderLeftColor: course.color }}
                        >
                            <span className="course-dot" style={{ backgroundColor: course.color }}></span>
                            <span className="course-name">{course.name}</span>
                            {getCourseGrade && getCourseGrade(course.id) !== undefined && (
                                <span className="course-grade-badge">
                                    {getCourseGrade(course.id)!.toFixed(1)}%
                                </span>
                            )}
                            <button
                                className="edit-course-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEdit(course);
                                }}
                            >
                                ✏️
                            </button>
                        </div>
                    )
                ))}
            </div>

            {isAdding ? (
                <div className="add-course-form">
                    <input
                        type="text"
                        placeholder="Class Name"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        autoFocus
                    />
                    <div className="color-picker">
                        {COLORS.map(color => (
                            <div
                                key={color}
                                className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setSelectedColor(color)}
                            />
                        ))}
                    </div>
                    <div className="add-actions">
                        <button onClick={() => setIsAdding(false)}>Cancel</button>
                        <button className="confirm-btn" onClick={handleAdd}>Add</button>
                    </div>
                </div>
            ) : (
                <button className="add-course-btn" onClick={() => setIsAdding(true)}>
                    + Add Class
                </button>
            )}
        </div>
    );
};
