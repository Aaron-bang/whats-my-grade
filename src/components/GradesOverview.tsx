import React, { useState } from 'react';
import type { Course, Semester } from '../types';
import { calculateLetterGrade, calculateWeightedGPA } from '../utils/gradeUtils';
import './GradesOverview.css';

interface GradesOverviewProps {
    courses: Course[];
    semesters: Semester[];
    getCourseGrade?: (courseId: string) => number | undefined;
}

export const GradesOverview: React.FC<GradesOverviewProps> = ({
    courses,
    semesters,
    getCourseGrade
}) => {
    const [collapsedSemesters, setCollapsedSemesters] = useState<Set<string>>(new Set());

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

    // Group courses by semester
    const coursesBySemester = semesters.map(semester => ({
        ...semester,
        courses: courses.filter(c => c.semesterId === semester.id && !c.deleted)
    }));

    const otherCourses = courses.filter(c => !c.semesterId && !c.deleted);

    // Calculate semester stats
    const getSemesterStats = (semesterCourses: Course[]) => {
        const totalCredits = semesterCourses.reduce((sum, c) => sum + (c.credits || 4), 0);

        const courseGrades = semesterCourses.map(course => {
            const percentage = getCourseGrade ? getCourseGrade(course.id) : undefined;
            const letterGrade = percentage !== undefined
                ? calculateLetterGrade(percentage, course.gradeScale)
                : null;
            return {
                grade: letterGrade,
                credits: course.credits || 4
            };
        });

        const gpa = calculateWeightedGPA(courseGrades);
        const qualityPoints = gpa !== null ? gpa * totalCredits : 0;

        return { totalCredits, gpa, qualityPoints };
    };

    // Calculate overall stats
    const allCoursesWithGrades = courses.filter(c => {
        const grade = getCourseGrade ? getCourseGrade(c.id) : undefined;
        return grade !== undefined && !c.deleted;
    });

    const overallStats = getSemesterStats(allCoursesWithGrades);

    return (
        <div className="grades-overview-container">
            <div className="grades-header">
                <h1>Grades Overview</h1>
                <p className="grades-subtitle">Academic transcript view</p>
            </div>

            <div className="grades-table-wrapper">
                <table className="grades-table">
                    <thead>
                        <tr>
                            <th className="subject-col">Subject</th>
                            <th className="credits-col">Credits</th>
                            <th className="pct-col">PCT</th>
                            <th className="grade-col">Grade</th>
                            <th className="gpa-col">GPA</th>
                            <th className="qpts-col">QPTS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coursesBySemester.map(semester => {
                            if (semester.courses.length === 0) return null;

                            const isCollapsed = collapsedSemesters.has(semester.id);
                            const semesterStats = getSemesterStats(semester.courses);

                            return (
                                <React.Fragment key={semester.id}>
                                    <tr className="semester-row" onClick={() => toggleSemester(semester.id)}>
                                        <td className="semester-name">
                                            <span className="toggle-icon">{isCollapsed ? '▶' : '▼'}</span>
                                            {semester.name}
                                        </td>
                                        <td className="semester-credits">{semesterStats.totalCredits}</td>
                                        <td></td>
                                        <td></td>
                                        <td className="semester-gpa">
                                            {semesterStats.gpa !== null ? semesterStats.gpa.toFixed(2) : '-'}
                                        </td>
                                        <td className="semester-qpts">
                                            {semesterStats.qualityPoints.toFixed(2)}
                                        </td>
                                    </tr>
                                    {!isCollapsed && semester.courses.map(course => {
                                        const courseGrade = getCourseGrade ? getCourseGrade(course.id) : undefined;
                                        const letterGrade = courseGrade !== undefined && course.gradeScale
                                            ? calculateLetterGrade(courseGrade, course.gradeScale)
                                            : '-';

                                        // Calculate GPA for this course
                                        const gradePoints = letterGrade !== '-'
                                            ? calculateWeightedGPA([{ grade: letterGrade, credits: course.credits || 4 }])
                                            : null;

                                        const qualityPoints = gradePoints !== null
                                            ? gradePoints * (course.credits || 4)
                                            : 0;

                                        return (
                                            <tr key={course.id} className="course-row">
                                                <td className="course-name">
                                                    <span className="course-color-dot" style={{ backgroundColor: course.color }}></span>
                                                    {course.name}
                                                    {(course.professorName || course.taName) && (
                                                        <div className="course-contacts-inline">
                                                            {course.professorName && (
                                                                <span>👨‍🏫 {course.professorName}</span>
                                                            )}
                                                            {course.taName && (
                                                                <span>👤 {course.taName}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="course-credits">{course.credits || 4}</td>
                                                <td className="course-pct">
                                                    {courseGrade !== undefined ? `${courseGrade.toFixed(1)}%` : '-'}
                                                </td>
                                                <td className="course-grade">{letterGrade}</td>
                                                <td className="course-gpa">
                                                    {gradePoints !== null ? gradePoints.toFixed(2) : '-'}
                                                </td>
                                                <td className="course-qpts">
                                                    {qualityPoints.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}

                        {otherCourses.length > 0 && (
                            <>
                                <tr className="semester-row">
                                    <td className="semester-name">Other</td>
                                    <td className="semester-credits">
                                        {otherCourses.reduce((sum, c) => sum + (c.credits || 4), 0)}
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td className="semester-gpa">
                                        {getSemesterStats(otherCourses).gpa?.toFixed(2) || '-'}
                                    </td>
                                    <td className="semester-qpts">
                                        {getSemesterStats(otherCourses).qualityPoints.toFixed(2)}
                                    </td>
                                </tr>
                                {otherCourses.map(course => {
                                    const courseGrade = getCourseGrade ? getCourseGrade(course.id) : undefined;
                                    const letterGrade = courseGrade !== undefined && course.gradeScale
                                        ? calculateLetterGrade(courseGrade, course.gradeScale)
                                        : '-';

                                    const gradePoints = letterGrade !== '-'
                                        ? calculateWeightedGPA([{ grade: letterGrade, credits: course.credits || 4 }])
                                        : null;

                                    const qualityPoints = gradePoints !== null
                                        ? gradePoints * (course.credits || 4)
                                        : 0;

                                    return (
                                        <tr key={course.id} className="course-row">
                                            <td className="course-name">
                                                <span className="course-color-dot" style={{ backgroundColor: course.color }}></span>
                                                {course.name}
                                            </td>
                                            <td className="course-credits">{course.credits || 4}</td>
                                            <td className="course-pct">
                                                {courseGrade !== undefined ? `${courseGrade.toFixed(1)}%` : '-'}
                                            </td>
                                            <td className="course-grade">{letterGrade}</td>
                                            <td className="course-gpa">
                                                {gradePoints !== null ? gradePoints.toFixed(2) : '-'}
                                            </td>
                                            <td className="course-qpts">
                                                {qualityPoints.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </>
                        )}

                        {/* Totals row */}
                        <tr className="totals-row">
                            <td className="totals-label">Total</td>
                            <td className="totals-credits">{overallStats.totalCredits}</td>
                            <td></td>
                            <td></td>
                            <td className="totals-gpa">
                                {overallStats.gpa !== null ? overallStats.gpa.toFixed(2) : '-'}
                            </td>
                            <td className="totals-qpts">
                                {overallStats.qualityPoints.toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {allCoursesWithGrades.length === 0 && (
                    <div className="empty-grades-state">
                        <h3>No Grades Yet</h3>
                        <p>Complete assignments and add grades to see your transcript here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
