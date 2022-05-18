// this tests use real open match services
import { getTicketsAssignment } from '../src/functions'
import { OpenMatchTicketAssignment } from '../src/interfaces'

export async function waitForTicketAssignment(
  ticketId: string,
  signal: AbortSignal,
  checkInterval: number
): Promise<OpenMatchTicketAssignment> {
  return new Promise<OpenMatchTicketAssignment>((resolve) => {
    let timeoutId: NodeJS.Timeout
    signal.addEventListener('onabort', () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    })

    const checkLoop = async () => {
      if (signal.aborted) {
        return
      }

      const assignment = await getTicketsAssignment(ticketId)

      if (assignment.connection || signal.aborted) {
        clearTimeout(timeoutId)
        resolve(assignment)
        return
      }

      timeoutId = setTimeout(checkLoop, checkInterval)
    }

    checkLoop()
  })
}
