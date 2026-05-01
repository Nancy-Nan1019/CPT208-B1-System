# Avatar and Rejoin Prompts

## Prompt 1: Animal Avatar Replacement

I added a new `icons` folder inside the images directory. It contains several SVG animal icons such as bat, bird, drawing, fox, giraffe, and kitty, plus a new robot SVG.

I want to replace the original avatar images with these SVG files:
- student avatars shown in the discussion room should use the new animal SVG icons
- the robot illustration should also use the new `robot.svg`

Constraints:
- a group has at most 6 students, so the 6 animal icons can map one-to-one without repetition
- I want the avatar assignment to feel random
- but within the same group, the avatars must not repeat
- the SVG files are visually larger and not circular, so the UI needs size and shape adjustment

Do not change system functionality. Only adjust the presentation and avatar assignment logic.

## Prompt 2: Avatar Consistency Across Clients

There is a problem with the current random avatar logic.

In the same session, if two students are logged in at the same time, each client may see a different avatar assignment for the same group members. For example, one student sees Kitty and Bat, while another sees Giraffe and Bat for the same people.

Please fix the logic so that:
- avatar assignment is deterministic within the same group
- all clients in the same session see the same avatar for each member
- avatars remain unique inside a single group
- the leaderboard also shows each student’s avatar beside their name

Do not change backend database structures if it can be avoided.

## Prompt 3: Rejoin Flow from Waiting Room

Analyse and implement a safer rejoin flow for students who leave the discussion room and later come back.

Expected behaviour:
- when students first join a session, they should proceed normally through the waiting room and then automatically enter the discussion room after the teacher starts the session
- if a student leaves the discussion room and returns to the waiting room while the session is still running, they should see a separate `Rejoin` button
- the system should not automatically force them back into the discussion room the moment they open the waiting room
- this should preserve the option to log out or stay in the waiting room first

Please use a low-risk approach that avoids backend database changes if possible.

## Prompt 4: Avatar Sizing and Shape Normalisation

The new animal SVG files are visually larger and have different proportions from the original avatars.

Please suggest how to normalise them in the UI so they feel consistent:
- aligned visual size
- consistent padding
- stable layout in small cards and leaderboard rows
- support for non-circular art while still looking neat

The avatars should feel cute and playful, but still clean enough for a serious web application.

## Prompt 5: Rejoin UX Wording and Card Design

Help me improve the UX wording for the student waiting-room rejoin state.

The current copy mentions a session number like “Session #56”, which feels too technical and unclear for users.

Please suggest:
- clearer wording using session topic or session name
- a separate rejoin card rather than mixing it into the generic join list
- calm but visible status messaging
- language that distinguishes “join for the first time” from “rejoin an ongoing discussion”

Do not change the backend payload if possible. Focus on better front-end presentation and wording.

## Prompt 6: Preventing Multi-Session Confusion

Analyse a product issue where the same student account appears able to join more than one currently running discussion session.

Please discuss:
- why this is problematic from a user-experience and session-consistency perspective
- whether it should be blocked on the backend, frontend, or both
- low-risk strategies that do not require database schema changes
- how the UI should communicate the restriction if we enforce “one active session per user at a time”

Do not implement yet. I want an analysis-first answer with low-risk options.

## Short Prompts

- The new SVG avatars are cute, but they look too large. How should I normalise them?
- The avatar shape is not circular anymore. How can I make it still look neat in cards and lists?
- Avatar assignment feels random in a bad way. How can I make it stable per group?
- The leaderboard would look better with avatars. What is the cleanest layout for that?
- The rejoin wording feels too technical. How should I rewrite it in simpler English?
- The waiting room mixes first-time join and rejoin too closely. How should those states be separated?
- Please analyse the current rejoin flow and point out where users may get confused.
- If a student leaves during a running session, what is the safest way to let them back in?
- The same user should probably not join two sessions at once. Should this be blocked on frontend, backend, or both?
- Which part of the avatar/rejoin experience feels least polished right now?
