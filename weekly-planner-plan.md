# Weekly Planner App — Implementation Plan

## Top-Level Overview

Build a **Vue 3 + Vite** single-page application living in `weekly-plan/app/` that guides the
user through a 4-step Covey-style weekly planning process. The app has three named modes
accessible via a top navigation bar:

| Mode | Tab Label | Purpose |
|------|-----------|---------|
| Define | "1 · Define" | **Sharpen the Saw first**, then roles and Big Rock goals |
| Budget | "2 · Budget" | **Sharpen the Saw time budgets first**, then confirm outcomes and set goal budgets |
| Plan | "3 · Plan" | **Sharpen the Saw blocks draggable first** in the side panel, then place everything on the 7-day × hourly grid |

**Sharpen the Saw** (Physical, Mental, Spiritual, Social/Emotional) is treated as a
first-class role throughout all three modes — it appears at the top of every mode, its
activities get their own time budget, and its blocks are placed on the calendar grid just
like any goal. It defaults to the `self` color family (lavender) but the user can change
its color like any other role's color.

All data is persisted to `localStorage` keyed by ISO week string (e.g. `2026-W46`).
When a new week starts the app auto-loads the previous week's roles and goals as the
starting point (text preserved, blocks and budgets reset to 0).

**Tech stack:**
- Vue 3 (Composition API, `<script setup>`)
- Vite (build tool, dev server)
- Vue Draggable Next (`vuedraggable`) for Define-mode drag-and-drop reordering
- Native HTML5 Drag-and-Drop API for the Plan-mode calendar grid
- `localStorage` for persistence (no backend)
- Plain CSS with CSS variables matching the existing `habit-tracker` design language

**Non-goals:** no user accounts, no sync, no backend, no TypeScript (plain JS).

---

## Project Structure

```
weekly-plan/
  app/
    index.html
    package.json
    vite.config.js
    src/
      main.js
      App.vue
      store/
        useWeekStore.js          # Pinia store — single source of truth
      components/
        NavBar.vue               # Top nav: mode switcher + week label
        DefineMode.vue           # Step 1 — Sharpen the Saw + roles & goals
        BudgetMode.vue           # Step 2 — Sharpen the Saw budgets first, then goals
        PlanMode.vue             # Step 3 — side panel + calendar grid
        SharpenSawDefine.vue     # Sharpen the Saw section for Define mode (editable activities + color picker)
        SharpenSawBudget.vue     # Sharpen the Saw section for Budget mode (budget inputs)
        SharpenSawPanel.vue      # Compact draggable cards for the Plan mode side panel
        RoleCard.vue             # One role with its goals list (Define mode)
        GoalCard.vue             # One goal card (Define mode and Plan mode side panel)
        TimeGrid.vue             # 7-day x hourly grid (Sun–Sat, 7am–midnight)
        TimeBlock.vue            # A placed/draggable/resizable block on the grid
      composables/
        useWeekKey.js            # ISO week key helpers; week starts Sunday
        useDragDrop.js           # Grid drag, drop, and resize logic
      assets/
        main.css                 # Global CSS variables, color themes, resets
```

---

## Color Theme System

Roles (including Sharpen the Saw) are assigned one of three **semantic color families**.
The user always picks a family first, then a specific swatch within it. Sharpen the Saw
**defaults** to `self` / lavender but can be changed by the user.

| Family | CSS token prefix | Swatches | Intended use |
|--------|-----------------|----------|--------------|
| `work` | `--theme-work-*` | Navy `#1e3a5f`, Ocean blue `#1a6b8a`, Dark teal `#0d6e6e`, Dark green `#1b5e20` | Professional / research / career roles |
| `life` | `--theme-life-*` | Warm orange `#e65100`, Coral `#e64a19`, Hot pink `#c2185b`, Rose `#ad1457` | Family, partner, community roles |
| `self` | `--theme-self-*` | Lavender `#7c4dff`, Soft purple `#9c27b0`, Dusty violet `#6a1b9a`, Mauve `#8e24aa`, Grass green `#268b07`, New leaf `#beea41` | Self / personal growth / Sharpen the Saw |

