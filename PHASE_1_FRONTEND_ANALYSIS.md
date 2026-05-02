# PHASE 1 - FRONTEND ANALYSIS
## University Timetable Management System - Complete API Contract

**Analysis Date:** 2026-01-10  
**Frontend Source:** React (Vite)  
**Base URL:** `${import.meta.env.VITE_API_URL}/api` (mixed with `${import.meta.env.VITE_API_URL}/api` in some places)

---

## AUTHENTICATION FLOW

### Token Storage & Usage
- Token is stored in `localStorage` with key: `userToken`
- Token is sent in Authorization header: `Authorization: Bearer ${token}`
- Content-Type header: `application/json`
- Token is set on login/register and used for all authenticated requests

### Current Authentication Implementation (Not Best Practice)
1. **Login** (`/api/Auth/token`):
   - Returns `data.data.token` on success
   - Stores token in localStorage as `userToken`
   - Checks `data.message == null` for success (note: token in response)

2. **Register** (`/api/Auth/register`):
   - Returns `data.data.token` on success  
   - Stores token in localStorage as `userToken`
   - Checks `data.data?.message == null` for success (note: token in register response)

---

## MODULE 1: AUTHENTICATION (`/api/Auth`)

### 1.1 POST `/api/Auth/register`
**Request Body:**
```json
{
  "userName": "string",
  "email": "string",
  "password": "string",
  "confirmePassword": "string"
}
```
**Response Success:**
```json
{
  "message": null,
  "data": {
    "token": "string"
  }
}
```
**Response Error:**
- Returns error message in `error.response.data`

**Notes:**
- Field name: `confirmePassword` (misspelled - must stay as-is)
- Response structure: `data.data.token` (nested data property)

---

### 1.2 POST `/api/Auth/token` (Login)
**Request Body:**
```json
{
  "userName": "string",
  "password": "string"
}
```
**Headers:** None (no auth token required)

**Response Success:**
```json
{
  "message": null,
  "data": {
    "token": "string"
  }
}
```
**Response Error:**
- Returns error message in `error.response.data`

**Notes:**
- Success check: `data.message == null` (checks top-level message)
- Response structure: `data.data.token` (nested data property)

---

### 1.3 POST `/api/Auth/forgotPassword`
**Request Body:**
```json
{
  "email": "string",
  "clientUrl": "string"  // e.g., "https://next-advisory.vercel.app/forget-password"
}
```
**Headers:** None

**Response:** Success message (no specific structure documented)

---

### 1.4 POST `/api/Auth/resetPassword`
**Request Body:**
```json
{
  "email": "string",
  "token": "string",  // Encoded token from URL
  "newPassword": "string",
  "confirmPassword": "string"
}
```
**Headers:** None

**Response Success:** HTTP 200
**Response Error:** 
- Error in `error.response?.data?.[0]?.description`

**Notes:**
- Field name: `confirmPassword` (correct spelling, different from register)

---

## MODULE 2: PROFESSORS (`/api/Professors`)

### 2.1 GET `/api/Professors`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
[
  {
    "id": number,
    "name": "string",
    "numberAssignedCourses": number,
    "sat": boolean,
    "sun": boolean,
    "mon": boolean,
    "tue": boolean,
    "wed": boolean,
    "thu": boolean,
    "fri": boolean
  }
]
```

**Notes:**
- Day fields use abbreviated names: `sat`, `sun`, `mon`, `tue`, `wed`, `thu`, `fri`
- Endpoint name: `/api/Professors` (correct spelling)
- Alternative endpoint found: `/api/Proffessors` (misspelled, used in About.jsx and Servic.jsx)

---

### 2.2 POST `/api/Professors ` (Note: trailing space!)
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": number,
  "name": "string",
  "numberAssignedCourses": number,
  "sat": boolean,
  "sun": boolean,
  "mon": boolean,
  "tue": boolean,
  "wed": boolean,
  "thu": boolean,
  "fri": boolean
}
```

**Response:** Created professor object

**Notes:**
- URL has trailing space: `/api/Professors ` (must preserve!)
- Also found: `${import.meta.env.VITE_API_URL}/api/Professors` (HTTP, no space)

---

### 2.3 PUT `/api/Professors/{id}`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** Same as POST

**Response:** Updated professor object

---

### 2.4 DELETE `/api/Professors/{id}`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:** Success (no specific structure)

