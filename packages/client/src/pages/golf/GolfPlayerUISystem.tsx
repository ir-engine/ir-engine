import React from 'react'
import { Color, Vector3, Quaternion, Matrix4 } from 'three'
import { createState } from '@hookstate/core'

import { useUserState } from '@xrengine/client-core/src/user/store/UserState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { addComponent, defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { Network } from '@xrengine/engine/src/networking/classes/Network'

import { getGolfPlayerNumber } from './functions/golfFunctions'
import { GolfColours } from './GolfGameConstants'
import { useGolfState } from './GolfSystem'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'

const scratchColor = new Color()

export function createNetworkPlayerUI(userId: UserId) {
  const ui = createXRUI(GolfNetworkPlayerView, createAvatarDetailState(userId))
  addComponent(ui.entity, TransformComponent, {
    position: new Vector3(),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })
  return ui
}

function createAvatarDetailState(userId: UserId) {
  return createState({
    userId
  })
}

type GolfNetworkPlayerState = ReturnType<typeof createAvatarDetailState>

const GolfNetworkPlayerView = () => {
  const detailState = useXRUIState() as GolfNetworkPlayerState
  const golfState = useGolfState()
  const userState = useUserState()
  const userId = detailState.userId.value
  const playerNumber = getGolfPlayerNumber(userId)
  const playerColor = GolfColours[playerNumber]
  const playerState = golfState.players[playerNumber].value
  const user = playerState ? userState.layerUsers.find((user) => user.id.value === playerState.userId) : null
  const isPlayersTurn = golfState.currentPlayerId.value === userId
  return user ? (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Racing+Sans+One"></link>
      <div
        style={{
          fontSize: '60px',
          backgroundColor: '#000000dd',
          color: playerColor.getStyle(),
          width: '400px',
          textAlign: 'center',
          fontFamily: 'Racing Sans One',
          border: `${isPlayersTurn ? 20 : 10}px solid white`,
          borderRadius: '50px',
          padding: '20px',
          margin: '60px',
          filter: 'drop-shadow(0 0 30px #fff2)'
        }}
      >
        {user.name.value}
      </div>
    </>
  ) : (
    <div></div>
  )
}

const mat = new Matrix4()
const up = new Vector3(0, 1, 0)

export const GolfPlayerUISystem = async (world: World) => {
  const playerQuery = defineQuery([AvatarComponent])

  return () => {
    // Network Player XRUI
    if (isClient) {
      for (const entity of playerQuery.enter()) {
        if (entity === world.localClientEntity) continue
        const networkComponent = getComponent(entity, NetworkObjectComponent)
        const playerUI = createNetworkPlayerUI(networkComponent.userId)
        GolfNetworkPlayerUI.set(entity, playerUI)
      }

      for (const entity of playerQuery()) {
        const ui = GolfNetworkPlayerUI.get(entity)!
        if (!ui) continue
        const { avatarHeight } = getComponent(entity, AvatarComponent)
        const avatarTransform = getComponent(entity, TransformComponent)
        const uiTransform = getComponent(ui.entity, TransformComponent)
        uiTransform.scale.setScalar(Math.max(1, Engine.camera.position.distanceTo(avatarTransform.position) / 3))
        uiTransform.position.copy(avatarTransform.position)
        uiTransform.position.y += avatarHeight + 0.3
        mat.lookAt(Engine.camera.position, uiTransform.position, up)
        uiTransform.rotation.setFromRotationMatrix(mat)
      }

      for (const entity of playerQuery.exit()) {
        const ui = GolfNetworkPlayerUI.get(entity)!
        removeEntity(ui.entity)
        GolfNetworkPlayerUI.delete(entity)
      }
    }
  }
}

const GolfNetworkPlayerUI = new Map<Entity, ReturnType<typeof createNetworkPlayerUI>>()
