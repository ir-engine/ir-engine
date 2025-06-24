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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { HookContext } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  buildStatusDataValidator,
  buildStatusPatchValidator,
  buildStatusQueryValidator,
  BuildStatusType
} from '@ir-engine/common/src/schemas/cluster/build-status.schema'

import verifyScope from '../../hooks/verify-scope'
import { BuildStatusService } from './build-status.class'
import {
  buildStatusDataResolver,
  buildStatusExternalResolver,
  buildStatusPatchResolver,
  buildStatusQueryResolver,
  buildStatusResolver
} from './build-status.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(buildStatusExternalResolver), schemaHooks.resolveResult(buildStatusResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(buildStatusQueryValidator), schemaHooks.resolveQuery(buildStatusQueryResolver)],
    find: [iff(isProvider('external'), verifyScope('server', 'read'))],
    get: [iff(isProvider('external'), verifyScope('server', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('server', 'write')),
      schemaHooks.validateData(buildStatusDataValidator),
      schemaHooks.resolveData(buildStatusDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('server', 'write')),
      schemaHooks.validateData(buildStatusPatchValidator),
      schemaHooks.resolveData(buildStatusPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('server', 'read'))]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      (context: HookContext<BuildStatusService>) => {
        // Track build start in metrics
        const metricsService = context.app.get('metricsService') as any
        if (metricsService && typeof metricsService.trackBuildStart === 'function') {
          metricsService.trackBuildStart()
        }
        return context
      }
    ],
    update: [],
    patch: [
      (context: HookContext<BuildStatusService>) => {
        // Track build completion in metrics if status is changed from pending
        const metricsService = context.app.get('metricsService') as any
        if (!metricsService || typeof metricsService.trackBuildCompletion !== 'function') return context

        const data = context.data as Partial<BuildStatusType>
        const buildStatus = context.result as BuildStatusType

        // Only track completion if status is being updated and it's not 'pending'
        if (data.status && data.status !== 'pending') {
          // Calculate duration if both dateStarted and dateEnded are available
          if (buildStatus.dateStarted && buildStatus.dateEnded) {
            const startDate = new Date(buildStatus.dateStarted)
            const endDate = new Date(buildStatus.dateEnded)
            const durationSeconds = (endDate.getTime() - startDate.getTime()) / 1000

            metricsService.trackBuildCompletion(data.status, durationSeconds)
          } else {
            // If we can't calculate duration, still track the status change
            metricsService.trackBuildCompletion(data.status, 0)
          }
        }

        return context
      }
    ],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
