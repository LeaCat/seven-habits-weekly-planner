<script setup>
/**
 * ColorPicker — shared family + swatch picker used by SharpenSawDefine and RoleCard.
 *
 * Props:
 *   family      String  'work' | 'life' | 'self'
 *   modelValue  String  hex color, e.g. '#7c4dff'
 *
 * Emits:
 *   update:family      String  new family
 *   update:modelValue  String  new hex color
 */
const props = defineProps({
  family: { type: String, default: 'work' },
  modelValue: { type: String, default: '#1e3a5f' },
})
const emit = defineEmits(['update:family', 'update:modelValue'])

const SWATCHES = {
  work: ['#1e3a5f', '#1a6b8a', '#0d6e6e', '#1b5e20'],
  life: ['#e65100', '#e64a19', '#c2185b', '#ad1457'],
  self: ['#7c4dff', '#9c27b0', '#6a1b9a', '#8e24aa', '#268b07', '#beea41'],
}

/** Light swatches that need dark text instead of white */
const LIGHT_SWATCHES = new Set(['#beea41'])

function swatchTextColor(hex) {
  return LIGHT_SWATCHES.has(hex) ? '#1f2328' : '#fff'
}

const FAMILY_LABELS = { work: 'Work', life: 'Life', self: 'Self' }

function pickFamily(f) {
  const firstSwatch = SWATCHES[f][0]
  emit('update:family', f)
  emit('update:modelValue', firstSwatch)
}

function pickColor(hex) {
  emit('update:modelValue', hex)
}
</script>

<template>
  <div class="color-picker">
    <!-- Family pill buttons -->
    <div class="family-row">
      <button
        v-for="(label, key) in FAMILY_LABELS"
        :key="key"
        class="family-pill"
        :class="{ active: family === key }"
        :style="family === key ? { background: modelValue, borderColor: modelValue, color: swatchTextColor(modelValue) } : {}"
        type="button"
        @click="pickFamily(key)"
      >{{ label }}</button>
    </div>

    <!-- Swatch circles -->
    <div class="swatch-row">
      <button
        v-for="hex in SWATCHES[family]"
        :key="hex"
        class="swatch"
        :class="{ selected: modelValue === hex }"
        :style="{ background: hex }"
        :title="hex"
        type="button"
        @click="pickColor(hex)"
      >
        <span v-if="modelValue === hex" class="swatch-check" :style="{ color: swatchTextColor(hex) }">✓</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.color-picker { display: flex; flex-direction: column; gap: 8px; }

.family-row { display: flex; gap: 6px; flex-wrap: wrap; }

.family-pill {
  padding: 4px 12px;
  border-radius: 999px;
  border: 1.5px solid var(--border);
  background: transparent;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.family-pill.active { color: #fff; }
/* When new-leaf (#beea41) is active family color it needs dark text — handled via inline style */
.family-pill:not(.active):hover { border-color: var(--muted); }

.swatch-row { display: flex; gap: 8px; flex-wrap: wrap; }

.swatch {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s, border-color 0.12s;
}
.swatch:hover { transform: scale(1.15); }
.swatch.selected { border-color: var(--text); transform: scale(1.1); }

.swatch-check {
  font-size: 11px;
  /* color set via inline binding for light/dark contrast */
  font-weight: 700;
  line-height: 1;
}
</style>
