# Smart Hostel Integration Handoff

All `/api/v1` requests use the existing Supabase Auth session cookie. For browser `fetch`, use same-origin requests (or `credentials: 'include'`). RLS scopes complaint, assignment, history, and notification rows. The API error envelope is `{ "error": { "code": "...", "message": "..." } }`.

## Student Frontend

### Create complaint

`POST /api/v1/complaints` (student only). JSON body:

```json
{
  "title": "Leaking bathroom tap",
  "description": "The tap has been leaking continuously since morning.",
  "roomId": "ROOM_UUID",
  "subcategory": "Bathroom"
}
```

Required: `title`, `description`, `roomId`. Optional: `subcategory`, `priority`, `severity`. If `priority` is sent it must be `MEDIUM`; if `severity` is sent it must be `1`. Do not send `student_id`, status, canonical category, or AI fields. The server uses the authenticated profile ID and creates category `OTHER`, priority `MEDIUM`, status `PENDING`.

Success is `201`:

```json
{
  "complaint": { "id": "UUID", "student_id": "UUID", "room_id": "UUID", "title": "...", "description": "...", "category": "OTHER", "priority": "MEDIUM", "status": "PENDING", "created_at": "...", "updated_at": "...", "ai_category": null, "ai_priority": null, "ai_summary": null, "ai_department": null, "ai_suggested_action": null, "ai_reason": null, "ai_status": "PENDING", "room": { "id": "UUID", "room_number": "...", "floor": 0, "block": { "id": "UUID", "name": "...", "hostel": { "id": "UUID", "name": "...", "location": "..." } } } },
  "ai_status": "ANALYZED",
  "analysis": { "category": "PLUMBING", "priority": "HIGH", "summary": "Leaking bathroom tap", "department": "PLUMBING", "suggested_action": "Assign a plumber to inspect and repair the tap.", "reason": "Continuous leakage needs prompt attention." },
  "analysis_persisted": false
}
```

The full `complaint` is the database complaint row plus the nested room/block/hostel relation. Creation runs AI automatically. Its top-level `analysis` is returned to the student but is **not persisted**; `complaint.ai_status` remains `PENDING` and the AI columns remain null until an admin persists an analysis. If AI is unavailable, top-level `ai_status` is `UNAVAILABLE` and `analysis` is `null`; complaint creation still succeeds.

### List, detail, history

- `GET /api/v1/complaints` returns `{ "complaints": [complaintRowWithLocation, ...], "count": number }`. RLS limits students to their own complaints. Supported query fields: `status`, `priority`, `category`, `studentId`, `assignedTo`, `roomId`, `from`, `to`, `limit`, `offset`. `studentId` and `assignedTo` filters are admin-only. `limit` defaults to 25 and is capped at 100.
- `GET /api/v1/complaints/:complaintId` returns `{ "complaint": complaintRowWithLocation, "assignments": [...] }`. Assignments returned are restricted by RLS.
- `GET /api/v1/complaints/:complaintId/history` returns `{ "history": [...] }`, ordered oldest first. Each update includes `old_status`, `new_status`, `updated_by`, `comment`, and `created_at`.

Use the status, priority, category, created/updated timestamps, location relation, and history for the student complaint/status views. The history contains workflow and admin-update events, not a separate AI event log.

### AI analysis

`POST /api/v1/complaints/:complaintId/analyze`, no body. The ID must be a UUID. Students may analyze only their own complaint. Success:

```json
{
  "ai_status": "ANALYZED",
  "analysis": { "category": "PLUMBING", "priority": "HIGH", "summary": "Leaking bathroom tap", "department": "PLUMBING", "suggested_action": "Assign a plumber to inspect and repair the tap.", "reason": "Continuous leakage needs prompt attention." },
  "analysis_persisted": false
}
```

For student calls, `analysis_persisted` is always false. Use the creation response for immediate AI feedback; do not assume a student analysis updates stored complaint fields.

### Notifications

- `GET /api/v1/notifications?limit=25` returns `{ "notifications": [...] }`. `limit` must be an integer from 1 to 100; default is 25. RLS scopes the user's notifications.
- `PATCH /api/v1/notifications` body: `{ "notificationId": "UUID" }`. Marks it read and returns `{ "notification": notificationRow }`.

## Admin Dashboard

- **List/filter:** `GET /api/v1/complaints` with supported filters above. Only admins may filter by `studentId` or `assignedTo`. Results include full complaint rows, nested room/block/hostel location, and `count`.
- **Detail:** `GET /api/v1/complaints/:complaintId` returns `{ complaint, assignments }`.
- **Persist/re-run AI:** `POST /api/v1/complaints/:complaintId/analyze`, no body. Admin calls return `analysis_persisted: true` if the database save succeeds; when provider output is unavailable, `ai_status` is `UNAVAILABLE`, `analysis` is `null`, and a successful save sets the complaint `ai_status` to `UNAVAILABLE`. If persistence fails, it is logged server-side and `analysis_persisted` remains false.
- **Assign:** `POST /api/v1/complaints/:complaintId/assign` body `{ "maintenanceId": "MAINTENANCE_PROFILE_UUID", "comment": "Optional" }`. Returns `201` with `{ "assignment": assignmentRow }`. Target must have role `MAINTENANCE`. Reassignment closes the prior active assignment and creates a new one.
- **Canonical priority:** `PATCH /api/v1/complaints/:complaintId/priority` body `{ "priority": "LOW|MEDIUM|HIGH|CRITICAL", "comment": "Optional" }`. Returns `{ "complaint": complaintRow }`.
- **Status:** `PATCH /api/v1/complaints/:complaintId/status` body `{ "status": "...", "comment": "Optional" }`. Returns `{ "complaint": complaintRow }`.
- **Notifications:** `GET /api/v1/notifications?limit=25`; marking read uses `PATCH /api/v1/notifications` with `{ "notificationId": "UUID" }`.

