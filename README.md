# Course Management & Grade Tracker

A comprehensive course management application built with React, TypeScript, and Vite. Track your courses, assignments, grades, and notes all in one place with customizable grading scales and detailed analytics.

## Features

### 📚 Course Management
- Create and manage multiple courses with custom colors
- Edit course details including professor and TA information
- View all courses in an organized sidebar with grade displays
- Color-coded course identification

### 📝 Notes & Assignments
- **Notes**: Create and organize lecture notes for each course
- **Assignments**: Track assignments with detailed information:
  - Assignment titles and descriptions
  - Due dates
  - File attachments (PDFs and other documents)
  - Completion status
  - Graded scores

### 📊 Grade Tracking & Analytics
- **Assignment Groups**: Organize assignments into weighted categories (e.g., Problem Sets, Exams, Quizzes)
- **Customizable Grade Scales**: Set custom letter grade thresholds for each course
- **Automatic Calculations**:
  - Individual assignment percentages and letter grades
  - Group averages with letter grades
  - Overall course grade with letter grades
  - Weighted grade calculations based on group weights
- **Opt-out Feature**: Exclude specific assignments from grade calculations

### 🎯 Advanced Features
- **Letter Grade System**: 
  - Customizable grade scale per course (A, A-, B+, B, B-, etc.)
  - Automatic letter grade calculation and display
  - Letter grades shown for assignments, groups, and overall course
- **Grade Scale Modal**: Easy-to-use interface for setting minimum percentages for each letter grade
- **Visual Grade Indicators**: Beautiful gradient badges for letter grades
- **Trash System**: Soft delete for notes with restore capability

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd day2
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage Guide

### Creating a Course
1. Click "+ Add Class" in the sidebar
2. Enter the course name and select a color
3. Click "Add"

### Setting Up Grade Scale
1. Select a course
2. Click "📊 Grade Scale" button in the Assignments section
3. Set minimum percentages for each letter grade
4. Click "Save"

### Adding Assignment Groups
1. Select a course
2. Click "+ Add Group"
3. Enter group name and weight percentage
4. Click "Add"

### Creating Assignments
1. Select an assignment group from the dropdown
2. Enter assignment title
3. Optionally set a due date
4. Click "+" to add
5. Click on the assignment to edit details, add description, or attach files

### Grading Assignments
1. Check the assignment as completed
2. Enter earned score and total score
3. Letter grade will automatically appear based on your grade scale

### Adding Professor/TA Information
1. Select a course
2. Click the "Edit" button (✏️) next to the course info at the top
3. Fill in professor and TA names and emails
4. Click "Save"

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Styling with custom properties

## Project Structure

```
src/
├── components/          # React components
│   ├── Sidebar.tsx     # Course navigation
│   ├── CombinedView.tsx # Main content area
│   ├── TaskList.tsx    # Assignment management
│   ├── NoteList.tsx    # Note management
│   ├── GradeScaleModal.tsx # Grade scale editor
│   └── ...
├── utils/              # Utility functions
│   └── gradeUtils.ts   # Grade calculation logic
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Features in Detail

### Grade Calculation
- Weighted average based on assignment group weights
- Excludes opted-out assignments
- Handles partial grading (only counts graded assignments)
- Automatic letter grade assignment based on custom thresholds

### Data Persistence
Currently, all data is stored in component state. For production use, consider adding:
- Local storage persistence
- Backend API integration
- Database storage

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for personal or educational purposes.
