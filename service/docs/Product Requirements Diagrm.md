# Product Requirements Document (PRD):

## Private Learning Management System (LMS)

**Version:** 1.0  
**Date:** July 10, 2026  
**Status:** Draft

---

## 1. Executive Summary

This is a private, admin-provisioned Learning Management System (LMS). Users cannot self-register; they are manually created by administrators. Once onboarded, users can log in, browse a structured library of courses (organized into Categories → Courses → Sections → Parts), and consume multimedia content (video/audio) and supporting documents. The system tracks which parts a user has completed.

---

## 2. Goals & Success Metrics

### 2.1 Goals

- **Goal 1:** Provide a structured, distraction-free learning environment for admin-approved users.
- **Goal 2:** Ensure content is easily navigable through a strict hierarchy (Course → Section → Part).
- **Goal 3:** Accurately track user progress per part.

### 2.2 Success Metrics (KPIs)

- **Content Consumption:** Average number of Parts viewed per user per week.
- **Completion Rate:** Percentage of users who view 100% of the Parts in a Course.
- **Admin Efficiency:** Time it takes for an admin to upload a new Course and assign users.

---

## 3. User Personas

### 3.1 The Admin (Role: `Admin` / `SuperAdmin`)

- **Needs:** Bulk-create users, upload courses/sections/parts, attach documents, and view usage reports.
- **Pain Point:** Complex uploading processes; needs a simple dashboard.

### 3.2 The Learner (Role: `User`)

- **Needs:** A clear list of assigned/available courses, a smooth video player, and clear indication of what they have finished.
- **Pain Point:** Losing their place in a long course.

---

## 4. User Stories (Core Functionality)

| #         | User Story                                                                                                                                                  |
| :-------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **US-01** | As a **Learner**, I want to log in using my username/mobile so that I can access my personalized dashboard.                                                 |
| **US-02** | As a **Learner**, I want to browse courses by **Category** so that I can find relevant topics quickly.                                                      |
| **US-03** | As a **Learner**, I want to open a Course and see its **Sections** sorted by `sectionOrder`, so I can follow the curriculum logically.                      |
| **US-04** | As a **Learner**, I want to click into a **Part** and watch/listen to the `Video` or `Audio` content in the correct `contentOrder`.                         |
| **US-05** | As a **Learner**, I want to download or view supporting **Documents** attached to the Course.                                                               |
| **US-06** | As a **Learner**, I want my progress to be automatically saved so that if I leave the page, the system remembers I viewed that Part (`PartView`).           |
| **US-07** | As an **Admin**, I want to create a new User by manually providing their `firstName`, `lastName`, `mobile`, and `username` so they can access the platform. |
| **US-08** | As an **Admin**, I want to upload a Course with a Thumbnail, Documents, and multimedia Parts without needing to write code.                                 |
| **US-09** | As an **Learner**, I want to change my password using an otp way.                                                                                           |

---

## 5. Functional Requirements

### 5.1 Authentication & Authorization (RBAC)

- **FR-01:** The system **must** reject login attempts for `isActive: false` users.
- **FR-02:** The system **must** hide "Admin Panels" from users with `Role: User`.
- **FR-03:** The system **must** enforce granular permissions via the `UserPermission` and `RolePermission` join tables (e.g., only users with the "DeleteCourse" permission can delete a course).

### 5.2 Content Navigation Structure

- **FR-04:** The UI **must** display a hierarchy: `Category` → `Course` → `Section` → `Part`.
- **FR-05:** Sections **must** be displayed in ascending `sectionOrder`. Parts **must** be displayed in ascending `partOrder`.
- **FR-06:** Content within a Part (Video/Audio) **must** be displayed in ascending `contentOrder`.

### 5.3 Progress Tracking

- **FR-07:** When a user finishes watching a video or listening to audio, the system **must** create a `PartView` record linking the `User` and the `Part`.
- **FR-08:** The system **must** prevent duplicate `PartView` entries (enforced by the `@@unique([userId, partId])` in the schema).

### 5.4 Document Management

- **FR-09:** The system **must** allow admins to upload files (PDFs, etc.) as `Document` records associated with a `Course`.
- **FR-10:** Learners **must** be able to download these files via the `fileUrl`.

---

## 6. Non-Functional Requirements

- **Performance:** Courses with multiple videos must load the Part list in under 800ms.
- **Media:** Video/Audio must support streaming (not just downloading) and be responsive across mobile/desktop.
- **Security:** Passwords must be hashed (Prisma `password` field should store a hash, not plain text).
- **Data Integrity:** Deleting a Course **must** cascade delete its Sections, Parts, and Content (already enforced by `onDelete: Cascade` in the schema).

---

## 7. User Flows (High-Level)

### 7.1 Login Flow

User enters `username`/`mobile` + `password` → System checks `isActive` → Redirects to Dashboard.

### 7.2 Learning Flow

User clicks "Course A" → Sees Section 1 (Title), Section 2 (Title) → Clicks Part 1 → Media player loads `mediaUrl` → User watches video → System writes to `PartView` → UI marks Part 1 as "Complete" (Green checkmark).

### 7.3 Admin Upload Flow

Admin clicks "New Course" → Enters Title, Description, uploads Thumbnail → Adds new Sections → Adds Parts to Sections → Uploads Video/Audio to Parts → Publishes course (`isPublished: true`).

---

## 8. Edge Cases & Constraints

| Scenario                                               | System Behavior                                                                                                                         |
| :----------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **User has no role assigned.**                         | Default to `Role: User` (as defined in your enum).                                                                                      |
| **Admin deletes a Category.**                          | Due to `onDelete: SetNull`, the Courses remain but are uncategorized. The admin should be warned before deletion.                       |
| **User watches a video twice.**                        | The system checks the unique constraint on `PartView`. It should **not** create a duplicate record; it just ignores the second request. |
| **A Part has 0 video/audio content.**                  | The UI should display "No media available" rather than a broken player.                                                                 |
| **Admin tries to create a duplicate username/mobile.** | Prisma handles this via `@unique`; the API should return a clear error message: "Username already exists."                              |

---

## 9. Appendix: Schema Mapping

| Business Concept  | Database Model                     |
| :---------------- | :--------------------------------- |
| Content Category  | `Category`                         |
| Learning Program  | `Course`                           |
| Curriculum Module | `Section`                          |
| Individual Lesson | `Part`                             |
| Media Asset       | `Content`                          |
| Supporting File   | `Document`                         |
| User Progress     | `PartView`                         |
| Access Control    | `UserPermission`, `RolePermission` |

---

**Document History:**

| Version | Date          | Author      | Changes          |
| :------ | :------------ | :---------- | :--------------- |
| 1.0     | July 10, 2026 | [Your Name] | Initial creation |
