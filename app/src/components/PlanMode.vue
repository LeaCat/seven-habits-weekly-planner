<script setup>
/**
 * PlanMode — two-column layout.
 *
 * <aside> (~280px, scrollable):
 *   - <SharpenSawPanel /> at the top
 *   - Role sections, each with <GoalCard showBudget /> for every goal
 *   - Footer: totalPlannedHours / totalBudgetedHours (color-coded)
 *   - Hamburger toggle on narrow screens (< 768px)
 *
 * <main>: <TimeGrid />
 */
import { ref, computed } from 'vue'
import { useWeekStore } from '../store/useWeekStore.js'
import SharpenSawPanel from './SharpenSawPanel.vue'
import GoalCard from './GoalCard.vue'
import TimeGrid from './TimeGrid.vue'

const store = useWeekStore()

/** Show/hide side panel (narrow screens) */
const sidebarOpen = ref(true)

/** Footer color: green ≥ budget, yellow within 20% short, red > 20% short */
const footerClass = computed(() => {
  const planned = store.totalPlannedHours
  const budgeted = store.totalBudgetedHours
  if (budgeted === 0) return 'footer--neutral'
  const ratio = planned / budgeted
  if (ratio >= 1) return 'footer--green'
  if (ratio >= 0.8) return 'footer--yellow'
  return 'footer--red'
})

/** Sharpen the Saw dimension labels for print summary */
const SAW_DIMS = [
  { key: 'physical',  label: 'Physical',        icon: '🏃' },
  { key: 'mental',    label: 'Mental',           icon: '📖' },
  { key: 'spiritual', label: 'Spiritual',        icon: '🧘' },
  { key: 'social',    label: 'Social/Emotional', icon: '❤️' },
]
</script>

