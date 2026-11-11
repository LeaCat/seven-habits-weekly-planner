<script setup>
/**
 * GoalCard — one goal entry inside a RoleCard (Define mode) or the Plan-mode side panel.
 *
 * Props:
 *   goal       Object  { id, text, expectedOutput, budgetHours, blocks }
 *   roleId     String  parent role id (needed for deleteGoal)
 *   roleColor  String  hex color inherited from parent role (for drag handle accent)
 *   showBudget Boolean when true: shows budget/planned/remaining and makes card draggable
 */
import { computed } from 'vue'
import { useWeekStore } from '../store/useWeekStore.js'
import { useDragDrop } from '../composables/useDragDrop.js'

const props = defineProps({
  goal: { type: Object, required: true },
  roleId: { type: String, required: true },
  roleColor: { type: String, default: '#1e3a5f' },
  showBudget: { type: Boolean, default: false },
})

const store = useWeekStore()
const { startDrag } = useDragDrop()

const planned = computed(() => store.plannedHours(props.goal.id))
const remaining = computed(() => (props.goal.budgetHours || 0) - planned.value)

function onTextInput(e) {
  store.updateGoal(props.goal.id, { text: e.target.value })
}

function onOutputInput(e) {
  store.updateGoal(props.goal.id, { expectedOutput: e.target.value })
}

function remove() {
  store.deleteGoal(props.roleId, props.goal.id)
}

function onDragStart(event) {
  startDrag(event, { type: 'goal', goalId: props.goal.id })
}
</script>

<template>
  <!-- ── Plan-mode compact card (showBudget=true) ─────────────────────── -->
  <div
    v-if="showBudget"
    class="goal-card goal-card--plan"
    draggable="true"
    :class="{ 'goal-card--full': remaining <= 0 }"
    :style="{ '--role-accent': roleColor }"
    @dragstart="onDragStart"
  >
    <div class="goal-card__text">{{ goal.text || '(no goal text)' }}</div>
    <div class="goal-card__hours">
      <span class="goal-card__hours-item">
        <span class="goal-card__hours-label">Budget</span>
        <span class="goal-card__hours-val">{{ goal.budgetHours || 0 }}h</span>
      </span>
      <span class="goal-card__hours-item">
        <span class="goal-card__hours-label">Planned</span>
        <span class="goal-card__hours-val">{{ planned }}h</span>
      </span>
      <span class="goal-card__hours-item" :class="{ 'hours--over': remaining < 0 }">
        <span class="goal-card__hours-label">Left</span>
        <span class="goal-card__hours-val">{{ remaining }}h</span>
      </span>
    </div>
  </div>

  <!-- ── Define-mode full card (showBudget=false, default) ───────────── -->
  <div v-else class="goal-card" :class="{ 'warn-empty': !goal.text.trim() }">
    <!-- Drag handle -->
    <span class="drag-handle" title="Drag to reorder">⠿</span>

    <div class="goal-body">
      <!-- Goal text -->
      <input
        class="input goal-text"
        type="text"
        placeholder="Goal (Big Rock)…"
        :value="goal.text"
        @input="onTextInput"
      />

      <!-- Expected output -->
      <textarea
        class="input goal-output"
        rows="2"
        placeholder="What does done look like?"
        :value="goal.expectedOutput"
        @input="onOutputInput"
      />

      <!-- Inline warning -->
      <p v-if="!goal.text.trim()" class="inline-warn">⚠ Goal text is empty</p>
    </div>

    <!-- Delete button -->
    <button class="btn-icon btn-delete" type="button" title="Delete goal" @click="remove">✕</button>
  </div>
</template>

<style scoped>
/* ── Define-mode card ──────────────────────────────────────────────────────── */
.goal-card {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 10px 10px 8px;
  transition: border-color 0.15s;
}
.goal-card.warn-empty { border-left: 3px solid var(--danger); }

.drag-handle {
  color: var(--muted);
  cursor: grab;
  font-size: 16px;
  padding-top: 6px;
  user-select: none;
  flex-shrink: 0;
}
.drag-handle:active { cursor: grabbing; }

.goal-body { flex: 1; display: flex; flex-direction: column; gap: 6px; }

.goal-text { font-size: 13px; }

.goal-output {
  font-size: 12px;
  resize: vertical;
  min-height: 48px;
  line-height: 1.5;
}

.inline-warn {
  font-size: 11px;
  color: var(--danger);
  margin: 0;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--muted);
  padding: 4px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  transition: color 0.12s, background 0.12s;
}
.btn-delete:hover { color: var(--danger); background: #fef2f2; }

/* ── Plan-mode compact card ────────────────────────────────────────────────── */
.goal-card--plan {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--role-accent, #1e3a5f);
  border-radius: var(--radius);
  padding: 8px 10px;
  cursor: grab;
  transition: opacity 0.15s;
}
.goal-card--plan:active { cursor: grabbing; }
.goal-card--full { opacity: 0.45; }

.goal-card__text {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goal-card__hours {
  display: flex;
  gap: 10px;
}
.goal-card__hours-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.goal-card__hours-label { font-size: 10px; color: var(--muted); }
.goal-card__hours-val   { font-size: 12px; font-weight: 600; color: var(--text); }
.hours--over .goal-card__hours-val { color: var(--danger); }
</style>
