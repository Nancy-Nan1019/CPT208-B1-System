# UI Redesign Prompts

## Prompt 1: Global Visual Direction

Refine the UI design of this classroom discussion platform without changing its existing functionality.

The current interface works, but the visual language feels plain and inconsistent. I want the redesign to feel more polished, high-fidelity, and human-centered.

Design direction:
- blue-led diffuse visual style
- soft gradient atmosphere and glow
- light local glassmorphism only on key panels
- pink-purple used only as AI-related accent color
- clear content hierarchy and strong readability
- practical academic system, not decorative for decoration’s sake

Please analyse which global style layers should be updated first, especially:
- design tokens
- base styles
- shared components
- page-level layout consistency

Do not change the system logic. Focus only on visual design improvements.

## Prompt 2: Page-Level Optimisation

Now continue from the global visual redesign and propose page-level improvements for the existing interface.

Requirements:
- keep all current functionality unchanged
- do not redesign the app into a completely different structure
- improve component hierarchy, spacing, cards, buttons, empty states, and visual clarity
- keep the interface suitable for desktop and responsive layouts
- make the discussion room, teacher dashboard, and results page feel more intentional and visually engaging

Please suggest practical modifications that can be implemented in HTML/CSS/vanilla JavaScript without introducing a new framework.

## Prompt 3: Alert Styling

Analyse how to improve urgent alert visibility in the teacher monitoring interface without changing the backend logic.

I want important alerts to be much more visible:
- use a red alert state
- allow the whole card to turn red or tinted red
- optionally add a short blinking or pulsing effect
- keep it readable and not overly distracting

Do not change the functional meaning of alerts. Only improve the UI expression and notification clarity.

## Prompt 4: Discussion Room Layout Hierarchy

Review the current discussion room UI and suggest a better visual hierarchy without changing the underlying logic or data flow.

The discussion room currently includes:
- participants
- leaderboard
- speaking log
- AI guide area
- session timer and progress
- hold-to-speak interaction

I want the page to feel more intentional and easier to scan during a live discussion.

Please suggest:
- which module should be visually dominant
- where the most dynamic real-time components should sit
- how to reduce visual clutter
- how to preserve high readability while still feeling playful

Do not remove key features. Focus on information architecture and interface composition.

## Prompt 5: Student-Side Result Page Refinement

Analyse the student result page UI and suggest how to make it clearer and more useful without changing the backend response structure.

Current concerns:
- some sections feel repetitive
- there is not enough visual distinction between high-level summary and detailed information
- the page should feel rewarding and reflective after discussion ends

Please propose:
- a better section order
- stronger summary cards
- improved visual grouping
- lightweight playful feedback that still feels academic

Keep the current data fields and implementation constraints in mind.

## Prompt 6: Teacher Dashboard Cohesion

The teacher-side pages currently work, but the dashboard, session monitor, and result view do not feel fully unified as one product.

Please suggest a page-system refinement plan that improves:
- visual consistency across teacher pages
- card system reuse
- button hierarchy
- state styling for waiting, running, ended, warning, and alert states
- spacing rhythm and desktop layout balance

Do not change the workflow logic. The goal is to make the teacher experience feel more professional and cohesive.

## Short Prompts

- The current button styles feel too plain. How can I make them look more polished without changing functionality?
- The page spacing feels inconsistent. Please point out which areas should be tightened or expanded.
- The discussion room looks crowded. Which module should visually stand out the most?
- The color system feels messy. Which colors should be kept, reduced, or removed?
- The cards all look too similar. How can I create a clearer visual hierarchy?
- The alert state is not noticeable enough. How should I redesign it so teachers notice it immediately?
- The result page feels repetitive. Which sections should look more distinct from each other?
- The teacher pages do not feel like one system. What should be unified first?
- The current visual style works, but it still feels generic. What would make it feel more intentional?
- Please analyse which page has the weakest UI right now and explain why.
