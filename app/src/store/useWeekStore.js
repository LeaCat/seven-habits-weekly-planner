import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  currentWeekKey,
  prevWeekKey,
  getWeekDates,
} from '../composables/useWeekKey.js'

// ── Default Sharpen-the-Saw structure ───────────────────────────────────────
function defaultSharpenTheSaw() {
  return {
    colorFamily: 'self',
    color: '#7c4dff',
    dimensions: {
      physical:  { activity: '', budgetHours: 0, blocks: [] },
      mental:    { activity: '', budgetHours: 0, blocks: [] },
      spiritual: { activity: '', budgetHours: 0, blocks: [] },
      social:    { activity: '', budgetHours: 0, blocks: [] },
    },
  }
}

// ── Default full-week plan ───────────────────────────────────────────────────
function defaultPlan(weekKey) {
  return {
    weekKey,
    sharpenTheSaw: defaultSharpenTheSaw(),
    roles: [],
  }
}

// ── localStorage key ─────────────────────────────────────────────────────────
function storageKey(weekKey) {
  return `weekly_planner_${weekKey}`
}

// ── Deep-copy a plan and reset blocks / budgets (for new-week carry-forward) ─
function carryForward(oldPlan, newWeekKey) {
  const plan = JSON.parse(JSON.stringify(oldPlan))
  plan.weekKey = newWeekKey

  // Reset saw dimension blocks and budgets
  for (const dim of Object.values(plan.sharpenTheSaw.dimensions)) {
    dim.blocks = []
    dim.budgetHours = 0
  }

  // Reset goal blocks and budgets; preserve text and colors
  for (const role of plan.roles) {
    for (const goal of role.goals) {
      goal.blocks = []
      goal.budgetHours = 0
    }
  }

  return plan
}

// ── Find a goal by id across all roles ──────────────────────────────────────
function findGoal(roles, goalId) {
  for (const role of roles) {
    const goal = role.goals.find((g) => g.id === goalId)
    if (goal) return goal
  }
  return null
}

