import React from 'react';
import { NoteList } from './NoteList';
import { TaskList } from './TaskList';
import type { Note, Task, AssignmentGroup } from '../types';
import './CombinedView.css';

interface CombinedViewProps {
    notes: Note[];
    tasks: Task[];
    groups: AssignmentGroup[];
    onAddNote: () => void;
    onUpdateNote: (id: string, content: string, title: string) => void;
    onDeleteNote: (id: string) => void;
    onAddTask: (text: string, dueDate: string, groupId: string) => void;
    onUpdateTask: (id: string, updates: Partial<Task>) => void;
    onToggleTask: (id: string) => void;
    onDeleteTask: (id: string) => void;
    onAddGroup: (name: string, weight: number) => void;
    onUpdateGroup: (id: string, name: string, weight: number) => void;
    onDeleteGroup: (id: string) => void;
    courseGrade?: number;
}

export const CombinedView: React.FC<CombinedViewProps> = ({
    notes,
    tasks,
    groups,
    onAddNote,
    onUpdateNote,
    onDeleteNote,
    onAddTask,
    onUpdateTask,
    onToggleTask,
    onDeleteTask,
    onAddGroup,
    onUpdateGroup,
    onDeleteGroup,
    courseGrade
}) => {
    return (
        <div className="combined-view">
            <div className="combined-left">
                <NoteList
                    notes={notes}
                    onAddNote={onAddNote}
                    onUpdateNote={onUpdateNote}
                    onDeleteNote={onDeleteNote}
                />
            </div>
            <div className="combined-right">
                <TaskList
                    tasks={tasks}
                    groups={groups}
                    onAddTask={onAddTask}
                    onUpdateTask={onUpdateTask}
                    onToggleTask={onToggleTask}
                    onDeleteTask={onDeleteTask}
                    onAddGroup={onAddGroup}
                    onUpdateGroup={onUpdateGroup}
                    onDeleteGroup={onDeleteGroup}
                    courseGrade={courseGrade}
                />
            </div>
        </div>
    );
};