---

### 2.5 POST `/api/Professors/{id}` (Alternative - used in Postprofessor.jsx)
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** Same as POST structure

**URL:** `${import.meta.env.VITE_API_URL}/api/Professors/{id}` (HTTP, no trailing space)

**Notes:**
- Uses HTTP instead of HTTPS
- Method can be PUT or POST based on `isEdit` flag

---

## MODULE 3: TEACHING ASSISTANTS (`/api/TeachingAssistants`)

### 3.1 GET `/api/TeachingAssistants`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:** Same structure as Professors

---

### 3.2 POST `/api/TeachingAssistants`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** Same structure as Professors

---

### 3.3 PUT `/api/TeachingAssistants/{id}`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** Same structure as Professors

---

### 3.4 DELETE `/api/TeachingAssistants/{id}`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## MODULE 4: COURSES (`/api/Courses`)

### 4.1 GET `/api/Courses`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
[
  {
    "id": number,
    "name": "string",
    "grops": number,  // Note: misspelled "groups"
    "grop_lap": number,  // Note: misspelled "group_lab"
    "year": number,
    "enrollment": number
  }
]
```

**Notes:**
- Field names: `grops` (misspelled - must stay), `grop_lap` (misspelled - must stay)

---

### 4.2 GET `/api/Courses/{id}`
**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": number,
  "name": "string",
  "grops": number,
  "grop_lap": number,
  "year": number,
  "enrollment": number,
  "professors": [
    {
      "id": number,
      "name": "string"
    }
  ],
  "teachingAssistants": [
    {
      "id": number,
      "name": "string"
    }
  ]
}
```

---

### 4.3 POST `/api/Courses`
**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "string",
  "grops": number,
  "grop_lap": number,
  "year": number,
  "enrollment": number
}
```

---

### 4.4 PUT `/api/Courses/{id}`
**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:** Same as POST (or full course object with same fields)

---

### 4.5 DELETE `/api/Courses/{id}`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## MODULE 5: COURSE-PROFESSOR ASSIGNMENTS (`/api/CourseProfessors`)

### 5.1 GET `/api/CourseProfessors`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
[
  {
    "idProfessor": number,
    "idCourse": number,
    "nameCourse": "string"
  }
]
```

**Notes:**
- Field names: `idProfessor`, `idCourse`, `nameCourse` (camelCase)

---

### 5.2 POST `/api/CourseProfessors/{professorId}/{courseId}`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** `{}` (empty object)

**Notes:**
- Route uses path parameters for both IDs

---

### 5.3 DELETE `/api/CourseProfessors/{professorId}/{courseId}`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## MODULE 6: COURSE-TEACHING ASSISTANT ASSIGNMENTS (`/api/CourseTeachingAssistant`)

### 6.1 GET `/api/CourseTeachingAssistant`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
[
  {
    "idTeachingAssistant": number,
    "idCourse": number,
    "nameCourse": "string"
  }
]
```

**Notes:**
- Field name: `idTeachingAssistant` (different from `idProfessor`)

---

### 6.2 POST `/api/CourseTeachingAssistant/{teachingAssistantId}/{courseId}`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** `{}` (empty object)

---

### 6.3 DELETE `/api/CourseTeachingAssistant/{teachingAssistantId}/{courseId}`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## MODULE 7: CLASSROOMS/HALLS (`/api/ClassRooms`)

### 7.1 GET `/api/ClassRooms`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
[
  {
    "id": number,
    "name": "string",
    "type": boolean,  // false = Lecture Hall, true = Section Hall
    "capacity": number
  }
]
```

**Notes:**
- Field name: `type` (boolean, not string)

---

### 7.2 POST `/api/ClassRooms`
**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "string",
  "type": boolean,
  "capacity": number,
  "userGuid": "string"  // From localStorage.getItem("userGuid")
}
```

**Notes:**
- Includes `userGuid` field (may be null/empty)

---

### 7.3 PUT `/api/ClassRooms/{id}`
**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:** Same as POST (includes `userGuid`)

---

### 7.4 DELETE `/api/ClassRooms/{id}`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## MODULE 8: SCHEDULE GENERATION (`/api/schedule`)

### 8.1 POST `/api/schedule/generate`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "days": ["1", "2", "3", ...],  // Array of day IDs as strings
  "timeslots": ["09:00-11:00", "11:00-13:00", ...],  // Array of time slot strings
  "run_capacity": boolean  // Note: snake_case
}
```

