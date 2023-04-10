import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Player } from '../core/types/Player'

export const usePlayerStore = defineStore('players', () => {
  const matchInfos = ref<Player[]>([])
  function massUpdate(players: Player[]) {
    matchInfos.value = players
  }

  return { matchInfos, massUpdate }
})
