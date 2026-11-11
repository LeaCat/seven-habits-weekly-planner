<script setup>
/**
 * SharpenSawDefine — Sharpen the Saw section for Define mode.
 *
 * - Section header accented with the current saw color
 * - ColorPicker bound to sharpenTheSaw.colorFamily and .color
 * - Four labeled textareas for the dimensions: Physical, Mental, Spiritual, Social/Emotional
 */
import { computed } from 'vue'
import { useWeekStore } from '../store/useWeekStore.js'
import ColorPicker from './ColorPicker.vue'

const store = useWeekStore()

const saw = computed(() => store.plan.sharpenTheSaw)

const DIMENSIONS = [
  { key: 'physical',  icon: '🏃', label: 'Physical' },
  { key: 'mental',    icon: '📖', label: 'Mental' },
  { key: 'spiritual', icon: '🧘', label: 'Spiritual' },
  { key: 'social',    icon: '❤️', label: 'Social / Emotional' },
]

function onFamilyUpdate(newFamily) {
  store.updateSawMeta({ colorFamily: newFamily })
}

function onColorUpdate(newColor) {
  store.updateSawMeta({ color: newColor })
}

function onActivityInput(dimKey, e) {
  store.updateSawDimension(dimKey, { activity: e.target.value })
}
</script>

<template>
  <section class="saw-define card">
    <!-- Section header -->
    <div class="saw-header" :style="{ borderLeftColor: saw.color }">
      <h2 class="saw-title" :style="{ color: saw.color }">🌱 Sharpen the Saw</h2>
      <p class="saw-subtitle">Define your renewal activities for the week.</p>
    </div>

    <!-- Color picker -->
    <div v-if="!store.isReadOnly" class="saw-picker">
      <p class="label">Section color</p>
      <ColorPicker
        :family="saw.colorFamily"
        :modelValue="saw.color"
        @update:family="onFamilyUpdate"
        @update:modelValue="onColorUpdate"
      />
    </div>

    <!-- Dimension textareas -->
    <div class="dimensions-grid">
      <div
        v-for="dim in DIMENSIONS"
        :key="dim.key"
        class="dim-row"
      >
        <label class="dim-label">
          <span class="dim-icon">{{ dim.icon }}</span>
          {{ dim.label }}
        </label>
        <textarea
          class="input dim-textarea"
          rows="2"
          :placeholder="`${dim.label} renewal activity…`"
          :value="saw.dimensions[dim.key].activity"
          @input="onActivityInput(dim.key, $event)"
          :disabled="store.isReadOnly"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.saw-define { display: flex; flex-direction: column; gap: 16px; }

.saw-header {
  border-left: 4px solid var(--muted);
  padding-left: 12px;
  transition: border-left-color 0.2s;
}

.saw-title {
  font-size: 18px;
  font-weight: 700;
  transition: color 0.2s;
}

.saw-subtitle {
  font-size: 13px;
  color: var(--muted);
  margin-top: 2px;
}

.saw-picker { padding-left: 0; }

.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.dim-row { display: flex; flex-direction: column; gap: 4px; }

.dim-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.dim-icon { font-size: 15px; }

.dim-textarea {
  resize: vertical;
  min-height: 56px;
  font-size: 13px;
  line-height: 1.5;
}
</style>
