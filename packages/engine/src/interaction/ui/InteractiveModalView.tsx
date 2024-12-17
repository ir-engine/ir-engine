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

import React from 'react'

import { createEntity, setComponent } from '@ir-engine/ecs'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { createXRUI } from '@ir-engine/engine/src/xrui/createXRUI'
import { useXRUIState } from '@ir-engine/engine/src/xrui/useXRUIState'
import { hookstate, isClient } from '@ir-engine/hyperflux'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Color, DoubleSide, Mesh, MeshPhysicalMaterial, Shape, ShapeGeometry, Vector3 } from 'three'

export interface InteractiveModalState {
  interactMessage: string
}

export const createModalView = (
  entity: Entity,
  interactMessage: string,
  isInteractable = true,
  borderRadiusPx: number = 10,
  bgPaddingPx: number = 30,
  contentVerticalPadPx: number = 10,
  contentHorizontalPadPx: number = 10
) => {
  const uiEntity = createEntity()
  const ui = createXRUI(
    () =>
      InteractiveModalView({
        entity: uiEntity,
        borderRadiusPx: borderRadiusPx,
        bgPaddingPx: bgPaddingPx,
        contentVerticalPadPx: contentVerticalPadPx,
        contentHorizontalPadPx: contentHorizontalPadPx
      }),
    hookstate({
      interactMessage
    } as InteractiveModalState),
    { interactable: isInteractable },
    uiEntity
  )
  return ui
}

function createBackground(
  parentEntity: Entity,
  width: number,
  height: number,
  borderRadiusPx: number = 10,
  paddingPx: number = 30,
  contentVerticalPadPx: number = 10,
  contentHorizontalPadPx: number = 10
): Entity {
  const blurMat = new MeshPhysicalMaterial({
    color: new Color('#B9B9B9'),
    transmission: 1,
    roughness: 0.5,
    opacity: 1,
    transparent: true,
    side: DoubleSide,
    depthWrite: false
  })

  const backgroundEid = createEntity()
  const calcWidth = width + paddingPx // 30 accounts for padding and border radius in the Element styling
  const calcHeight = height + paddingPx
  const mesh = new Mesh(
    // roundedRect(-((calcWidth + contentHorizontalPadPx) / 1000) / 2, -((calcHeight + contentVerticalPadPx)/ 1000) / 2, (calcWidth + contentHorizontalPadPx) / 1000, (calcHeight + contentVerticalPadPx )/ 1000, borderRadiusPx/1000),
    roundedRect(
      -(calcWidth / 1000) / 2,
      -(calcHeight / 1000) / 2,
      calcWidth / 1000,
      calcHeight / 1000,
      borderRadiusPx / 1000
    ),
    blurMat
  )
  setComponent(backgroundEid, EntityTreeComponent, { parentEntity: parentEntity })
  setComponent(backgroundEid, MeshComponent, mesh)
  setComponent(backgroundEid, VisibleComponent)
  const backgroundTransform = setComponent(backgroundEid, TransformComponent, { position: new Vector3(0, 0, -0.0001) })
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

export const InteractiveModalView: React.FC = (props: {
  entity: Entity
  borderRadiusPx: number
  bgPaddingPx: number
  contentVerticalPadPx: number
  contentHorizontalPadPx: number
}) => {
  const modalState = useXRUIState<InteractiveModalState>()
  const rootElement = React.useRef<HTMLDivElement>(null)

  if (!isClient) return <></>

  React.useLayoutEffect(() => {
    if (rootElement.current) {
      createBackground(
        props.entity,
        rootElement.current.clientWidth,
        rootElement.current.clientHeight,
        props.borderRadiusPx,
        props.bgPaddingPx,
        props.contentVerticalPadPx,
        props.contentHorizontalPadPx
      )
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
          font-size: 50px;
          color: #e7e7e7;
          font-family: sans-serif;
          font-weight: 400;
          border: 4px solid #e7e7e7;
          border-radius: ${props.borderRadiusPx}px;
          padding-top: ${props.contentVerticalPadPx}px;
          padding-bottom: ${props.contentVerticalPadPx}px;
          padding-left: ${props.contentHorizontalPadPx}px;
          padding-right: ${props.contentHorizontalPadPx}px;
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
