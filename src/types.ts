export interface Semester {
    id: string;
    name: string;
    createdAt: number;
}

export interface Course {
    id: string;
    name: string;
    color: string;
    professorName?: string;
    professorEmail?: string;
    taName?: string;
    taEmail?: string;
    gradeScale?: { [key: string]: number }; // Letter grade thresholds
    credits?: number; // Number of credits, default 4
    semesterId?: string;
    deleted?: boolean;
}

export interface Note {
    id: string;
    courseId: string;
    title: string;
    content: string;
    createdAt: number;
    deleted?: boolean;
}

export interface Task {
    id: string;
    courseId: string;
    text: string;
    description?: string;
    dueDate: string; // YYYY-MM-DD
    completed: boolean;
    totalScore?: number;
    earnedScore?: number;
    groupId?: string; // Reference to assignment group
    attachments?: { name: string; dataUrl: string }[]; // PDF attachments
    optOut?: boolean;
    deleted?: boolean;
}

export interface AssignmentGroup {
    id: string;
    courseId: string;
    name: string;
    weight: number; // percentage weight of this group
}
