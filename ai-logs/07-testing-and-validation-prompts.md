# Testing and Validation Prompts

## Prompt 1: End-to-End Functional Testing Plan

Help me create a practical end-to-end functional testing checklist for a university classroom discussion platform.

The system includes:
- teacher and student login
- session creation
- waiting room join flow
- auto-grouping and manual regrouping
- discussion room participation
- hold-to-speak interaction
- AI guidance prompts
- teacher monitoring
- session result pages

Please write a test checklist with:
- feature area
- test steps
- expected result
- possible failure signs

The checklist should be realistic for manual testing by a student team.

## Prompt 2: Multi-Role Scenario Testing

Help me design a manual test plan for a system with both teacher and student roles.

I want to test cross-role workflows such as:
- teacher creates a session
- multiple students join
- teacher forms groups
- teacher starts the session
- students enter the discussion room
- teacher watches live progress
- session ends and both roles review results

Please describe the most important scenarios we should rehearse before a demo or assessment.

## Prompt 3: WebSocket Synchronisation Test Cases

Please generate test cases for validating WebSocket-based real-time synchronisation in a discussion platform.

Focus on:
- students in the same session seeing live speaking-state updates
- teacher receiving updates from all groups
- leaderboard changes propagating correctly
- AI guide events appearing in the right session context
- connection closure and reconnection behaviour

I want a practical set of manual test cases, not only protocol-level theory.

## Prompt 4: Hold-to-Speak Interaction Testing

Help me think through how to test a “Hold to Speak” feature in a browser-based discussion room.

Important cases:
- press and hold normally
- release quickly
- release outside the button
- mobile touch interaction
- repeated speaking turns
- network delay or double-trigger risk
- whether the speaking log and leaderboard remain consistent

Please organise the answer as a test matrix with expected outcomes.

## Prompt 5: Rejoin Flow Validation

I recently changed the student rejoin flow for an ongoing discussion session.

Please help me build a manual validation checklist for these cases:
- first-time join should still work normally
- after leaving the discussion room, the student should return to the waiting room
- a separate rejoin action should appear only when appropriate
- the user should not be forced directly back into the room
- rejoin should work only while the session is still running

I want to verify that the new behaviour is intuitive and does not break the original join flow.

## Prompt 6: Avatar Consistency Test Cases

Please help me design test cases for deterministic avatar assignment in a small-group discussion system.

Requirements being tested:
- each group member receives one animal avatar
- avatars do not repeat inside the same group
- all clients in the same session see the same avatar for the same user
- leaderboard and participant views stay consistent

Please include both normal and edge cases.

## Prompt 7: Teacher Monitor Usability Check

I want to run a lightweight usability review of the teacher monitoring interface in a classroom discussion platform.

Please suggest a short evaluation checklist that focuses on:
- whether alerts are noticeable enough
- whether group cards are easy to scan
- whether real-time changes are understandable
- whether the session overview feels actionable
- whether the result transition after session end is clear

This is for a student project, so keep the method simple and feasible.

## Prompt 8: Accessibility-Oriented QA

Help me create a small accessibility-oriented QA checklist for a web application with forms, dashboards, live updates, and animations.

Please include checks for:
- keyboard navigation
- focus visibility
- text readability
- contrast awareness
- responsive layout behaviour
- touch interaction on mobile
- motion sensitivity concerns

I want a lightweight checklist suitable for README evidence or internal testing notes.

## Prompt 9: Submission Readiness Testing

Please create a final pre-submission testing checklist for a deployed student web application.

The checklist should verify:
- live URL accessibility
- login works on different devices or networks
- core features are demonstrable
- no obvious demo-breaking errors appear
- repository materials are complete
- README matches the real system behaviour
- AI logs are present
- video-demo scenes can be reproduced reliably

Format the answer as a practical go/no-go checklist.

## Prompt 10: Writing Honest Testing Evidence

Help me write a short project-report paragraph about testing and validation for a student-built interactive web system.

The testing was mainly:
- manual scenario-based testing
- multi-user role testing
- repeated UI and interaction checks
- deployment verification through the live server

Write it in academic English.
Make it sound responsible and professional, without pretending that we built a full industrial automated testing pipeline.

## Short Prompts

- Please help me make a quick manual testing checklist for our main demo flow.
- Which three user journeys are most important to test before presentation day?
- How should we test WebSocket synchronisation with two student accounts and one teacher account?
- What is the simplest way to verify the `Hold to Speak` feature is not double-counting?
- Please analyse which part of the current system is most likely to fail during a live demo.
- How can we test the rejoin flow without overcomplicating the setup?
- What accessibility checks can we realistically do before submission?
- How should we document manual testing without making it sound weak?
- Please help me turn our informal testing into a cleaner validation summary.
- Which demo-breaking bugs should we check for one last time before recording the video?
