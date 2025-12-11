import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CombinedView } from './components/CombinedView';
import { AllTasks } from './components/AllTasks';
import { Trash } from './components/Trash';
import { GradesOverview } from './components/GradesOverview';
import { ThemeToggle } from './components/ThemeToggle';
import { EmailSyncModal, type ImportableAssignment } from './components/EmailSyncModal';
import { SettingsModal } from './components/SettingsModal';
import { fetchAssignmentEmails } from './services/gmailService';
import { extractAssignmentsFromEmails } from './services/aiService';
import type { Course, Note, Task, AssignmentGroup, Semester, GmailAuth, ExtractedAssignment, SyncSettings } from './types';
import { DEFAULT_GRADE_SCALE, calculateCourseGrade } from './utils/gradeUtils';
import { GMAIL_SEARCH_CONFIG } from './config/apiConfig';
import './App.css';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  // --- State ---
  const [semesters, setSemesters] = useState<Semester[]>(() => {
    const saved = localStorage.getItem('semesters');
    return saved ? JSON.parse(saved) : [{ id: 's1', name: 'Fall 2023', createdAt: Date.now() }];
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('courses');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'MATH 101', color: '#FF6B6B', semesterId: 's1', gradeScale: DEFAULT_GRADE_SCALE },
      { id: '2', name: 'HIST 105', color: '#4ECDC4', semesterId: 's1', gradeScale: DEFAULT_GRADE_SCALE },
      { id: '3', name: 'CSCI 228', color: '#FFE66D', gradeScale: DEFAULT_GRADE_SCALE }
    ];
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(() => {
    const saved = localStorage.getItem('selectedCourseId');
    return saved ? JSON.parse(saved) : '1';
  });

  const [isEditingInfo, setIsEditingInfo] = useState(false);

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [
      { id: 'n1', courseId: '1', title: 'Lecture 1', content: 'Derivatives are...', createdAt: Date.now() },
      { id: 'n2', courseId: '2', title: 'Lecture 1', content: 'Lecture 1 notes.', createdAt: Date.now() }
    ];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [
      {
        id: 't1',
        courseId: '1',
        text: 'Problem Set 1',
        description: 'PS1',
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
        earnedScore: undefined,
        totalScore: undefined
      }
    ];
  });

  const [assignmentGroups, setAssignmentGroups] = useState<AssignmentGroup[]>(() => {
    const saved = localStorage.getItem('assignmentGroups');
    return saved ? JSON.parse(saved) : [
      { id: 'g1', courseId: '1', name: 'Problem Sets', weight: 30 },
      { id: 'g2', courseId: '1', name: 'Exams', weight: 50 },
      { id: 'g3', courseId: '1', name: 'Quizzes', weight: 20 },
      { id: 'ec1', courseId: '1', name: 'Extra Credits', weight: 0, isExtraCredit: true },
      { id: 'ec2', courseId: '2', name: 'Extra Credits', weight: 0, isExtraCredit: true },
      { id: 'ec3', courseId: '3', name: 'Extra Credits', weight: 0, isExtraCredit: true }
    ];
  });

  // Gmail Integration State
  const [gmailAuth, setGmailAuth] = useState<GmailAuth | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [extractedAssignments, setExtractedAssignments] = useState<ExtractedAssignment[]>([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [syncSettings, setSyncSettings] = useState<SyncSettings>(() => {
    const saved = localStorage.getItem('syncSettings');
    return saved ? JSON.parse(saved) : {
      dateRange: GMAIL_SEARCH_CONFIG.defaultDateRange,
      keywords: GMAIL_SEARCH_CONFIG.keywords
    };
  });

  // --- Effects for Persistence ---
  useEffect(() => {
    localStorage.setItem('semesters', JSON.stringify(semesters));
  }, [semesters]);

  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('selectedCourseId', JSON.stringify(selectedCourseId));
  }, [selectedCourseId]);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('assignmentGroups', JSON.stringify(assignmentGroups));
  }, [assignmentGroups]);

  useEffect(() => {
    localStorage.setItem('syncSettings', JSON.stringify(syncSettings));
  }, [syncSettings]);

  // --- Handlers ---
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

    // Add default Extra Credits group
    const extraCreditGroup: AssignmentGroup = {
      id: generateId(),
      courseId: newCourse.id,
      name: 'Extra Credits',
      weight: 0,
      isExtraCredit: true
    };
    setAssignmentGroups([...assignmentGroups, extraCreditGroup]);
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
      // Also delete associated notes and tasks forever
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

  // Gmail Handlers
  const handleGmailAuthChange = (auth: GmailAuth | null) => {
    setGmailAuth(auth);
  };

  const handleGmailSync = async () => {
    if (!gmailAuth) {
      alert('Please connect your Gmail account first');
      return;
    }

    setIsSyncing(true);
    try {
      // Calculate date range
      const afterDate = new Date();
      afterDate.setDate(afterDate.getDate() - syncSettings.dateRange);

      // Fetch emails
      const emails = await fetchAssignmentEmails(afterDate);

      if (emails.length === 0) {
        alert('No assignment-related emails found in the specified date range.');
        setIsSyncing(false);
        return;
      }

      // Extract assignments using AI
      const assignments = await extractAssignmentsFromEmails(emails, courses.filter(c => !c.deleted));

      setExtractedAssignments(assignments);
      setShowSyncModal(true);

      // Update last sync time
      setSyncSettings(prev => ({ ...prev, lastSyncTime: Date.now() }));
    } catch (error: any) {
      console.error('Sync failed:', error);
      alert(`Failed to sync emails: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportAssignments = (assignments: ImportableAssignment[]) => {
    const newTasks: Task[] = [];

    assignments.forEach(assignment => {
      if (!assignment.courseId) return;

      const newTask: Task = {
        id: generateId(),
        courseId: assignment.courseId,
        text: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate || new Date().toISOString().split('T')[0],
        completed: false,
        groupId: assignment.groupId,
        totalScore: assignment.points,
      };

      newTasks.push(newTask);
    });

    setTasks([...tasks, ...newTasks]);
    setShowSyncModal(false);
    setExtractedAssignments([]);

    alert(`Successfully imported ${newTasks.length} assignment${newTasks.length !== 1 ? 's' : ''}!`);
  };

  // Wrapper for calculateCourseGrade to pass current state
  const getCourseGrade = (courseId: string): number | undefined => {
    return calculateCourseGrade(courseId, tasks, assignmentGroups);
  };

  // --- Views ---
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
        getCourseGrade={getCourseGrade}
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
      const courseGrade = getCourseGrade(selectedCourseId);

      mainContent = (
        <>
          <header className="course-header" style={{ borderBottomColor: currentCourse.color }}>
            <div className="header-left">
              <h1 style={{ color: currentCourse.color }}>{currentCourse.name}</h1>
              <input
                type="text"
                placeholder="e.g., Introduction to Calculus 1"
                value={currentCourse.title || ''}
                onChange={(e) => handleUpdateCourse(currentCourse.id, { title: e.target.value })}
                className="course-title-input"
              />
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
      <ThemeToggle />
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
        getCourseGrade={getCourseGrade}
        gmailAuth={gmailAuth}
        onGmailAuthChange={handleGmailAuthChange}
        onGmailSync={handleGmailSync}
        isSyncing={isSyncing}
        lastSyncTime={syncSettings.lastSyncTime}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      <main className="main-content">
        {mainContent}
      </main>

      {showSyncModal && (
        <EmailSyncModal
          assignments={extractedAssignments}
          courses={courses.filter(c => !c.deleted)}
          groups={assignmentGroups}
          onImport={handleImportAssignments}
          onClose={() => setShowSyncModal(false)}
        />
      )}

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}

export default App;
