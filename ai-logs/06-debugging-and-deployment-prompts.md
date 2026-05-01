# Debugging and Deployment Prompts

## Prompt 1: Local Run Troubleshooting

I cloned a Spring Boot project but `mvn` is not recognised on my machine.

Please help me troubleshoot local setup on Windows step by step.

The project uses:
- JDK
- Maven
- Spring Boot
- remote MySQL and Redis

Please explain:
- how to check whether Java is installed
- how to check whether Maven is installed
- how to fix PATH issues
- how to run the project once the environment is ready
- what command should be used to package and run the jar

## Prompt 2: Remote Database and Teammate Environment Problem

A teammate pulled the same repository and the system runs, but the test user accounts do not appear to exist on their machine.

The project uses a remote database rather than a local database.

Please analyse possible reasons, such as:
- different application configuration
- different environment variables
- pointing to a different database instance
- seed data not actually existing in the remote database
- stale assumptions in the README

I want a practical debugging checklist rather than only theoretical explanations.

## Prompt 3: Discussion Rejoin Bug Analysis

In the discussion system, a student can join a discussion, but if they close the page and log in again, they do not automatically get a clear path back into the discussion room.

Please analyse low-risk ways to support rejoining without changing the remote database schema.

Focus on:
- storing lightweight session context on the frontend
- restoring session/group context after login
- distinguishing first-time join from rejoin
- preventing confusing navigation loops

I want an analysis-first answer before implementation.

## Prompt 4: Git Pull with Local Changes

I changed code locally, but a teammate has already pushed new work to the remote repository.

Please explain the safest workflow to:
- preserve my local changes
- pull the latest remote changes
- reapply my own work
- avoid accidentally overwriting teammates’ changes

The project is in Git, and I may have both tracked modifications and an untracked `target/` directory.

Please include:
- when to use `git stash`
- whether to include untracked files
- why `target/` should usually be excluded
- what to do if merge conflicts appear

## Prompt 5: Deployment Script Review

Please review a simple Linux deployment workflow for a Spring Boot application:
- `mvn clean package -DskipTests`
- `nohup java -jar target/discussion-platform-1.0.0.jar > app.log 2>&1 &`

The application serves both frontend and backend on port 9527 and connects to remote MySQL and Redis.

Please explain:
- what each command does
- what assumptions this deployment model makes
- what logs or checks should be used after deployment
- what could go wrong on a fresh server

## Prompt 6: Public vs Private Repository Submission Question

I am preparing a university submission for a deployed interactive web application.

The repository is currently private, but the coursework requires a source-code repository link and a README.

Please analyse:
- whether a private repository is enough
- when it should be made public
- what risks exist if the assessor cannot access it
- what materials should remain visible in the repository during marking

Answer from the perspective of practical academic submission readiness.

## Prompt 7: Accessibility Gap Check

Please analyse a student-built web application for likely accessibility strengths and likely gaps based on a codebase review.

The application includes:
- forms
- buttons
- dashboards
- discussion-room interactions
- animations
- responsive design

I do not want overclaiming. Please separate:
- evidence likely already present
- likely missing evidence
- realistic low-effort improvements

## Prompt 8: Video Demo Content Planning

I need to prepare a 2-minute project demo video for a live interactive web application.

Please help me decide:
- what should be shown on screen
- which features are essential
- how to structure the hook, concept, walkthrough, impact, and closing
- how to divide work across four team members
- what AI-generated assets need disclosure

The project is a classroom discussion platform with real-time features and playful interaction design.

## Prompt 9: Preventing Overclaim in Documentation

Help me rewrite product and evaluation statements so they sound accurate and academically responsible.

I want to avoid overstating that the system is “fully intelligent” or “proven effective” if the evidence is actually:
- prototype-level implementation
- small-scale usability testing
- limited deployment

Please turn overly strong claims into honest, professional wording suitable for README, portfolio, and demo-video narration.

## Prompt 10: Submission Readiness Audit

Please audit a student software project before final submission.

Check whether the project appears ready in terms of:
- code repository contents
- README completeness
- AI logs
- deployment evidence
- live URL stability
- core feature coverage
- responsiveness
- accessibility evidence
- demo-video support materials

For each item, say:
- ready
- mostly ready
- needs work

Then suggest the most urgent fixes first.

## Short Prompts

- `mvn` is not recognised on this machine. What should I check first?
- The project runs for me but not for my teammate. What configuration mismatch should we look for?
- The live server works, but some test accounts do not. What might be happening?
- Please analyse whether this deployment approach is stable enough for a coursework demo.
- The repository is still private. Is that risky for submission?
- I changed code locally before pulling remote updates. What is the safest Git workflow now?
- The old folder name changed from `ailogs` to `ai-logs`. How should I stage that cleanly in Git?
- Which files should definitely not be pushed to GitHub in this project?
- The deployment script works, but looks messy. What should be cleaned up first?
- Please help me audit this repo for last-minute submission risks.