The Sharpen the Saw section stores its chosen `colorFamily` and `color` in the data model
and uses the same color picker UI as `RoleCard.vue`. Its color is applied to its time blocks
on the grid the same way role colors are applied.

---

## Data Model

Stored in `localStorage` under key `weekly_planner_<weekKey>` (e.g. `weekly_planner_2026-W46`):

```json
{
  "weekKey": "2026-W46",
  "sharpenTheSaw": {
    "colorFamily": "self",
    "color": "#7c4dff",
    "dimensions": {
      "physical":  { "activity": "Morning run", "budgetHours": 3.5, "blocks": [
                     { "day": 0, "startHour": 7, "durationHours": 0.5 }] },
      "mental":    { "activity": "Read 30 min/day", "budgetHours": 3.5, "blocks": [] },
      "spiritual": { "activity": "Meditation",      "budgetHours": 2,   "blocks": [] },
      "social":    { "activity": "Family dinner",   "budgetHours": 4,   "blocks": [] }
    }
  },
  "roles": [
    {
      "id": "r1",
      "name": "Researcher",
      "colorFamily": "work",
      "color": "#1a6b8a",
      "goals": [
        {
          "id": "g1",
          "text": "Submit conference abstract",
          "expectedOutput": "Abstract PDF submitted by Friday",
          "budgetHours": 5,
          "blocks": [{ "day": 1, "startHour": 9, "durationHours": 2 }]
        }
      ]
    }
  ]
}
```

`day` is 0 = Sunday … 6 = Saturday. Week starts on Sunday.
`startHour` is an integer 7–23 (7am–11pm; the last slot covers 11pm–midnight).

Sharpen the Saw dimensions share the **same block shape** as role goals so they can be driven
by the same `TimeBlock.vue` component and similar store actions, accessed via
`store.plan.sharpenTheSaw.dimensions.<dim>` instead of a role's goals array.

---

## Sub-Tasks

---

### Sub-Task 1 — Project Scaffold & Shared Infrastructure

**Intent**
Create the Vite + Vue 3 project skeleton, install dependencies, set up the Pinia store,
define all CSS design tokens (including the three color-family palettes and grid constants),
and build the top-level `App.vue` with `NavBar` and mode routing.

**Expected Outcomes**
- `weekly-plan/app/` exists and `npm run dev` starts with no errors
- `npm run build` produces a working `dist/` folder
- `App.vue` renders a `<NavBar>` and a stub for each of the three modes; clicking a tab switches modes
- `useWeekStore` (Pinia) is wired up; `save()` / `loadWeek()` work against `localStorage`
- All CSS variables match `habit-tracker/index.html` plus the three color-family palettes
- `--slot-height: 48px`, `--grid-start: 7`, `--grid-end: 24` (17 slots × 48px = 816px)
- `getWeekDates(k)` returns 7 Date objects starting from **Sunday** (index 0)

**Todo List**
1. `npm create vite@latest app -- --template vue` inside `weekly-plan/`
2. `cd app && npm install pinia vuedraggable@next`
3. Register Pinia in `main.js`; mount `App.vue`
4. Write `src/assets/main.css`:
   - CSS reset + base `:root` variables from habit-tracker (`--bg`, `--surface`, `--border`,
     `--text`, `--muted`, `--accent`, `--danger`, `--done`, `--radius`)
   - `--theme-work-1…4`: `#1e3a5f`, `#1a6b8a`, `#0d6e6e`, `#1b5e20`
   - `--theme-life-1…4`: `#e65100`, `#e64a19`, `#c2185b`, `#ad1457`
   - `--theme-self-1…6`: `#7c4dff`, `#9c27b0`, `#6a1b9a`, `#8e24aa`, `#268b07`, `#beea41`
   - `--slot-height: 48px`, `--grid-start: 7`, `--grid-end: 24`
