# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                               │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    React Frontend                             │  │
│  │                   (localhost:5173)                            │  │
│  │                                                               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │
│  │  │  Login   │  │Dashboard │  │ Calendar │  │Analytics │    │  │
│  │  │ Register │  │   Page   │  │   Page   │  │   Page   │    │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │  │
│  │       │             │              │              │           │  │
│  │       └─────────────┴──────────────┴──────────────┘           │  │
│  │                          │                                    │  │
│  │                ┌─────────▼──────────┐                        │  │
│  │                │   Context APIs     │                        │  │
│  │                │  - AuthContext     │                        │  │
│  │                │  - ThemeContext    │                        │  │
│  │                └─────────┬──────────┘                        │  │
│  │                          │                                    │  │
│  │                ┌─────────▼──────────┐                        │  │
│  │                │   API Service      │                        │  │
│  │                │   (Axios)          │                        │  │
│  │                └─────────┬──────────┘                        │  │
│  └──────────────────────────┼────────────────────────────────────  │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                    HTTP/HTTPS (REST API)
                    Authorization: Bearer JWT
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                      Backend Server                                  │
│                   (Node.js + Express)                                │
│                   (localhost:5000)                                   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     Middleware                                │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────┐  │  │
│  │  │  CORS   │→ │   Body   │→ │ JWT Auth    │→ │ Validator│  │  │
│  │  │ Handler │  │  Parser  │  │ Middleware  │  │          │  │  │
│  │  └─────────┘  └──────────┘  └─────────────┘  └──────────┘  │  │
│  └─────────────────────────────┬────────────────────────────────┘  │
│                                 │                                    │
│  ┌──────────────────────────────▼───────────────────────────────┐  │
│  │                         Routes                                │  │
│  │  ┌──────────────────┐      ┌───────────────────────────┐    │  │
│  │  │   /api/auth      │      │    /api/journal           │    │  │
│  │  │  - POST /register│      │  - POST /                 │    │  │
│  │  │  - POST /login   │      │  - GET /                  │    │  │
│  │  │  - GET /profile  │      │  - GET /:id               │    │  │
│  │  │                  │      │  - GET /date/:date        │    │  │
│  │  │                  │      │  - PUT /:id               │    │  │
│  │  │                  │      │  - DELETE /:id            │    │  │
│  │  │                  │      │  - GET /dates             │    │  │
│  │  │                  │      │  - GET /stats/mood        │    │  │
│  │  └────────┬─────────┘      └────────┬──────────────────┘    │  │
│  └───────────┼──────────────────────────┼────────────────────────  │
│              │                          │                           │
│  ┌───────────▼──────────────────────────▼───────────────────────┐  │
│  │                      Controllers                              │  │
│  │  ┌──────────────────┐      ┌───────────────────────────┐    │  │
│  │  │ authController   │      │  journalController        │    │  │
│  │  │  - register()    │      │  - createEntry()          │    │  │
│  │  │  - login()       │      │  - getEntries()           │    │  │
│  │  │  - getProfile()  │      │  - getEntryById()         │    │  │
│  │  │                  │      │  - getEntryByDate()       │    │  │
│  │  │                  │      │  - updateEntry()          │    │  │
│  │  │                  │      │  - deleteEntry()          │    │  │
│  │  │                  │      │  - getEntriesDates()      │    │  │
│  │  │                  │      │  - getMoodStats()         │    │  │
│  │  └────────┬─────────┘      └────────┬──────────────────┘    │  │
│  └───────────┼──────────────────────────┼────────────────────────  │
│              │                          │                           │
│              └──────────┬───────────────┘                           │
│                         │                                            │
│              ┌──────────▼──────────┐                                │
│              │   Database Pool     │                                │
│              │   (pg Pool)         │                                │
│              └──────────┬──────────┘                                │
└─────────────────────────┼────────────────────────────────────────────┘
                          │
                   SQL Queries
            (Parameterized/Prepared)
                          │
┌─────────────────────────▼────────────────────────────────────────────┐
│                   PostgreSQL Database                                 │
│                     (Neon.tech)                                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                        Tables                                 │   │
│  │                                                               │   │
│  │  ┌─────────────────────┐      ┌─────────────────────────┐   │   │
│  │  │       users         │      │   journal_entries       │   │   │
│  │  ├─────────────────────┤      ├─────────────────────────┤   │   │
│  │  │ id (PK)            │      │ id (PK)                │   │   │
│  │  │ name               │      │ user_id (FK) ──────────┼───┐   │
│  │  │ email (UNIQUE)     │      │ title                  │   │   │
│  │  │ password_hash      │      │ content                │   │   │
│  │  │ created_at         │      │ date                   │   │   │
│  │  └─────────────────────┘      │ mood                   │   │   │
│  │                                │ tags (Array)           │   │   │
│  │                                │ created_at             │   │   │
│  │                                │ updated_at             │   │   │
│  │                                │ UNIQUE(user_id, date)  │   │   │
│  │                                └─────────────────────────┘   │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │                   Indexes                            │    │   │
│  │  │  - idx_journal_entries_user_id                      │    │   │
│  │  │  - idx_journal_entries_date                         │    │   │
│  │  │  - idx_journal_entries_mood                         │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow

```
User → Login Form → API Service → POST /api/auth/login
                                        ↓
                              authController.login()
                                        ↓
                              1. Query user by email
                              2. Verify password (bcrypt)
                              3. Generate JWT token
                                        ↓
                              Return token + user data
                                        ↓
                              Store in localStorage
                                        ↓
                              Update AuthContext
                                        ↓
                              Redirect to Dashboard
```

