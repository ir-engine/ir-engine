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
import { FileBrowserContentType } from '@ir-engine/common/src/schema.type.module'
import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { act, render, waitFor } from '@testing-library/react'
import React from 'react'
import sinon from 'sinon'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { FileThumbnailJobState } from './FileThumbnailJobState'

describe('FileThumbnailJobState (React-safe + Sinon only)', () => {
  const testKey = 'projects/ir-engine/default-project/public/test.glb'
  const testUrl = 'https://domain/' + testKey

  const filesQueryData: FileBrowserContentType[] = [
    {
      key: testKey,
      name: 'test',
      size: 1000,
      type: 'glb',
      url: testUrl
    }
  ]
  let useFindStub: sinon.SinonStub

  beforeEach(() => {
    createEngine()

    useFindStub = sinon.stub(Common, 'useFind').returns({
      data: [
        {
          id: '1',
          key: testKey,
          project: 'default-project',
          url: testUrl,
          thumbnailKey: null,
          width: null,
          height: null,
          depth: null,
          type: 'glb'
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

  afterEach(() => {
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

  it('should add thumbnail jobs using useGenerateThumbnails', async () => {
    await act(async () => {
      render(<TestThumbnailComponent />)
    })

    await waitFor(() => {
      sinon.assert.called(useFindStub)
    })
  })
  it('should add dimension jobs using useGenerateDimenshion', async () => {
    await act(async () => {
      render(<TestDimensionComponent />)
    })

    await waitFor(() => {
      sinon.assert.called(useFindStub)
    })
  })
})
