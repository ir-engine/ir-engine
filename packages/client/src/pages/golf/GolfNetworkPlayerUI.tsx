import React from 'react'
import { createState } from '@hookstate/core'
import { useUserState } from '@xrengine/client-core/src/user/store/UserState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { GolfColours } from '@xrengine/engine/src/game/templates/Golf/GolfGameConstants'
import { Color } from 'three'
import { useGolfState } from '@xrengine/engine/src/game/templates/Golf/GolfSystem'

const scratchColor = new Color()

export function createNetworkPlayerUI(playerNumber: number) {
  return createXRUI(GolfNetworkPlayerView, createAvatarDetailState(playerNumber))
}

function createAvatarDetailState(playerNumber: number) {
  return createState({
    playerNumber
  })
}

type GolfNetworkPlayerState = ReturnType<typeof createAvatarDetailState>

const GolfNetworkPlayerView = () => {
  const detailState = useXRUIState() as GolfNetworkPlayerState
  const golfState = useGolfState()
  const userState = useUserState()
  const playerNumber = detailState.playerNumber.value
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
