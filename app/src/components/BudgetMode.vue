<script setup>
import { ref, computed } from 'vue'
import { useWeekStore } from '../store/useWeekStore.js'
import SharpenSawBudget from './SharpenSawBudget.vue'

const store = useWeekStore()

// ── Section 2: Confirm Your Outcomes ─────────────────────────────────────────
// Local-only confirmed set — not persisted, resets each visit
const confirmedIds = ref(new Set())

function toggleConfirm(goalId) {
  if (confirmedIds.value.has(goalId)) {
    confirmedIds.value.delete(goalId)
  } else {
    confirmedIds.value.add(goalId)
  }
  // trigger reactivity on Set mutation
  confirmedIds.value = new Set(confirmedIds.value)
}

function onOutputInput(goalId, event) {
  store.updateGoal(goalId, { expectedOutput: event.target.value })
}

// ── Section 3: Set Time Budgets ───────────────────────────────────────────────
const WEEKLY_CAP = 119

function onGoalBudgetInput(goalId, event) {
  const val = Math.min(WEEKLY_CAP, Math.max(0, Number(event.target.value) || 0))
  store.updateGoal(goalId, { budgetHours: val })
}

function outcomeSnippet(text) {
  if (!text) return '—'
  return text.length > 60 ? text.slice(0, 60) + '…' : text
}

function roleBudgetSubtotal(role) {
  return role.goals.reduce((s, g) => s + (Number(g.budgetHours) || 0), 0)
}

function pctOfCap(hours) {
  return ((Number(hours) / WEEKLY_CAP) * 100).toFixed(0)
}

// ── Grand total ───────────────────────────────────────────────────────────────
const total = computed(() => store.totalBudgetHours)

const barWidth = computed(() => `${Math.min(total.value / WEEKLY_CAP, 1) * 100}%`)

const barColor = computed(() => {
  if (total.value > WEEKLY_CAP) return 'var(--danger)'
  if (total.value > 80) return '#f59e0b'   // amber / yellow
  return 'var(--done)'                      // green
})

const hasRoles = computed(() => store.plan.roles.length > 0)
</script>

<template>
  <div class="budget-mode">

    <!-- ── Section 1: Sharpen the Saw budgets ─────────────────────────────── -->
    <SharpenSawBudget />

    <!-- ── Section 2: Confirm Your Outcomes ──────────────────────────────── -->
    <section class="outcomes-section">
      <h3 class="section-title">✅ Confirm Your Outcomes</h3>

      <div v-if="!hasRoles" class="empty-state">
        No goals yet — go to Define mode first.
      </div>

      <template v-else>
        <div
          v-for="role in store.plan.roles"
          :key="role.id"
          class="outcomes-role-group"
        >
          <div class="outcomes-role-header" :style="{ borderLeftColor: role.color }">
            <span class="role-swatch" :style="{ background: role.color }"></span>
            <span class="role-name">{{ role.name || '(unnamed role)' }}</span>
          </div>

          <div
            v-for="goal in role.goals"
            :key="goal.id"
            class="outcomes-goal-row"
            :class="{ confirmed: confirmedIds.has(goal.id) }"
          >
            <div class="goal-info">
              <span class="goal-text">{{ goal.text || '(no goal text)' }}</span>
              <textarea
                class="outcome-textarea"
                :value="goal.expectedOutput"
                placeholder="What does done look like?"
                rows="2"
                @input="onOutputInput(goal.id, $event)"
              ></textarea>
            </div>
            <button
              class="confirm-btn"
              :class="{ active: confirmedIds.has(goal.id) }"
              :title="confirmedIds.has(goal.id) ? 'Unconfirm' : 'Confirm outcome'"
              @click="toggleConfirm(goal.id)"
            >
              ✓
            </button>
          </div>
        </div>
      </template>
    </section>

    <!-- ── Section 3: Set Time Budgets ───────────────────────────────────── -->
    <section class="budget-section">
      <h3 class="section-title">⏱ Set Time Budgets</h3>

      <div v-if="!hasRoles" class="empty-state">
        No goals yet — go to Define mode first.
      </div>

      <template v-else>
        <div
          v-for="role in store.plan.roles"
          :key="role.id"
          class="budget-role-block"
        >
          <!-- Role subtotal header row -->
          <div class="budget-role-header" :style="{ borderLeftColor: role.color }">
            <span class="role-swatch" :style="{ background: role.color }"></span>
            <span class="role-name">{{ role.name || '(unnamed role)' }}</span>
            <span class="role-subtotal">{{ roleBudgetSubtotal(role).toFixed(1) }}h</span>
          </div>

          <!-- Budget table -->
          <div class="budget-table">
            <!-- Column headers -->
            <div class="bt-head bt-swatch"></div>
            <div class="bt-head">Goal</div>
            <div class="bt-head">Expected outcome</div>
            <div class="bt-head bt-right">Hours</div>
            <div class="bt-head bt-right">% of 119h</div>

            <!-- One row per goal -->
            <template v-for="goal in role.goals" :key="goal.id">
              <div class="bt-cell bt-swatch">
                <span class="role-swatch" :style="{ background: role.color }"></span>
              </div>
              <div class="bt-cell bt-goal">{{ goal.text || '(no goal text)' }}</div>
              <div class="bt-cell bt-outcome" :title="goal.expectedOutput || ''">
                {{ outcomeSnippet(goal.expectedOutput) }}
              </div>
              <div class="bt-cell bt-right">
                <input
                  class="hours-input"
                  type="number"
                  min="0"
                  :max="WEEKLY_CAP"
                  step="0.5"
                  :value="goal.budgetHours"
                  @input="onGoalBudgetInput(goal.id, $event)"
                />
                <span class="unit">h</span>
              </div>
              <div class="bt-cell bt-right bt-pct">
                {{ pctOfCap(goal.budgetHours) }}%
              </div>
            </template>
          </div>
        </div>
      </template>
    </section>

    <!-- ── Grand-total footer ─────────────────────────────────────────────── -->
    <footer class="grand-total">
      <div class="gt-label">
        <span class="gt-text">Total budgeted</span>
        <span class="gt-hours" :style="{ color: total > WEEKLY_CAP ? 'var(--danger)' : 'var(--text)' }">
          {{ total.toFixed(1) }}h / {{ WEEKLY_CAP }}h
        </span>
      </div>
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{ width: barWidth, background: barColor }"
        ></div>
      </div>
      <div v-if="total > WEEKLY_CAP" class="over-cap-warning">
        ⚠ Over the weekly cap by {{ (total - WEEKLY_CAP).toFixed(1) }}h
      </div>
    </footer>

    <!-- ── Navigation ─────────────────────────────────────────────────────── -->
    <div class="mode-nav">
      <button class="btn-back" @click="store.setMode('define')">← Back</button>
      <button class="btn-next" @click="store.setMode('plan')">Next →</button>
    </div>

  </div>