5. Write `src/composables/useWeekKey.js`:
   - `currentWeekKey()` → ISO `YYYY-Www`
   - `prevWeekKey(k)` → prior week's key
   - `weekLabel(k)` → e.g. "Nov 9 – Nov 15, 2026"
   - `getWeekDates(k)` → 7 Date objects, index 0 = **Sunday**
6. Write `src/store/useWeekStore.js` (Pinia):
   - `weekKey` (defaults to `currentWeekKey()`), `mode` (`'define'`), `plan` states
   - `loadWeek(weekKey)`: load from localStorage; if absent, copy from previous week
     (preserve activity text and role/goal text; clear all `blocks`; reset all `budgetHours` to 0;
     preserve `colorFamily` and `color` from previous week)
   - `save()`, `setMode(mode)`
   - Sharpen the Saw actions: `updateSawMeta(patch)` for colorFamily/color,
     `updateSawDimension(dim, patch)` for activity/budgetHours,
     `addSawBlock(dim, day, startHour, durationHours)`,
     `updateSawBlock(dim, idx, patch)`, `removeSawBlock(dim, idx)`
   - Role/goal actions: `addRole`, `updateRole`, `deleteRole`, `reorderRoles`,
     `addGoal`, `updateGoal`, `deleteGoal`, `reorderGoals`
   - Block actions for goals: `addBlock(goalId, day, startHour, durationHours)`,
     `updateBlock(goalId, idx, patch)`, `removeBlock(goalId, idx)`
   - Getters: `totalBudgetHours` (sum of all saw dims + all goals),
     `plannedHours(goalId)`, `sawPlannedHours(dim)`,
     `totalPlannedHours`, `totalBudgetedHours`
7. Write `NavBar.vue`: three step-tab buttons + current week label; active tab highlighted
8. `App.vue`: shows `<DefineMode />`, `<BudgetMode />`, or `<PlanMode />` based on `store.mode`
9. `vite.config.js`: `base: './'` for file-system compatibility

**Relevant Context**
- CSS tokens to mirror: `habit-tracker/index.html` lines 10–21
- No TypeScript — plain `.js` and `.vue` files only

**Status:** `[x] done`

---

### Sub-Task 2 — Define Mode

**Intent**
Build Define Mode. It opens with `SharpenSawDefine` at the very top, where the user
describes their Physical, Mental, Spiritual, and Social/Emotional renewal activities and
picks a color for the Sharpen the Saw section (defaults to `self` / lavender). Below that,
the user defines roles (with color family / swatch selection) and their Big Rock goals.

**Expected Outcomes**
- `DefineMode.vue` renders `<SharpenSawDefine />` **first**, above the roles list
- Sharpen the Saw section has a color picker (family + swatch) that defaults to `self` / lavender;
  the user can change it to any family and swatch
- Each of the 4 dimensions has a labeled textarea for its activity description
- Section header and accents use the currently selected Sharpen the Saw color
- Below a divider: draggable list of `<RoleCard>` components
- Each role has a family + swatch color picker (same UI as Sharpen the Saw)
- Goals within each role have a text input and an `expectedOutput` textarea
- All edits auto-save; "Next →" navigates to Budget mode

**Todo List**
1. Write `SharpenSawDefine.vue`:
   - Section header "🌱 Sharpen the Saw" accented with the current saw color
   - Color family picker (3 pill buttons: Work / Life / Self) + swatch circles from the chosen
     family (4 swatches for `work` and `life`; 6 swatches for `self`),
     bound to `store.plan.sharpenTheSaw.colorFamily` and `.color`; calls `store.updateSawMeta()`
   - Four labeled `<textarea>` inputs for Physical, Mental, Spiritual, Social/Emotional
     bound to `store.plan.sharpenTheSaw.dimensions.<dim>.activity`; auto-saves on `@input`
2. Write `RoleCard.vue`:
   - Role name `<input>`, color family picker (Work / Life / Self pill buttons),
     swatch picker (4 circles for `work`/`life`, 6 circles for `self`); delete button; drag handle
   - `vuedraggable` list of `GoalCard` children
