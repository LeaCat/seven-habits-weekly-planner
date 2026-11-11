# Weekly Planner App

A Vue 3 + Vite single-page application for Covey-style weekly planning.
Plan your Sharpen the Saw renewal activities, define roles and Big Rock goals,
budget your time, and schedule everything on a 7-day × hourly grid.

---

## Prerequisites

- **Node.js ≥ 18** (LTS recommended)
- npm (comes with Node)

---

## Getting started

```bash
# Install dependencies
npm install

# Start the development server (hot-reload)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview the production build locally
npm run preview
```

The dev server runs at `http://localhost:5173` by default.

---

## The three modes

| Mode | Tab | Purpose |
|------|-----|---------|
| **Define** | `1 · Define` | Describe your Sharpen the Saw renewal activities (Physical, Mental, Spiritual, Social/Emotional), then add roles and their Big Rock goals |
| **Budget** | `2 · Budget` | Set time budgets for each Sharpen the Saw dimension and each goal; track against the 119 h/week cap (7 am–midnight × 7 days) |
| **Plan** | `3 · Plan` | Drag items from the side panel onto the 7-day × hourly calendar grid to schedule your week |

Work through the modes in order: **Define → Budget → Plan**.

---

## How localStorage persistence works

All data is saved to `localStorage` automatically whenever you make a change.
The storage key is based on the ISO week number:

```
weekly_planner_YYYY-Www
```

Examples:
- `weekly_planner_2026-W46` — week of Nov 9–15, 2026
- `weekly_planner_2026-W01` — first week of 2026

When you open the app on a **new week**, it automatically imports the previous
week's roles, goals, and activity text as a starting point — with all time
blocks and hour budgets reset to zero so you start fresh.

---

## How to reset a week

To clear all data for the current week and start over:

1. Open your browser's **DevTools** (F12 or Cmd+Opt+I)
2. Go to **Application** → **Storage** → **Local Storage** → your origin
3. Find the key for the current week (e.g. `weekly_planner_2026-W46`)
4. Click it and press **Delete** (or right-click → Delete)
5. Refresh the page — the app starts with a blank plan

---

## Print / Export PDF

In **Plan mode**, click the **🖨 Print** button in the header bar.
Your browser's print dialog will open. Select **"Save as PDF"** to export
a PDF that includes:

1. Sharpen the Saw summary (in its chosen color)
2. Roles, goals, and expected outcomes table
3. The weekly time grid

---

## Project structure

```
src/
  assets/main.css          # Global CSS variables and design tokens
  store/useWeekStore.js    # Pinia store — single source of truth
  composables/
    useWeekKey.js          # ISO week key helpers
    useDragDrop.js         # Grid drag/drop/resize logic
  components/
    NavBar.vue             # Top navigation bar
    DefineMode.vue         # Step 1 — define roles and goals
    BudgetMode.vue         # Step 2 — set time budgets
    PlanMode.vue           # Step 3 — side panel + calendar grid
    SharpenSawDefine.vue   # Sharpen the Saw section for Define mode
    SharpenSawBudget.vue   # Sharpen the Saw section for Budget mode
    SharpenSawPanel.vue    # Draggable cards for Plan mode side panel
    RoleCard.vue           # One role with its goals (Define mode)
    GoalCard.vue           # One goal card
    ColorPicker.vue        # Shared family + swatch color picker
    TimeGrid.vue           # 7-day × hourly calendar grid
    TimeBlock.vue          # A placed block on the grid
```
