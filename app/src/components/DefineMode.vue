<script setup>
/**
 * DefineMode — Step 1.
 *
 * Layout:
 *   1. <SharpenSawDefine /> (top)
 *   2. Divider
 *   3. Draggable list of <RoleCard> components
 *   4. "Add Role" button
 *   5. Footer "Next →" → store.setMode('budget')
 */
import { computed } from 'vue'
import draggable from 'vuedraggable'
import { useWeekStore } from '../store/useWeekStore.js'
import SharpenSawDefine from './SharpenSawDefine.vue'
import RoleCard from './RoleCard.vue'

const store = useWeekStore()

// Proxy for vuedraggable — reorders roles on drag
const roles = computed({
  get: () => store.plan.roles,
  set: (newRoles) => store.reorderRoles(newRoles),
})

function addRole() {
  store.addRole({ colorFamily: 'work', color: '#1e3a5f' })
}

/** Show empty-state hint when no roles AND all saw dimensions are empty */
const sawIsEmpty = computed(() => {
  const dims = store.plan.sharpenTheSaw.dimensions
  return Object.values(dims).every(d => !d.activity || d.activity.trim() === '')
})

const showEmptyState = computed(() => roles.value.length === 0 && sawIsEmpty.value)
</script>

<template>
  <div class="define-mode">
    <!-- Sharpen the Saw at the top -->
    <SharpenSawDefine />

    <!-- Divider -->
    <div class="section-divider">
      <span>Roles &amp; Big Rock Goals</span>
    </div>

    <!-- Roles list -->
    <draggable
      v-model="roles"
      item-key="id"
      handle=".drag-handle"
      ghost-class="ghost"
      animation="200"
      class="roles-list"
      :disabled="store.isReadOnly"
    >
      <template #item="{ element }">
        <RoleCard :role="element" />
      </template>
    </draggable>

    <!-- Empty state -->
    <div v-if="showEmptyState" class="empty-state">
      <p>Start by planning your renewal activities above, then add your first role.</p>
    </div>

    <!-- Add Role -->
    <button v-if="!store.isReadOnly" class="btn-add-role" type="button" @click="addRole">+ Add Role</button>

    <!-- Footer -->
    <footer class="define-footer">
      <button class="btn-next" type="button" @click="store.setMode('budget')">Next →</button>
    </footer>
  </div>
</template>

<style scoped>
.define-mode {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Section divider ──────────────────────────────────────── */
.section-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* ── Roles list ───────────────────────────────────────────── */
.roles-list { display: flex; flex-direction: column; gap: 16px; }

/* vuedraggable ghost */
.ghost { opacity: 0.35; }

/* ── Empty state ──────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 24px 0 8px;
  font-size: 13px;
  color: var(--muted);
}

/* ── Add Role button ──────────────────────────────────────── */
.btn-add-role {
  align-self: flex-start;
  background: none;
  border: 1.5px dashed var(--border);
  color: var(--accent);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}
.btn-add-role:hover { background: #eff6ff; border-color: var(--accent); }

/* ── Footer ───────────────────────────────────────────────── */
.define-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.btn-next {
  padding: 9px 22px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.12s;
}
.btn-next:hover { opacity: 0.88; }
</style>
