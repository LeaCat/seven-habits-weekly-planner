<script setup>
import { useWeekStore } from '../store/useWeekStore.js'
import { weekLabel } from '../composables/useWeekKey.js'

const store = useWeekStore()

const tabs = [
  { key: 'define', label: '1 · Define' },
  { key: 'budget', label: '2 · Budget' },
  { key: 'plan',   label: '3 · Plan'   },
]
</script>

<template>
  <nav class="navbar">
    <span class="week-label">{{ weekLabel(store.weekKey) }}</span>
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: store.mode === tab.key }"
        @click="store.setMode(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 20px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.week-label {
  font-size: 13px;
  color: var(--muted);
  white-space: nowrap;
}

.tabs {
  display: flex;
  gap: 4px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 4px;
}

.tab-btn {
  padding: 7px 16px;
  border: none;
  background: transparent;
  border-radius: calc(var(--radius) - 2px);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.tab-btn:hover {
  background: var(--border);
  color: var(--text);
}

.tab-btn.active {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 1px 3px rgba(59,130,212,0.25);
}

@media (max-width: 768px) {
  .navbar {
    flex-wrap: wrap;
    padding: 8px 12px;
    gap: 8px;
  }
  .week-label {
    order: -1;
    width: 100%;
    font-size: 12px;
  }
  .tabs {
    flex-wrap: wrap;
    width: 100%;
    justify-content: center;
  }
  .tab-btn {
    padding: 6px 12px;
    font-size: 12px;
    flex: 1;
    text-align: center;
    min-width: 0;
  }
}
</style>
