<script setup>
import { computed } from 'vue'
import { useWeekStore } from '../store/useWeekStore.js'
import { useDragDrop } from '../composables/useDragDrop.js'

const props = defineProps({
  // For goal blocks
  goalId: { type: String, default: null },
  // For saw blocks
  dim: { type: String, default: null },
  blockIndex: { type: Number, required: true },
  blockType: { type: String, required: true }, // 'goal' | 'saw'
  startHour: { type: Number, required: true },
  durationHours: { type: Number, required: true },
  color: { type: String, required: true },
  label: { type: String, required: true },
})

const store = useWeekStore()
const { startDrag, startResize } = useDragDrop()

const SLOT_HEIGHT = 48

const style = computed(() => ({
  top: `${(props.startHour - 7) * SLOT_HEIGHT}px`,
  height: `${props.durationHours * SLOT_HEIGHT}px`,
  backgroundColor: hexWithOpacity(props.color, 0.85),
}))

function hexWithOpacity(hex, opacity) {
  // Convert #rrggbb to rgba(r,g,b,opacity)
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

const durationLabel = computed(() => {
  const h = props.durationHours
  return h === 1 ? '1h' : h % 1 === 0 ? `${h}h` : `${h}h`
})

function onDragStart(event) {
  const payload = {
    type: props.blockType,
    goalId: props.goalId,
    dim: props.dim,
    blockIndex: props.blockIndex,
    durationHours: props.durationHours,
    existingBlock: true,
  }
  startDrag(event, payload)
}

function deleteBlock() {
  if (props.blockType === 'goal') {
    store.removeBlock(props.goalId, props.blockIndex)
  } else {
    store.removeSawBlock(props.dim, props.blockIndex)
  }
}

function onResizeDown(event) {
  const payload = {
    type: props.blockType,
    goalId: props.goalId,
    dim: props.dim,
    blockIndex: props.blockIndex,
    startHour: props.startHour,
    durationHours: props.durationHours,
  }
  startResize(payload, event)
}
</script>

<template>
  <div
    class="time-block"
    :style="style"
    draggable="true"
    @dragstart="onDragStart"
  >
    <button class="delete-btn" @click.stop="deleteBlock" title="Remove block">✕</button>
    <div class="block-content">
      <span class="block-label">{{ label }}</span>
      <span class="block-duration">{{ durationLabel }}</span>
    </div>
    <div class="resize-handle" @pointerdown.stop="onResizeDown"></div>
  </div>
</template>

<style scoped>
.time-block {
  position: absolute;
  left: 3px;
  right: 3px;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  overflow: hidden;
  cursor: grab;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  z-index: 2;
  user-select: none;
}

.time-block:active {
  cursor: grabbing;
}

.delete-btn {
  position: absolute;
  top: 2px;
  right: 3px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 10px;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
  z-index: 3;
}

.delete-btn:hover {
  color: #fff;
}

.block-content {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 3px 18px 3px 5px; /* right pad leaves room for ✕ */
  min-height: 0;
}

.block-label {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.block-duration {
  opacity: 0.85;
  font-size: 11px;
}

.resize-handle {
  height: 6px;
  background: rgba(255, 255, 255, 0.35);
  cursor: s-resize;
  flex-shrink: 0;
}

.resize-handle:hover {
  background: rgba(255, 255, 255, 0.6);
}
</style>
