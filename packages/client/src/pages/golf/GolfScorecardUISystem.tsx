import { State, useState } from '@hookstate/core'
import { useUserState } from '@xrengine/client-core/src/user/store/UserState'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { getHeadTransform } from '@xrengine/engine/src/xr/functions/WebXRFunctions'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { defineSystem } from 'bitecs'
import React from 'react'
import { Matrix4 } from 'three'
import { getPlayerNumber } from './functions/golfBotHookFunctions'
import { GolfColours } from './GolfGameConstants'
import { GolfState } from './GolfSystem'

export function createScorecardUI() {
  return createXRUI(GolfScorecardView, GolfState)
}

function getUserById(id: string, userState: ReturnType<typeof useUserState>) {
  return userState.layerUsers.find((user) => user.id.value === id)
}

const GolfLabelColumn = () => {
  const userState = useUserState()
  const players = useState(GolfState.players)
  return (
    <div
      id="labels"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        padding: '15px 10px',
        gap: '10px',
        position: 'static',
        width: 'fit-content',
        height: 'fit-content',
        textAlign: 'right',
        color: '#FFFFFF'
      }}
    >
      <div
        style={{
          position: 'static',
          height: '40px',
          fontSize: '30px',
          lineHeight: '38px'
        }}
      >
        Hole
      </div>
      <div
        style={{
          position: 'static',
          height: '40px',
          fontSize: '18px',
          lineHeight: '19px'
        }}
      >
        Par
      </div>
      {players.map((p, i) => {
        console.log('PLAYER ' + p.id.value)
        const color = GolfColours[i]
        return (
          <div
            key={i}
            style={{
              position: 'static',
              height: '40px',
              fontSize: '30px',
              lineHeight: '38px',
              alignItems: 'center',
              color: color.getStyle()
            }}
          >
            {getUserById(p.id.value, userState)?.name.value || `Player${i}`}
          </div>
        )
      })}
    </div>
  )
}

const GolfScoreBox = (props: { scoreState: State<number> }) => {
  const score = useState(props.scoreState).value
  return (
    <div
      style={{
        width: '40px',
        height: '40px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '9px',
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: '32px'
      }}
    >
      {score || 0}
    </div>
  )
}

const GolfHoleColumn = (props: { hole: number }) => {
  const players = useState(GolfState.players)
  const holeState = useState(GolfState.holes)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'center',
        padding: '10px',
        gap: '10px',
        color: 'white',
        paddingLeft: '10px'
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #FFFFFF',
          boxSizing: 'border-box',
          borderRadius: '20px',
          lineHeight: '32px',
          fontSize: '20px'
        }}
      >
        {props.hole}
      </div>
      <div
        id="data"
        style={{
          width: '40px',
          height: '40px',
          fontSize: '18px',
          lineHeight: '30px'
        }}
      >
        {holeState[props.hole].par.value}
      </div>
      {players.map((p, i) => (
        <GolfScoreBox key={i} scoreState={p.scores[props.hole]}></GolfScoreBox>
      ))}
    </div>
  )
}

const GolfFinalScoreColumn = () => {
  return <></>
}

const GolfScorecardView = () => {
  const holes = useState(GolfState.holes)
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto"></link>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Racing+Sans+One"></link>
      <div
        id="scorecard"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          padding: '30px 40px',
          position: 'relative',
          width: 'fit-content',
          height: 'fit-content',
          background: ' rgba(0, 0, 0, 0.51)',
          border: '10px solid #FFFFFF',
          boxSizing: 'border-box',
          filter: 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.57))',
          borderRadius: '60px',
          margin: '50px',
          fontFamily: 'Racing Sans One',
          fontStyle: 'normal',
          fontWeight: 'normal'
        }}
      >
        <GolfLabelColumn />
        {holes.map((h, i) => (
          <GolfHoleColumn key={i} hole={i}></GolfHoleColumn>
        ))}
        <GolfFinalScoreColumn></GolfFinalScoreColumn>
      </div>
    </>
  )
}

const mat4 = new Matrix4()

export const GolfScorecardUISystem = async () => {
  const ui = createScorecardUI()

  return defineSystem((world) => {
    // return world

    const uiComponent = getComponent(ui.entity, XRUIComponent)
    if (!uiComponent) return world

    const cameraTransform = getHeadTransform(Network.instance.localClientEntity)
    mat4.compose(cameraTransform.position, cameraTransform.rotation, cameraTransform.scale)

    // const uiTransform = getComponent(ui.entity, TransformComponent)
    const layer = uiComponent.layer
    layer.position.set(0, 0, -1)
    layer.quaternion.set(0, 0, 0, 1)
    layer.scale.setScalar(1)
    layer.matrix.compose(layer.position, layer.quaternion, layer.scale).premultiply(mat4)
    layer.matrix.decompose(layer.position, layer.quaternion, layer.scale)

    // uiTransform.rotation.copy(cameraTransform.rotation)
    // uiTransform.position.copy(cameraTransform.position)
    // uiTransform.position.z = -10
    // ui.z
    // uiTransform.scale.setScalar(Math.max(1, Engine.camera.position.distanceTo(avatarTransform.position) / 3))
    // uiTransform.position.copy(avatarTransform.position)
    // uiTransform.position.y += avatarHeight + 0.3

    return world
  })
}

const GolfScorecardUI = new Map<Entity, ReturnType<typeof createScorecardUI>>()
