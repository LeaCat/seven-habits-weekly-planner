# Weekly Planner

A personal, browser-based weekly planning tool built on the **7 Habits** framework by
Stephen Covey. Plan your week in 20–30 minutes before it begins: define your renewal
activities and roles, set time budgets, and schedule everything on an interactive
7-day calendar grid.

---

## What it does

The planner guides you through a 4-step weekly planning process across three modes:

### 1 · Define
Set your week's priorities from the inside out.

- **Sharpen the Saw first** — before anything else, describe your renewal activities
  for the week across four dimensions:
  - 🏃 **Physical** — exercise, sleep, nutrition
  - 📚 **Mental** — reading, learning, creative work
  - 🧘 **Spiritual** — meditation, reflection, values
  - 🤝 **Social/Emotional** — family, friends, community
- **Roles** — list the distinct roles you play (e.g. Researcher, Manager, Partner, Self).
  Each role gets a color from one of three semantic families:
  - 🔵 **Work** — navy, ocean blue, dark teal, dark green
  - 🟠 **Life** — warm orange, coral, hot pink, rose
  - 🟣 **Self** — lavender, soft purple, dusty violet, mauve, grass green, new leaf
- **Big Rock goals** — for each role, add 1–3 high-impact goals that advance your
  long-range mission. For each goal, write the **expected outcome**: what does "done"
  look like by end of week?

Roles and goals can be reordered by dragging.

---

### 2 · Budget
Allocate your time before you schedule it.

- **Sharpen the Saw time budget** — assign hours to each renewal dimension first.
  Renewal is not optional; budget it before your work.
- **Confirm your outcomes** — review the expected outcome of each goal and check it
  off before budgeting time. This slows you down to think clearly about what success
  means before committing hours.
- **Set goal budgets** — assign hours to each goal. The progress bar tracks your total
  against the **119 h/week cap** (7 am–midnight × 7 days).

---

### 3 · Plan
Schedule your Big Rocks before everything else.

- The **side panel** lists all your Sharpen the Saw dimensions and role goals, each
  showing budgeted, planned, and remaining hours.
- **Drag cards** from the side panel onto the **7-day × 17-hour calendar grid**
  (Sun–Sat, 7 am–midnight, starting Sunday).
- **Resize blocks** by dragging the bottom edge to adjust duration (snaps to 0.5 h).
- **Move blocks** by dragging them to a new day/time slot.
- When a goal's remaining hours reach zero its card dims — a visual cue that it's
  fully scheduled.
- Click **🖨 Print** to export a PDF: Sharpen the Saw summary → roles/goals/outcomes
  table → calendar grid.

---

## How to install and run locally

### Prerequisites

- [Node.js](https://nodejs.org/) **≥ 18** (LTS recommended — includes npm)

### Steps

```bash
# 1. Navigate to the app folder
cd weekly-plan/app

# 2. Install dependencies (first time only)
npm install

# 3. Start the development server with hot-reload
npm run dev
```

Open your browser at **http://localhost:5173**.

### Build for production

```bash
npm run build      # outputs to weekly-plan/app/dist/
npm run preview    # serve the production build locally
```

The built `dist/` folder is a fully static site — open `dist/index.html` directly in
any browser, or host it on any static file server.

### Deploy to GitHub Pages

A repository administrator must enable GitHub Pages under **Settings → Pages** and
select **GitHub Actions** as the build and deployment source. Then rerun the failed
workflow or push to `main`. The workflow checks the Pages configuration before
building and deploys the resulting artifact to the `github-pages` environment.

---

## Your data

All data is saved **automatically** to your browser's `localStorage` as you type.
Nothing is sent to a server.

**Storage key format:** `weekly_planner_YYYY-Www`  
Example: `weekly_planner_2026-W46` = the week of Nov 9–15, 2026.

**New week behaviour:** when you open the app on a new week, it automatically copies
your roles, goals, activity descriptions, and colors from the previous week as a
starting point — with all time blocks and hour budgets reset to zero.

### Resetting a week

To wipe the current week and start fresh:

1. Open **DevTools** (F12 or Cmd+Opt+I on Mac)
2. Go to **Application → Storage → Local Storage → `localhost:5173`**
3. Find and delete the key for the current week (e.g. `weekly_planner_2026-W46`)
4. Refresh the page

---

## Tips for effective weekly planning

1. **Do this on Sunday evening or Monday morning** — give yourself 20–30 uninterrupted minutes.
2. **Budget Sharpen the Saw first.** If renewal is not on your calendar, it won't happen.
3. **Write the expected outcome before budgeting time.** The Budget mode asks you to confirm
   each outcome before you enter hours — don't skip this step.
4. **Schedule Big Rocks before reactive tasks.** Place your goals on the grid first; let
   meetings, emails, and minor tasks fill the remaining gaps.
5. **Use the color families** to visually distinguish work/life/self commitments at a glance.
   A healthy week should have a mix of all three colors on the grid.
