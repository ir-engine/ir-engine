/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import assert from 'assert'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { apiJobPath } from '@etherealengine/engine/src/schemas/cluster/api-job.schema'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'
import { getDateTimeSql } from '../../util/datetime-sql'

describe('api job service', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })
  after(() => {
    return destroyEngine()
  })

  it('should register the service', () => {
    const service = app.service(apiJobPath)
    assert.ok(service, 'Registered the service')
  })

  it('find service', () => {
    assert.doesNotThrow(async () => await app.service(apiJobPath).get(''))
  })

  let jobId
  it('creates a job', async () => {
    const date = await getDateTimeSql()
    const createdJob = await app.service(apiJobPath).create({
      name: 'test-job',
      startTime: date,
      endTime: date,
      returnData: '',
      status: 'pending'
    })
    jobId = createdJob.id
    assert.ok(createdJob)
  })

  it('gets the job', async () => {
    assert.doesNotThrow(async () => await app.service(apiJobPath).get(jobId))
  })

  it('finds multiple jobs', async () => {
    const foundJobs = await app.service(apiJobPath).find({ query: { name: 'test-job' } })
    assert.equal(foundJobs.total, 1)
  })

  it('patches the job', async () => {
    await app.service(apiJobPath).patch(jobId, { name: 'updated-job', status: 'succeeded', returnData: 'success' })
    const patchedJob = await app.service(apiJobPath).get(jobId)
    assert.equal(patchedJob.name, 'updated-job')
    assert.equal(patchedJob.status, 'succeeded')
    assert.equal(patchedJob.returnData, 'success')
  })

  it('removes a job', async () => {
    await app.service(apiJobPath).remove(jobId)
    const foundJobs = await app.service(apiJobPath).find({ query: { name: 'updated-job' } })
    assert.equal(foundJobs.total, 0)
  })
})
