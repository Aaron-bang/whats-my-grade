import React, { useState, useRef, useEffect } from 'react';
import type { Task, AssignmentGroup } from '../types';
import { GradeScaleModal } from './GradeScaleModal';
import { calculateLetterGrade, calculateGroupAverage, calculatePercentage } from '../utils/gradeUtils';
import './TaskList.css';

interface TaskListProps {
    tasks: Task[];
    groups: AssignmentGroup[];
    onAddTask: (text: string, dueDate: string, groupId: string) => void;
    onUpdateTask: (id: string, updates: Partial<Task>) => void;
    onToggleTask: (id: string) => void;
    onDeleteTask: (id: string) => void;
    onAddGroup: (name: string, weight: number) => void;
    onUpdateGroup: (id: string, name: string, weight: number) => void;
    onDeleteGroup: (id: string) => void;
    courseGrade?: number;
    gradeScale?: { [key: string]: number };
    onUpdateGradeScale?: (gradeScale: { [key: string]: number }) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
    tasks,
    groups,
    onAddTask,
    onUpdateTask,
    onToggleTask,
    onDeleteTask,
    onAddGroup,
    onUpdateGroup,
    onDeleteGroup,
    courseGrade,
    gradeScale,
    onUpdateGradeScale
}) => {
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupWeight, setNewGroupWeight] = useState<number>(0);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editTaskText, setEditTaskText] = useState('');
    const [editTaskDescription, setEditTaskDescription] = useState('');
    const [editGroupName, setEditGroupName] = useState('');
    const [editGroupWeight, setEditGroupWeight] = useState(0);
    const [editTaskDate, setEditTaskDate] = useState('');
    const [editTaskOptOut, setEditTaskOptOut] = useState(false);
    const [isGradeScaleModalOpen, setIsGradeScaleModalOpen] = useState(false);
    const editDescriptionRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (editingTaskId && editDescriptionRef.current) {
            const el = editDescriptionRef.current;
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
        }
    }, [editTaskDescription, editingTaskId]);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim()) {
            onAddTask(newTaskText, newTaskDate, selectedGroupId);
            setNewTaskText('');
            setNewTaskDate('');
            setSelectedGroupId('');
        }
    };

    const handleAddGroup = () => {
        if (newGroupName.trim()) {
            onAddGroup(newGroupName, newGroupWeight);
            setNewGroupName('');
            setNewGroupWeight(0);
            setIsAddingGroup(false);
        }
    };

    return (
        <div className="task-list-container">
            <div className="section-header">
                <div>
                    <h3>Assignments</h3>
                    {courseGrade !== undefined && (
                        <div className="course-grade-display">
                            Course Grade: <span className="grade-value">{courseGrade.toFixed(1)}%</span>
                            {gradeScale && (
                                <span className="letter-grade-badge">{calculateLetterGrade(courseGrade, gradeScale)}</span>
                            )}
                        </div>
                    )}
                </div>
                <div className="header-buttons">
                    <button className="grade-scale-btn" onClick={() => setIsGradeScaleModalOpen(true)}>
                        📊 Grade Scale
                    </button>
                    <button className="add-group-btn" onClick={() => setIsAddingGroup(true)}>
                        + Add Group
                    </button>
                </div>
            </div>

            {isAddingGroup && (
                <div className="add-group-form">
                    <input
                        type="text"
                        placeholder="Group name (e.g., Problem Sets, Exams)"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        autoFocus
                    />
                    <input
                        type="number"
                        placeholder="Weight %"
                        value={newGroupWeight || ''}
                        onChange={(e) => setNewGroupWeight(Number(e.target.value))}
                    />
                    <div className="group-actions">
                        <button onClick={() => setIsAddingGroup(false)}>Cancel</button>
                        <button className="confirm-btn" onClick={handleAddGroup}>Add</button>
                    </div>
                </div>
            )}

            <form className="add-task-form" onSubmit={handleAddTask}>
                <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="group-select"
                >
                    <option value="">Select group...</option>
                    {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Assignment title..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    className="task-input"
                    required
                />
                {(!selectedGroupId || !groups.find(g => g.id === selectedGroupId)?.isExtraCredit) && (
                    <input
                        type="date"
                        value={newTaskDate}
                        onChange={(e) => setNewTaskDate(e.target.value)}
                        className="date-input"
                    />
                )}
                <button type="submit" className="add-task-btn">+</button>
            </form>

            <div className="tasks-scroll">
                {groups.map(group => {
                    const groupTasks = tasks.filter(t => t.groupId === group.id);
                    const groupAverage = calculateGroupAverage(group, tasks);

                    return (
                        <div key={group.id} className="assignment-group">
                            <div className="group-header">
                                {editingGroupId === group.id ? (
                                    <div className="edit-group-form">
                                        <input
                                            type="text"
                                            value={editGroupName}
                                            onChange={(e) => setEditGroupName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && editGroupName.trim()) {
                                                    onUpdateGroup(group.id, editGroupName, editGroupWeight);
                                                    setEditingGroupId(null);
                                                }
                                            }}
                                            autoFocus
                                            placeholder="Group name"
                                        />
                                        <div className="weight-input-wrapper">
                                            <input
                                                type="number"
                                                value={editGroupWeight}
                                                onChange={(e) => setEditGroupWeight(Number(e.target.value))}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && editGroupName.trim()) {
                                                        onUpdateGroup(group.id, editGroupName, editGroupWeight);
                                                        setEditingGroupId(null);
                                                    }
                                                }}
                                                style={{ width: '60px' }}
                                                placeholder="Weight"
                                            />
                                            <span>%</span>
                                        </div>
                                        <div className="edit-group-actions">
                                            <button onClick={() => setEditingGroupId(null)}>Cancel</button>
                                            <button
                                                className="confirm-btn"
                                                onClick={() => {
                                                    if (editGroupName.trim()) {
                                                        onUpdateGroup(group.id, editGroupName, editGroupWeight);
                                                    }
                                                    setEditingGroupId(null);
                                                }}
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h4 onClick={() => {
                                            setEditingGroupId(group.id);
                                            setEditGroupName(group.name);
                                            setEditGroupWeight(group.weight);
                                        }}>{group.name}</h4>
                                        <div className="group-info">
                                            <span className="group-weight">{group.weight}%</span>
                                            {groupAverage !== null && (
                                                <>
                                                    {group.isExtraCredit ? (
                                                        <span className="group-average">Total: {groupAverage.toFixed(1)}%</span>
                                                    ) : (
                                                        <>
                                                            <span className="group-average">Avg: {groupAverage.toFixed(1)}%</span>
                                                            {gradeScale && (
                                                                <span className="letter-grade-badge small">{calculateLetterGrade(groupAverage, gradeScale)}</span>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                            <button
                                                className="delete-group-btn"
                                                onClick={() => {
                                                    if (groupTasks.length === 0 || confirm('Delete this group and all its assignments?')) {
                                                        onDeleteGroup(group.id);
                                                    }
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {groupTasks.map(task => {
                                const percentage = calculatePercentage(task.earnedScore, task.totalScore);
                                const isEditing = editingTaskId === task.id;


                                return (
                                    <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                                        <div className="checkbox-wrapper" onClick={() => onToggleTask(task.id)}>
                                            <div className="checkbox">
                                                {task.completed && <span>✓</span>}
                                            </div>
                                        </div>
                                        <div className="task-content" onClick={() => {
                                            setEditingTaskId(task.id);
                                            setEditTaskText(task.text);
                                            setEditTaskDescription(task.description || '');
                                            setEditTaskDate(task.dueDate || '');
                                            setEditTaskOptOut(task.optOut || false);
                                        }}>
                                            {isEditing ? (
                                                <div className="edit-task-form" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        value={editTaskText}
                                                        onChange={(e) => setEditTaskText(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && editTaskText.trim()) {
                                                                e.preventDefault();
                                                                onUpdateTask(task.id, {
                                                                    text: editTaskText,
                                                                    description: editTaskDescription,
                                                                    dueDate: editTaskDate,
                                                                    optOut: editTaskOptOut
                                                                });
                                                                setEditingTaskId(null);
                                                            }
                                                        }}
                                                        autoFocus
                                                        className="edit-title-input"
                                                        placeholder="Assignment title..."
                                                    />
                                                    {!group.isExtraCredit && (
                                                        <>
                                                            <textarea
                                                                ref={editDescriptionRef}
                                                                value={editTaskDescription}
                                                                onChange={(e) => setEditTaskDescription(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && editTaskDescription.trim()) {
                                                                        e.preventDefault();
                                                                        onUpdateTask(task.id, {
                                                                            text: editTaskText,
                                                                            description: editTaskDescription,
                                                                            dueDate: editTaskDate,
                                                                            optOut: editTaskOptOut
                                                                        });
                                                                        setEditingTaskId(null);
                                                                    }
                                                                }}
                                                                placeholder="Description..."
                                                                className="edit-description-input"
                                                                rows={1}
                                                                onInput={(e) => {
                                                                    const target = e.target as HTMLTextAreaElement;
                                                                    target.style.height = 'auto';
                                                                    target.style.height = `${target.scrollHeight}px`;
                                                                }}
                                                            />
                                                            <div className="edit-task-meta-inputs">
                                                                <input
                                                                    type="date"
                                                                    value={editTaskDate}
                                                                    onChange={(e) => setEditTaskDate(e.target.value)}
                                                                    className="edit-date-input"
                                                                />
                                                                <label className="opt-out-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={editTaskOptOut}
                                                                        onChange={(e) => setEditTaskOptOut(e.target.checked)}
                                                                    />
                                                                    Opt-out
                                                                </label>
                                                                <label className="add-attachment-btn">
                                                                    <input
                                                                        type="file"
                                                                        multiple
                                                                        style={{ display: 'none' }}
                                                                        onChange={(e) => {
                                                                            const files = Array.from(e.target.files || []);
                                                                            files.forEach(file => {
                                                                                const reader = new FileReader();
                                                                                reader.onload = (event) => {
                                                                                    const dataUrl = event.target?.result as string;
                                                                                    const newAttachment = { name: file.name, dataUrl };
                                                                                    onUpdateTask(task.id, {
                                                                                        attachments: [...(task.attachments || []), newAttachment]
                                                                                    });
                                                                                };
                                                                                reader.readAsDataURL(file);
                                                                            });
                                                                            e.target.value = '';
                                                                        }}
                                                                    />
                                                                    📎 Add Files
                                                                </label>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="edit-task-actions">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingTaskId(null);
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            className="confirm-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (editTaskText.trim()) {
                                                                    onUpdateTask(task.id, {
                                                                        text: editTaskText,
                                                                        description: editTaskDescription,
                                                                        dueDate: editTaskDate,
                                                                        optOut: editTaskOptOut
                                                                    });
                                                                }
                                                                setEditingTaskId(null);
                                                            }}
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="task-text">
                                                        {task.text}
                                                        {task.optOut && <span className="opt-out-badge">Opt-out</span>}
                                                    </span>
                                                    {task.description && (
                                                        <span className="task-description">{task.description}</span>
                                                    )}
                                                </>
                                            )}
                                            <div className="task-meta">
                                                {task.dueDate && (
                                                    <span className="task-date">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                )}
                                                {task.completed && (
                                                    <div className="task-grade-inputs">
                                                        {group.isExtraCredit ? (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    placeholder="%"
                                                                    value={task.earnedScore ?? ''}
                                                                    onChange={(e) => onUpdateTask(task.id, { earnedScore: e.target.value ? Number(e.target.value) : undefined })}
                                                                    className="grade-input"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{ width: '60px' }}
                                                                />
                                                                <span style={{ fontSize: '0.9rem', color: '#666' }}>% added</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    placeholder=""
                                                                    value={task.earnedScore ?? ''}
                                                                    onChange={(e) => onUpdateTask(task.id, { earnedScore: e.target.value ? Number(e.target.value) : undefined })}
                                                                    className="grade-input"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                                <span>/</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder=""
                                                                    value={task.totalScore ?? ''}
                                                                    onChange={(e) => onUpdateTask(task.id, { totalScore: e.target.value ? Number(e.target.value) : undefined })}
                                                                    className="grade-input"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                {percentage && !group.isExtraCredit && (
                                                    <>
                                                        <span className="task-grade">{percentage}%</span>
                                                        {gradeScale && (
                                                            <span className="letter-grade-badge small">{calculateLetterGrade(Number(percentage), gradeScale)}</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            {/* Grade inputs - only show when completed */}

                                            {/* PDF Attachments */}
                                            <div className="task-attachments" onClick={(e) => e.stopPropagation()}>
                                                {task.attachments && task.attachments.length > 0 && (
                                                    <div className="attachments-list">
                                                        {task.attachments.map((attachment, index) => (
                                                            <div key={index} className="attachment-item">
                                                                <a
                                                                    href={attachment.dataUrl}
                                                                    download={attachment.name}
                                                                    className="attachment-link"
                                                                >
                                                                    📄 {attachment.name}
                                                                </a>
                                                                <button
                                                                    className="delete-attachment-btn"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        const newAttachments = task.attachments!.filter((_, i) => i !== index);
                                                                        onUpdateTask(task.id, { attachments: newAttachments });
                                                                    }}
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button className="delete-btn" onClick={() => onDeleteTask(task.id)}>×</button>
                                    </div>
                                );
                            })}

                            {groupTasks.length === 0 && (
                                <div className="empty-group">No assignments in this group yet.</div>
                            )}
                        </div>
                    );
                })}

                {groups.length === 0 && (
                    <div className="empty-state">
                        <p>Create an assignment group to get started!</p>
                    </div>
                )}
            </div>

            <GradeScaleModal
                isOpen={isGradeScaleModalOpen}
                onClose={() => setIsGradeScaleModalOpen(false)}
                onSave={(scale) => onUpdateGradeScale?.(scale)}
                initialGradeScale={gradeScale}
            />
        </div>
    );
};
