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

import React from 'react'

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import { createEntity, setComponent } from '@etherealengine/ecs'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { hookstate } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { createXRUI } from '@etherealengine/spatial/src/xrui/functions/createXRUI'
import { useXRUIState } from '@etherealengine/spatial/src/xrui/functions/useXRUIState'
import { Color, DoubleSide, Mesh, MeshPhysicalMaterial, Shape, ShapeGeometry, Vector3 } from 'three'

export interface InteractiveModalState {
  interactMessage: string
}

export const createModalView = (entity: Entity, interactMessage: string, isInteractable = true) => {
  const uiEntity = createEntity()
  const ui = createXRUI(
    () => InteractiveModalView(uiEntity),
    hookstate({
      interactMessage
    } as InteractiveModalState),
    { interactable: isInteractable },
    uiEntity
  )
  return ui
}

function createBackground(parentEntity: Entity, width: number, height: number): Entity {
  const blurMat = new MeshPhysicalMaterial({
    color: new Color('#B9B9B9'),
    transmission: 1,
    roughness: 0.5,
    opacity: 1,
    transparent: true,
    side: DoubleSide
  })

  const backgroundEid = createEntity()
  const calcWidth = width + 30 // 30 accounts for padding and border radius in the Element styling
  const calcHeight = height + 30
  const mesh = new Mesh(
    roundedRect(-(calcWidth / 1000) / 2, -(calcHeight / 1000) / 2, calcWidth / 1000, calcHeight / 1000, 0.01),
    blurMat
  )
  setComponent(backgroundEid, EntityTreeComponent, { parentEntity: parentEntity })
  setComponent(backgroundEid, MeshComponent, mesh)
  setComponent(backgroundEid, VisibleComponent)
  const backgroundTransform = setComponent(backgroundEid, TransformComponent, { position: new Vector3(0, 0, -0.001) })
  addObjectToGroup(backgroundEid, mesh) // TODO: this should be managed by the MeshComponent
  return backgroundEid
}

function roundedRect(x: number, y: number, width: number, height: number, radius: number): ShapeGeometry {
  const shape = new Shape()
  shape.moveTo(x, y + radius)
  shape.lineTo(x, y + height - radius)
  shape.quadraticCurveTo(x, y + height, x + radius, y + height)
  shape.lineTo(x + width - radius, y + height)
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius)
  shape.lineTo(x + width, y + radius)
  shape.quadraticCurveTo(x + width, y, x + width - radius, y)
  shape.lineTo(x + radius, y)
  shape.quadraticCurveTo(x, y, x, y + radius)
  return new ShapeGeometry(shape)
}

export const InteractiveModalView: React.FC = (entity: Entity) => {
  const modalState = useXRUIState<InteractiveModalState>()
  const rootElement = React.useRef<HTMLDivElement>(null)

  if (!isClient) return <></>

  React.useLayoutEffect(() => {
    if (rootElement.current) {
      createBackground(entity, rootElement.current.clientWidth, rootElement.current.clientHeight)
    }
  }, [rootElement.current]) //TODO this isn't firing, not calculating size to add BG

  return (
    <div className={'modal'} ref={rootElement}>
      {modalState.interactMessage.value && modalState.interactMessage.value !== ''
        ? modalState.interactMessage.value
        : 'E'}
      <link href="https://fonts.googleapis.com/css?family=Lato:400" rel="stylesheet" type="text/css" />
      <style>
        {`
        .modal {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 60px;
          color: #e7e7e7;
          font-family: sans-serif;
          font-weight: 400;
          border: 4px solid #e7e7e7;
          border-radius: 10px;
          padding: 10px;
          margin: 60px;
          width: fit-content;
          height: fit-content;
          min-width: 50px;
          min-height: 50px;
          text-align: center;
          vertical-align: center;
        }
      `}
      </style>
    </div>
  )
}
