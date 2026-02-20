import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/connection'
import { Match } from '@/lib/db/models'
import { teamData } from '@/lib/scraper/team-data'

export async function GET() {
  try {
    await connectToDatabase()

    const teams = await Promise.all(
      teamData.map(async (team) => {
        const matches = await Match.find({ teamId: team.teamId })
          .sort({ date: -1 })
          .lean()

        const matchesPlayed = matches.length

        let playerAverage = 0
        let uniquePlayers = 0
        let trend: 'up' | 'down' | 'neutral' | null = null

        if (matchesPlayed > 0) {
          const allPlayers = matches.flatMap((m) => m.players)
          const totalScoreSum = allPlayers.reduce((sum, p) => sum + p.totalScore, 0)
          playerAverage = allPlayers.length > 0
            ? Math.round(totalScoreSum / allPlayers.length)
            : 0

          const licenseNumbers = new Set(allPlayers.map((p) => p.licenseNumber))
          uniquePlayers = licenseNumbers.size

          if (matchesPlayed >= 5) {
            const recentMatches = matches.slice(0, 5)
            const recentPlayers = recentMatches.flatMap((m) => m.players)
            const recentAvg = recentPlayers.length > 0
              ? recentPlayers.reduce((sum, p) => sum + p.totalScore, 0) / recentPlayers.length
              : 0

            const diff = recentAvg - playerAverage
            if (diff > 5) {
              trend = 'up'
            } else if (diff < -5) {
              trend = 'down'
            } else {
              trend = 'neutral'
            }
          }
        }

        return {
          teamId: team.teamId,
          teamName: team.teamName,
          divisionId: team.divisionId,
          matchesPlayed,
          playerAverage,
          trend,
          uniquePlayers,
        }
      })
    )

    return NextResponse.json({ teams })
  } catch (error) {
    console.error('Failed to fetch team stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team stats' },
      { status: 500 }
    )
  }
}