</template>

<style scoped>
.budget-mode {
  max-width: 800px;
  margin: 32px auto;
  padding: 0 20px 60px;
}

/* ── Shared section title ───────────────────────────────────────────────────── */
.section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 16px;
}

.empty-state {
  font-size: 13px;
  color: var(--muted);
  padding: 16px;
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  margin-bottom: 24px;
}

/* ── Role swatch chip ──────────────────────────────────────────────────────── */
.role-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.role-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

/* ── Section 2: Confirm Your Outcomes ─────────────────────────────────────── */
.outcomes-section {
  margin-bottom: 32px;
}

.outcomes-role-group {
  margin-bottom: 16px;
}

.outcomes-role-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-left: 4px solid transparent;
  background: var(--surface);
  border-radius: var(--radius) var(--radius) 0 0;
  border: 1px solid var(--border);
  border-left-width: 4px;
}

.outcomes-goal-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 12px 12px 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-top: none;
  transition: background 0.15s;
}
.outcomes-goal-row:last-child {
  border-radius: 0 0 var(--radius) var(--radius);
}
.outcomes-goal-row.confirmed {
  background: #f0fdf4;
}

.goal-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.goal-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.outcome-textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font: inherit;
  font-size: 13px;
  resize: vertical;
  background: var(--surface);
  color: var(--text);
  box-sizing: border-box;
}
.outcome-textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.confirm-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: var(--surface);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  color: var(--muted);
}
.confirm-btn.active {
  background: var(--done);
  border-color: var(--done);
  color: #fff;
}
.confirm-btn:hover:not(.active) {
  border-color: var(--done);
  color: var(--done);
}

/* ── Section 3: Set Time Budgets ───────────────────────────────────────────── */
.budget-section {
  margin-bottom: 32px;
}

.budget-role-block {
  margin-bottom: 20px;
}

.budget-role-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-left: 4px solid transparent;
  background: var(--surface);
  border: 1px solid var(--border);
  border-left-width: 4px;
  border-radius: var(--radius) var(--radius) 0 0;
}

.role-subtotal {
  margin-left: auto;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

/* CSS Grid budget table */
.budget-table {
  display: grid;
  grid-template-columns: 24px 1fr 1fr 110px 80px;
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 var(--radius) var(--radius);
  overflow: hidden;
}

.bt-head {
  padding: 6px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.bt-cell {
  padding: 8px 8px;
  font-size: 13px;
  color: var(--text);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  background: var(--bg);
}

.bt-swatch {
  justify-content: center;
}

.bt-goal {
  font-weight: 500;
}

.bt-outcome {
  color: var(--muted);
  font-style: italic;
  font-size: 12px;
}

.bt-right {
  justify-content: flex-end;
  text-align: right;
  gap: 4px;
}

.bt-pct {
  color: var(--muted);
  font-size: 12px;
}

.hours-input {
  width: 64px;
  padding: 4px 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font: inherit;
  font-size: 13px;
  text-align: right;
  background: var(--surface);
  color: var(--text);
}

.unit {
  font-size: 12px;
  color: var(--muted);
}

/* ── Grand-total footer ────────────────────────────────────────────────────── */
.grand-total {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 24px;
}

.gt-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.gt-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.gt-hours {
  font-size: 14px;
  font-weight: 700;
}

.progress-track {
  height: 10px;
  background: var(--border);
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.25s, background 0.25s;
}

.over-cap-warning {
  margin-top: 8px;
  font-size: 12px;
  color: var(--danger);
  font-weight: 600;
}

/* ── Navigation ───────────────────────────────────────────────────────────── */
.mode-nav {
  display: flex;
  justify-content: space-between;
}

.btn-back,
.btn-next {
  padding: 9px 20px;
  border: none;
  border-radius: var(--radius);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-back {
  background: var(--border);
  color: var(--text);
}

.btn-next {
  background: var(--accent);
  color: #fff;
}
.btn-back:hover { background: #d0d3d8; }
.btn-next:hover { filter: brightness(1.1); }
</style>
