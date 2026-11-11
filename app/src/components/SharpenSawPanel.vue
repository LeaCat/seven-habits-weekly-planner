<script setup>
/**
 * SharpenSawPanel — compact draggable cards for the Plan-mode side panel.
 *
 * Four dimension cards (Physical, Mental, Spiritual, Social/Emotional), each
 * draggable onto the TimeGrid. Each card shows the activity (truncated),
 * budgeted hours, planned hours, and remaining hours.
 * Cards with 0 remaining are dimmed to opacity 0.45 but remain draggable.
 */
import { computed } from 'vue'
import { useWeekStore } from '../store/useWeekStore.js'
import { useDragDrop } from '../composables/useDragDrop.js'

const store = useWeekStore()
const { startDrag } = useDragDrop()

const DIMS = [
  { key: 'physical',  label: 'Physical',        icon: '🏃' },
  { key: 'mental',    label: 'Mental',           icon: '📚' },
  { key: 'spiritual', label: 'Spiritual',        icon: '🧘' },
  { key: 'social',    label: 'Social/Emotional', icon: '❤️' },
]

const sawColor = computed(() => store.plan.sharpenTheSaw.color)

function dimData(key) {
  const dim = store.plan.sharpenTheSaw.dimensions[key]
  const planned = store.sawPlannedHours(key)
  const remaining = (dim.budgetHours || 0) - planned
  return {
    activity: dim.activity || '',
    budgetHours: dim.budgetHours || 0,
    planned,
    remaining,
  }
}

function onDragStart(event, key) {
  startDrag(event, { type: 'saw', dim: key })
}
</script>

<template>
  <section class="saw-panel">
    <!-- Section header accented with the saw color -->
    <h3
      class="saw-panel__header"
      :style="{ borderLeftColor: sawColor, color: sawColor }"
    >
      🌱 Sharpen the Saw
    </h3>

    <div class="saw-panel__cards">
      <div
        v-for="dim in DIMS"
        :key="dim.key"
        class="saw-card"
        draggable="true"
        :class="{ 'saw-card--full': dimData(dim.key).remaining <= 0 }"
        :style="{ '--saw-accent': sawColor }"
        @dragstart="onDragStart($event, dim.key)"
      >
        <div class="saw-card__label">
          <span class="saw-card__icon">{{ dim.icon }}</span>
          <span class="saw-card__name">{{ dim.label }}</span>
        </div>
        <p class="saw-card__activity">{{ dimData(dim.key).activity || '(no activity set)' }}</p>
        <div class="saw-card__hours">
          <span class="saw-card__hours-item">
            <span class="saw-card__hours-label">Budget</span>
            <span class="saw-card__hours-val">{{ dimData(dim.key).budgetHours }}h</span>
          </span>
          <span class="saw-card__hours-item">
            <span class="saw-card__hours-label">Planned</span>
            <span class="saw-card__hours-val">{{ dimData(dim.key).planned }}h</span>
          </span>
          <span class="saw-card__hours-item" :class="{ 'hours--over': dimData(dim.key).remaining < 0 }">
            <span class="saw-card__hours-label">Left</span>
            <span class="saw-card__hours-val">{{ dimData(dim.key).remaining }}h</span>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.saw-panel__header {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-left: 3px solid;
  padding-left: 8px;
  margin: 0 0 10px;
}

.saw-panel__cards { display: flex; flex-direction: column; gap: 8px; }

.saw-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--saw-accent, #7c4dff);
  border-radius: var(--radius);
  padding: 8px 10px;
  cursor: grab;
  transition: opacity 0.15s;
}
.saw-card:active { cursor: grabbing; }
.saw-card--full { opacity: 0.45; }

.saw-card__label {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
}
.saw-card__icon { font-size: 14px; }
.saw-card__name { font-size: 13px; font-weight: 600; color: var(--text); }

.saw-card__activity {
  font-size: 11px;
  color: var(--muted);
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.saw-card__hours {
  display: flex;
  gap: 10px;
}
.saw-card__hours-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.saw-card__hours-label { font-size: 10px; color: var(--muted); }
.saw-card__hours-val   { font-size: 12px; font-weight: 600; color: var(--text); }
.hours--over .saw-card__hours-val { color: var(--danger); }
</style>
