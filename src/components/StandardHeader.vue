<template>
    <h2>{{ text }}</h2>
</template>
<script setup lang="ts">
type Props = {
    text: string;
}
defineProps<Props>();
</script>
<style>
    h2 {
        margin-top: 2rem;
        margin-bottom: 1rem;
    }
</style>