import React from 'react'
import { Color, Vector3, Quaternion } from 'three'
import { createState } from '@hookstate/core'

import { useUserState } from '@xrengine/client-core/src/user/store/UserState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { addComponent, getComponent, removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { defineQuery, defineSystem, enterQuery, exitQuery } from '@xrengine/engine/src/ecs/bitecs'
import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { Network } from '@xrengine/engine/src/networking/classes/Network'

import { getGolfPlayerNumber } from './functions/golfFunctions'
import { GolfColours } from './GolfGameConstants'
import { GolfState, useGolfState } from './GolfSystem'

const scratchColor = new Color()

export function createScorecardUI(playerNumber: number) {
  const ui = createXRUI(GolfScorecardView, GolfState)
  addComponent(ui.entity, TransformComponent, {
    position: new Vector3(),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })
  return ui
}

const GolfScorecardView = () => {
  const detailState = useXRUIState() as typeof GolfState
  const golfState = useGolfState()
  const userState = useUserState()
  const playerNumber = 0
  const playerColor = GolfColours[playerNumber]
  const playerState = golfState.players[playerNumber]
  const user = userState.layerUsers.find((user) => user.id.value === playerState.id.value)
  const isPlayersTurn = golfState.currentPlayer.value === playerNumber
  return user ? (
    <div
      style={{
        fontSize: '60px',
        backgroundColor: '#000000dd',
        color: scratchColor.setHex(playerColor).getStyle(),
        fontFamily: "'Roboto', sans-serif",
        border: `${isPlayersTurn ? 20 : 10}px solid white`,
        borderRadius: '50px',
        padding: '20px',
        margin: '60px',
        filter: 'drop-shadow(0 0 30px #fff2)'
      }}
    >
      {user.name.value}
    </div>
  ) : (
    <div></div>
  )
}

export const GolfScorecardUISystem = async () => {
  const playerQuery = defineQuery([AvatarComponent])
  const playerEnterQuery = enterQuery(playerQuery)
  const playerExitQuery = exitQuery(playerQuery)

  return defineSystem((world) => {
    // Network Player XRUI
    if (isClient) {
      // for (const entity of playerEnterQuery(world)) {
      //   if (entity === Network.instance.localClientEntity) continue
      //   const playerUI = createScorecardUI(getGolfPlayerNumber(entity))
      //   GolfScorecardUI.set(entity, playerUI)
      // }
      // for (const entity of playerQuery(world)) {
      //   const ui = GolfScorecardUI.get(entity)!
      //   if (!ui) continue
      //   const { avatarHeight } = getComponent(entity, AvatarComponent)
      //   const avatarTransform = getComponent(entity, TransformComponent)
      //   const uiTransform = getComponent(ui.entity, TransformComponent)
      //   uiTransform.scale.setScalar(Math.max(1, Engine.camera.position.distanceTo(avatarTransform.position) / 3))
      //   uiTransform.position.copy(avatarTransform.position)
      //   uiTransform.position.y += avatarHeight + 0.3
      //   uiTransform.rotation.setFromRotationMatrix(Engine.camera.matrix)
      // }
      // for (const entity of playerExitQuery(world)) {
      //   const ui = GolfScorecardUI.get(entity)
      //   removeEntity(ui.entity)
      //   GolfScorecardUI.delete(entity)
      // }
    }
    return world
  })
}

const GolfScorecardUI = new Map<Entity, ReturnType<typeof createScorecardUI>>()