<template>
  <div class="plan-mode">

    <!-- ── Print-only summary (hidden on screen, visible on print) ───────────── -->
    <div class="print-only print-summary" style="display:none">
      <!-- Sharpen the Saw section -->
      <div
        class="print-saw"
        :style="{ borderColor: store.plan.sharpenTheSaw.color, color: store.plan.sharpenTheSaw.color }"
      >
        <h2 class="print-saw__title">🌱 Sharpen the Saw</h2>
        <table class="print-table">
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Activity</th>
              <th>Budget (h)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dim in SAW_DIMS" :key="dim.key">
              <td>{{ dim.icon }} {{ dim.label }}</td>
              <td>{{ store.plan.sharpenTheSaw.dimensions[dim.key].activity || '—' }}</td>
              <td>{{ store.plan.sharpenTheSaw.dimensions[dim.key].budgetHours || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Roles / goals / outcomes table -->
      <div class="print-roles">
        <h2 class="print-section-title">Roles, Goals &amp; Outcomes</h2>
        <table class="print-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Goal</th>
              <th>Expected Outcome</th>
              <th>Budget (h)</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="role in store.plan.roles" :key="role.id">
              <tr v-for="(goal, gi) in role.goals" :key="goal.id">
                <td :style="{ fontWeight: gi === 0 ? '700' : 'normal', color: role.color }">
                  {{ gi === 0 ? (role.name || '(unnamed)') : '' }}
                </td>
                <td>{{ goal.text || '—' }}</td>
                <td>{{ goal.expectedOutput || '—' }}</td>
                <td>{{ goal.budgetHours || 0 }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <h2 class="print-section-title" style="margin-top: 24px">Weekly Schedule</h2>
    </div>

    <!-- ── Top header bar ──────────────────────────────────────────────────── -->
    <div class="plan-header">
      <button class="btn-back" type="button" @click="store.setMode('budget')">← Back</button>
      <h2 class="plan-title">3 · Plan</h2>
      <!-- Print / Export PDF button -->
      <button class="btn-print" type="button" @click="window.print()">🖨 Print</button>
      <!-- Hamburger toggle (only visible on narrow screens via CSS) -->
      <button
        class="btn-hamburger"
        type="button"
        :aria-label="sidebarOpen ? 'Hide side panel' : 'Show side panel'"
        @click="sidebarOpen = !sidebarOpen"
      >
        <span class="hamburger-icon">☰</span>
      </button>
    </div>

    <!-- ── Body: aside + main ──────────────────────────────────────────────── -->
    <div class="plan-body">
      <!-- Side panel -->
      <aside
        class="plan-aside"
        :class="{ 'plan-aside--hidden': !sidebarOpen }"
      >
        <!-- Sharpen the Saw cards at the very top -->
        <SharpenSawPanel />

        <!-- Role sections -->
        <template v-for="role in store.plan.roles" :key="role.id">
          <div v-if="role.goals.length > 0" class="role-section">
            <h4
              class="role-section__header"
              :style="{ borderLeftColor: role.color, color: role.color }"
            >
              {{ role.name || '(unnamed role)' }}
            </h4>
            <div class="role-section__goals">
              <GoalCard
                v-for="goal in role.goals"
                :key="goal.id"
                :goal="goal"
                :role-id="role.id"
                :role-color="role.color"
                :show-budget="true"
              />
            </div>
          </div>
        </template>

        <!-- Footer -->
        <div class="plan-aside__footer" :class="footerClass">
          <span class="footer__label">Total</span>
          <span class="footer__values">
            {{ store.totalPlannedHours }}h planned /
            {{ store.totalBudgetedHours }}h budgeted
          </span>
        </div>
      </aside>

      <!-- Time grid -->
      <main class="plan-main">
        <!-- Empty state: nothing budgeted yet -->
        <div v-if="store.totalBudgetedHours === 0" class="plan-empty-state">
          <p>Nothing budgeted yet — go to Budget mode first.</p>
          <button class="btn-go-budget" type="button" @click="store.setMode('budget')">
            ← Go to Budget
          </button>
        </div>
        <TimeGrid v-else />
      </main>
    </div>
  </div>
</template>

<style scoped>
.plan-mode {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ── Header ───────────────────────────────────────────────────────────────── */
.plan-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.plan-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  flex: 1;
}

.btn-back {
  padding: 6px 14px;
  background: var(--border);
  color: var(--text);
  border: none;
  border-radius: var(--radius);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
}
.btn-back:hover {
  background: color-mix(in srgb, var(--border) 80%, var(--text) 20%);
}

/* Hamburger — hidden on wide screens, visible on narrow */
.btn-hamburger {
  display: none;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 4px 10px;
  cursor: pointer;
  font-size: 18px;
  color: var(--text);
  flex-shrink: 0;
}

/* ── Body ─────────────────────────────────────────────────────────────────── */
.plan-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ── Aside (side panel) ───────────────────────────────────────────────────── */
.plan-aside {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 12px;
  overflow-y: auto;
  border-right: 1px solid var(--border);
  background: var(--bg);
}

.plan-aside--hidden { display: none; }

/* ── Role section ─────────────────────────────────────────────────────────── */
.role-section { display: flex; flex-direction: column; gap: 6px; }

.role-section__header {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-left: 3px solid;
  padding-left: 8px;
  margin: 0;
}

.role-section__goals { display: flex; flex-direction: column; gap: 6px; }

/* ── Aside footer ─────────────────────────────────────────────────────────── */
.plan-aside__footer {
  margin-top: auto;
  padding: 10px 8px;
  border-top: 1px solid var(--border);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 12px;
}

.footer__label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.footer__values { font-weight: 700; }

/* Footer color states */
.footer--green  { background: #f0fdf4; color: #16a34a; }
.footer--yellow { background: #fefce8; color: #ca8a04; }
.footer--red    { background: #fef2f2; color: var(--danger); }
.footer--neutral { background: var(--surface); color: var(--muted); }

/* ── Main (grid) ──────────────────────────────────────────────────────────── */
.plan-main {
  flex: 1;
  overflow: auto;
}

/* ── Print button ─────────────────────────────────────────────────────────── */
.btn-print {
margin-left: auto;
padding: 6px 14px;
background: var(--surface);
color: var(--text);
border: 1px solid var(--border);
border-radius: var(--radius);
font: inherit;
font-size: 13px;
font-weight: 600;
cursor: pointer;
transition: background 0.12s;
}
.btn-print:hover { background: var(--bg); }

/* ── Empty state (no budget yet) ─────────────────────────────────────────── */
.plan-empty-state {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
gap: 16px;
height: 100%;
min-height: 300px;
color: var(--muted);
font-size: 14px;
text-align: center;
padding: 40px;
}

.btn-go-budget {
padding: 8px 18px;
background: var(--accent);
color: #fff;
border: none;
border-radius: var(--radius);
font: inherit;
font-size: 13px;
font-weight: 600;
cursor: pointer;
}
.btn-go-budget:hover { opacity: 0.88; }

/* ── Narrow screens (< 768px) ─────────────────────────────────────────────── */
@media (max-width: 768px) {
.btn-hamburger { display: block; }

.plan-body {
  flex-direction: column;
}

.plan-aside {
  width: 100%;
  max-height: 340px;
  border-right: none;
  border-bottom: 1px solid var(--border);
}
}

/* ── Print styles ─────────────────────────────────────────────────────────── */
@media print {
/* Show the print-only summary */
.print-only { display: block !important; }

/* Hide plan header buttons (print/hamburger/back already hidden globally) */
.plan-header { display: none !important; }

/* Side panel hidden on print */
.plan-aside { display: none !important; }

/* Grid takes full width */
.plan-body { display: block !important; }
.plan-main { overflow: visible !important; }

/* Print summary styles */
.print-saw {
  border: 2px solid;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  page-break-inside: avoid;
}
.print-saw__title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
}
.print-section-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #000;
}
.print-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-bottom: 20px;
}
.print-table th,
.print-table td {
  border: 1px solid #ccc;
  padding: 5px 8px;
  text-align: left;
}
.print-table th {
  background: #f0f0f0;
  font-weight: 700;
}
}
</style>