3. Write `GoalCard.vue`:
   - Goal text `<input>`, expected output `<textarea>` (placeholder: "What does done look like?"),
     delete button, drag handle icon
4. Write `DefineMode.vue`:
   - `<SharpenSawDefine />` at the top
   - Divider, then `<draggable>` list of `<RoleCard>` (outer drag for role reorder)
   - "Add Role" button (default family = `work`, color = `--theme-work-1`)
   - "Next →" footer → `store.setMode('budget')`
5. Add store actions from Sub-Task 1 list if not yet implemented
6. Validate with inline non-blocking warnings: role with 0 goals, goal with empty text

**Relevant Context**
- `vuedraggable` v4 for Vue 3: `<draggable v-model="list" item-key="id">`
- The color picker is shared between `SharpenSawDefine` and `RoleCard` — extract it as
  `ColorPicker.vue`; it accepts a `family` prop and renders the correct number of swatches
  (4 for `work`/`life`, 6 for `self`)
- `crypto.randomUUID()` for id generation

**Status:** `[x] done`

---

### Sub-Task 3 — Budget Mode

**Intent**
Build Budget Mode with Sharpen the Saw **first and budgeted**. The mode has three sections:
(1) Sharpen the Saw time budgets, (2) confirm/edit expected outcomes per goal, (3) set
time budgets per goal. The weekly cap is **17 h/day × 7 = 119 h** (7am–midnight), shared
across Sharpen the Saw and all role goals.

**Expected Outcomes**
- `BudgetMode.vue` opens with `<SharpenSawBudget />` at the top
- Sharpen the Saw section: 4 rows (Physical, Mental, Spiritual, Social/Emotional) each
  showing the activity text (read-only + "Edit →" link back to Define), a `budgetHours`
  number input, and is accented with the current saw color
- A Sharpen the Saw subtotal row appears below the 4 rows
- Section 2 "Confirm Your Outcomes": per-goal rows with editable `expectedOutput` textarea
  and a ✓ confirm toggle (UI-only, resets each visit)
- Section 3 "Set Time Budgets": per-goal table with role color swatch, goal text, outcome
  snippet (60 chars, full text in tooltip), `budgetHours` input, `% of 119h` column,
  per-role subtotals
- Grand-total footer progress bar spans Sharpen the Saw + all goal budgets vs 119h; turns
  red (`--danger`) when exceeded
- "← Back" and "Next →" navigation buttons

**Todo List**
1. Write `SharpenSawBudget.vue`:
   - Section header "🌱 Sharpen the Saw" accented with `store.plan.sharpenTheSaw.color`
   - Four rows; each: dimension label (icon), activity text (read-only),
     `<input type="number" min="0" step="0.5">` bound to `store.plan.sharpenTheSaw.dimensions.<dim>.budgetHours`;
     auto-saves on `@input`
   - Subtotal row below the 4 rows
   - "Edit activities →" link → `store.setMode('define')`
2. Write `BudgetMode.vue` with three `<section>` blocks:
   - Block 1: `<SharpenSawBudget />`
   - Block 2 "Confirm Your Outcomes": iterate roles → goals; editable `expectedOutput`
     textarea + ✓ toggle (local `confirmedIds = ref(new Set())`, not persisted)
   - Block 3 "Set Time Budgets": `.budget-table` CSS Grid —
     columns `[color swatch][goal text][outcome snippet][hours input][% of 119h]`
     with per-role subtotal rows; role-header rows have `border-left: 4px solid <roleColor>`
3. `<input type="number" min="0" max="119" step="0.5">` for goal budgets; calls
   `store.updateGoal(...)` + `store.save()` on `@input`
4. Grand-total footer: sums all saw dim budgets + all goal budgets; progress bar
   width = `min(total / 119, 1) * 100%`; green → yellow → red color transition
5. "← Back" (→ define) and "Next →" (→ plan) buttons

