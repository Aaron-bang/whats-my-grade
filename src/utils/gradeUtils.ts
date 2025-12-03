/**
 * Default grade scale (standard US grading system)
 */
export const DEFAULT_GRADE_SCALE: { [key: string]: number } = {
    'A': 93,
    'A-': 90,
    'B+': 87,
    'B': 83,
    'B-': 80,
    'C+': 77,
    'C': 73,
    'C-': 70,
    'D+': 67,
    'D': 63,
    'D-': 60,
    'F': 0
};

import type { Task, AssignmentGroup } from '../types';

/**
 * Calculate letter grade from percentage based on grade scale
 * @param percentage - The percentage score (0-100)
 * @param gradeScale - Object mapping letter grades to minimum percentages
 * @returns The letter grade or null if no grade scale is provided
 */
export const calculateLetterGrade = (
    percentage: number,
    gradeScale?: { [key: string]: number }
): string | null => {
    if (!gradeScale) return null;

    // Sort grades by threshold in descending order
    const sortedGrades = Object.entries(gradeScale)
        .sort(([, a], [, b]) => b - a);

    // Find the first grade where percentage meets or exceeds the threshold
    for (const [grade, threshold] of sortedGrades) {
        if (percentage >= threshold) {
            return grade;
        }
    }

    // If no grade matches, return the lowest grade (usually F)
    return sortedGrades[sortedGrades.length - 1]?.[0] || null;
};

/**
 * Get GPA points for a letter grade based on the provided chart
 */
export const getGPAPoints = (letterGrade: string): number => {
    switch (letterGrade) {
        case 'A': return 4.0;
        case 'A-': return 3 + (2 / 3);
        case 'B+': return 3 + (1 / 3);
        case 'B': return 3.0;
        case 'B-': return 2 + (2 / 3);
        case 'C+': return 2 + (1 / 3);
        case 'C': return 2.0;
        case 'C-': return 1 + (2 / 3);
        case 'D+': return 1 + (1 / 3);
        case 'D': return 1.0;
        case 'D-': return 2 / 3;
        case 'F': return 0.0;
        default: return 0.0;
    }
};

/**
 * Calculate weighted GPA for a list of courses
 */
export const calculateWeightedGPA = (
    courses: { grade: string | null; credits: number }[]
): number | null => {
    let totalPoints = 0;
    let totalCredits = 0;

    for (const course of courses) {
        if (course.grade) {
            const points = getGPAPoints(course.grade);
            totalPoints += points * course.credits;
            totalCredits += course.credits;
        }
    }

    if (totalCredits === 0) return null;
    return totalPoints / totalCredits;
};

/**
 * Calculate the average score for a specific assignment group
 */
export const calculateGroupAverage = (
    group: AssignmentGroup,
    tasks: Task[]
): number | null => {
    const groupTasks = tasks.filter(t => t.groupId === group.id);

    if (group.isExtraCredit) {
        const totalExtra = groupTasks.reduce((sum, t) => {
            if (t.completed && t.earnedScore !== undefined) {
                return sum + t.earnedScore;
            }
            return sum;
        }, 0);
        return totalExtra;
    }

    const gradedTasks = groupTasks.filter(t =>
        t.earnedScore !== undefined &&
        t.totalScore !== undefined &&
        t.totalScore > 0 &&
        !t.optOut
    );

    if (gradedTasks.length === 0) return null;

    const average = gradedTasks.reduce((sum, t) => {
        const percentage = ((t.earnedScore! / t.totalScore!) * 100);
        return sum + percentage;
    }, 0) / gradedTasks.length;

    return average;
};

/**
 * Calculate the overall course grade based on assignment groups and their weights
 */
export const calculateCourseGrade = (
    courseId: string,
    tasks: Task[],
    assignmentGroups: AssignmentGroup[]
): number | undefined => {
    const courseGroups = assignmentGroups.filter(g => g.courseId === courseId);

    if (courseGroups.length === 0) return undefined;

    let totalWeightedGrade = 0;
    let totalWeight = 0;
    let extraCreditTotal = 0;

    for (const group of courseGroups) {
        const groupTasks = tasks.filter(t => t.groupId === group.id && !t.deleted);

        if (group.isExtraCredit) {
            // For extra credit, just sum the earned scores (treated as percentage points)
            const groupExtraCredit = groupTasks.reduce((sum, t) => {
                if (t.completed && t.earnedScore !== undefined) {
                    return sum + t.earnedScore;
                }
                return sum;
            }, 0);
            extraCreditTotal += groupExtraCredit;
            continue;
        }

        const gradedTasks = groupTasks.filter(t =>
            t.earnedScore !== undefined &&
            t.totalScore !== undefined &&
            t.totalScore > 0 &&
            !t.optOut
        );

        if (gradedTasks.length > 0) {
            // Calculate average for this group
            const groupAverage = gradedTasks.reduce((sum, t) => {
                const percentage = ((t.earnedScore! / t.totalScore!) * 100);
                return sum + percentage;
            }, 0) / gradedTasks.length;

            // Add weighted contribution
            totalWeightedGrade += (groupAverage * group.weight / 100);
            totalWeight += group.weight;
        }
    }

    if (totalWeight === 0 && extraCreditTotal === 0) return undefined;

    // If only extra credit exists, return that
    if (totalWeight === 0) return extraCreditTotal;

    // Normalize by actual total weight and add extra credit
    return ((totalWeightedGrade / totalWeight) * 100) + extraCreditTotal;
};

/**
 * Calculate percentage from earned and total score
 */
export const calculatePercentage = (earned?: number, total?: number): string | null => {
    if (earned !== undefined && total !== undefined && total > 0) {
        return ((earned / total) * 100).toFixed(1);
    }
    return null;
};
