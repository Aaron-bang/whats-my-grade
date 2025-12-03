import React, { useState, useEffect } from 'react';
import { DEFAULT_GRADE_SCALE } from '../utils/gradeUtils';
import './GradeScaleModal.css';

interface GradeScaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (gradeScale: { [key: string]: number }) => void;
    initialGradeScale?: { [key: string]: number };
}

const DEFAULT_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];

export const GradeScaleModal: React.FC<GradeScaleModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialGradeScale
}) => {
    const [gradeScale, setGradeScale] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        if (initialGradeScale) {
            setGradeScale(initialGradeScale);
        } else {
            // Default grade scale
            setGradeScale(DEFAULT_GRADE_SCALE);
        }
    }, [initialGradeScale, isOpen]);

    const handleSave = () => {
        onSave(gradeScale);
        onClose();
    };

    const handleInputChange = (grade: string, value: string) => {
        const numValue = value === '' ? 0 : Number(value);
        setGradeScale({ ...gradeScale, [grade]: numValue });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Grade Scale</h2>
                <p className="modal-description">Set the minimum percentage for each letter grade</p>

                <div className="grade-scale-table">
                    <div className="grade-scale-header">
                        <span>Letter Grade</span>
                        <span>Minimum %</span>
                    </div>
                    {DEFAULT_GRADES.map((grade) => (
                        <div key={grade} className="grade-scale-row">
                            <span className="grade-letter">{grade}</span>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={gradeScale[grade] ?? ''}
                                onChange={(e) => handleInputChange(grade, e.target.value)}
                                className="grade-input-field"
                            />
                        </div>
                    ))}
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                    <button onClick={handleSave} className="save-btn">Save</button>
                </div>
            </div>
        </div>
    );
};