Persisted AI fields on complaint rows are:

- `ai_category`
- `ai_priority`
- `ai_summary`
- `ai_department`
- `ai_suggested_action`
- `ai_reason`
- `ai_status` (`PENDING`, `ANALYZED`, `UNAVAILABLE`)

AI category/priority are recommendations, separate from canonical `category`/`priority`. Admins can change canonical priority through the priority endpoint. There is no canonical category update endpoint in the current API; do not present one as available or replace canonical category with `ai_category` in dashboard state.

There is **no API endpoint to list maintenance profiles**. Do not call an invented route; the current admin UI needs to obtain eligible maintenance profile IDs through its existing authorized data-access arrangement.

## Maintenance Workflow

- Assigned complaint list: `GET /api/v1/complaints?assignedTo=MAINTENANCE_PROFILE_UUID`. RLS and active assignments scope visible rows. The `assignedTo` filter is admin-only in this API, so maintenance clients should call `GET /api/v1/complaints` with no `assignedTo`; RLS returns only accessible complaints.
- Detail/history: `GET /api/v1/complaints/:complaintId` and `GET /api/v1/complaints/:complaintId/history`, limited by RLS to complaints currently assigned to that maintenance user.
- Progress/resolution: `PATCH /api/v1/complaints/:complaintId/status` body `{ "status": "IN_PROGRESS", "comment": "Inspection started" }` or `{ "status": "RESOLVED", "comment": "Tap repaired" }`. The database rejects unassigned users and invalid transitions. Resolution sets `resolved_at` and writes history; the existing trigger notifies the student.
- Maintenance may call AI analyze only for a complaint visible under the existing assignment policy. It cannot persist AI recommendations; admin persistence is required.

## Roles And Workflow

A valid signed-in user and corresponding `profiles` record are required. Roles are exactly `STUDENT`, `ADMIN`, and `MAINTENANCE`.

- `STUDENT`: create complaints; list/read own complaints/history; analyze own complaint; read/update own notifications.
- `ADMIN`: list/filter/manage complaints; assign maintenance; change canonical priority/status; persist AI recommendation; view administrative notifications.
- `MAINTENANCE`: read/update only assigned complaint workflow; cannot assign or change canonical priority.

Status values are `PENDING`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`, `ESCALATED`. Allowed transitions:

- `PENDING` → `ASSIGNED`, `REJECTED`, `ESCALATED`
- `ASSIGNED` → `IN_PROGRESS`, `PENDING`, `REJECTED`, `ESCALATED`
- `IN_PROGRESS` → `ASSIGNED`, `RESOLVED`, `ESCALATED`
- `ESCALATED` → `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`
- `RESOLVED` → `IN_PROGRESS` by admin only
- `REJECTED` → no further transitions

There is no `OPEN` or `CLOSED` status in the current schema.

## Error Handling

Typical errors use `{ "error": { "code", "message" } }`. Common codes include `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `INVALID_ID`, `INVALID_JSON`, `INVALID_BODY`, `MISSING_FIELDS`, `INVALID_STATUS`, `INVALID_PRIORITY`, `INVALID_FILTER` (400), `COMPLAINT_NOT_FOUND` (404), `INVALID_WORKFLOW_ACTION` (409), and `DATABASE_ERROR` (500). Clients should treat `ai_status: "UNAVAILABLE"` as a non-fatal analysis fallback, not a failed complaint submission.

## Demo Flow

1. Student submits `POST /api/v1/complaints` with title, description, and room ID.
2. Complaint is stored as `PENDING`, canonical category `OTHER`, priority `MEDIUM`; the database trigger notifies admins of the new complaint.
3. Creation response includes an automatic AI recommendation, but it is not stored yet.
4. Admin fetches complaint detail, then calls `POST /api/v1/complaints/:complaintId/analyze`. Admin analysis persists `ai_*` recommendation fields. HIGH/CRITICAL recommendations trigger a deduplicated admin notification using the existing notifications table.
5. Admin reviews the AI fields and assigns maintenance with `POST /api/v1/complaints/:complaintId/assign`; the assignee is notified and status becomes `ASSIGNED`.
6. Maintenance loads its RLS-scoped complaint list, then PATCHes status to `IN_PROGRESS` and `RESOLVED` as work proceeds. Each status change writes history and notifies the student.
7. Student refreshes complaint detail/history and notifications to see status and progress.
