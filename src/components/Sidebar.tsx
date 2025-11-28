import React, { useState } from 'react';
import type { Course } from '../types';
import { calculateLetterGrade, calculateWeightedGPA } from '../utils/gradeUtils';
import './Sidebar.css';

interface SidebarProps {
    courses: Course[];
    selectedCourseId: string | null;
    onSelectCourse: (id: string) => void;
    onAddCourse: (name: string, color: string, credits: number) => void;
    onEditCourse: (id: string, name: string, color: string, credits: number) => void;
    getCourseGrade?: (courseId: string) => number | undefined;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#2EC4B6', '#E71D36', '#7209B7'];

export const Sidebar: React.FC<SidebarProps> = ({ courses, selectedCourseId, onSelectCourse, onAddCourse, onEditCourse, getCourseGrade }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newCourseName, setNewCourseName] = useState('');
    const [newCourseCredits, setNewCourseCredits] = useState(4);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
    const [editCourseName, setEditCourseName] = useState('');
    const [editCourseCredits, setEditCourseCredits] = useState(4);
    const [editCourseColor, setEditCourseColor] = useState('');

    // Calculate overall GPA
    const courseGrades = courses.map(course => {
        const percentage = getCourseGrade ? getCourseGrade(course.id) : undefined;
        const letterGrade = percentage !== undefined
            ? calculateLetterGrade(percentage, course.gradeScale)
            : null;
        return {
            grade: letterGrade,
            credits: course.credits || 4
        };
    });

    const overallGPA = calculateWeightedGPA(courseGrades);

    const handleAddCourse = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCourseName.trim()) {
            onAddCourse(newCourseName, selectedColor, newCourseCredits);
            setNewCourseName('');
            setNewCourseCredits(4);
            setIsAdding(false);
        }
    };

    const handleStartEdit = (course: Course) => {
        setEditingCourseId(course.id);
        setEditCourseName(course.name);
        setEditCourseCredits(course.credits || 4);
        setEditCourseColor(course.color);
    };

    const handleSaveEdit = () => {
        if (editingCourseId && editCourseName.trim()) {
            onEditCourse(editingCourseId, editCourseName, editCourseColor, editCourseCredits);
            setEditingCourseId(null);
        }
    };


    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>My Courses</h2>
                {overallGPA !== null && (
                    <div className="overall-gpa">
                        <span className="gpa-label">GPA</span>
                        <span className="gpa-value">{overallGPA.toFixed(2)}</span>
                    </div>
                )}
            </div>

            <div className="course-list">
                <div
                    className={`course-item ${selectedCourseId === 'all-tasks' ? 'active' : ''} special-item`}
                    onClick={() => onSelectCourse('all-tasks')}
                >
                    <span className="course-icon">📋</span>
                    <span className="course-name">All Assignments</span>
                </div>
                <div
                    className={`course-item ${selectedCourseId === 'trash' ? 'active' : ''} special-item`}
                    onClick={() => onSelectCourse('trash')}
                >
                    <span className="course-icon">🗑️</span>
                    <span className="course-name">Trash</span>
                </div>

                <div className="divider"></div>

                {courses.map(course => (
                    editingCourseId === course.id ? (
                        <div key={course.id} className="edit-course-form" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                value={editCourseName}
                                onChange={(e) => setEditCourseName(e.target.value)}
                                placeholder="Course Name"
                                autoFocus
                            />
                            <div className="credits-input-group">
                                <label>Credits:</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={editCourseCredits}
                                    onChange={(e) => setEditCourseCredits(Number(e.target.value))}
                                    className="credits-input"
                                />
                            </div>
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
                                <button onClick={() => setEditingCourseId(null)}>Cancel</button>
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
                            <div className="course-item-content">
                                <div className="course-title-row">
                                    <span className="course-name">{course.name}</span>
                                    <span className="course-credits">{course.credits || 4} </span>
                                </div>
                                {getCourseGrade && getCourseGrade(course.id) !== undefined && (
                                    <div className="course-grade-display">
                                        <span className="course-grade-text">
                                            {getCourseGrade(course.id)!.toFixed(1)}%
                                        </span>
                                        {course.gradeScale && (
                                            <span className="sidebar-letter-grade">
                                                {' '}({calculateLetterGrade(getCourseGrade(course.id)!, course.gradeScale)})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
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
                <form className="add-course-form" onSubmit={handleAddCourse}>
                    <input
                        type="text"
                        placeholder="Course Name"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        autoFocus
                    />
                    <div className="credits-input-group">
                        <label>Credits:</label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            value={newCourseCredits}
                            onChange={(e) => setNewCourseCredits(Number(e.target.value))}
                            className="credits-input"
                        />
                    </div>
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
                        <button type="button" onClick={() => setIsAdding(false)}>Cancel</button>
                        <button type="submit" className="confirm-btn">Add</button>
                    </div>
                </form>
            ) : (
                <button className="add-course-btn" onClick={() => setIsAdding(true)}>
                    + Add Class
                </button>
            )}
        </div>
    );
};
