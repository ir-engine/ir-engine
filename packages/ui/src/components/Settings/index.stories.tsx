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

import {
  createEntity,
  defineSystem,
  ECSState,
  EntityTreeComponent,
  getComponent,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import { defineState, getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState, TransformComponent, TransformSystem } from '@ir-engine/spatial'
import { Vector3_Up, Vector3_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import type { Meta, StoryObj } from '@storybook/react'
import React, { useEffect, useState } from 'react'
import { BoxGeometry, Matrix4, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import SettingsMenu from '.'

const meta = {
  title: 'UI/Settings Menu',
  component: SettingsMenu,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A settings menu component with iPhone-like slide transitions between screens.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    onClose: { action: 'closed' }
  }
} satisfies Meta<typeof SettingsMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-transparent bg-center">
        <button
          className="rounded-md bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close Settings' : 'Open Settings'}
        </button>
        {open && <SettingsMenu {...args} onClose={() => setOpen(false)} />}
      </div>
    )
  }
}

const SceneState = defineState({
  name: 'ir.minimalist.SceneState',
  initial: {
    entity: UndefinedEntity
  }
})

const UpdateSystem = defineSystem({
  uuid: 'ir.minimalist.UpdateSystem',
  insert: { before: TransformSystem },
  execute: () => {
    const entity = getState(SceneState).entity
    if (!entity) return

    const elapsedSeconds = getState(ECSState).elapsedSeconds
    const transformComponent = getComponent(entity, TransformComponent)
    transformComponent.rotation.setFromAxisAngle(Vector3_Up, elapsedSeconds)
  },
  reactor: function () {
    const { originEntity, viewerEntity } = useMutableState(ReferenceSpaceState).value

    useEffect(() => {
      if (!viewerEntity) return

      // Create a new entity
      const entity = createEntity()
      setComponent(entity, TransformComponent, { position: new Vector3(0, 0, 0) })
      setComponent(entity, EntityTreeComponent, { parentEntity: originEntity })

      // Create a box at the origin
      const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x00ff00 }))
      setComponent(entity, MeshComponent, mesh)
      setComponent(entity, NameComponent, 'Box')
      setComponent(entity, VisibleComponent)

      // Make the camera look at the box
      setComponent(viewerEntity, TransformComponent, { position: new Vector3(5, 2, 0) })
      const cameraTransform = getComponent(viewerEntity, TransformComponent)
      cameraTransform.rotation.setFromRotationMatrix(
        new Matrix4().lookAt(cameraTransform.position, Vector3_Zero, Vector3_Up)
      )

      getMutableState(SceneState).entity.set(entity)
    }, [viewerEntity])

    return null
  }
})
