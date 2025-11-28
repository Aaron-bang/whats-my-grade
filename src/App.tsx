import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { CombinedView } from './components/CombinedView';
import { AllTasks } from './components/AllTasks';
import { Trash } from './components/Trash';
import type { Course, Note, Task, AssignmentGroup } from './types';
import './App.css';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  // State
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'MATH 101', color: '#FF6B6B' },
    { id: '2', name: 'HIST 105', color: '#4ECDC4' },
    { id: '3', name: 'CSCI 226', color: '#FFE66D' }
  ]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>('1');

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
  const handleAddCourse = (name: string, color: string) => {
    const newCourse: Course = { id: generateId(), name, color };
    setCourses([...courses, newCourse]);
    setSelectedCourseId(newCourse.id);
  };

  const handleUpdateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(courses.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleEditCourse = (id: string, name: string, color: string) => {
    handleUpdateCourse(id, { name, color });
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

  const handleDeleteForever = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleAddTask = (text: string, dueDate: string, groupId: string) => {
    if (!selectedCourseId || selectedCourseId === 'all-tasks' || selectedCourseId === 'trash') return;
    const newTask: Task = {
      id: generateId(),
      courseId: selectedCourseId,
      text,
      dueDate,
      completed: false,
      groupId
    };
    setTasks([...tasks, newTask]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
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

  // Calculate course grade based on group weights
  const calculateCourseGrade = (courseId: string): number | undefined => {
    const courseGroups = assignmentGroups.filter(g => g.courseId === courseId);

    if (courseGroups.length === 0) return undefined;

    let totalWeightedGrade = 0;
    let totalWeight = 0;

    for (const group of courseGroups) {
      const groupTasks = tasks.filter(t => t.groupId === group.id);
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

  if (selectedCourseId === 'all-tasks') {
    mainContent = (
      <AllTasks
        tasks={tasks}
        courses={courses}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />
    );
  } else if (selectedCourseId === 'trash') {
    const deletedNotes = notes.filter(n => n.deleted);
    mainContent = (
      <Trash
        notes={deletedNotes}
        courses={courses}
        onRestoreNote={handleRestoreNote}
        onDeleteForever={handleDeleteForever}
      />
    );
  } else {
    const currentCourse = courses.find(c => c.id === selectedCourseId);
    if (selectedCourseId && currentCourse) {
      const courseNotes = notes.filter(n => n.courseId === selectedCourseId && !n.deleted);
      const courseTasks = tasks.filter(t => t.courseId === selectedCourseId);
      const courseGroups = assignmentGroups.filter(g => g.courseId === selectedCourseId);
      const courseGrade = calculateCourseGrade(selectedCourseId);

      mainContent = (
        <>
          <header className="course-header" style={{ borderBottomColor: currentCourse.color }}>
            <div className="header-left">
              <h1 style={{ color: currentCourse.color }}>{currentCourse.name}</h1>
            </div>
            <div className="course-info">
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
        selectedCourseId={selectedCourseId}
        onSelectCourse={setSelectedCourseId}
        onAddCourse={handleAddCourse}
        onEditCourse={handleEditCourse}
        getCourseGrade={calculateCourseGrade}
      />

      <main className="main-content">
        {mainContent}
      </main>
    </div>
  );
}

export default App;
