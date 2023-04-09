
<script setup lang="ts">
import StandardHeader from '../components/StandardHeader.vue';
</script>

<template>
  <div class="team">
    <StandardHeader text="Ditt lag" />
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .team {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
