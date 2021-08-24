import React from 'react'
import { Vector3, Quaternion, Matrix4 } from 'three'
import { useState } from '@hookstate/core'

import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { addComponent, getComponent, removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { defineQuery, defineSystem, enterQuery, exitQuery } from '@xrengine/engine/src/ecs/bitecs'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'

import { GolfColours } from './GolfGameConstants'
import { GolfState } from './GolfSystem'
import { getPlayerNumber } from './functions/golfBotHookFunctions'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { useUserState } from '@xrengine/client-core/src/user/store/UserState'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { getHeadTransform } from '@xrengine/engine/src/xr/functions/WebXRFunctions'

export function createScorecardUI() {
  return createXRUI(GolfScorecardView, GolfState)
}

const GolfHoles = () => {
  const holes = useState(GolfState.holes)
  return (
    <div className="holes">
      <span className="label">Hole</span>
      {holes.map((_, i) => (
        <span key={i}>{i}</span>
      ))}
    </div>
  )
}

const GolfPar = () => {
  const holes = useState(GolfState.holes)
  return (
    <div className="par">
      <span>Par</span>
      {holes.map((hole, i) => (
        <span key={i}>{hole.par.value}</span>
      ))}
      <span className="total">{holes.reduce((prev, next) => prev + next.par.value, 0)}</span>
    </div>
  )
}

const GolfScores = () => {
  const playerNumber = getPlayerNumber()
  const playerColor = GolfColours[playerNumber]
  const golfState = useXRUIState() as typeof GolfState
  if (golfState.players.length === 0) return <div></div>
  return (
    <>
      {golfState.players.map((player, i) => {
        const scores = player.scores
        return (
          <div className="score" key={i}>
            <span>{'' + player.id.value}</span>
            {scores.value.map((score) => (
              <span>{score}</span>
            ))}
            <span className="total">{scores.reduce((prev, next) => prev + next.value, 0)}</span>
          </div>
        )
      })}
    </>
  )
}

function getUserById(id: string, userState: ReturnType<typeof useUserState>) {
  return userState.layerUsers.find((user) => user.id.value === id)
}

const GolfLabelsView = () => {
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
        padding: '15px 0px 15px 10px',
        position: 'static',
        width: 'fit-content',
        height: 'fit-content',
        fontFamily: 'Racing Sans One',
        fontStyle: 'normal',
        fontWeight: 'normal',
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
          fontSize: '15px',
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
              width: '107px',
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

const GolfScorecardView = () => {
  return (
    <>
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
          filter: 'drop-shadow(0 0 30px rgba(0, 0, 0, 0.57))',
          borderRadius: '60px',
          margin: '50px'
        }}
      >
        <GolfLabelsView />
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
