<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { RouterLink, RouterView } from 'vue-router'
import type { MatchInfo } from './core/types/MatchInfo';
import { useMatchInfoStore } from './stores/matches';

const matchInfoStore = useMatchInfoStore();
const { matchInfos } = storeToRefs(matchInfoStore);

const fetchData = async () => {
  await fetch('/scrape')
  const data = await fetch('/players/2022');
  const matchInfos = (await data.json()) as MatchInfo[];
  matchInfoStore.massUpdate(matchInfos);
}

onMounted(() => {
  fetchData();
})

</script>

<template>
  <header>
    <div class="wrapper">

      <nav>
        <RouterLink to="/">Hem</RouterLink>
        <RouterLink to="/team">Ditt lag</RouterLink>
        <RouterLink to="/last-round">Senaste rundan</RouterLink>
        <RouterLink to="/leaderboard">Topplistan</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }

  nav a {
    display: block;
    border-right: 1px solid var(--color-border);
  }
}
</style>