**Relevant Context**
- Budget cap: 17 h/day × 7 days = 119 h/week
- `totalBudgetHours` store getter already includes saw dims + goals (Sub-Task 1)
- Saw color comes from `store.plan.sharpenTheSaw.color` (user-selected in Define mode)

**Status:** `[x] done`

---

### Sub-Task 4 — Plan Mode: Time Grid

**Intent**
Build the calendar grid: 7 columns (Sun–Sat) × 17 rows (7am–midnight). Both Sharpen the
Saw dimension items and role goals are draggable onto the grid. Each block is colored with
its source's chosen color (saw color or role color).

**Expected Outcomes**
- `TimeGrid.vue` renders 7 day columns (Sun, Mon, Tue, Wed, Thu, Fri, Sat) × 17 rows (7am–11pm)
- Hour axis labels: 7am, 8am, … 11pm (last slot covers 11pm–midnight)
- Week starts Sunday (leftmost column)
- Each cell is a drop target; dropping creates a `TimeBlock` at that slot
- Saw blocks use the saw's currently selected color; goal blocks use the role's color
- Blocks show item label and duration; can be resized, moved, and deleted
- Today's column has a subtle accent background

**Todo List**
1. Write `TimeGrid.vue`:
   - CSS Grid: `grid-template-columns: 60px repeat(7, 1fr)`
   - 17 hour rows (7–23); columns Sun=0 … Sat=6
   - Sticky day headers (day name + date)
   - `@dragover.prevent` + `@drop` per cell → `useDragDrop.handleDrop(day, hour, event)`
   - Iterate all goal blocks and saw dimension blocks from store; render `<TimeBlock>` for each
2. Write `TimeBlock.vue`:
   - `top = (startHour - 7) * --slot-height`; `height = durationHours * --slot-height`
   - Background = source color (saw color for `blockType === 'saw'`; role color otherwise),
     85% opacity, white text
   - Resize handle (bottom strip, `cursor: s-resize`); ✕ delete button; draggable for move
3. Write `src/composables/useDragDrop.js`:
   - Drag payload on `dataTransfer`: `{ type: 'goal' | 'saw', id, dim? }`
   - `handleDrop(day, hour, event)`: dispatches to `store.addBlock` or `store.addSawBlock`
     based on payload type; if payload contains `existingBlockIndex` it's a move (remove + add)
   - `startResize(payload, event)`: `pointermove` updates `durationHours` in 0.5h snaps;
     `pointerup` saves

**Relevant Context**
- `--slot-height: 48px` → 17 slots × 48px = 816px total; grid scrolls vertically
- `top = (startHour - 7) * 48`, `height = durationHours * 48`
- Sunday = column 0 (leftmost), consistent with `Date.getDay() === 0`
- Resize and move use pointer events (`pointerdown`/`pointermove`/`pointerup`) for touch compat

**Status:** `[x] done`

---

### Sub-Task 5 — Plan Mode: Side Panel

**Intent**
Build the side panel. Sharpen the Saw dimension items appear **first** at the top as
draggable cards (accented with the saw color), followed by role goal cards grouped by role.
Each card shows budget, planned, and remaining hours. The footer shows the grand total.

**Expected Outcomes**
- `PlanMode.vue` is a two-column layout: `<aside>` (~280px) + `<main>` (grid)
- Top of `<aside>`: `<SharpenSawPanel />` — 4 draggable cards, one per dimension,
  accented with the saw's chosen color
- Each saw card shows: dimension name, activity text, `budgetHours`, `sawPlannedHours(dim)`,
  remaining hours; cards with 0 remaining are dimmed (but still draggable)
- Below the saw section: role goal cards grouped by role, color-coded per role
- Each card draggable; `dragstart` sets `dataTransfer` payload
- `<aside>` footer: total planned / total budgeted across everything (saw + goals)
- Narrow screens (< 768px): side panel hidden behind a hamburger toggle

**Todo List**
1. Write `SharpenSawPanel.vue`:
   - Section header accented with `store.plan.sharpenTheSaw.color`
   - Four draggable cards; `dragstart` payload: `{ type: 'saw', dim: 'physical' }` etc.
   - Card content: dimension label, activity text (truncated), budgeted / planned / remaining
   - 0-remaining cards dimmed to opacity 0.45 but remain draggable for adding more blocks
