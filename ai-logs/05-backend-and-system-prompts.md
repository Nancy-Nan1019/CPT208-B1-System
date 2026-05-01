# Backend and System Prompts

## Prompt 1: Spring Boot System Architecture

I am building a classroom discussion platform as a Spring Boot web application with a static frontend and real-time communication.

Please help me design a practical project architecture using:
- Spring Boot
- REST controllers
- service layer
- JPA repositories
- MySQL
- Redis
- WebSocket
- JWT authentication

The system needs to support:
- teacher and student roles
- registration and login
- session creation and management
- group allocation
- real-time speaking updates
- AI discussion guidance
- result review after a session ends

Please propose:
- package structure
- major entities
- controller responsibilities
- service responsibilities
- where real-time state should live
- how to keep the code maintainable for a student project

## Prompt 2: Entity and Data Model Planning

Help me plan the entity model for a classroom discussion platform.

The application needs to handle:
- users with different roles
- sessions created by teachers
- discussion groups within a session
- group membership
- speaking logs
- scores or participation metrics
- AI prompt records
- session participants who joined but may not yet be grouped

Please propose a clean JPA entity design and explain the relationships between:
- User
- Session
- DiscussionGroup
- GroupMember
- SessionParticipant
- SpeakingLog
- Score
- AiPrompt

I want the model to support both real-time interaction and end-of-session analytics.

## Prompt 3: JWT Authentication Flow

Please help me design a JWT-based authentication system for a Spring Boot web application.

Requirements:
- users can register and log in
- backend returns a token after login
- frontend stores the token and uses it for later API requests
- certain endpoints are teacher-only
- some endpoints are student-only
- logout should invalidate or block the token if possible

Please explain:
- what endpoints I need
- how the JWT filter should work
- how role-based access control can be handled
- whether Redis can be used for logout or blacklist behaviour

Keep the design realistic for a coursework project.

## Prompt 4: WebSocket Design for Real-Time Discussion

I need real-time updates in a classroom discussion platform where students speak in groups and teachers monitor live progress.

Please help me design the WebSocket layer.

Requirements:
- clients should connect using an authenticated token
- updates should be scoped to a session
- teachers can observe all groups in a session
- students should only access sessions they belong to
- the system should broadcast speaking state changes, rankings, and AI guidance events

Please explain:
- how to authenticate WebSocket connections
- how to map connections to session IDs
- how to broadcast selectively
- how to clean up closed connections
- how to avoid simple security mistakes

## Prompt 5: Speaking Start/Stop Backend Logic

Help me design backend logic for a “Hold to Speak” interaction.

The frontend will send:
- a request when the student starts speaking
- another request when the student stops speaking

The backend should:
- verify the session is running
- verify the student belongs to a group in that session
- track the start time
- calculate a speaking duration when the user stops
- save a speaking log entry
- update score or ranking data
- broadcast the new state to the relevant session via WebSocket

Please propose a robust service-layer design for this.

## Prompt 6: AI Guide Service Integration

I want to integrate AI-generated discussion prompts into a Spring Boot classroom discussion platform.

The AI guidance should support cases like:
- a silent group
- a student who needs encouragement
- discussion wrap-up

Please suggest how to structure an `AiGuideService` that:
- builds prompts based on session topic and trigger type
- optionally calls an external API such as DeepSeek
- falls back to local prompt templates if the API fails
- stores generated prompts for later analytics
- avoids repeating the same guidance too often in one session

## Prompt 7: Teacher and Student Controller Boundaries

Please help me define clean responsibilities between `StudentController`, `TeacherController`, `SessionController`, and `AuthController` in a Spring Boot application.

The system includes:
- login and registration
- session creation and listing
- waiting room actions
- auto-grouping and manual adjustment
- discussion participation
- AI prompt requests
- live monitoring
- session results

I want the controller structure to be easy to understand and not overloaded.

## Prompt 8: Real-Time State vs Persistent Data

Analyse how to split state between:
- persistent MySQL data
- temporary in-memory runtime state
- optional Redis-backed support state

This is for a discussion platform where some data must be saved permanently, while other data is only needed during a running session.

Please classify examples such as:
- user accounts
- sessions
- group assignments
- speaking logs
- scores
- JWT blacklist
- currently active speakers
- group last-activity timestamps
- current WebSocket connection mapping

I want a practical explanation suitable for a student full-stack system.

## Prompt 9: Session Lifecycle Logic

Help me reason about the full lifecycle of a classroom discussion session.

The session can move through stages such as:
- created
- waiting for students
- grouped
- running
- ended

Please explain:
- what actions should be allowed in each stage
- what UI transitions each stage implies
- what backend checks should enforce valid transitions
- what data should be reset or preserved when a session ends

## Prompt 10: Result Analytics Without New Tables

I want to build useful teacher and student result views using only the data already collected during discussion.

Assume I already have:
- speaking logs
- score or participation data
- group membership
- AI prompt records

Please suggest how to derive:
- overall ranking
- per-group comparison
- participation balance insights
- teacher reflection cards
- student-facing summary metrics

Do not require adding new database tables unless absolutely necessary.

## Short Prompts

- Please analyse whether the current backend structure is clean enough for a student project.
- Which controller currently sounds like it might be handling too many responsibilities?
- Do I really need Redis for this feature, or is in-memory state enough?
- What data should definitely be stored in MySQL rather than kept only in memory?
- Is this WebSocket design secure enough for a classroom project?
- Please explain the safest way to validate that a student belongs to a session before sending updates.
- The service layer feels messy. How should I split responsibilities more clearly?
- Which entity relationships are essential, and which ones might be overcomplicated?
- How should I handle AI API failure without breaking the user experience?
- Please analyse whether the result logic can be improved without changing the database schema.
- The runtime state and persistent state feel mixed together. How should I separate them conceptually?
- How can I make the backend easier for teammates to understand and maintain?
