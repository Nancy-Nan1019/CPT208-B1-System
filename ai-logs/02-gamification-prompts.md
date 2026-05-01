# Gamification Prompts

## Prompt 1: Playful Discussion Room Phase 1

Analyse how to gradually turn the discussion room into a more playful, game-like experience without changing the backend database design.

Current available interactions already include:
- hold to speak
- AI guide
- leaderboard
- speaking log
- teacher monitoring

I want to explore a first phase of frontend-only gamification:
- character-style participant cards using existing animal SVG avatars
- speaking-triggered motion or highlight effects
- a race-track style progress visual
- visible AI companion presence

Please explain what can be completed only on the frontend, what existing data can drive these visuals, and what assets would be helpful.

## Prompt 2: Race Track Design Revision

Revise the playful discussion-room concept so the leaderboard remains in its current simple format, while the race track becomes a separate full-width comparison area.

Requirements:
- keep participants on the left and leaderboard on the right
- place the race track below the session progress area, above the participants and leaderboard sections
- each member should move gradually based on speaking time compared with full session duration
- use milestone flags at 20%, 40%, 60%, and 80%
- place a gold reward around 50%
- place a success icon and treasure near the finish
- optionally float 2 to 3 rainbow clouds above the track
- make it easy to compare multiple students side by side

Do not change the backend. This should be driven by existing front-end session duration and speaking-time data.

## Prompt 3: Teacher Results Perspective

Suggest a more useful teacher-facing results view without changing the backend database schema.

The current teacher result page feels too similar to the student result page, especially because “overall ranking” and “group details” overlap in meaning.

Please propose a better teacher analysis perspective using only currently available data, such as:
- participation balance
- group comparison
- speaking distribution
- summary insight cards
- session-level reflection rather than student-only ranking

Keep the implementation realistic for the current repository and remote deployment constraints.

## Prompt 4: Playful Interaction Without Breaking Utility

I want to increase the playful feeling of the discussion room, but this is still a practical classroom system and should not become visually noisy or childish.

Please suggest interaction-level playful enhancements that preserve utility, such as:
- subtle motion when a student starts speaking
- a more expressive AI companion
- lightweight celebration moments
- visually rewarding transitions when milestones are reached

Constraints:
- do not reduce information density too much
- do not hide important teaching information
- do not introduce backend dependencies
- keep the UI suitable for a university classroom setting

## Prompt 5: Mapping Existing Data to Game-Like Feedback

Help me analyse how the existing data in the discussion room can be mapped into playful feedback without changing the API contract.

Available data already includes:
- session duration
- current session status
- group members
- speaking logs
- score or ranking information
- AI guide content
- real-time speaking events through WebSocket

Please explain:
- which visual components can be driven by which data
- which game-like feedback is safe to derive on the frontend
- what should remain descriptive rather than competitive
- how to avoid misleading users with overly literal “game score” metaphors

## Prompt 6: AI Companion Character Design

Analyse how to redesign the AI support area into a more character-like “AI companion” without changing its core function.

Current function:
- students click to request discussion guidance
- the system may also surface guidance during quiet moments or wrap-up phases

I want the AI area to feel more alive and supportive through:
- a companion panel
- mood states
- subtle visual status indicators
- guidance bubbles

Please propose a UI behaviour model for the companion, including idle, guiding, encouraging, and wrap-up states.

## Short Prompts

- The discussion room is functional, but not playful enough. What is the easiest frontend-only improvement?
- How can I make speaking feel more animated without making the interface distracting?
- The gamification should feel cute but still academic. What visual balance would you recommend?
- The race track looks useful, but maybe still too static. What small enhancements could improve it?
- Which existing data can be reused to drive playful feedback without adding new APIs?
- The AI guide works, but the companion still feels flat. How can I make it feel more alive?
- I want the discussion room to feel rewarding. What micro-celebration moments are safe to add?
- Which playful feature gives the biggest visual impact for the lowest implementation risk?
- Please analyse whether the current gamification improves comparison or just adds decoration.
- What playful elements should definitely not be added because they would hurt usability?
