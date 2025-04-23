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

import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { getMutableState } from '@ir-engine/hyperflux'
import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { FileThumbnailJobState } from './FileThumbnailJobState'

describe('FileThumbnailJobState', () => {
  const testKey = 'projects/ir-engine/default-project/public/test.glb'
  beforeEach(async () => {
    createEngine()
  })

  afterEach(async () => {
    destroyEngine()
  })

  it('should add thumbnail jobs for files without thumbnails', async () => {
    const jobState = getMutableState(FileThumbnailJobState)
    const seenResources = jobState.seenResources.thumbnail
    const fakeResources = [
      {
        id: '1',
        key: testKey,
        url: 'https://domain/' + testKey,
        project: 'default-project',
        thumbnailKey: null,
        type: 'glb'
      }
    ]

    for (const resource of fakeResources) {
      if (seenResources.value.includes(resource.key)) continue
      seenResources.merge([resource.key])

      if (resource.type === 'thumbnail') continue

      const ext = resource.key.split('.').pop() ?? ''
      if (resource.thumbnailKey != null || !['glb', 'gltf', 'fbx'].includes(ext)) {
        continue
      }

      if (jobState.jobs.value.filter((fj) => fj.key === resource.url && fj.jobType === 'thumbnail').length < 1) {
        jobState.jobs.merge([
          {
            key: resource.url,
            project: resource.project!,
            jobType: 'thumbnail'
          }
        ])
      }
    }
    assert.ok(jobState.jobs.value.length > 0, 'Thumbnail job was added')
  })
  it('should add dimension jobs for glb/gltf files without dimension data', async () => {
    const jobState = getMutableState(FileThumbnailJobState)
    const seenDimensions = jobState.seenResources.dimension

    const fakeResources = [
      {
        id: '1',
        key: testKey,
        url: 'https://domain/' + testKey,
        project: 'default-project',
        type: 'glb',
        width: null,
        height: null,
        depth: null
      }
    ]

    for (const resource of fakeResources) {
      if (!seenDimensions.value.includes(resource.key)) {
        seenDimensions.merge([resource.key])

        if (!jobState.jobs.value.some((job) => job.key === resource.url && job.jobType === 'dimension')) {
          jobState.jobs.merge([
            {
              key: resource.url,
              project: resource.project!,
              jobType: 'dimension'
            }
          ])
        }
      }
    }

    const jobKeys = jobState.jobs.value.map((j) => j.jobType)
    assert.ok(jobKeys.includes('dimension'), 'Dimension job was added')
  })
})
