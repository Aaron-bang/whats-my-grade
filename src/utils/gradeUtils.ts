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
