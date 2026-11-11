# Weekly Planner — Handoff Memo

## Project summary

A Vue 3 + Vite personal weekly planning SPA built on the 7 Habits framework.
Three modes: Define (roles + goals + Sharpen the Saw), Budget (time allocation),
Plan (drag-and-drop 7-day calendar grid). Data persisted to `localStorage` keyed
by ISO week (`weekly_planner_YYYY-Www`). No backend.

---

## Repo layout

```
weekly-plan/
  README.md                     ← user-facing guide (what/how/install)
  weekly-planner-plan.md        ← full implementation plan (all sub-tasks marked done)
  seven-habits-of-highly-effective-people-weekly-schedule.pdf  ← reference PDF
  app/                          ← Vite + Vue 3 project root
    index.html
    package.json
    vite.config.js              ← base: './' (static-file compatible)
    README.md                   ← developer guide (install/build/localStorage)
    src/
      main.js                   ← registers Pinia, mounts App
      App.vue                   ← routes between DefineMode/BudgetMode/PlanMode
      assets/main.css           ← CSS reset + all design tokens + color palettes
      store/useWeekStore.js     ← Pinia store (all state, actions, getters)
      composables/
        useWeekKey.js           ← ISO week key helpers, Sunday-start week dates
        useDragDrop.js          ← drag/drop/resize logic for the calendar grid
      components/
        NavBar.vue
        ColorPicker.vue         ← shared family+swatch picker (4/6 swatches)
        DefineMode.vue
        SharpenSawDefine.vue
        RoleCard.vue
        GoalCard.vue            ← dual-mode: editable (Define) + draggable (Plan)
        BudgetMode.vue
        SharpenSawBudget.vue
        PlanMode.vue            ← two-column: aside (side panel) + main (grid)
        SharpenSawPanel.vue
        TimeGrid.vue            ← 7 col × 17 row (Sun-Sat, 7am-midnight)
        TimeBlock.vue           ← absolutely positioned, draggable, resizable
```

---

## Tech stack

| Tool | Version | Notes |
|------|---------|-------|
| Vue 3 | latest | Composition API, `<script setup>` |
| Vite | 8.x | `base: './'` set |
| Pinia | latest | single store at `useWeekStore.js` |
| vuedraggable@next | 4.x | used in Define mode for role/goal reorder only |
| Native HTML5 DnD | — | used for calendar grid drop targets |
| Pointer Events API | — | used for block resize |

No TypeScript. No backend. No router (mode switching is store state).

---

## Data model (localStorage)

Key: `weekly_planner_YYYY-Www`

```json
{
  "weekKey": "2026-W46",
  "sharpenTheSaw": {
    "colorFamily": "self",
    "color": "#7c4dff",
    "dimensions": {
      "physical":  { "activity": "", "budgetHours": 0, "blocks": [] },
      "mental":    { "activity": "", "budgetHours": 0, "blocks": [] },
      "spiritual": { "activity": "", "budgetHours": 0, "blocks": [] },
      "social":    { "activity": "", "budgetHours": 0, "blocks": [] }
    }
  },
  "roles": [{
    "id": "uuid",
    "name": "Researcher",
    "colorFamily": "work",
    "color": "#1a6b8a",
    "goals": [{
      "id": "uuid",
      "text": "Submit abstract",
      "expectedOutput": "PDF submitted by Friday",
      "budgetHours": 5,
      "blocks": [{ "day": 0, "startHour": 9, "durationHours": 2 }]
    }]
  }]
}
```

`day`: 0=Sun … 6=Sat. `startHour`: 7–23. Week starts Sunday.
New week: text/colors carry forward; `blocks` and `budgetHours` reset to 0.

---

## Color theme system

Three semantic families, each with named CSS variables in `main.css`:

| Family | Token prefix | Swatches |
|--------|-------------|---------|
| work | `--theme-work-1…4` | `#1e3a5f` `#1a6b8a` `#0d6e6e` `#1b5e20` |
| life | `--theme-life-1…4` | `#e65100` `#e64a19` `#c2185b` `#ad1457` |
| self | `--theme-self-1…6` | `#7c4dff` `#9c27b0` `#6a1b9a` `#8e24aa` `#268b07` `#beea41` |

`#beea41` (New Leaf) is light — `ColorPicker.vue` already applies dark text on it.
Sharpen the Saw defaults to `self`/lavender but the user can change it.

---

## Grid constants (`main.css`)

```css
--slot-height: 48px;   /* 40px on mobile */
--grid-start: 7;       /* 7am */
--grid-end: 24;        /* midnight */
/* 17 slots × 48px = 816px */
```

Block positioning: `top = (startHour - 7) * 48px`, `height = durationHours * 48px`.

---

## Key store getters

| Getter | Returns |
|--------|---------|
| `totalBudgetHours` | sum of all saw dim budgets + all goal budgets |
| `totalBudgetedHours` | alias of above (used in side panel footer) |
| `totalPlannedHours` | sum of all placed block durations (saw + goals) |
| `plannedHours(goalId)` | placed hours for one goal |
| `sawPlannedHours(dim)` | placed hours for one saw dimension |

Weekly cap: **119 h** (17 h/day × 7 days). Progress bar in BudgetMode.

---

## Known working state

- `npm run build` passes clean: 53 modules, 0 errors, 0 warnings
- All 6 sub-tasks in `weekly-planner-plan.md` are marked `[x] done`
- Print/PDF export works via `window.print()` in PlanMode

---

## Setup at new location

```bash
cd <new-location>/weekly-plan/app
npm install          # restores node_modules (not committed)
npm run dev          # http://localhost:5173
npm run build        # outputs dist/
```

Git init (if not already):
```bash
cd <new-location>/weekly-plan
git init
git add .
git commit -m "initial commit: weekly planner app"
git remote add origin <your-github-url>
git push -u origin main
```

For GitHub Pages deployment, set `base` in `vite.config.js` to your repo name:
```js
base: '/your-repo-name/'
```
Then push the `dist/` folder to the `gh-pages` branch, or use a GitHub Actions
workflow to build and deploy automatically.

---

## Open items / potential next improvements

- [ ] Week navigation (browse past weeks in Plan mode)
- [ ] Daily checklist / completion tracking per block
- [ ] Recurring roles/goals (carry forward more intelligently)
- [ ] Export to `.ics` calendar format
- [ ] Dark mode (CSS variables are already structured for it)
