import React, { useState } from 'react';
import type { Course, Semester } from '../types';
import { calculateLetterGrade, calculateWeightedGPA } from '../utils/gradeUtils';
import './Sidebar.css';

interface SidebarProps {
    courses: Course[];
    semesters: Semester[];
    selectedCourseId: string | null;
    onSelectCourse: (id: string) => void;
    onAddCourse: (name: string, color: string, credits: number, semesterId?: string) => void;
    onEditCourse: (id: string, name: string, color: string, credits: number, semesterId?: string) => void;
    onDeleteCourse: (id: string) => void;
    onAddSemester: (name: string) => void;
    onEditSemester: (id: string, name: string) => void;
    getCourseGrade?: (courseId: string) => number | undefined;
}

const COLORS = ['#FF6B6B', '#FFE66D', '#FF9F1C', '#2EC4B6', '#E71D36', '#7209B7'];

export const Sidebar: React.FC<SidebarProps> = ({
    courses,
    semesters,
    selectedCourseId,
    onSelectCourse,
    onAddCourse,
    onEditCourse,
    onDeleteCourse,
    onAddSemester,
    onEditSemester,
    getCourseGrade
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newCourseName, setNewCourseName] = useState('');
    const [newCourseCredits, setNewCourseCredits] = useState(4);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');

    const [isAddingSemester, setIsAddingSemester] = useState(false);
    const [newSemesterName, setNewSemesterName] = useState('');

    const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
    const [editCourseName, setEditCourseName] = useState('');
    const [editCourseCredits, setEditCourseCredits] = useState(4);
    const [editCourseColor, setEditCourseColor] = useState('');
    const [editCourseSemesterId, setEditCourseSemesterId] = useState<string>('');

    const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
    const [editSemesterName, setEditSemesterName] = useState('');
    const [collapsedSemesters, setCollapsedSemesters] = useState<Set<string>>(new Set());

    // Calculate overall GPA (only for non-deleted courses)
    const courseGrades = courses
        .filter(c => !c.deleted)
        .map(course => {
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

    const getSemesterGPA = (semesterCourses: Course[]) => {
        const semesterGrades = semesterCourses.map(course => {
            const percentage = getCourseGrade ? getCourseGrade(course.id) : undefined;
            const letterGrade = percentage !== undefined
                ? calculateLetterGrade(percentage, course.gradeScale)
                : null;
            return {
                grade: letterGrade,
                credits: course.credits || 4
            };
        });
        return calculateWeightedGPA(semesterGrades);
    };

    const handleAddCourse = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCourseName.trim()) {
            onAddCourse(newCourseName, selectedColor, newCourseCredits, selectedSemesterId || undefined);
            setNewCourseName('');
            setNewCourseCredits(4);
            setSelectedSemesterId('');
            setIsAdding(false);
        }
    };

    const handleAddSemester = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSemesterName.trim()) {
            onAddSemester(newSemesterName);
            setNewSemesterName('');
            setIsAddingSemester(false);
        }
    };

    const handleStartEdit = (course: Course) => {
        setEditingCourseId(course.id);
        setEditCourseName(course.name);
        setEditCourseCredits(course.credits || 4);
        setEditCourseColor(course.color);
        setEditCourseSemesterId(course.semesterId || '');
    };

    const handleSaveEdit = () => {
        if (editingCourseId && editCourseName.trim()) {
            onEditCourse(editingCourseId, editCourseName, editCourseColor, editCourseCredits, editCourseSemesterId || undefined);
            setEditingCourseId(null);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        onDeleteCourse(id);
        setEditingCourseId(null);
    };

    const handleStartEditSemester = (semester: Semester) => {
        setEditingSemesterId(semester.id);
        setEditSemesterName(semester.name);
    };

    const handleSaveEditSemester = () => {
        if (editingSemesterId && editSemesterName.trim()) {
            onEditSemester(editingSemesterId, editSemesterName);
            setEditingSemesterId(null);
        }
    };

    const toggleSemester = (semesterId: string) => {
        setCollapsedSemesters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(semesterId)) {
                newSet.delete(semesterId);
            } else {
                newSet.add(semesterId);
            }
            return newSet;
        });
    };

    // Group courses by semester (filter out deleted courses for display)
    const activeCourses = courses.filter(c => !c.deleted);
    const coursesBySemester = semesters.map(semester => ({
        ...semester,
        courses: activeCourses.filter(c => c.semesterId === semester.id)
    }));

    const otherCourses = activeCourses.filter(c => !c.semesterId);

    const renderCourseItem = (course: Course) => {
        if (editingCourseId === course.id) {
            return (
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
                    <div className="semester-select-group">
                        <label>Semester:</label>
                        <select
                            value={editCourseSemesterId}
                            onChange={(e) => setEditCourseSemesterId(e.target.value)}
                            className="semester-select"
                        >
                            <option value="">None</option>
                            {semesters.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="color-picker-group">
                        <label>Color:</label>
                        <div className="color-picker">
                            {COLORS.map(color => (
                                <div
                                    key={color}
                                    className={`color-option ${editCourseColor === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setEditCourseColor(color)}
                                />
                            ))}
                            <div className="custom-color-wrapper" title="Choose custom color">
                                <input
                                    type="color"
                                    value={editCourseColor}
                                    onChange={(e) => setEditCourseColor(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="edit-actions">
                        <button type="button" className="delete-btn" onClick={(e) => handleDelete(e, course.id)}>Delete</button>
                        <div className="right-actions">
                            <button type="button" onClick={() => setEditingCourseId(null)}>Cancel</button>
                            <button type="button" className="confirm-btn" onClick={handleSaveEdit}>Save</button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
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
        );
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
                    className={`course-item ${selectedCourseId === 'grades-overview' ? 'active' : ''} special-item`}
                    onClick={() => onSelectCourse('grades-overview')}
                >
                    <span className="course-icon">📊</span>
                    <span className="course-name">Grades Overview</span>
                </div>
                <div
                    className={`course-item ${selectedCourseId === 'trash' ? 'active' : ''} special-item`}
                    onClick={() => onSelectCourse('trash')}
                >
                    <span className="course-icon">🗑️</span>
                    <span className="course-name">Trash</span>
                </div>

                <div className="divider"></div>

                {coursesBySemester.map(semester => {
                    const semesterGPA = getSemesterGPA(semester.courses);
                    const isCollapsed = collapsedSemesters.has(semester.id);
                    return (
                        <div key={semester.id} className="semester-group">
                            <div className="semester-header group">
                                {editingSemesterId === semester.id ? (
                                    <div className="edit-semester-inline">
                                        <input
                                            value={editSemesterName}
                                            onChange={(e) => setEditSemesterName(e.target.value)}
                                            autoFocus
                                            onBlur={handleSaveEditSemester}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEditSemester()}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="semester-title-group">
                                            <button
                                                className="toggle-semester-btn"
                                                onClick={() => toggleSemester(semester.id)}
                                            >
                                                {isCollapsed ? '▶' : '▼'}
                                            </button>
                                            <span className="semester-name">{semester.name}</span>
                                            <button
                                                className="edit-semester-btn"
                                                onClick={() => handleStartEditSemester(semester)}
                                            >
                                                ✏️
                                            </button>
                                        </div>
                                        {semesterGPA !== null && (
                                            <span className="semester-gpa">{semesterGPA.toFixed(2)}</span>
                                        )}
                                    </>
                                )}
                            </div>
                            {!isCollapsed && semester.courses.map(renderCourseItem)}
                        </div>
                    );
                })}

                {otherCourses.length > 0 && (
                    <div className="semester-group">
                        <div className="semester-header">
                            <span className="semester-name">Other</span>
                        </div>
                        {otherCourses.map(renderCourseItem)}
                    </div>
                )}
            </div>

            <div className="sidebar-actions">
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
                        <div className="semester-select-group">
                            <label>Semester:</label>
                            <select
                                value={selectedSemesterId}
                                onChange={(e) => setSelectedSemesterId(e.target.value)}
                                className="semester-select"
                            >
                                <option value="">None</option>
                                {semesters.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="color-picker-group">
                            <label>Color:</label>
                            <div className="color-picker">
                                {COLORS.map(color => (
                                    <div
                                        key={color}
                                        className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setSelectedColor(color)}
                                    />
                                ))}
                                <div className="custom-color-wrapper" title="Choose custom color">
                                    <input
                                        type="color"
                                        value={selectedColor}
                                        onChange={(e) => setSelectedColor(e.target.value)}
                                    />
                                </div>
                            </div>
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

                {isAddingSemester ? (
                    <form className="add-semester-form" onSubmit={handleAddSemester}>
                        <input
                            type="text"
                            placeholder="Semester Name (e.g. Spring 2024)"
                            value={newSemesterName}
                            onChange={(e) => setNewSemesterName(e.target.value)}
                            autoFocus
                        />
                        <div className="add-actions">
                            <button type="button" onClick={() => setIsAddingSemester(false)}>Cancel</button>
                            <button type="submit" className="confirm-btn">Add</button>
                        </div>
                    </form>
                ) : (
                    <button className="add-semester-btn" onClick={() => setIsAddingSemester(true)}>
                        + Add Semester
                    </button>
                )}
            </div>
        </div>
    );
};
