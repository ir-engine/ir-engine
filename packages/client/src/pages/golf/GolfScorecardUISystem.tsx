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

export function createScorecardUI() {
  const ui = createXRUI(GolfScorecardView, GolfState)

  addComponent(ui.entity, TransformComponent, {
    position: new Vector3(),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })

  return ui
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

const GolfScorecardView = () => {
  return (
    <div id="scorecard">
      <GolfHoles></GolfHoles>
      <GolfPar></GolfPar>
      <GolfScores></GolfScores>
    </div>
  )
}

export const GolfScorecardUISystem = async () => {
  const ui = createScorecardUI()

  const mat = new Matrix4()

  return defineSystem((world) => {
    return world

    const uiRoot = getComponent(ui.entity, XRUIComponent)
    if (!uiRoot) return world

    const cameraMatrix = Engine.camera.matrix
    const uiTransform = getComponent(ui.entity, TransformComponent)

    uiTransform.position.set(0, 0, -1)
    uiTransform.rotation.set(0, 0, 0, 1)
    uiTransform.scale.setScalar(1)
    mat.compose(uiTransform.position, uiTransform.rotation, uiTransform.scale).premultiply(cameraMatrix)
    mat.decompose(uiTransform.position, uiTransform.rotation, uiTransform.scale)

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
