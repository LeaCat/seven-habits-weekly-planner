# Start Page & Read-Only Past Weeks — Plan

## Overview

Add a **Home/Start screen** that appears when the app first loads (or when the user
clicks the "Home" tab). It shows:

1. A **"Start / Continue This Week"** button that loads the current ISO week
   (creating fresh data if none exists, or resuming existing data).
2. A **"Past Weeks"** list built by scanning `localStorage` for all
   `weekly_planner_*` keys — sorted newest-first.

Loading a **past week** opens it in a **read-only** version of the three modes
(Define / Budget / Plan). All editing controls are hidden or disabled.

A **"Home" tab** is added to the NavBar so the user can return to the start page
at any time.

Data storage is unchanged — everything lives in `localStorage`, nothing touches
the filesystem or git.

---

## Sub-Tasks

---

### Sub-Task 1 — Add `viewMode` and `isReadOnly` state to the store

**Intent**  
The store needs to know whether the user is currently on the home screen or
viewing a past week, and whether edits should be blocked.

**Expected Outcomes**  
- `store.mode` can be set to `'home'` (alongside existing `'define'`, `'budget'`,
  `'plan'`).
- `store.isReadOnly` is `true` when a past week is loaded, `false` otherwise.
- A new action `goHome()` resets `mode` to `'home'` and `isReadOnly` to `false`
  and reloads the current week's data so the home screen is always fresh.
- The existing `loadWeek(key)` action gains a second parameter `readonly = false`
  that sets `store.isReadOnly` accordingly.

**Todo List**  
- [ ] Add `isReadOnly` ref (default `false`) to store state.
- [ ] Allow `'home'` as a valid value for `mode` and initialize it to `'home'`
      (so the start page shows on first load).
- [ ] Add `goHome()` action: sets `mode = 'home'`, `isReadOnly = false`, and
      calls `loadWeek(currentWeekKey(), false)` to refresh current-week state.
- [ ] Update `loadWeek(newWeekKey, readonly = false)` to set `isReadOnly`.

**Relevant Context**  
- `app/src/store/useWeekStore.js` — `mode` ref (line ~71), `loadWeek` action
  (line ~84), `setMode` action.
- `app/src/composables/useWeekKey.js` — `currentWeekKey()`.

**Status** `[ ] pending`

---

### Sub-Task 2 — Create `HomeScreen.vue`

**Intent**  
A new component that renders the start page UI: app title/tagline, a primary
"Start / Continue This Week" button, and a scrollable list of past saved weeks.

**Expected Outcomes**  
- Displays the current week label (e.g. "Nov 9 – Nov 15, 2026") in the primary
  button.
- Scans `localStorage` for all keys matching `weekly_planner_*`, sorts them
  newest-first, and lists them.
- Each past-week row shows the week label and a "View" button.
- Clicking "Start / Continue This Week" calls `store.loadWeek(currentWeekKey())`
  then `store.setMode('define')`.
- Clicking a past week's "View" button calls
  `store.loadWeek(pastKey, true)` then `store.setMode('define')`.
- If there are no past weeks yet, shows a friendly "No past weeks saved" message.

**Todo List**  
- [ ] Create `app/src/components/HomeScreen.vue`.
- [ ] In `setup`, read all `localStorage` keys, filter to `weekly_planner_*`,
      exclude the current week key, sort descending, map to `{ key, label }`.
- [ ] Render the "Start / Continue" button using `currentWeekKey()` and
      `weekLabel()`.
- [ ] Render the past-weeks list. Each row: week label on the left, "View"
      button on the right.
- [ ] Wire button click handlers to store actions as described above.
- [ ] Style consistently with the existing design tokens in `main.css`
      (use `--color-accent`, `--radius`, card-style panels, etc.).

**Relevant Context**  
- `app/src/assets/main.css` — design tokens and existing card/button styles.
- `app/src/composables/useWeekKey.js` — `weekLabel(k)`, `currentWeekKey()`.
- `app/src/store/useWeekStore.js` — `loadWeek`, `setMode`.

**Status** `[ ] pending`

---

