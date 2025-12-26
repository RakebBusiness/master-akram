# Exercise System Update Documentation

## Overview

The exercise management system has been successfully updated to support three distinct exercise types (QCM, Quiz, and Code) using the new database schema. All components maintain the same design patterns and user experience while adapting to the new data structure.

## Database Schema

The new database structure uses the following tables:

- **exercise**: Main table containing id, title, type, statement, idEnseignant, idCours
- **qcm_option**: Stores multiple choice options for QCM exercises
- **qcm_answer**: Stores the correct option index for QCM exercises
- **quiz_answer**: Stores the text answer for Quiz exercises
- **code_test**: Stores input/output test cases for Code exercises

## Backend Changes

### 1. Exercise Model (`back/model/exerciceModel.js`)

**Updated Methods:**
- `findAll()`: Fetches all exercises with their type-specific data
- `findById(id)`: Retrieves a single exercise with related data (options, answers, or tests)
- `findByTeacher(idEnseignant)`: Gets all exercises for a specific teacher
- `create(exerciceData)`: Creates exercises with type-specific data using transactions
- `update(id, exerciceData)`: Updates exercises and their related data
- `delete(id)`: Removes exercises (CASCADE delete handles related data)

**Key Features:**
- Uses database transactions for data consistency
- Automatically loads type-specific data (options, answers, tests)
- Maintains referential integrity through foreign keys

### 2. Exercise Controller (`back/controllers/exerciceController.js`)

**Updated Validation:**
- QCM exercises require options array
- Quiz exercises require answer text
- Code exercises require test cases array

**Endpoints (unchanged):**
- GET `/exercises` - Get all exercises (or teacher's exercises with ?my=true)
- GET `/exercises/:id` - Get single exercise
- POST `/exercises` - Create new exercise
- PUT `/exercises/:id` - Update exercise
- DELETE `/exercises/:id` - Delete exercise
- POST `/exercises/:id/enroll` - Enroll student
- GET `/exercises/enrolled` - Get enrolled exercises

## Frontend Changes

### 1. TypeScript Types (`front/src/types/exercise.ts`)

**New type definitions:**
```typescript
export type ExerciseType = 'qcm' | 'quiz' | 'code';

export interface QcmExercise {
  type: 'qcm';
  options: QcmOption[];
  correctOptionIndex: number;
}

export interface QuizExercise {
  type: 'quiz';
  answer: string;
}

export interface CodeExercise {
  type: 'code';
  tests: CodeTest[];
}

export type Exercise = QcmExercise | QuizExercise | CodeExercise;
```

### 2. Exercise Modal (`front/src/components/ens-panel/Exercise/ExerciseModal.tsx`)

**Features:**
- Dynamic form based on selected exercise type
- QCM: Add/remove options, select correct answer with radio buttons
- Quiz: Single text input for answer
- Code: Add/remove test cases with input/output pairs
- Proper form validation for each type
- Edit mode pre-fills form with existing data

### 3. Exercise List Page (`front/src/pages/ens-panel/ExerciceList.tsx`)

**Features:**
- Uses modular component structure (Header, Filters, Card, Modal)
- Real-time search functionality
- Filter by exercise type (all, qcm, quiz, code)
- Statistics display showing count per type
- Grid layout for exercise cards

### 4. Exercise Card (`front/src/components/ens-panel/Exercise/ExerciseCard.tsx`)

**Features:**
- Type-specific icons and colors
- Shows relevant details (option count, test count)
- Edit and delete actions
- Clean, modern design

### 5. Exercise Filters (`front/src/components/ens-panel/Exercise/ExerciseFilters.tsx`)

**Features:**
- Search bar for filtering by title or statement
- Type filter buttons with counts
- Visual indication of active filter

### 6. Exercise Header (`front/src/components/ens-panel/Exercise/ExerciseHeader.tsx`)

**Features:**
- Statistics overview (total, qcm, quiz, code)
- Add new exercise button
- Export/Import buttons (placeholders for future implementation)

## How It Works

### Creating an Exercise

1. Teacher clicks "Nouvel exercice" button
2. Modal opens with form
3. Teacher selects exercise type (QCM, Quiz, or Code)
4. Form adapts to show type-specific fields
5. Teacher fills in required information
6. On submit:
   - Frontend sends data to POST `/exercises`
   - Controller validates data based on type
   - Model creates exercise and related data in transaction
   - Success response triggers list refresh

### Editing an Exercise

1. Teacher clicks edit icon on exercise card
2. Modal opens with pre-filled data
3. Teacher modifies fields
4. On submit:
   - Frontend sends data to PUT `/exercises/:id`
   - Controller validates and checks ownership
   - Model updates exercise and replaces related data
   - Success response triggers list refresh

### Deleting an Exercise

1. Teacher clicks delete icon
2. Confirmation dialog appears
3. On confirm:
   - Frontend sends DELETE `/exercises/:id`
   - Controller checks ownership
   - Model deletes exercise (CASCADE removes related data)
   - Success response triggers list refresh

### Filtering and Searching

1. Teacher types in search bar or clicks filter button
2. Frontend filters exercises locally
3. Results update in real-time
4. Stats remain accurate based on all exercises

## API Data Format

### Creating QCM Exercise
```json
{
  "title": "Question about algorithms",
  "type": "qcm",
  "statement": "What is the time complexity of binary search?",
  "options": [
    {"option_text": "O(n)"},
    {"option_text": "O(log n)"},
    {"option_text": "O(n²)"}
  ],
  "correctOptionIndex": 1
}
```

### Creating Quiz Exercise
```json
{
  "title": "Define recursion",
  "type": "quiz",
  "statement": "What is recursion in programming?",
  "answer": "A function that calls itself"
}
```

### Creating Code Exercise
```json
{
  "title": "Fibonacci function",
  "type": "code",
  "statement": "Write a function that returns the nth Fibonacci number",
  "tests": [
    {"input": "5", "expected_output": "5"},
    {"input": "10", "expected_output": "55"}
  ]
}
```

## Success Indicators

✅ Build completes without TypeScript errors
✅ Backend handles all three exercise types
✅ Frontend components work seamlessly together
✅ Same UI/UX patterns maintained
✅ Proper data validation on both frontend and backend
✅ Transaction-safe database operations
✅ Clean component structure with separation of concerns

## Next Steps (Optional Enhancements)

- Implement export/import functionality
- Add course selection dropdown
- Add difficulty level field
- Implement student exercise submission
- Add exercise statistics and analytics
- Add rich text editor for statements
