import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { MatchInfo } from '../core/types/MatchInfo'

export const useMatchInfoStore = defineStore('matches', () => {
  const matchInfos = ref<MatchInfo[]>([])
  function massUpdate(newMatches: MatchInfo[]) {
    matchInfos.value = newMatches
  }

  const getAllTeamNames = computed(() => {
    const allTeams = matchInfos.value.flatMap((m) => [m.away, m.home])
    const allUniqueTeams = new Set(allTeams)
    return Array.from(allUniqueTeams)
  })

  return { matchInfos, massUpdate, getAllTeamNames }
})
