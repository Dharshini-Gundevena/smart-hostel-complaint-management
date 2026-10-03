# SmartHostel AI — Student Frontend

SmartHostel AI is an AI-powered hostel complaint management platform that helps students report hostel issues and enables intelligent classification, prioritization, routing, tracking, and feedback.

This folder contains the **student-facing frontend**: authentication UI, complaint submission, AI analysis visualization, complaint tracking, notifications, and feedback. It currently runs entirely on a **mock API** and is built to switch to the real backend with minimal changes.

## Features

- Student login and registration (mock authentication)
- Student dashboard (complaint counts, recent complaints)
- Complaint submission with image upload and preview
- AI analysis UI: category, subcategory, priority, assigned team, summary, confidence
- Duplicate detection result
- Complaint tracking (status timeline) and complaint history
- Notifications
- Feedback and star rating for resolved complaints
- Student profile
- Responsive layout (scrollable nav on mobile)

## Student Flow

```text
Login → Dashboard → Report Complaint → Enter Details → Upload Image (optional)
  → Analyze with AI → Category + Priority + Team + Duplicate check
  → Submit → Track Complaint → Resolved → Feedback
```

## Tech Stack

Only what is installed and used (see `package.json`):

- React 18
- Vite 5
- TypeScript
- Tailwind CSS 3 (with PostCSS and Autoprefixer)
- Lucide React (icons)
- React Router 6

shadcn/ui is **not** used.

## Project Structure

```text
src/
├── components/   Reusable UI: Layout, Badges, AnalysisCard, Timeline
├── pages/        One file per route (Login, Register, Dashboard, Complaints,
│                 ComplaintDetail, Report, Notifications, Profile, Feedback)
├── services/     api.ts — the only place data is fetched or mocked
├── data/         mockData.ts — in-memory mock data
├── types/        Shared TypeScript types
├── App.tsx       Route table and auth guard
├── main.tsx      App entry point
└── index.css     Tailwind setup and shared component classes
```

## Routes

| Route | Purpose |
|---|---|
| `/student/login` | Student login |
| `/student/register` | Student registration |
| `/student/dashboard` | Student dashboard (protected) |
| `/student/complaints` | Complaint history (protected) |
| `/student/complaints/:id` | Complaint details and tracking (protected) |
| `/student/report` | Submit a complaint (protected) |
| `/student/notifications` | Notifications (protected) |
| `/student/profile` | Profile (protected) |
| `/student/feedback/:id` | Complaint feedback (protected) |

Protected routes redirect to `/student/login` when no session exists. `/` redirects to the dashboard.

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173` by default.

Other scripts in `package.json`:

```bash
npm run build     # type-check (tsc) and build for production
npm run preview   # preview the production build
```

## Mock Login

```text
Student ID: CSE123
Password: anything
```

This is **temporary mock authentication**. Any non-empty Student ID works; `CSE123` loads the seeded profile. The session is stored in `localStorage` (`smarthostel_student`). It will be replaced by backend authentication.

## Mock Data

Stored in `src/data/mockData.ts`:

- Students (one seeded student)
- Complaints (two seeded: #1021 In Progress, #1018 Resolved), each with an AI analysis and status timeline
- Notifications (three seeded)
- Feedback (empty list; filled when feedback is submitted)

AI analysis results live inside each complaint. Data is in memory, so it resets on page refresh. New complaints created in the demo start at #1024.

## API Integration

All data access is in `src/services/api.ts`. Pages never fetch directly, so the mock can be replaced without touching the UI.

When `VITE_API_BASE_URL` is **unset**, the mock implementation is used. When it is **set**, these calls go to the backend:

| Endpoint | Status |
|---|---|
| `POST /api/auth/login` | Planned backend endpoint (client call written, backend not built) |
| `POST /api/auth/register` | Planned backend endpoint |
| `GET /api/complaints` | Planned backend endpoint |
| `GET /api/complaints/:id` | Planned backend endpoint |
| `POST /api/complaints` | Planned backend endpoint (currently sends `description` and `room` as JSON; image upload is not sent yet) |
| `GET /api/notifications` | Planned backend endpoint |
| `POST /api/feedback` | Planned backend endpoint |

The response shapes are the types in `src/types/index.ts`. Not yet wired to the backend: the **Analyze with AI** preview (`analyzeComplaint`) and the demo-only `advanceStatus`. Both always use local mock logic.

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000
```

Copy `.env.example` to `.env` to use it. Leave it unset to run on mock data. This is the only variable the app reads.

## Backend Integration

```text
Current:  Frontend → Mock API/Data (src/services/api.ts)
Final:    Frontend → Backend API → Database + AI Engine
```

When the backend is ready: set `VITE_API_BASE_URL`, confirm response shapes match `src/types/index.ts`, add image upload to `POST /api/complaints` (likely `multipart/form-data`), and expose an analysis endpoint to replace the mock `analyzeComplaint`. The UI should need little or no change.

## AI Integration

The frontend only **displays** AI output:

```text
Complaint → AI Analysis → Category, Subcategory, Priority,
                          Duplicate Status, Assigned Team, AI Summary, Confidence
```

The keyword rules in `analyzeComplaint` are a **stand-in** so the UI can be demoed. Real AI processing belongs to the backend/AI service, not the frontend.

## Demo Scenario

1. Log in with `CSE123` / any password.
2. Open **Report**, keep room `307`, and enter: *"There is continuous water leakage from the bathroom tap in Room 307."*
3. Click **Analyze with AI**. Expected result:

```text
Category: Plumbing
Subcategory: Water Leakage
Priority: HIGH
Assigned Team: Plumbing Maintenance
Duplicate: No duplicate found
```

4. Click **Submit complaint**. It is created as **#1024** with status Submitted.
5. On the complaint page, click **Demo: advance to next status** to step through Submitted → Assigned → In Progress → Resolved. Each step adds a notification.
6. Once Resolved, click **Rate this resolution** and submit feedback.

The "advance" button only appears in mock mode and is for demos.

## Development Notes

- This is the student-facing application only.
- The landing page, admin dashboard, maintenance dashboard and backend are maintained separately.
- Do not place backend logic inside the frontend.
- Keep API calls inside `src/services/api.ts`.
- Keep reusable UI components inside `src/components/`.

## Future Improvements

None of these are implemented yet:

- Real authentication
- Real backend API integration and image upload
- Real-time complaint status updates
- Push notifications
- Advanced image analysis
- Offline support
- Accessibility audit
- Production deployment

## Team Integration

```text
landing-page/      → Landing page
frontend/          → Student application (this folder)
backend/           → APIs + database + AI
admin-dashboard/   → Admin + maintenance management
```

The student frontend can be developed and demoed independently on mock data, then connected to the backend later through `services/api.ts`.
