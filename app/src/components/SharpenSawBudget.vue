<script setup>
import { computed } from 'vue'
import { useWeekStore } from '../store/useWeekStore.js'

const store = useWeekStore()

const DIMENSIONS = [
  { key: 'physical',  label: '🏃 Physical' },
  { key: 'mental',    label: '📚 Mental' },
  { key: 'spiritual', label: '🧘 Spiritual' },
  { key: 'social',    label: '🤝 Social / Emotional' },
]

const sawColor = computed(() => store.plan.sharpenTheSaw.color)

const subtotal = computed(() => {
  const dims = store.plan.sharpenTheSaw.dimensions
  return Object.values(dims).reduce((s, d) => s + (Number(d.budgetHours) || 0), 0)
})

function onBudgetInput(dim, event) {
  const val = Math.max(0, Number(event.target.value) || 0)
  store.updateSawDimension(dim, { budgetHours: val })
}
</script>

<template>
  <section class="saw-budget">
    <div class="saw-header" :style="{ borderLeftColor: sawColor }">
      <span class="saw-title">🌱 Sharpen the Saw</span>
      <button v-if="!store.isReadOnly" class="edit-link" @click="store.setMode('define')">Edit activities →</button>
    </div>

    <div class="saw-rows">
      <div
        v-for="dim in DIMENSIONS"
        :key="dim.key"
        class="saw-row"
      >
        <span class="dim-label">{{ dim.label }}</span>
        <span class="dim-activity">
          {{ store.plan.sharpenTheSaw.dimensions[dim.key].activity || '—' }}
        </span>
        <input
          class="hours-input"
          type="number"
          min="0"
          step="0.5"
          :value="store.plan.sharpenTheSaw.dimensions[dim.key].budgetHours"
          @input="onBudgetInput(dim.key, $event)"
          :disabled="store.isReadOnly"
        />
        <span class="dim-unit">h</span>
      </div>

      <div class="saw-subtotal">
        <span class="subtotal-label">Subtotal</span>
        <span class="subtotal-value">{{ subtotal.toFixed(1) }}h</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.saw-budget {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 24px;
}

.saw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-left: 4px solid var(--accent);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.saw-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.edit-link {
  background: none;
  border: none;
  font: inherit;
  font-size: 13px;
  color: var(--accent);
  cursor: pointer;
  padding: 0;
}
.edit-link:hover {
  text-decoration: underline;
}

.saw-rows {
  padding: 8px 0;
}

.saw-row {
  display: grid;
  grid-template-columns: 160px 1fr 80px 20px;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}
.saw-row:hover {
  background: rgba(0, 0, 0, 0.02);
}

.dim-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.dim-activity {
  font-size: 13px;
  color: var(--muted);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.hours-input {
  width: 72px;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font: inherit;
  font-size: 13px;
  text-align: right;
  background: var(--bg);
  color: var(--text);
}

.dim-unit {
  font-size: 12px;
  color: var(--muted);
}

.saw-subtotal {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
}

.subtotal-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
}

.subtotal-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  min-width: 52px;
  text-align: right;
}
</style>
