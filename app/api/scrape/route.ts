import { runScraper } from '@/lib/scraper'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: string) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`))
      }

      const onLog = (msg: string) => {
        send('log', msg)
      }

      try {
        const result = await runScraper(onLog)
        send('result', JSON.stringify(result))
      } catch (error) {
        send('result', JSON.stringify({
          success: false,
          message: `Server error: ${error}`,
          matchesProcessed: 0,
          errors: [`${error}`]
        }))
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
