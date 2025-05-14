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

import { API } from '@ir-engine/common'
import { FileBrowserContentType } from '@ir-engine/common/src/schema.type.module'
import { createEngine, createEntity, destroyEngine, setComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { useMutableState } from '@ir-engine/hyperflux'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { BoundingBoxComponent } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponents'
import { act, render, waitFor } from '@testing-library/react'
import { assert } from 'console'
import React from 'react'
import sinon from 'sinon'
import { Box3, BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { FileThumbnailJobState, uploadDimension } from './FileThumbnailJobState'

describe('FileThumbnailJobState', () => {
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
  let patchStub: sinon.SinonStub
  let findStub: sinon.SinonStub
  let data: any[]
  beforeEach(() => {
    createEngine()
    findStub = sinon.stub().resolves({
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
      total: 1
    })
    data = [
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
    ]

    patchStub = sinon.stub().callsFake((id, patchData) => {
      return new Promise((resolve) => {
        const index = data.findIndex((item) => item.id === id)
        if (index !== -1) {
          data[index] = { ...data[index], ...patchData }
          resolve(data[index])
        } else {
          resolve(null)
        }
      })
    })
    findStub = sinon.stub().resolves({ data: data, total: 1 })
    const serviceStub = sinon.stub().returns({
      patch: patchStub,
      find: findStub
    })
    sinon.stub(API, 'instance').value({ service: serviceStub })
  })

  afterEach(() => {
    sinon.restore()
    destroyEngine()
  })
  null

  it('should add dimension jobs using useGenerateDimenshion', async () => {
    let jobState: any
    const TestDimensionComponent = () => {
      FileThumbnailJobState.useGenerateDimensions(filesQueryData)
      jobState = useMutableState(FileThumbnailJobState).jobs
      return null
    }
    await act(async () => {
      render(<TestDimensionComponent />)
    })
    await waitFor(() => {
      sinon.assert.called(findStub)
      assert(jobState.length > 0, 'Should have at least one job in the queue')
    })
  })
  it('should calculate dimensions', async () => {
    const projectName = 'default-project'
    const entity = createEntity()
    const boxMin = new Vector3(-1, -2, -3)
    const boxMax = new Vector3(1, 2, 3)
    const box = new Box3(boxMin, boxMax)
    setComponent(entity, BoundingBoxComponent, { box })
    const geometry = new BoxGeometry(2, 4, 6)
    const material = new MeshBasicMaterial({ color: 0x00ff00 })
    setComponent(entity, GLTFComponent, { src: testUrl })
    const mesh = new Mesh(geometry, material)
    setComponent(entity, MeshComponent, mesh)
    await uploadDimension(entity, testUrl, projectName)

    await waitFor(() => {
      sinon.assert.calledOnce(findStub)
      sinon.assert.calledOnce(patchStub)
      sinon.assert.calledWith(patchStub, '1', {
        width: 2,
        height: 4,
        depth: 6,
        project: projectName
      })
    })
  })
})
