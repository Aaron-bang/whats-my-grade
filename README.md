# What's My Grade? 📊

A comprehensive grade tracking and course management application built with React, TypeScript, and Vite. Track your courses, assignments, grades, and notes all in one place with customizable grading scales, semester organization, and detailed analytics.

[![Deploy Status](https://github.com/Aaron-bang/whats_my_grade/actions/workflows/deploy.yml/badge.svg)](https://github.com/Aaron-bang/whats_my_grade/actions/workflows/deploy.yml)
![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2-646cff?logo=vite)

## 🚀 [Live Demo](https://aaron-bang.github.io/whats_my_grade/)

Try it out: **[https://aaron-bang.github.io/whats_my_grade/](https://aaron-bang.github.io/whats_my_grade/)**


## ✨ Features

### 📚 Course Management
- **Semester Organization**: Group courses by semester (Fall 2023, Spring 2024, etc.)
- **Course Details**: Add course name, title, color coding, and credit hours
- **Professor & TA Information**: Store contact information for instructors and teaching assistants
- **Visual Organization**: Color-coded courses for easy identification
- **Course Editing**: Update course details at any time
- **Soft Delete**: Deleted courses can be restored from the trash

### 📝 Notes & Assignments
- **Lecture Notes**: Create and organize notes for each course
  - Rich text content
  - Timestamps for tracking
  - Easy editing and deletion
- **Assignment Tracking**: Comprehensive assignment management
  - Assignment titles and descriptions
  - Due dates with calendar picker
  - File attachments (PDFs and other documents)
  - Completion status tracking
  - Graded scores with automatic percentage calculation

### 📊 Advanced Grade Tracking

#### Assignment Groups
- Organize assignments into weighted categories (Problem Sets, Exams, Quizzes, etc.)
- Set custom weights for each group (e.g., Exams 50%, Homework 30%, Quizzes 20%)
- View group averages with letter grades
- Automatic weight validation

#### Extra Credit System
- Dedicated "Extra Credits" group for each course
- Extra credit points added directly to final grade (not averaged)
- Simplified grading interface for extra credit assignments
- Automatic creation for new courses

#### Customizable Grade Scales
- Set custom letter grade thresholds for each course
- Support for standard grades: A, A-, B+, B, B-, C+, C, C-, D+, D, F
- Easy-to-use grade scale modal with visual interface
- Default grade scale provided (A: 93%, A-: 90%, B+: 87%, etc.)

#### Grade Calculations
- **Individual Assignments**: Automatic percentage calculation from earned/total scores
- **Group Averages**: Weighted averages within assignment groups
- **Course Grades**: Overall grade calculated from weighted group averages
- **GPA Calculation**: Weighted GPA based on course grades and credit hours
- **Letter Grade Display**: Automatic letter grade assignment based on custom thresholds
- **Opt-Out Feature**: Exclude specific assignments from grade calculations

### 🎯 Additional Features

#### Dark Mode
- Beautiful dark theme with indigo and purple gradients
- Persistent theme preference (saved to localStorage)
- Smooth transitions between light and dark modes
- Theme toggle button for easy switching

#### Grades Overview
- Consolidated view of all graded assignments across all courses
- Organized by semester and course
- Shows professor/TA information
- Displays group weights and averages
- Overall course grades with letter grades
- Weighted GPA calculation

#### All Tasks View
- See all assignments across all courses in one place
- Filter by completion status
- Quick access to upcoming deadlines
- Course color coding for easy identification

#### Trash System
- Soft delete for notes, assignments, and courses
- Restore deleted items
- Permanent deletion option
- Separate trash view for easy management

#### Data Persistence
- All data saved to browser localStorage
- Automatic saving on every change
- Data persists across browser sessions
- No backend required

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Aaron-bang/whats_my_grade.git
   cd whats_my_grade
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📖 Usage Guide

### Managing Semesters

1. Click the **"+ Add Semester"** button in the sidebar
2. Enter the semester name (e.g., "Fall 2024")
3. Click **"Add"**
4. Edit semester names by clicking the edit icon

### Creating a Course

1. Click **"+ Add Class"** in the sidebar
2. Enter the course name (e.g., "MATH 101")
3. Select a color for visual identification
4. Set credit hours (default is 4)
5. Optionally assign to a semester
6. Click **"Add"**

### Setting Up Grade Scale

1. Select a course from the sidebar
2. Navigate to the **Assignments** tab
3. Click **"📊 Grade Scale"** button
4. Set minimum percentages for each letter grade:
   - A, A-, B+, B, B-, C+, C, C-, D+, D, F
5. Click **"Save"**

### Adding Assignment Groups

1. Select a course
2. Click **"+ Add Group"** in the Assignments section
3. Enter group name (e.g., "Midterm Exams")
4. Set weight percentage (e.g., 30 for 30%)
5. Click **"Add"**
6. Ensure all group weights add up to 100%

### Creating Assignments

1. Select an assignment group from the dropdown
2. Enter assignment title
3. Optionally set a due date
4. Click **"+"** to add
5. Click on the assignment to:
   - Add a description
   - Attach files (PDFs, documents)
   - Edit details

### Grading Assignments

1. Check the assignment as completed
2. Enter **earned score** and **total score**
3. Letter grade will automatically appear based on your grade scale
4. Use the **opt-out** checkbox to exclude from grade calculations

### Adding Professor/TA Information

1. Select a course
2. Click the **"✏️"** button next to the course info at the top
3. Fill in professor and TA names and emails
4. Click **"Save"**

### Viewing Grades Overview

1. Click **"Grades Overview"** in the sidebar
2. View all courses organized by semester
3. See overall grades, GPAs, and assignment breakdowns
4. Review professor/TA contact information

### Using Dark Mode

1. Click the **theme toggle button** in the top-right corner
2. Theme preference is automatically saved
3. Enjoy the beautiful indigo and purple gradient theme

## 🛠️ Technology Stack

- **React 19** - Modern UI framework with hooks
- **TypeScript** - Type safety and better developer experience
- **Vite** - Lightning-fast build tool and dev server
- **CSS3** - Custom styling with CSS variables for theming
- **LocalStorage API** - Client-side data persistence

## 📁 Project Structure

```
whats-my-grade/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx           # Course navigation and semester management
│   │   ├── CombinedView.tsx      # Main content area with tabs
│   │   ├── TaskList.tsx          # Assignment management
│   │   ├── NoteList.tsx          # Note management
│   │   ├── GradeScaleModal.tsx   # Grade scale editor
│   │   ├── GradesOverview.tsx    # All grades view
│   │   ├── AllTasks.tsx          # All assignments view
│   │   ├── Trash.tsx             # Deleted items view
│   │   ├── ThemeToggle.tsx       # Dark mode toggle
│   │   └── ...
│   ├── utils/
│   │   └── gradeUtils.ts         # Grade calculation logic
│   ├── types.ts                  # TypeScript type definitions
│   ├── App.tsx                   # Main application component
│   ├── App.css                   # Application styles
│   ├── index.css                 # Global styles and CSS variables
│   └── main.tsx                  # Application entry point
├── public/
│   └── nyu-torch.svg             # Favicon
├── index.html                    # HTML template
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite configuration
└── README.md                     # This file
```

## 🧮 Grade Calculation Details

### Standard Assignments
- **Percentage**: `(earnedScore / totalScore) × 100`
- **Group Average**: Weighted average of all assignments in the group
- **Course Grade**: Weighted average of all group averages

### Extra Credit
- Extra credit points are added **directly** to the final course grade
- Not included in weighted averages
- Can push grade above 100%

### Opt-Out Assignments
- Excluded from all grade calculations
- Useful for optional assignments or dropped grades
- Still visible in assignment list

### GPA Calculation
- Uses 4.0 scale
- Weighted by credit hours
- Based on letter grades from custom grade scale
- Formula: `Σ(grade points × credits) / Σ(credits)`

## 🎨 Customization

### Changing Default Grade Scale
Edit `src/utils/gradeUtils.ts` to modify the default grade scale:

```typescript
export const DEFAULT_GRADE_SCALE = {
  'A': 93,
  'A-': 90,
  'B+': 87,
  // ... etc
};
```

### Adding New Color Options
Edit the color picker in `Sidebar.tsx` to add more course colors.

### Modifying Theme Colors
Edit CSS variables in `src/index.css` for light and dark themes:

```css
:root {
  --primary-color: #your-color;
  /* ... */
}

[data-theme="dark"] {
  --primary-color: #your-dark-color;
  /* ... */
}
```

## 🔒 Privacy & Data

- **All data is stored locally** in your browser's localStorage
- **No data is sent to any server**
- **No account or login required**
- **Your data stays on your device**

⚠️ **Note**: Clearing browser data will delete all your courses and grades. Consider exporting your data regularly if needed.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

MIT License - feel free to use this project for personal or educational purposes.

## 🙏 Acknowledgments

Built with ❤️ for students who want to stay on top of their grades.

---

**Made by Aaron Bang** | [GitHub](https://github.com/Aaron-bang)