**Response:** Success message/object

**Notes:**
- Field name: `run_capacity` (snake_case, not camelCase)
- Days are strings: "1" to "7"
- Timeslots format: "HH:MM-HH:MM"

---

### 8.2 GET `/api/schedule/TimeTable`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
[
  [
    {
      "year": number,
      "name_group": "string",  // Note: snake_case
      "day": "1" | "2" | "3" | "4" | "5" | "6" | "7",  // Day ID as string
      "time_slot": "string",  // Note: snake_case
      "name_course": "string",  // Note: snake_case
      "name_professor_or_teaching_assistant": "string",  // Note: snake_case, very long
      "room": "string",
      "type": "lecture" | "section"
    }
  ]
]
```

**Notes:**
- Response is array of arrays (nested structure)
- All field names use snake_case
- `type` is string: "lecture" or "section"

---

### 8.3 GET `/api/Schedule/Professor` (Note: capital S)
**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  [
    {
      "name_professor": "string",  // Note: snake_case
      "day": "1" | "2" | ...,
      "time_slot": "string",
      "name_course": "string",
      "group_name": "string",  // Note: snake_case
      "class_room_name": "string",  // Note: snake_case
      "year": number
    }
  ]
]
```

**Notes:**
- Response is array of arrays
- Field names use snake_case
- Note: endpoint is `/api/Schedule/Professor` (capital S in Schedule)

---

### 8.4 GET `/api/Schedule/ClassRooms`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
[
  [
    {
      "name_classRoom": "string",  // Note: camelCase
      "day": "1" | "2" | ...,
      "time_slot": "string",
      "name_course": "string",
      "name_professor": "string",
      "year": number,
      "name_group": "string"
    }
  ]
]
```

**Notes:**
- Response is array of arrays
- Mixed naming: `name_classRoom` (camelCase) but other fields snake_case

---

### 8.5 GET `/api/Schedule/AllCourseInTimeTable`
**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
["course1", "course2", ...]  // Array of course name strings
```

---

### 8.6 POST `/api/Schedule/GenerateUniqueStudent`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentName": "string",
  "studentId": "string",
  "courses": ["course1", "course2", ...],  // Array of course names
  "courseNames": ["course1", "course2", ...]  // Duplicate field (both sent)
}
```

**Response:**
```json
[
  {
    "day": "1" | "2" | ...,
    "time_slot": "string",
    "name_course": "string",
    "name_professor_or_teaching_assistant": "string",
    "room": "string",
    "type": "lecture" | "section"
  }
]
```

**Notes:**
- Request has duplicate fields: `courses` and `courseNames` (both arrays of strings)
- Response is flat array (not nested)

---

### 8.7 GET `/api/Schedule/AllUniqueStudent`
**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  [
    {
      "studentName": "string",
      "studentId": "string",
      "timeSlot": "string",  // Note: camelCase
      "day": "1" | "2" | ...,
      "nameCourse": "string",  // Note: camelCase
      "nameProfessorOrTeachingAssistant": "string",  // Note: camelCase
      "room": "string",
      "type": "lecture" | "section"
    }
  ]
]
```

**Notes:**
- Response is array of arrays
- Mixed naming: camelCase fields (different from other Schedule endpoints)

---

### 8.8 DELETE `/api/Schedule/DeleteStudent/{studentId}`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:** Success

---

### 8.9 POST `/api/Schedule/AddSameTimeTable`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentName": "string",
  "studentId": "string",
  "anotherStudentId": "string"
}
```

**Response:**
```json
[
  {
    "day": "1" | "2" | ...,
    "time_slot": "string",
    "name_course": "string",
    "name_professor_or_teaching_assistant": "string",
    "room": "string",
    "type": "lecture" | "section"
  }
]
```

**Notes:**
- Field name: `anotherStudentId` (camelCase)
- Response is flat array (not nested)

---

## MODULE 9: ANALYTICS & STATISTICS (`/api/AnalysisAndStatisticals`)

### 9.1 GET `/api/AnalysisAndStatisticals/Professor`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
[
  {
    "professorName": "string",
    "totalLectural": number,  // Note: misspelled "Lectural"
    "numberDays": number,
    "eachTimeSlotNo": {
      "09:00-11:00": number,
      "11:00-13:00": number,
      ...
    }
  }
]
```

