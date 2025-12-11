// Email Sync Modal - Review and import extracted assignments
import { useState, useEffect } from 'react';
import { identifyCourse } from '../services/aiService';
import type { ExtractedAssignment, Course, AssignmentGroup } from '../types';
import './EmailSyncModal.css';

interface EmailSyncModalProps {
    assignments: ExtractedAssignment[];
    courses: Course[];
    groups: AssignmentGroup[];
    onImport: (assignments: ImportableAssignment[]) => void;
    onClose: () => void;
}

export interface ImportableAssignment extends ExtractedAssignment {
    courseId?: string;
    groupId?: string;
    selected: boolean;
}

export function EmailSyncModal({ assignments, courses, groups, onImport, onClose }: EmailSyncModalProps) {
    const [importable, setImportable] = useState<ImportableAssignment[]>([]);
    const [filter, setFilter] = useState<'all' | 'high' | 'low'>('all');

    useEffect(() => {
        // Convert to importable format with course matching
        const mapped = assignments.map(assignment => {
            const matchedCourse = identifyCourse(assignment, courses);
            return {
                ...assignment,
                courseId: matchedCourse?.id,
                selected: assignment.confidence >= 0.5, // Auto-select high confidence
            };
        });
        setImportable(mapped);
    }, [assignments, courses]);

    function toggleSelection(index: number) {
        setImportable(prev => prev.map((a, i) =>
            i === index ? { ...a, selected: !a.selected } : a
        ));
    }

    function toggleAll() {
        const allSelected = importable.every(a => a.selected);
        setImportable(prev => prev.map(a => ({ ...a, selected: !allSelected })));
    }

    function updateCourse(index: number, courseId: string) {
        setImportable(prev => prev.map((a, i) =>
            i === index ? { ...a, courseId } : a
        ));
    }

    function updateGroup(index: number, groupId: string) {
        setImportable(prev => prev.map((a, i) =>
            i === index ? { ...a, groupId } : a
        ));
    }

    function handleImport() {
        const selected = importable.filter(a => a.selected && a.courseId);
        onImport(selected);
    }

    const filteredAssignments = importable.filter(a => {
        if (filter === 'high') return a.confidence >= 0.7;
        if (filter === 'low') return a.confidence < 0.7;
        return true;
    });

    const selectedCount = importable.filter(a => a.selected).length;

    if (assignments.length === 0) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="email-sync-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>📧 Email Sync Results</h2>
                        <button className="close-button" onClick={onClose}>✕</button>
                    </div>
                    <div className="modal-body">
                        <div className="empty-state">
                            <span className="empty-icon">📭</span>
                            <h3>No assignments found</h3>
                            <p>We didn't find any assignments in your recent emails.</p>
                            <p className="empty-hint">Try adjusting your sync settings or date range.</p>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="button-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="email-sync-modal large" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>📧 Review Extracted Assignments</h2>
                        <p className="modal-subtitle">
                            Found {assignments.length} potential assignment{assignments.length !== 1 ? 's' : ''} •
                            {selectedCount} selected
                        </p>
                    </div>
                    <button className="close-button" onClick={onClose}>✕</button>
                </div>

                <div className="modal-controls">
                    <div className="filter-buttons">
                        <button
                            className={filter === 'all' ? 'active' : ''}
                            onClick={() => setFilter('all')}
                        >
                            All ({importable.length})
                        </button>
                        <button
                            className={filter === 'high' ? 'active' : ''}
                            onClick={() => setFilter('high')}
                        >
                            High Confidence ({importable.filter(a => a.confidence >= 0.7).length})
                        </button>
                        <button
                            className={filter === 'low' ? 'active' : ''}
                            onClick={() => setFilter('low')}
                        >
                            Low Confidence ({importable.filter(a => a.confidence < 0.7).length})
                        </button>
                    </div>
                    <button className="select-all-button" onClick={toggleAll}>
                        {importable.every(a => a.selected) ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                <div className="modal-body">
                    <div className="assignments-list">
                        {filteredAssignments.map((assignment) => {
                            const actualIndex = importable.indexOf(assignment);
                            const courseGroups = assignment.courseId
                                ? groups.filter(g => g.courseId === assignment.courseId)
                                : [];

                            return (
                                <div
                                    key={actualIndex}
                                    className={`assignment-card ${assignment.selected ? 'selected' : ''}`}
                                >
                                    <div className="card-header">
                                        <input
                                            type="checkbox"
                                            checked={assignment.selected}
                                            onChange={() => toggleSelection(actualIndex)}
                                            className="assignment-checkbox"
                                        />
                                        <div className="assignment-info">
                                            <h3>{assignment.title}</h3>
                                            <div className="assignment-meta">
                                                <span className="confidence-badge" data-level={
                                                    assignment.confidence >= 0.8 ? 'high' :
                                                        assignment.confidence >= 0.5 ? 'medium' : 'low'
                                                }>
                                                    {Math.round(assignment.confidence * 100)}% confident
                                                </span>
                                                {assignment.assignmentType && (
                                                    <span className="type-badge">{assignment.assignmentType}</span>
                                                )}
                                                {assignment.dueDate && (
                                                    <span className="due-date">📅 {assignment.dueDate}</span>
                                                )}
                                                {assignment.points && (
                                                    <span className="points">🎯 {assignment.points} pts</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {assignment.description && (
                                        <p className="assignment-description">{assignment.description}</p>
                                    )}

                                    <div className="assignment-source">
                                        <span className="source-label">From:</span>
                                        <span className="source-email">{assignment.sourceEmailSubject}</span>
                                    </div>

                                    <div className="assignment-mapping">
                                        <div className="mapping-field">
                                            <label>Course:</label>
                                            <select
                                                value={assignment.courseId || ''}
                                                onChange={(e) => updateCourse(actualIndex, e.target.value)}
                                                className="course-select"
                                            >
                                                <option value="">Select course...</option>
                                                {courses.filter(c => !c.deleted).map(course => (
                                                    <option key={course.id} value={course.id}>
                                                        {course.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {assignment.courseId && courseGroups.length > 0 && (
                                            <div className="mapping-field">
                                                <label>Group:</label>
                                                <select
                                                    value={assignment.groupId || ''}
                                                    onChange={(e) => updateGroup(actualIndex, e.target.value)}
                                                    className="group-select"
                                                >
                                                    <option value="">Select group...</option>
                                                    {courseGroups.map(group => (
                                                        <option key={group.id} value={group.id}>
                                                            {group.name} ({group.weight}%)
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="button-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="button-primary"
                        onClick={handleImport}
                        disabled={selectedCount === 0}
                    >
                        Import {selectedCount} Assignment{selectedCount !== 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    );
}