2. Write `PlanMode.vue`:
   - `<aside>`: `<SharpenSawPanel />` at top, then role sections with `<GoalCard showBudget />`
   - `<main>`: `<TimeGrid />`
   - Footer in `<aside>`: `{totalPlanned}h / {totalBudgeted}h`; green / yellow / red
   - Hamburger toggle on narrow screens
3. Extend `GoalCard.vue` with `showBudget` prop:
   - When true: show `budgetHours`, `plannedHours(goalId)`, remaining; add `draggable="true"`;
     `dragstart` sets payload `{ type: 'goal', goalId }`
4. Ensure store getters `totalPlannedHours` and `totalBudgetedHours` include saw dims + goals

**Relevant Context**
- Saw panel color = `store.plan.sharpenTheSaw.color` (user-selected, not fixed)
- `sawPlannedHours(dim)` = sum of `store.plan.sharpenTheSaw.dimensions[dim].blocks[*].durationHours`
- Drag payload matches what `useDragDrop.handleDrop` expects from Sub-Task 4

**Status:** `[x] done`

---

### Sub-Task 6 — Polish, Mobile Layout & Export

**Intent**
Finalize visual consistency, mobile responsiveness, and a print/PDF export. The printed
output shows Sharpen the Saw first (in its chosen color), then roles/goals, then the grid.

**Expected Outcomes**
- Visual language matches `habit-tracker` (same fonts, CSS tokens, radii, card style)
- Mobile (≤ 768px): Plan mode stacks side panel above grid; grid scrollable both axes
- `@media print`: hides nav + side panel; prints Sharpen the Saw summary → role/goal/outcome
  table → full-width grid
- "Print / Export PDF" button calls `window.print()`
- Empty states in each mode
- `weekly-plan/app/README.md` documents setup, usage, and data reset

**Todo List**
1. `@media (max-width: 768px)` in `main.css`:
   - `PlanMode` columns stack vertically; side panel above grid
   - `--slot-height: 40px`; grid scrollable both axes
   - NavBar wraps or collapses to icon-only
2. `@media print`:
   - Hide `<NavBar>`, `<aside>`, all buttons
   - Print Sharpen the Saw summary (in its chosen color) → role/goal/outcome table → grid
3. "Print / Export PDF" `<button>` in `PlanMode.vue` → `window.print()`
4. Empty states:
   - Define: "Start by planning your renewal activities above, then add your first role"
   - Budget: "No goals yet — go to Define mode first"
   - Plan: "Nothing budgeted yet — go to Budget mode first"
5. Write `weekly-plan/app/README.md`: Node ≥ 18, `npm install`, `npm run dev`,
   `npm run build`, how localStorage keys work, how to reset a week
6. Final smoke-test checklist:
   - All 4 Sharpen the Saw dimensions can be defined, budgeted, and placed on the grid
   - Saw blocks use the user-selected saw color (changeable in Define mode)
   - Role goal blocks use the role's user-selected color
   - New week auto-imports previous week's data (text + colors preserved, blocks/budgets cleared)
   - Define → Budget → Plan flow end-to-end
   - Drag from side panel → drop on grid → block appears at correct slot and color
   - Resize block → duration and side-panel remaining hours both update
   - Print preview: Sharpen the Saw section appears first in the saw's chosen color

**Relevant Context**
- `window.print()` + browser "Save as PDF" is sufficient for export
- `@media print`: `body { background: white }`, hide all interactive chrome

**Status:** `[x] done`

---

## Implementation Order

Sub-tasks must be completed in order — each depends on the foundation of the previous:

1. **Scaffold** → 2. **Define** → 3. **Budget** → 4. **Grid** → 5. **Side Panel** → 6. **Polish**

After the user approves this plan, switch to Agent mode and implement one sub-task at a time,
updating the Status line above after each sub-task completes.
