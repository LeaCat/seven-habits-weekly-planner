<script setup>
import { useWeekStore } from './store/useWeekStore.js'
import NavBar from './components/NavBar.vue'
import DefineMode from './components/DefineMode.vue'
import BudgetMode from './components/BudgetMode.vue'
import PlanMode from './components/PlanMode.vue'

const store = useWeekStore()
</script>

<template>
  <div id="app">
    <NavBar />
    <main class="app-main">
      <DefineMode v-if="store.mode === 'define'" />
      <BudgetMode v-else-if="store.mode === 'budget'" />
      <PlanMode  v-else-if="store.mode === 'plan'" />
    </main>
  </div>
</template>

<style>
@import './assets/main.css';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
}
</style>
