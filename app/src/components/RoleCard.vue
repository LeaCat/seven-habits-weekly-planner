<script setup>
/**
 * RoleCard — one role with its draggable GoalCard list.
 *
 * Props:
 *   role  Object  { id, name, colorFamily, color, goals[] }
 */
import { computed } from 'vue'
import draggable from 'vuedraggable'
import { useWeekStore } from '../store/useWeekStore.js'
import ColorPicker from './ColorPicker.vue'
import GoalCard from './GoalCard.vue'

const props = defineProps({
  role: { type: Object, required: true },
})

const store = useWeekStore()

// Proxy goals list for vuedraggable v-model
const goals = computed({
  get: () => props.role.goals,
  set: (newGoals) => store.reorderGoals(props.role.id, newGoals),
})

// Warn if no goals
const hasNoGoals = computed(() => props.role.goals.length === 0)

function onNameInput(e) {
  store.updateRole(props.role.id, { name: e.target.value })
}

function onFamilyUpdate(newFamily) {
  store.updateRole(props.role.id, { colorFamily: newFamily })
}

function onColorUpdate(newColor) {
  store.updateRole(props.role.id, { color: newColor })
}

function addGoal() {
  store.addGoal(props.role.id)
}

function remove() {
  store.deleteRole(props.role.id)
}
</script>

<template>
  <div
    class="role-card card"
    :style="{ borderTopColor: role.color }"
  >
    <!-- Card header row -->
    <div class="role-header">
      <span class="drag-handle" title="Drag to reorder">⠿</span>

      <input
        class="input role-name"
        type="text"
        placeholder="Role name…"
        :value="role.name"
        @input="onNameInput"
        :style="{ color: role.color }"
      />

      <button class="btn-icon btn-delete" type="button" title="Delete role" @click="remove">✕</button>
    </div>

    <!-- Color picker -->
    <div class="role-color-picker">
      <ColorPicker
        :family="role.colorFamily"
        :modelValue="role.color"
        @update:family="onFamilyUpdate"
        @update:modelValue="onColorUpdate"
      />
    </div>

    <!-- Goals list -->
    <div class="goals-section">
      <div class="goals-label">
        <span>Big Rock Goals</span>
        <button class="btn-add-goal" type="button" @click="addGoal">+ Add Goal</button>
      </div>

      <!-- Warning: 0 goals -->
      <p v-if="hasNoGoals" class="inline-warn">⚠ Add at least one goal for this role</p>

      <draggable
        v-model="goals"
        item-key="id"
        handle=".drag-handle"
        ghost-class="ghost"
        animation="180"
      >
        <template #item="{ element }">
          <GoalCard
            :goal="element"
            :roleId="role.id"
            :roleColor="role.color"
          />
        </template>
      </draggable>
    </div>
  </div>
</template>

<style scoped>
.role-card {
  border-top: 4px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-top-color 0.2s;
}

.role-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drag-handle {
  color: var(--muted);
  cursor: grab;
  font-size: 18px;
  flex-shrink: 0;
  user-select: none;
}
.drag-handle:active { cursor: grabbing; }

.role-name {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  border-color: transparent;
  background: transparent;
  padding: 4px 6px;
  transition: border-color 0.15s, background 0.15s;
}
.role-name:focus {
  background: var(--surface);
  border-color: var(--accent);
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

.role-color-picker {
  padding: 4px 0 4px 26px;
}

.goals-section { display: flex; flex-direction: column; gap: 6px; }

.goals-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-add-goal {
  background: none;
  border: 1px dashed var(--border);
  color: var(--accent);
  font: inherit;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s;
}
.btn-add-goal:hover { background: #eff6ff; }

.inline-warn {
  font-size: 12px;
  color: var(--danger);
  margin: 0;
}

/* vuedraggable ghost */
.ghost { opacity: 0.35; }
</style>
