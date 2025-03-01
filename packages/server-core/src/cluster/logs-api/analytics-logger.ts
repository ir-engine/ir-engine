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

import { BigQuery } from '@google-cloud/bigquery'
import { LogParamsObject } from '@ir-engine/common/src/logger'
import { v4 as uuidv4 } from 'uuid'

interface BigQueryRow {
  event_name: string
  event_id: string
  event_value: string
  event_properties: any
  event_time: number
  tenant: string
  project: string
  user_id: string
  session_id: string
  environment: string
  host_uri: string
  app_name: string
  ip_address: string
  device_type: string
  device_info: string
}

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
export const logToBigQuery = async (event: LogParamsObject) => {
  // Create the row to insert into BigQuery.
  const row: BigQueryRow = {
    event_name: event.event_name,
    event_id: event.event_id || uuidv4(),
    event_value: event.event_value || '',
    event_properties: event.event_properties || [],
    event_time: Date.now(),
    tenant: event.tenant,
    project: event.project,
    user_id: event.user_id,
    session_id: event.session_id,
    environment: event.environment,
    host_uri: event.host_uri,
    app_name: event.app_name,
    ip_address: event.ip_address,
    device_type: event.device_type,
    device_info: event.device_info
  }

  try {
    // Retrieve the dataset and table from BigQuery.
    const dataset = bigquery.dataset(datasetId)
    const table = dataset.table(tableId)

    // Insert the row.
    await table.insert(row)
    console.log(`Logged event to BigQuery: ${event.event_name}`)
  } catch (error) {
    console.error('Error inserting row into BigQuery:', error)
    throw error
  }
}
