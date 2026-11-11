<script setup>
import { computed } from 'vue'
import { useWeekStore } from '../store/useWeekStore.js'
import { getWeekDates } from '../composables/useWeekKey.js'
import { useDragDrop } from '../composables/useDragDrop.js'
import TimeBlock from './TimeBlock.vue'

const store = useWeekStore()
const { handleDrop } = useDragDrop()

function onDrop(day, hour, event) {
  if (store.isReadOnly) return
  handleDrop(day, hour, event)
}

// ── Week dates ────────────────────────────────────────────────────────────────
const weekDates = computed(() => getWeekDates(store.weekKey))

// ── Day headers ───────────────────────────────────────────────────────────────
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const today = new Date()
today.setHours(0, 0, 0, 0)

function isToday(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime() === today.getTime()
}

function formatDayDate(date) {
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
}

// ── Hour rows: 7am–11pm (hours 7–23) ─────────────────────────────────────────
const HOURS = Array.from({ length: 17 }, (_, i) => i + 7) // [7, 8, ..., 23]

function hourLabel(h) {
  if (h === 0) return '12am'
  if (h < 12) return `${h}am`
  if (h === 12) return '12pm'
  return `${h - 12}pm`
}

// ── Blocks ────────────────────────────────────────────────────────────────────

/**
 * Returns all blocks visible on the grid as a flat array of descriptor objects.
 */
const allBlocks = computed(() => {
  const blocks = []
  const { sharpenTheSaw, roles } = store.plan
  const sawColor = sharpenTheSaw.color

  // Saw dimension blocks
  const DIM_LABELS = {
    physical: 'Physical',
    mental: 'Mental',
    spiritual: 'Spiritual',
    social: 'Social',
  }
  for (const [dim, dimData] of Object.entries(sharpenTheSaw.dimensions)) {
    dimData.blocks.forEach((block, idx) => {
      blocks.push({
        key: `saw-${dim}-${idx}`,
        blockType: 'saw',
        dim,
        goalId: null,
        blockIndex: idx,
        day: block.day,
        startHour: block.startHour,
        durationHours: block.durationHours,
        color: sawColor,
        label: `🌱 ${DIM_LABELS[dim] ?? dim}${dimData.activity ? ': ' + dimData.activity : ''}`,
      })
    })
  }

  // Goal blocks
  for (const role of roles) {
    for (const goal of role.goals) {
      goal.blocks.forEach((block, idx) => {
        blocks.push({
          key: `goal-${goal.id}-${idx}`,
          blockType: 'goal',
          dim: null,
          goalId: goal.id,
          blockIndex: idx,
          day: block.day,
          startHour: block.startHour,
          durationHours: block.durationHours,
          color: role.color,
          label: goal.text || '(no title)',
        })
      })
    }
  }

  return blocks
})

/**
 * Returns blocks for a specific day column.
 */
function blocksForDay(dayIndex) {
  return allBlocks.value.filter((b) => b.day === dayIndex)
}
</script>

<template>
  <div class="time-grid-wrapper">
    <div class="time-grid">
      <!-- ── Corner cell ──────────────────────────────────────────────────── -->
      <div class="grid-corner sticky-header"></div>

      <!-- ── Day header cells ─────────────────────────────────────────────── -->
      <div
        v-for="(date, dayIndex) in weekDates"
        :key="dayIndex"
        class="day-header sticky-header"
        :class="{ 'today-header': isToday(date) }"
      >
        <span class="day-name">{{ DAY_NAMES[dayIndex] }}</span>
        <span class="day-date">{{ formatDayDate(date) }}</span>
      </div>

      <!-- ── Hour rows ─────────────────────────────────────────────────────── -->
      <template v-for="hour in HOURS" :key="hour">
        <!-- Hour label -->
        <div class="hour-label">{{ hourLabel(hour) }}</div>

        <!-- Day cells for this hour row -->
        <div
          v-for="dayIndex in 7"
          :key="dayIndex - 1"
          class="day-cell"
          :class="{ 'today-column': isToday(weekDates[dayIndex - 1]) }"
          @dragover.prevent
          @drop="onDrop(dayIndex - 1, hour, $event)"
        >
          <!-- Blocks are absolutely positioned inside the first row's column container -->
          <!-- We use a separate blocks layer rendered once per column (after the grid) -->
        </div>
      </template>
    </div>

    <!-- ── Block overlay columns (absolutely positioned inside scrollable area) ── -->
    <!-- We position blocks by overlaying them on top of the grid using the same column layout -->
    <div class="blocks-overlay">
      <!-- Spacer for the 60px hour-axis column -->
      <div class="overlay-axis"></div>

      <!-- One overlay column per day -->
      <div
        v-for="(date, dayIndex) in weekDates"
        :key="dayIndex"
        class="overlay-column"
      >
        <TimeBlock
          v-for="block in blocksForDay(dayIndex)"
          :key="block.key"
          :blockType="block.blockType"
          :goalId="block.goalId"
          :dim="block.dim"
          :blockIndex="block.blockIndex"
          :startHour="block.startHour"
          :durationHours="block.durationHours"
          :color="block.color"
          :label="block.label"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Wrapper: clips overflow and allows vertical scroll ────────────────────── */
.time-grid-wrapper {
  position: relative;
  overflow-y: auto;
  overflow-x: auto;
  /* header row height + 17 slots */
  max-height: calc(48px + 816px);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

/* ── Main CSS grid ────────────────────────────────────────────────────────── */
.time-grid {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  /* 1 header row + 17 hour rows */
  grid-template-rows: 48px repeat(17, 48px);
  min-width: 560px;
}

/* ── Sticky header row ────────────────────────────────────────────────────── */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--surface);
  border-bottom: 2px solid var(--border);
}

.grid-corner {
  border-right: 1px solid var(--border);
}

.day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  border-right: 1px solid var(--border);
  padding: 4px 2px;
}

.day-header:last-child {
  border-right: none;
}

.today-header {
  background: color-mix(in srgb, var(--accent) 10%, var(--surface));
  color: var(--accent);
}

.day-name {
  font-weight: 700;
  font-size: 13px;
}

.day-date {
  font-size: 11px;
  color: var(--muted);
}

.today-header .day-date {
  color: var(--accent);
}

/* ── Hour label cells ─────────────────────────────────────────────────────── */
.hour-label {
  font-size: 11px;
  color: var(--muted);
  text-align: right;
  padding: 4px 8px 0 0;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  box-sizing: border-box;
}

/* ── Day cells (drop targets) ─────────────────────────────────────────────── */
.day-cell {
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  box-sizing: border-box;
  transition: background 0.1s;
}

.day-cell:last-child {
  border-right: none;
}

.day-cell.today-column {
  background: color-mix(in srgb, var(--accent) 5%, transparent);
}

.day-cell:hover {
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}

/* ── Blocks overlay ───────────────────────────────────────────────────────── */
.blocks-overlay {
  position: absolute;
  top: 48px; /* below the sticky header */
  left: 0;
  right: 0;
  /* 17 rows × 48px */
  height: 816px;
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  pointer-events: none; /* let clicks pass through to drop cells */
  min-width: 560px;
}

.overlay-axis {
  /* empty spacer matching the hour-label column */
}

.overlay-column {
  position: relative;
  pointer-events: all; /* re-enable so TimeBlocks are interactive */
}
</style>