// ── Store definition ─────────────────────────────────────────────────────────
export const useWeekStore = defineStore('week', () => {
  const weekKey = ref(currentWeekKey())
  const mode = ref('define')
  const plan = ref(defaultPlan(weekKey.value))

  // ── Persistence ────────────────────────────────────────────────────────────

  function save() {
    localStorage.setItem(storageKey(weekKey.value), JSON.stringify(plan.value))
  }

  /**
   * Load data for `newWeekKey`. If no data exists for it, carry forward from
   * the previous week (text + colors preserved; blocks + budgets reset).
   */
  function loadWeek(newWeekKey) {
    weekKey.value = newWeekKey
    const raw = localStorage.getItem(storageKey(newWeekKey))
    if (raw) {
      plan.value = JSON.parse(raw)
    } else {
      const prevKey = prevWeekKey(newWeekKey)
      const prevRaw = localStorage.getItem(storageKey(prevKey))
      if (prevRaw) {
        plan.value = carryForward(JSON.parse(prevRaw), newWeekKey)
      } else {
        plan.value = defaultPlan(newWeekKey)
      }
    }
  }

  // ── Mode ────────────────────────────────────────────────────────────────────

  function setMode(newMode) {
    mode.value = newMode
  }

  // ── Sharpen the Saw actions ─────────────────────────────────────────────────

  /** Update colorFamily and/or color on the saw meta */
  function updateSawMeta(patch) {
    Object.assign(plan.value.sharpenTheSaw, patch)
    save()
  }

  /** Update activity and/or budgetHours for one dimension */
  function updateSawDimension(dim, patch) {
    Object.assign(plan.value.sharpenTheSaw.dimensions[dim], patch)
    save()
  }

  function addSawBlock(dim, day, startHour, durationHours) {
    plan.value.sharpenTheSaw.dimensions[dim].blocks.push({
      day,
      startHour,
      durationHours,
    })
    save()
  }

  function updateSawBlock(dim, idx, patch) {
    Object.assign(plan.value.sharpenTheSaw.dimensions[dim].blocks[idx], patch)
    save()
  }

  function removeSawBlock(dim, idx) {
    plan.value.sharpenTheSaw.dimensions[dim].blocks.splice(idx, 1)
    save()
  }

  // ── Role actions ────────────────────────────────────────────────────────────

  function addRole(patch = {}) {
    const role = {
      id: crypto.randomUUID(),
      name: '',
      colorFamily: 'work',
      color: '#1e3a5f',
      goals: [],
      ...patch,
    }
    plan.value.roles.push(role)
    save()
    return role
  }

  function updateRole(roleId, patch) {
    const role = plan.value.roles.find((r) => r.id === roleId)
    if (role) {
      Object.assign(role, patch)
      save()
    }
  }

  function deleteRole(roleId) {
    const idx = plan.value.roles.findIndex((r) => r.id === roleId)
    if (idx !== -1) {
      plan.value.roles.splice(idx, 1)
      save()
    }
  }

  /** Replace the roles array order (e.g. after drag-and-drop) */
  function reorderRoles(newRoles) {
    plan.value.roles = newRoles
    save()
  }

  // ── Goal actions ────────────────────────────────────────────────────────────

  function addGoal(roleId, patch = {}) {
    const role = plan.value.roles.find((r) => r.id === roleId)
    if (!role) return
    const goal = {
      id: crypto.randomUUID(),
      text: '',
      expectedOutput: '',
      budgetHours: 0,
      blocks: [],
      ...patch,
    }
    role.goals.push(goal)
    save()
    return goal
  }

  function updateGoal(goalId, patch) {
    const goal = findGoal(plan.value.roles, goalId)
    if (goal) {
      Object.assign(goal, patch)
      save()
    }
  }

  function deleteGoal(roleId, goalId) {
    const role = plan.value.roles.find((r) => r.id === roleId)
    if (!role) return
    const idx = role.goals.findIndex((g) => g.id === goalId)
    if (idx !== -1) {
      role.goals.splice(idx, 1)
      save()
    }
  }

  /** Replace a role's goals array (e.g. after drag-and-drop reorder) */
  function reorderGoals(roleId, newGoals) {
    const role = plan.value.roles.find((r) => r.id === roleId)
    if (role) {
      role.goals = newGoals
      save()
    }
  }

  // ── Block actions for goals ─────────────────────────────────────────────────

  function addBlock(goalId, day, startHour, durationHours) {
    const goal = findGoal(plan.value.roles, goalId)
    if (goal) {
      goal.blocks.push({ day, startHour, durationHours })
      save()
    }
  }

  function updateBlock(goalId, idx, patch) {
    const goal = findGoal(plan.value.roles, goalId)
    if (goal && goal.blocks[idx]) {
      Object.assign(goal.blocks[idx], patch)
      save()
    }
  }

  function removeBlock(goalId, idx) {
    const goal = findGoal(plan.value.roles, goalId)
    if (goal) {
      goal.blocks.splice(idx, 1)
      save()
    }
  }

  // ── Getters ─────────────────────────────────────────────────────────────────

  /** Sum of all budgetHours across saw dimensions + all goals */
  const totalBudgetHours = computed(() => {
    let total = 0
    const dims = plan.value.sharpenTheSaw.dimensions
    for (const dim of Object.values(dims)) {
      total += dim.budgetHours || 0
    }
    for (const role of plan.value.roles) {
      for (const goal of role.goals) {
        total += goal.budgetHours || 0
      }
    }
    return total
  })

  /** Total planned hours across saw dimensions + all goals */
  const totalPlannedHours = computed(() => {
    let total = 0
    const dims = plan.value.sharpenTheSaw.dimensions
    for (const dim of Object.values(dims)) {
      for (const b of dim.blocks) {
        total += b.durationHours || 0
      }
    }
    for (const role of plan.value.roles) {
      for (const goal of role.goals) {
        for (const b of goal.blocks) {
          total += b.durationHours || 0
        }
      }
    }
    return total
  })

  /** Alias for totalBudgetHours (used in PlanMode footer) */
  const totalBudgetedHours = totalBudgetHours

  /** Planned hours for a specific goal (sum of its blocks) */
  function plannedHours(goalId) {
    const goal = findGoal(plan.value.roles, goalId)
    if (!goal) return 0
    return goal.blocks.reduce((s, b) => s + (b.durationHours || 0), 0)
  }

  /** Planned hours for a specific Sharpen the Saw dimension */
  function sawPlannedHours(dim) {
    const dimension = plan.value.sharpenTheSaw.dimensions[dim]
    if (!dimension) return 0
    return dimension.blocks.reduce((s, b) => s + (b.durationHours || 0), 0)
  }

  // ── Initial load ─────────────────────────────────────────────────────────────
  loadWeek(weekKey.value)

  return {
    // state
    weekKey,
    mode,
    plan,
    // persistence
    save,
    loadWeek,
    // mode
    setMode,
    // saw actions
    updateSawMeta,
    updateSawDimension,
    addSawBlock,
    updateSawBlock,
    removeSawBlock,
    // role actions
    addRole,
    updateRole,
    deleteRole,
    reorderRoles,
    // goal actions
    addGoal,
    updateGoal,
    deleteGoal,
    reorderGoals,
    // block actions
    addBlock,
    updateBlock,
    removeBlock,
    // getters
    totalBudgetHours,
    totalPlannedHours,
    totalBudgetedHours,
    plannedHours,
    sawPlannedHours,
  }
})