### 2. Create Entry Flow

```
User → Journal Form → Fill details → Submit
                                        ↓
                              API Service (with JWT)
                                        ↓
                              POST /api/journal
                                        ↓
                              JWT Middleware (verify token)
                                        ↓
                              Validator Middleware
                                        ↓
                              journalController.createEntry()
                                        ↓
                              1. Extract user_id from JWT
                              2. Check for existing entry
                              3. INSERT INTO journal_entries
                                        ↓
                              Return created entry
                                        ↓
                              Update UI state
                                        ↓
                              Show success message
```

### 3. Calendar View Flow

```
User → Calendar Page → Load
                        ↓
            GET /api/journal/dates?year=2026&month=1
                        ↓
            journalController.getEntriesDates()
                        ↓
            SELECT date FROM journal_entries WHERE user_id...
                        ↓
            Return array of dates: ["2026-01-01", "2026-01-05"...]
                        ↓
            Calendar highlights dates with entries
                        ↓
            User clicks date
                        ↓
            GET /api/journal/date/2026-01-01
                        ↓
            journalController.getEntryByDate()
                        ↓
            SELECT * FROM journal_entries WHERE date = '2026-01-01'
                        ↓
            Display entry or show "Create Entry" form
```

### 4. Search & Filter Flow

```
User → Dashboard → Enter search term / Select filters
                        ↓
            GET /api/journal?search=work&mood=Happy&startDate=2026-01-01
                        ↓
            journalController.getEntries()
                        ↓
            Build dynamic SQL query:
            SELECT * FROM journal_entries
            WHERE user_id = $1
            AND (title ILIKE '%work%' OR content ILIKE '%work%')
            AND mood = 'Happy'
            AND date >= '2026-01-01'
            ORDER BY date DESC
            LIMIT 50 OFFSET 0
                        ↓
            Return filtered entries
                        ↓
            Display results in grid
```

## Component Hierarchy

```
App
├── ThemeProvider
│   └── AuthProvider
│       └── Router
│           ├── Navbar
│           │   ├── Brand
│           │   ├── Navigation Links
│           │   ├── Theme Toggle
│           │   └── User Menu
│           │
│           └── Routes
│               ├── /login → Login
│               ├── /register → Register
│               │
│               └── Protected Routes
│                   ├── / → Dashboard
│                   │   ├── SearchFilter
│                   │   └── JournalCard (multiple)
│                   │
│                   ├── /calendar → CalendarPage
│                   │   ├── CalendarView
│                   │   └── JournalForm or EntryDetail
│                   │
│                   ├── /entry/:id → EntryDetail
│                   │
│                   └── /analytics → Analytics
│                       └── MoodChart
```

## State Management

```
┌──────────────────────────────────────────────┐
│            Global State                       │
│                                               │
│  ┌─────────────────────────────────────┐    │
│  │        AuthContext                  │    │
│  │  - user: { id, name, email }       │    │
│  │  - loading: boolean                 │    │
│  │  - login(email, password)          │    │
│  │  - register(name, email, password) │    │
│  │  - logout()                        │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  ┌─────────────────────────────────────┐    │
│  │        ThemeContext                 │    │
│  │  - darkMode: boolean                │    │
│  │  - toggleDarkMode()                 │    │
│  └─────────────────────────────────────┘    │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│          Component State                      │
│                                               │
│  Dashboard:                                   │
│  - entries: []                                │
│  - loading: boolean                           │
│  - filters: { search, mood, tags... }        │
│  - showForm: boolean                          │
│  - editingEntry: object | null                │
│                                               │
│  CalendarPage:                                │
│  - entries: []                                │
│  - selectedDate: string | null                │
│  - selectedEntry: object | null               │
│  - showForm: boolean                          │
│                                               │
│  Analytics:                                   │
│  - moodStats: []                              │
│  - totalEntries: number                       │
│  - dateRange: { startDate, endDate }         │
└──────────────────────────────────────────────┘
```

## Security Layers

```
Client Request
    │
    ├─ 1. HTTPS/TLS Encryption
    │
    ├─ 2. CORS Check (Origin validation)
    │
    ├─ 3. JWT Token in Authorization Header
    │
    ├─ 4. JWT Verification Middleware
    │      - Verify signature
    │      - Check expiration
    │      - Extract user info
    │
    ├─ 5. Input Validation Middleware
    │      - express-validator
    │      - Type checking
    │      - Sanitization
    │
    ├─ 6. Authorization Check
    │      - User owns resource
    │      - Proper permissions
    │
    ├─ 7. Parameterized SQL Queries
    │      - Prevent SQL injection
    │      - Type-safe queries
    │
    └─ 8. Database Row-Level Security
           - user_id filter
           - CASCADE deletes
```

## File Organization

```
Backend Pattern:
    Route → Middleware → Controller → Database

Frontend Pattern:
    Component → Context → Service → API

Example Create Entry:
    JournalForm.jsx
        ↓ (handleSubmit)
    journalService.createEntry()
        ↓ (axios.post with JWT)
    /api/journal
        ↓ (authenticateToken middleware)
    journalController.createEntry()
        ↓ (pool.query)
    PostgreSQL Database
```

---

This architecture provides:

- ✅ Separation of concerns
- ✅ Scalability
- ✅ Security
- ✅ Maintainability
- ✅ Testability
- ✅ Clear data flow
- ✅ Error handling at multiple levels

Last Updated: January 1, 2026
