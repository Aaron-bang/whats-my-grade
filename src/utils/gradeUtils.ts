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
