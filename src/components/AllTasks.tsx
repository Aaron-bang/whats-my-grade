import React, { useState, useMemo } from 'react';
import type { Task, Course } from '../types';
import './AllTasks.css';

interface AllTasksProps {
    tasks: Task[];
    courses: Course[];
    onToggleTask: (id: string) => void;
    onDeleteTask: (id: string) => void;
}

type SortOption = 'course' | 'date' | 'status';

export const AllTasks: React.FC<AllTasksProps> = ({ tasks, courses, onToggleTask, onDeleteTask }) => {
    const [sortBy, setSortBy] = useState<SortOption>('date');

    const getCourseName = (courseId: string) => {
        return courses.find(c => c.id === courseId)?.name || 'Unknown Course';
    };

    const getCourseColor = (courseId: string) => {
        return courses.find(c => c.id === courseId)?.color || '#ccc';
    };

    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            if (sortBy === 'course') {
                const courseA = getCourseName(a.courseId);
                const courseB = getCourseName(b.courseId);
                return courseA.localeCompare(courseB);
            } else if (sortBy === 'date') {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return a.dueDate.localeCompare(b.dueDate);
            } else if (sortBy === 'status') {
                return (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
            }
            return 0;
        });
    }, [tasks, courses, sortBy]);

    return (
        <div className="all-tasks-container">
            <div className="all-tasks-header">
                <h2>All Tasks</h2>
                <div className="sort-controls">
                    <span>Sort by:</span>
                    <button
                        className={`sort-btn ${sortBy === 'course' ? 'active' : ''}`}
                        onClick={() => setSortBy('course')}
                    >
                        Class
                    </button>
                    <button
                        className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`}
                        onClick={() => setSortBy('date')}
                    >
                        Due Date
                    </button>
                    <button
                        className={`sort-btn ${sortBy === 'status' ? 'active' : ''}`}
                        onClick={() => setSortBy('status')}
                    >
                        Status
                    </button>
                </div>
            </div>

            <div className="all-tasks-list">
                {sortedTasks.map(task => (
                    <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                        <div className="checkbox-wrapper" onClick={() => onToggleTask(task.id)}>
                            <div className="checkbox" style={{ borderColor: getCourseColor(task.courseId), color: getCourseColor(task.courseId) }}>
                                {task.completed && <span>✓</span>}
                            </div>
                        </div>
                        <div className="task-content">
                            <div className="task-meta">
                                <span className="task-course-badge" style={{ backgroundColor: getCourseColor(task.courseId) }}>
                                    {getCourseName(task.courseId)}
                                </span>
                                {task.dueDate && (
                                    <span className="task-date">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                )}
                            </div>
                            <span className="task-text">{task.text}</span>
                        </div>
                        <button className="delete-btn" onClick={() => onDeleteTask(task.id)}>×</button>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <div className="empty-state">
                        <p>No tasks found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
