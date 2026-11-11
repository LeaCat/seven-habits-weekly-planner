/**
 * useDragDrop.js
 * Native HTML5 drag-and-drop + pointer-based resize for the Plan Mode time grid.
 */

import { useWeekStore } from '../store/useWeekStore.js'

const SLOT_HEIGHT = 48 // px per hour slot (mirrors --slot-height CSS var)
const MIN_DURATION = 0.5
const SNAP = 0.5

export function useDragDrop() {
  const store = useWeekStore()

  // ── Drag start ──────────────────────────────────────────────────────────────

  /**
   * Set the drag payload on the dataTransfer object.
   * Called from TimeBlock.vue's dragstart handler, or from the side-panel cards.
   * @param {DragEvent} event
   * @param {Object} payload  { type: 'goal'|'saw', goalId?, dim?, blockIndex?, existingBlock? }
   */
  function startDrag(event, payload) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify(payload))
  }

  // ── Drop ────────────────────────────────────────────────────────────────────

  /**
   * Handle a drop onto a grid cell.
   * @param {number} day       0 (Sun) – 6 (Sat)
   * @param {number} hour      7 – 23
   * @param {DragEvent} event
   */
  function handleDrop(day, hour, event) {
    event.preventDefault()
    let payload
    try {
      payload = JSON.parse(event.dataTransfer.getData('application/json'))
    } catch {
      return
    }
    if (!payload) return

    const { type, goalId, dim, blockIndex, existingBlock } = payload

    if (existingBlock) {
      // Move: remove old block, add at new position (preserve durationHours)
      const duration = payload.durationHours ?? 1

      if (type === 'goal') {
        store.removeBlock(goalId, blockIndex)
        store.addBlock(goalId, day, hour, duration)
      } else if (type === 'saw') {
        store.removeSawBlock(dim, blockIndex)
        store.addSawBlock(dim, day, hour, duration)
      }
    } else {
      // New placement — default 1h
      if (type === 'goal') {
        store.addBlock(goalId, day, hour, 1)
      } else if (type === 'saw') {
        store.addSawBlock(dim, day, hour, 1)
      }
    }
  }

  // ── Resize ──────────────────────────────────────────────────────────────────

  /**
   * Start a pointer-based resize.
   * @param {Object} payload   { type, goalId?, dim?, blockIndex, startHour, durationHours }
   * @param {PointerEvent} pointerdownEvent
   */
  function startResize(payload, pointerdownEvent) {
    pointerdownEvent.preventDefault()
    pointerdownEvent.stopPropagation()
    const startY = pointerdownEvent.clientY
    const origDuration = payload.durationHours

    function onMove(e) {
      const deltaY = e.clientY - startY
      const deltaHours = deltaY / SLOT_HEIGHT
      const raw = origDuration + deltaHours
      const snapped = Math.round(raw / SNAP) * SNAP
      const clamped = Math.max(MIN_DURATION, snapped)

      if (payload.type === 'goal') {
        store.updateBlock(payload.goalId, payload.blockIndex, { durationHours: clamped })
      } else if (payload.type === 'saw') {
        store.updateSawBlock(payload.dim, payload.blockIndex, { durationHours: clamped })
      }
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      store.save()
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return { startDrag, handleDrop, startResize }
}
