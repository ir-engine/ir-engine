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
import * as Common from '@ir-engine/common'
import { FileBrowserContentType, staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { getMutableState } from '@ir-engine/hyperflux'
import { render } from '@testing-library/react'
import React from 'react'
import sinon from 'sinon'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FileThumbnailJobState } from './FileThumbnailJobState'
vi.mock('@ir-engine/common', async () => {
  const actual = await vi.importActual<typeof import('@ir-engine/common')>('@ir-engine/common')
  return {
    ...actual,
    useFind: sinon.stub()
  }
})

import { useFind } from '@ir-engine/common'
describe('FileThumbnailJobState', () => {
  let useFindStub
  const testKey = 'projects/ir-engine/default-project/public/test.glb'
  const filesQueryData: FileBrowserContentType[] = [
    {
      key: testKey,
      name: 'test',
      size: 1000,
      type: 'glb',
      url: 'https://domain/' + testKey
    }
  ]
  beforeEach(async () => {
    createEngine()
    useFindStub = sinon.stub(Common, 'useFind').returns({
      data: [
        {
          id: '1',
          key: testKey,
          project: 'default-project',
          url: 'https://domain/' + testKey,
          thumbnailKey: null,
          width: null,
          height: null,
          depth: null
        }
      ],
      total: 1,
      setSort: sinon.fake(),
      setLimit: sinon.fake(),
      setPage: sinon.fake(),
      search: sinon.fake(),
      page: 1,
      skip: 0,
      limit: 10,
      sort: {},
      status: 'success',
      error: '',
      refetch: sinon.fake()
    })
  })

  afterEach(async () => {
    sinon.restore()
    destroyEngine()
  })
  const TestThumbnailComponent = () => {
    FileThumbnailJobState.useGenerateThumbnails(filesQueryData)
    return null
  }

  const TestDimensionComponent = () => {
    FileThumbnailJobState.useGenerateDimensions(filesQueryData)
    return null
  }
  describe('useGenerateThumbnails', () => {
    it('should add thumbnail jobs for files without thumbnails', async () => {
      render(<TestThumbnailComponent />)
      expect(useFind).toHaveBeenCalledOnce()
      expect(useFind).toHaveBeenCalledWith(staticResourcePath, {
        query: {
          key: { $in: [testKey] },
          thumbnailKey: 'null'
        }
      })

      const jobState = getMutableState(FileThumbnailJobState)
      expect(jobState.jobs.value.length).toBeGreaterThan(0)
    })
  })
})
