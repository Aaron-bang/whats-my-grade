import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { CombinedView } from './components/CombinedView';
import { AllTasks } from './components/AllTasks';
import { Trash } from './components/Trash';
import { GradesOverview } from './components/GradesOverview';
import type { Course, Note, Task, AssignmentGroup, Semester } from './types';
import { DEFAULT_GRADE_SCALE } from './utils/gradeUtils';
import './App.css';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  // State
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: 's1', name: 'Fall 2023', createdAt: Date.now() }
  ]);

  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'MATH 101', color: '#FF6B6B', semesterId: 's1', gradeScale: DEFAULT_GRADE_SCALE },
    { id: '2', name: 'HIST 105', color: '#4ECDC4', semesterId: 's1', gradeScale: DEFAULT_GRADE_SCALE },
    { id: '3', name: 'CSCI 228', color: '#FFE66D', gradeScale: DEFAULT_GRADE_SCALE }
  ]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>('1');
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  const [notes, setNotes] = useState<Note[]>([
    { id: 'n1', courseId: '1', title: 'Lecture 1', content: 'Derivatives are...', createdAt: Date.now() },
    { id: 'n2', courseId: '2', title: 'Lecture 1', content: 'Lecture 1 notes.', createdAt: Date.now() }

  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 't1',
      courseId: '1',
      text: 'Problem Set 1',
      description: 'Ad adipisicing aliqua magna cupidatat ad aliquip pariatur officia ullamco dolor id sunt.',
      dueDate: new Date().toISOString().split('T')[0],
      completed: true,
      groupId: 'g1',
      earnedScore: 37,
      totalScore: 40,
      optOut: true
    },
    {
      id: 't2',
      courseId: '1',
      text: 'Problem Set 2',
      description: 'PS2',
      dueDate: new Date().toISOString().split('T')[0],
      completed: true,
      groupId: 'g1',
      earnedScore: 39,
      totalScore: 40
    },
    {
      id: 't3',
      courseId: '1',
      text: 'Problem Set 3',
      description: 'PS3',
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      groupId: 'g1',
    }
  ]);

  const [assignmentGroups, setAssignmentGroups] = useState<AssignmentGroup[]>([
    { id: 'g1', courseId: '1', name: 'Problem Sets', weight: 30 },
    { id: 'g2', courseId: '1', name: 'Exams', weight: 50 },
    { id: 'g3', courseId: '1', name: 'Quizzes', weight: 20 }
  ]);

  // Handlers
  const handleAddSemester = (name: string) => {
    const newSemester: Semester = { id: generateId(), name, createdAt: Date.now() };
    setSemesters([newSemester, ...semesters]);
  };

  const handleEditSemester = (id: string, name: string) => {
    setSemesters(semesters.map(s => s.id === id ? { ...s, name } : s));
  };

  const handleAddCourse = (name: string, color: string, credits: number, semesterId?: string) => {
    const newCourse: Course = {
      id: generateId(),
      name,
      color,
      credits,
      semesterId,
      gradeScale: DEFAULT_GRADE_SCALE
    };
    setCourses([...courses, newCourse]);
    setSelectedCourseId(newCourse.id);
  };

  const handleUpdateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(courses.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleEditCourse = (id: string, name: string, color: string, credits: number, semesterId?: string) => {
    handleUpdateCourse(id, { name, color, credits, semesterId });
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(prevCourses => prevCourses.map(c => c.id === id ? { ...c, deleted: true } : c));
    if (selectedCourseId === id) setSelectedCourseId(null);
  };

  const handleRestoreCourse = (id: string) => {
    setCourses(courses.map(c => c.id === id ? { ...c, deleted: false } : c));
  };

  const handleAddNote = () => {
    if (!selectedCourseId || selectedCourseId === 'all-tasks' || selectedCourseId === 'trash') return;
    const newNote: Note = {
      id: generateId(),
      courseId: selectedCourseId,
      title: '',
      content: '',
      createdAt: Date.now()
    };
    setNotes([newNote, ...notes]);
  };

  const handleUpdateNote = (id: string, content: string, title: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, content, title } : n));
  };

  const handleDeleteNote = (id: string) => {
    // Soft delete
    setNotes(notes.map(n => n.id === id ? { ...n, deleted: true } : n));
  };

  const handleRestoreNote = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, deleted: false } : n));
  };

  const handleDeleteForever = (id: string, type: 'note' | 'course' | 'task') => {
    if (type === 'note') {
      setNotes(notes.filter(n => n.id !== id));
    } else if (type === 'course') {
      setCourses(courses.filter(c => c.id !== id));
      // Also delete associated notes and tasks forever? Or keep them orphaned?
      // Usually better to clean up.
      setNotes(notes.filter(n => n.courseId !== id));
      setTasks(tasks.filter(t => t.courseId !== id));
      setAssignmentGroups(assignmentGroups.filter(g => g.courseId !== id));
    } else if (type === 'task') {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const handleAddTask = (text: string, dueDate: string, groupId: string) => {
    if (!selectedCourseId || selectedCourseId === 'all-tasks' || selectedCourseId === 'trash') return;

    let finalGroupId = groupId;

    // If no group is selected, create a new group with the assignment name
    if (!groupId || groupId === '') {
      const newGroup: AssignmentGroup = {
        id: generateId(),
        courseId: selectedCourseId,
        name: text,
        weight: 0
      };
      setAssignmentGroups([...assignmentGroups, newGroup]);
      finalGroupId = newGroup.id;
    }

    const newTask: Task = {
      id: generateId(),
      courseId: selectedCourseId,
      text,
      dueDate,
      completed: false,
      groupId: finalGroupId
    };
    setTasks([...tasks, newTask]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, deleted: true } : t));
  };

  const handleRestoreTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, deleted: false } : t));
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleAddGroup = (name: string, weight: number) => {
    if (!selectedCourseId || selectedCourseId === 'all-tasks' || selectedCourseId === 'trash') return;
    const newGroup: AssignmentGroup = {
      id: generateId(),
      courseId: selectedCourseId,
      name,
      weight
    };
    setAssignmentGroups([...assignmentGroups, newGroup]);
  };

  const handleUpdateGroup = (id: string, name: string, weight: number) => {
    setAssignmentGroups(assignmentGroups.map(g => g.id === id ? { ...g, name, weight } : g));
  };

  const handleDeleteGroup = (id: string) => {
    // Delete all tasks in this group
    setTasks(tasks.filter(t => t.groupId !== id));
    setAssignmentGroups(assignmentGroups.filter(g => g.id !== id));
  };

  const handleUpdateGradeScale = (gradeScale: { [key: string]: number }) => {
    if (!selectedCourseId || selectedCourseId === 'all-tasks' || selectedCourseId === 'trash') return;
    handleUpdateCourse(selectedCourseId, { gradeScale });
  };

  // Calculate course grade based on group weights
  const calculateCourseGrade = (courseId: string): number | undefined => {
    const courseGroups = assignmentGroups.filter(g => g.courseId === courseId);

    if (courseGroups.length === 0) return undefined;

    let totalWeightedGrade = 0;
    let totalWeight = 0;

    for (const group of courseGroups) {
      const groupTasks = tasks.filter(t => t.groupId === group.id && !t.deleted);
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

    if (totalWeight === 0) return undefined;

    // Normalize by actual total weight
    return (totalWeightedGrade / totalWeight) * 100;
  };

  // Views
  let mainContent;

  const activeCourses = courses.filter(c => !c.deleted);
  const activeTasks = tasks.filter(t => !t.deleted && !courses.find(c => c.id === t.courseId)?.deleted);

  if (selectedCourseId === 'all-tasks') {
    mainContent = (
      <AllTasks
        tasks={activeTasks}
        courses={activeCourses}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />
    );
  } else if (selectedCourseId === 'grades-overview') {
    mainContent = (
      <GradesOverview
        courses={activeCourses}
        semesters={semesters}
        getCourseGrade={calculateCourseGrade}
      />
    );
  } else if (selectedCourseId === 'trash') {
    const deletedNotes = notes.filter(n => n.deleted || courses.find(c => c.id === n.courseId)?.deleted);
    const deletedCourses = courses.filter(c => c.deleted);
    const deletedTasks = tasks.filter(t => t.deleted || courses.find(c => c.id === t.courseId)?.deleted);

    mainContent = (
      <Trash
        notes={deletedNotes}
        courses={courses} // Pass all courses to look up names
        deletedCourses={deletedCourses}
        deletedTasks={deletedTasks}
        onRestoreNote={handleRestoreNote}
        onRestoreCourse={handleRestoreCourse}
        onRestoreTask={handleRestoreTask}
        onDeleteForever={handleDeleteForever}
      />
    );
  } else {
    const currentCourse = activeCourses.find(c => c.id === selectedCourseId);
    if (selectedCourseId && currentCourse) {
      const courseNotes = notes.filter(n => n.courseId === selectedCourseId && !n.deleted);
      const courseTasks = tasks.filter(t => t.courseId === selectedCourseId && !t.deleted);
      const courseGroups = assignmentGroups.filter(g => g.courseId === selectedCourseId);
      const courseGrade = calculateCourseGrade(selectedCourseId);

      mainContent = (
        <>
          <header className="course-header" style={{ borderBottomColor: currentCourse.color }}>
            <div className="header-left">
              <h1 style={{ color: currentCourse.color }}>{currentCourse.name}</h1>
            </div>
            <div className="course-info">
              {isEditingInfo ? (
                <>
                  <div className="info-content">
                    <div className="info-group">
                      <label>Professor:</label>
                      <input
                        type="text"
                        placeholder="Name"
                        value={currentCourse.professorName || ''}
                        onChange={(e) => handleUpdateCourse(currentCourse.id, { professorName: e.target.value })}
                        className="info-input"
                      />
                      <input
                        type="text"
                        placeholder="Email"
                        value={currentCourse.professorEmail || ''}
                        onChange={(e) => handleUpdateCourse(currentCourse.id, { professorEmail: e.target.value })}
                        className="info-input email"
                      />
                    </div>
                    <div className="info-group">
                      <label>TA:</label>
                      <input
                        type="text"
                        placeholder="Name"
                        value={currentCourse.taName || ''}
                        onChange={(e) => handleUpdateCourse(currentCourse.id, { taName: e.target.value })}
                        className="info-input"
                      />
                      <input
                        type="text"
                        placeholder="Email"
                        value={currentCourse.taEmail || ''}
                        onChange={(e) => handleUpdateCourse(currentCourse.id, { taEmail: e.target.value })}
                        className="info-input email"
                      />
                    </div>
                  </div>
                  <button className="save-info-btn" onClick={() => setIsEditingInfo(false)}>Save</button>
                </>
              ) : (
                <>
                  <div className="info-display">
                    <div className="info-row">
                      <span className="info-label">Professor:</span>
                      <span className="info-value">
                        {currentCourse.professorName || 'Not set'}
                        {currentCourse.professorEmail && <span className="info-email"> ({currentCourse.professorEmail})</span>}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">TA:</span>
                      <span className="info-value">
                        {currentCourse.taName || 'Not set'}
                        {currentCourse.taEmail && <span className="info-email"> ({currentCourse.taEmail})</span>}
                      </span>
                    </div>
                  </div>
                  <button className="edit-info-btn" onClick={() => setIsEditingInfo(true)}>✏️</button>
                </>
              )}
            </div>
          </header>

          <div className="content-area">
            <CombinedView
              notes={courseNotes}
              tasks={courseTasks}
              groups={courseGroups}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              onAddGroup={handleAddGroup}
              onUpdateGroup={handleUpdateGroup}
              onDeleteGroup={handleDeleteGroup}
              courseGrade={courseGrade}
              gradeScale={currentCourse.gradeScale}
              onUpdateGradeScale={handleUpdateGradeScale}
            />
          </div>
        </>
      );
    } else {
      mainContent = (
        <div className="no-selection">
          <h2>Select a class to get started</h2>
        </div>
      );
    }
  }

  return (
    <div className="app-container">
      <Sidebar
        courses={courses}
        semesters={semesters}
        selectedCourseId={selectedCourseId}
        onSelectCourse={(id) => {
          setSelectedCourseId(id);
          setIsEditingInfo(false);
        }}
        onAddCourse={handleAddCourse}
        onEditCourse={handleEditCourse}
        onDeleteCourse={handleDeleteCourse}
        onAddSemester={handleAddSemester}
        onEditSemester={handleEditSemester}
        getCourseGrade={calculateCourseGrade}
      />

      <main className="main-content">
        {mainContent}
      </main>
    </div>
  );
}

export default App;