**Notes:**
- Field name: `totalLectural` (misspelled)
- Field name: `eachTimeSlotNo` (camelCase)
- Time slots are keys in object

---

### 9.2 GET `/api/AnalysisAndStatisticals/ProfessorNotMapped`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
["professor1", "professor2", ...]  // Array of professor name strings
```

---

### 9.3 GET `/api/AnalysisAndStatisticals/TeachingAssistant`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:** Same structure as Professor endpoint

---

### 9.4 GET `/api/AnalysisAndStatisticals/TeachingAssistantNotMapped`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:** Array of TA name strings

---

### 9.5 GET `/api/AnalysisAndStatisticals/LectureClassRoom`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
[
  {
    "classRoomName": "string",
    "totalAssigned": number,
    "eachTimeSlot": {
      "09:00-11:00": number,
      ...
    }
  }
]
```

**Notes:**
- Field name: `classRoomName` (camelCase)
- Field name: `eachTimeSlot` (camelCase, different from `eachTimeSlotNo`)

---

### 9.6 GET `/api/AnalysisAndStatisticals/ClassRoomLectureNotMapped`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:** Array of classroom name strings

---

### 9.7 GET `/api/AnalysisAndStatisticals/SectionClassRoom`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:** Same structure as LectureClassRoom

---

### 9.8 GET `/api/AnalysisAndStatisticals/ClassRoomSectionNotMapped`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:** Array of classroom name strings

---

### 9.9 GET `/api/AnalysisAndStatisticals/TotalDays`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "1": number,  // Saturday
  "2": number,  // Sunday
  "3": number,  // Monday
  ...
  "7": number   // Friday
}
```

**Notes:**
- Keys are strings: "1" through "7"

---

### 9.10 GET `/api/AnalysisAndStatisticals/TotalTimeSlot`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "09:00-11:00": number,
  "11:00-13:00": number,
  ...
}
```

**Notes:**
- Time slot strings as keys

---

## MODULE 10: RATING (`/api/RatingTimeTable`)

### 10.1 GET `/api/RatingTimeTable`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
[
  {
    "nameTable": "string",  // Note: camelCase
    "rate": number  // 1-5
  }
]
```

---

### 10.2 POST `/api/RatingTimeTable`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "NameTable": "string",  // Note: PascalCase
  "rate": number
}
```

**Response:** `"done"` (string) on success

**Notes:**
- Request field: `NameTable` (PascalCase)
- Response field: `nameTable` (camelCase)
- Inconsistency in naming convention

---

### 10.3 POST `/api/RatingTimeTable/{tableName}`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** `{}` (empty object)

**Response:** 
- `"you are in the same table"` if already active
- Success message otherwise

**Notes:**
- This endpoint activates/switches to a timetable
- Uses POST method for activation action

---

### 10.4 DELETE `/api/RatingTimeTable/{tableName}`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:** Success

---

## SUMMARY OF NAMING INCONSISTENCIES & QUIRKS

### Spelling Mistakes (Must Preserve):
1. `confirmePassword` (register) vs `confirmPassword` (reset)
2. `grops` (should be "groups")
3. `grop_lap` (should be "group_lab")
4. `totalLectural` (should be "totalLectures")
5. `/api/Proffessors` (should be "Professors") - alternative endpoint
6. `Similer` Students (intentionally misspelled in frontend)

### Casing Inconsistencies (Must Preserve):
1. `NameTable` (PascalCase) in request vs `nameTable` (camelCase) in response
2. `run_capacity` (snake_case) vs other fields camelCase
3. Mixed snake_case and camelCase in Schedule endpoints
4. `userGuid` (camelCase) in ClassRooms

### Route Inconsistencies (Must Preserve):
1. `/api/Professors ` (trailing space)
2. `/api/schedule` vs `/api/Schedule` (case difference)
3. HTTP vs HTTPS mixed usage

### Field Naming Inconsistencies (Must Preserve):
1. `idProfessor` vs `idTeachingAssistant` (different patterns)
2. `name_professor_or_teaching_assistant` (very long snake_case)
3. `name_classRoom` (mixed case)
4. `eachTimeSlotNo` vs `eachTimeSlot` (different field names for similar purpose)

---

## MODULE MAPPING TO FRONTEND PAGES