### Sub-Task 3 — Wire `HomeScreen` into `App.vue` and `NavBar.vue`

**Intent**  
Make the app show `HomeScreen` when `store.mode === 'home'`, and add a "Home"
tab to the NavBar so users can navigate back to it from any mode.

**Expected Outcomes**  
- `App.vue` renders `<HomeScreen />` when `store.mode === 'home'` and the
  existing three mode components otherwise (unchanged).
- `NavBar.vue` has a "Home" tab (first position) that calls `store.goHome()`.
- The "Home" tab is visually active when `store.mode === 'home'`.
- The existing Define / Budget / Plan tabs are hidden (or disabled) when
  `store.isReadOnly` is `true` and `store.mode === 'home'` — no, actually tabs
  remain visible when viewing a past week (the user can switch between
  Define/Budget/Plan for that past week read-only), but are not shown on the
  Home screen itself (the home screen replaces the tab content area entirely,
  so those tabs are still rendered but inactive on `'home'`).

**Todo List**  
- [ ] In `App.vue`, add `v-if="store.mode === 'home'"` branch for
      `<HomeScreen />` and add `HomeScreen` to the imports.
- [ ] In `NavBar.vue`, prepend a "🏠 Home" tab entry to the `tabs` array (or
      add it separately with `store.goHome()` on click).
- [ ] Ensure the Home tab shows as active when `store.mode === 'home'`.
- [ ] When `store.isReadOnly` is `true`, display a visible "Read-only" badge or
      banner in the NavBar (e.g. a small pill: "Viewing: Nov 9 – Nov 15") so the
      user always knows they are not on the current week.

**Relevant Context**  
- `app/src/App.vue` — mode-switch conditional rendering.
- `app/src/components/NavBar.vue` — `tabs` array, active-tab logic.

**Status** `[ ] pending`

---

### Sub-Task 4 — Enforce read-only in the three mode components

**Intent**  
When `store.isReadOnly` is `true`, all editing interactions in Define, Budget,
and Plan modes must be disabled or hidden so past-week data cannot be
accidentally modified.

**Expected Outcomes**  
- In **DefineMode** / **RoleCard** / **GoalCard** / **SharpenSawDefine**:
  all `<input>`, `<textarea>`, add/delete buttons, drag handles are hidden or
  `disabled` when `isReadOnly`.
- In **BudgetMode** / **SharpenSawBudget**:
  hour-input controls are `disabled`; the progress bars still render.
- In **PlanMode** / **TimeGrid** / **TimeBlock**:
  drag-and-drop and resize are disabled; blocks render but cannot be moved or
  created.
- No `save()` calls are triggered while `isReadOnly` is `true` (guard in
  store actions is sufficient, but UI should also hide edit affordances).

**Todo List**  
- [ ] In `useWeekStore.js`, guard every mutating action with
      `if (isReadOnly.value) return` to prevent accidental writes.
- [ ] Pass or inject `isReadOnly` into DefineMode, BudgetMode, PlanMode
      (via `store.isReadOnly` — already accessible via the store, no prop
      drilling needed).
- [ ] In `DefineMode.vue` and child components (`RoleCard`, `GoalCard`,
      `SharpenSawDefine`): `v-if="!store.isReadOnly"` on add/delete/drag
      controls; `disabled` attribute on inputs.
- [ ] In `BudgetMode.vue` / `SharpenSawBudget.vue`: add `disabled` to
      number inputs and hour steppers.
- [ ] In `TimeGrid.vue` / `TimeBlock.vue`: skip drag/drop event listeners
      when `store.isReadOnly`; hide the "click to add block" affordance.

**Relevant Context**  
- `app/src/store/useWeekStore.js` — all mutating actions.
- `app/src/components/DefineMode.vue`, `RoleCard.vue`, `GoalCard.vue`,
  `SharpenSawDefine.vue`, `BudgetMode.vue`, `SharpenSawBudget.vue`,
  `PlanMode.vue`, `TimeGrid.vue`, `TimeBlock.vue`.
- `app/src/composables/useDragDrop.js` — drag/drop logic to gate.

**Status** `[ ] pending`
