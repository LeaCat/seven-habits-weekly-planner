<script setup>
import { computed } from 'vue'
import { useWeekStore } from '../store/useWeekStore.js'
import { currentWeekKey, weekLabel } from '../composables/useWeekKey.js'

const store = useWeekStore()

const thisWeekKey = currentWeekKey()
const thisWeekLabel = weekLabel(thisWeekKey)

const pastWeeks = computed(() => {
  const keys = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('weekly_planner_') && k !== `weekly_planner_${thisWeekKey}`) {
      keys.push(k.replace('weekly_planner_', ''))
    }
  }
  // Sort descending (newest first) — week keys are lexicographically sortable
  keys.sort((a, b) => (a > b ? -1 : a < b ? 1 : 0))
  return keys.map((k) => ({ key: k, label: weekLabel(k) }))
})

function startThisWeek() {
  store.loadWeek(thisWeekKey)
  store.setMode('define')
}

function viewPastWeek(key) {
  store.loadWeek(key, true)
  store.setMode('define')
}
</script>

<template>
  <div class="home-screen">
    <div class="home-hero card">
      <h1 class="home-title">Weekly Planner</h1>
      <p class="home-tagline">Plan with purpose. Live by design.</p>
      <button class="btn btn-primary home-cta" @click="startThisWeek">
        Start / Continue This Week
        <span class="home-cta-week">{{ thisWeekLabel }}</span>
      </button>
    </div>

    <section class="home-past">
      <h2 class="section-title">Past Weeks</h2>

      <p v-if="pastWeeks.length === 0" class="home-empty">
        No past weeks saved yet.
      </p>

      <ul v-else class="home-past-list">
        <li
          v-for="week in pastWeeks"
          :key="week.key"
          class="card home-past-row"
        >
          <span class="home-past-label">{{ week.label }}</span>
          <button class="btn btn-secondary home-past-btn" @click="viewPastWeek(week.key)">
            View
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.home-screen {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.home-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 24px;
  text-align: center;
}

.home-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--text);
}

.home-tagline {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 8px;
}

.home-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 28px;
  font-size: 15px;
}

.home-cta-week {
  font-size: 12px;
  font-weight: 400;
  opacity: 0.85;
}

.home-past-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.home-past-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.home-past-label {
  font-size: 14px;
  color: var(--text);
}

.home-past-btn {
  flex-shrink: 0;
}

.home-empty {
  font-size: 14px;
  color: var(--muted);
  padding: 12px 0;
}
</style>