| Frontend Component | Endpoints Used |
|-------------------|----------------|
| Login.jsx | POST `/api/Auth/token` |
| Register.jsx | POST `/api/Auth/register` |
| Resetpassword.jsx | POST `/api/Auth/forgotPassword` |
| Forgetpassword.jsx | POST `/api/Auth/resetPassword` |
| Proffesors.jsx | GET/POST/PUT/DELETE `/api/Professors`, GET `/api/CourseProfessors`, POST/DELETE `/api/CourseProfessors/{profId}/{courseId}` |
| TeachingAssisstant.jsx | GET/POST/PUT/DELETE `/api/TeachingAssistants`, GET `/api/CourseTeachingAssistant`, POST/DELETE `/api/CourseTeachingAssistant/{taId}/{courseId}` |
| Courses.jsx | GET/POST/PUT/DELETE `/api/Courses`, GET `/api/Courses/{id}` |
| Halls.jsx | GET/POST/PUT/DELETE `/api/ClassRooms` |
| Senddataschedule.jsx | POST `/api/schedule/generate` |
| TimetablePage.jsx | GET `/api/schedule/TimeTable` |
| ProfessorSchedule.jsx | GET `/api/Schedule/Professor` |
| Hallschedule.jsx | GET `/api/Schedule/ClassRooms` |
| SpecialCaseStudent.jsx | GET `/api/Schedule/AllCourseInTimeTable`, POST `/api/Schedule/GenerateUniqueStudent` |
| SameSpecialStudent.jsx | GET `/api/Schedule/AllUniqueStudent`, POST `/api/Schedule/AddSameTimeTable` |
| AllSpecialCaseStudent.jsx | GET `/api/Schedule/AllUniqueStudent`, DELETE `/api/Schedule/DeleteStudent/{studentId}` |
| AnalysisPagee.jsx | GET `/api/AnalysisAndStatisticals/Professor`, GET `/api/AnalysisAndStatisticals/ProfessorNotMapped` |
| AnalysisTeachingAssistant.jsx | GET `/api/AnalysisAndStatisticals/TeachingAssistant`, GET `/api/AnalysisAndStatisticals/TeachingAssistantNotMapped` |
| LectureClassRoom.jsx | GET `/api/AnalysisAndStatisticals/LectureClassRoom`, GET `/api/AnalysisAndStatisticals/ClassRoomLectureNotMapped` |
| SectionClassRoomchart.jsx | GET `/api/AnalysisAndStatisticals/SectionClassRoom`, GET `/api/AnalysisAndStatisticals/ClassRoomSectionNotMapped` |
| TimeslotandDaychart.jsx | GET `/api/AnalysisAndStatisticals/TotalDays`, GET `/api/AnalysisAndStatisticals/TotalTimeSlot` |
| Rating.jsx | GET/POST/DELETE `/api/RatingTimeTable`, POST `/api/RatingTimeTable/{tableName}` |

---

## ENDPOINT SUMMARY

**Total Endpoints:** 39

**By Module:**
- Authentication: 4 endpoints
- Professors: 5 endpoints
- Teaching Assistants: 4 endpoints
- Courses: 5 endpoints
- Course-Professor Assignments: 3 endpoints
- Course-TA Assignments: 3 endpoints
- ClassRooms: 4 endpoints
- Schedule: 9 endpoints
- Analytics: 10 endpoints
- Rating: 4 endpoints

---

## CRITICAL NOTES FOR BACKEND IMPLEMENTATION

1. **Preserve ALL spelling mistakes** (grops, grop_lap, confirmePassword, etc.)
2. **Preserve ALL casing inconsistencies** (NameTable vs nameTable, etc.)
3. **Preserve trailing spaces** in URLs (`/api/Professors `)
4. **Preserve route case differences** (`/api/schedule` vs `/api/Schedule`)
5. **Preserve field name inconsistencies** (idProfessor vs idTeachingAssistant)
6. **Preserve nested response structures** (data.data.token)
7. **Preserve empty request bodies** where used (`{}`)
8. **Preserve duplicate fields** (courses and courseNames)
9. **Preserve mixed HTTP/HTTPS** base URLs
10. **Preserve "Similer" spelling** (intentionally misspelled)

---

**PHASE 1 ANALYSIS COMPLETE**

Awaiting confirmation to proceed to Phase 2 (Database & Core Layer).
