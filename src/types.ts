export interface Semester {
    id: string;
    name: string;
    createdAt: number;
}

export interface Course {
    id: string;
    name: string;
    title?: string; // Course title (e.g., "Introduction to Calculus 1")
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
    isExtraCredit?: boolean; // If true, points are added directly to final grade
}

// Gmail Integration Types

export interface GmailAuth {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    email: string;
}

export interface EmailMessage {
    id: string;
    subject: string;
    from: string;
    date: Date;
    body: string;
    snippet: string;
}

export interface ExtractedAssignment {
    title: string;
    description?: string;
    dueDate?: string; // YYYY-MM-DD
    courseName?: string;
    assignmentType?: string; // homework, exam, quiz, project, etc.
    points?: number;
    confidence: number; // AI confidence score 0-1
    sourceEmailId: string;
    sourceEmailSubject?: string;
}

export interface SyncSettings {
    dateRange: number; // days to look back
    keywords: string[];
    lastSyncTime?: number;
}
