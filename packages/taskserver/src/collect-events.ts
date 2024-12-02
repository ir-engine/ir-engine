/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { getState } from '@ir-engine/hyperflux'
import config from '@ir-engine/server-core/src/appconfig'
import { default as multiLogger, default as serverLogger } from '@ir-engine/server-core/src/ServerLogger'
import { ServerState } from '@ir-engine/server-core/src/ServerState'

const logger = multiLogger.child({ component: 'taskserver:collect-events' })

const DEFAULT_INTERVAL_SECONDS = 60
const configInterval = parseInt(config['task-server'].processInterval)
const interval = (configInterval || DEFAULT_INTERVAL_SECONDS) * 1000

let lastTimestamp: string // Store the timestamp of the last run

const collectLogs = async () => {
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  logger.info('Collecting events at %s.', new Date().toString())

  if (k8DefaultClient) {
    try {
      const namespace = 'default' // Replace with your target namespace
      const currentTimestamp = new Date().toISOString()
      let eventMessages: any[] = []

      // Fetch all events in the namespace
      const eventsResponse = await k8DefaultClient.listNamespacedEvent(namespace)

      logger.info(eventsResponse.body.items.length)
      if (lastTimestamp) {
        eventMessages = eventsResponse.body.items
          .filter((event) => {
            if (event.firstTimestamp) {
              new Date(event.firstTimestamp) > new Date(lastTimestamp)
            }
          })
          .map((event) => ({
            name: event.involvedObject.name,
            message: event.message,
            timestamp: event.firstTimestamp
          }))
      } else {
        eventMessages = eventsResponse.body.items.map((event) => ({
          name: event.involvedObject.name,
          message: event.message,
          timestamp: event.firstTimestamp
        }))
      }

      if (eventMessages.length > 0) {
        // Log the collected events
        logger.info(eventMessages)
      }

      lastTimestamp = currentTimestamp
    } catch (e) {
      serverLogger.error(e)
      return e
    }
  }
}

export default (app): void => {
  logger.info('started event logging.')

  setInterval(collectLogs, interval)

  collectLogs()
}
