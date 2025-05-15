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
import { resolve } from '@feathersjs/schema'
import { getValidator, Static, Type } from '@feathersjs/typebox'
import { BigQuery } from '@google-cloud/bigquery'
import { dataValidator } from '@ir-engine/common/src/schemas/validators'

export const AnalyticsLogSchema = Type.Object(
  {
    // Required Log Properties Payload
    event_id: Type.String(),
    event_name: Type.String(),
    // Optional Properties
    action: Type.Optional(Type.String()),
    level: Type.Optional(Type.String()),
    component: Type.Optional(Type.String()),
    user_id: Type.Optional(Type.String()),
    event_value: Type.Optional(Type.String()),
    event_properties: Type.Optional(
      Type.Array(
        Type.Object({
          key: Type.String(),
          value: Type.String()
        })
      )
    ),
    session_id: Type.Optional(Type.String()),
    environment: Type.Optional(Type.String()),
    host_uri: Type.Optional(Type.String()),
    app_name: Type.Optional(Type.String()),
    ip_address: Type.Optional(Type.String()),
    device_type: Type.Optional(Type.String()),
    device_info: Type.Optional(Type.String()),
    account_id: Type.Optional(Type.String()),
    location_id: Type.Optional(Type.String()),
    project_id: Type.Optional(Type.String()),
    tenant: Type.Optional(Type.String()),
    project: Type.Optional(Type.String()),
    event_time: Type.Optional(Type.Number())
  },
  { additionalProperties: false }
)

export const BQLogSchema = Type.Pick(
  AnalyticsLogSchema,
  [
    'user_id',
    'event_name',
    'event_id',
    'event_value',
    'event_properties',
    'session_id',
    'environment',
    'host_uri',
    'app_name',
    'ip_address',
    'device_type',
    'device_info',
    'account_id',
    'location_id',
    'project_id',
    'tenant',
    'project',
    'event_time'
  ],
  { additionalProperties: false }
)

export type AnalyticsLog = Static<typeof AnalyticsLogSchema>
export type BQLog = Static<typeof BQLogSchema>

export const AnalyticsLogValidator = getValidator(AnalyticsLogSchema, dataValidator)
export const AnalyticsLogResolver = resolve<AnalyticsLog, HookContext>({
  user_id: async (value, log, context) => context.params.user.id,
  event_time: async (value, log) => value || Date.now(),
  action: async () => undefined,
  level: async () => undefined,
  component: async () => undefined
})

export const BQLogValidator = getValidator(BQLogSchema, dataValidator)

// Ensure the environment variables exist (or add runtime checks as needed)
const projectId: string = process.env.BQ_PROJECT_ID!
const datasetId: string = process.env.BQ_DATASET_ID!
const tableId: string = process.env.BQ_TABLE_ID!

// Initialize the BigQuery client
const bigquery = new BigQuery({
  projectId
})

/**
 * Logs an event to BigQuery.
 *
 * @param event - The event object containing the event data.
 */
export const logToBigQuery = async (log: BQLog) => {
  try {
    // Retrieve the dataset and table from BigQuery.
    const dataset = bigquery.dataset(datasetId)
    const table = dataset.table(tableId)
    // Insert the row.
    const result = await table.insert(log)
    console.log('[BigQuery] event:', log)
    console.log('[BigQuery] result:', result)
  } catch (error) {
    console.error('Error inserting row into BigQuery:', error)
    throw error
  }
}
