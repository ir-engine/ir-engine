import { useState } from '@hookstate/core'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import React from 'react'
import { MathUtils } from 'three'
import { getGolfPlayerNumber, getGolfPlayerState } from './functions/golfFunctions'
import { GolfState, useGolfState } from './GolfSystem'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

const strokeToParScore = {
  '-4': 'Condor',
  '-3': 'Albatross',
  '-2': 'Eagle',
  '-1': 'Birdie',
  '0': 'Par',
  '1': 'Bogey',
  '2': 'Double Bogey',
  '3': 'Triple Bogey'
}

const GolfCourseScoreView = () => {
  const playerState = getGolfPlayerState()
  const scores = playerState ? playerState.scores.value : []
  const currentCourseScore = scores[scores.length - 1] || 0
  const parScore = strokeToParScore[currentCourseScore]
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
          backgroundColor: '#000000dd',
          border: '8px solid #FFFFFF',
          boxSizing: 'border-box',
          boxShadow: '#fff2 0 0 30px',
          borderRadius: '60px',
          margin: '80px',
          fontFamily: 'Racing Sans One',
          fontStyle: 'normal',
          fontWeight: 'normal'
        }}
      >
        {parScore}
      </div>
    </>
  )
}

export const GolfCourseScoreUISystem = async (world: World) => {
  const ui = createXRUI(GolfCourseScoreView, GolfState)

  return () => {
    const uiComponent = getComponent(ui.entity, XRUIComponent)
    if (!uiComponent) return world

    const layer = uiComponent.layer
    layer.position.set(0, 0, -0.5)
    layer.quaternion.set(0, 0, 0, 1)
    layer.scale.setScalar(1)
    layer.matrix.compose(layer.position, layer.quaternion, layer.scale).premultiply(Engine.camera.matrixWorld)
    layer.matrix.decompose(layer.position, layer.quaternion, layer.scale)

    const localPlayerNumber = getGolfPlayerNumber()
    const viewingCourseScore = GolfState.players[localPlayerNumber]?.viewingCourseScore.value

    // todo: stop displaying after some amount of time
    const targetOpacity = viewingCourseScore ? 1 : 0
    layer.rootLayer.traverseLayersPreOrder((layer) => {
      layer.contentMesh.material.opacity = MathUtils.lerp(
        layer.contentMesh.material.opacity,
        targetOpacity,
        world.delta * 10
      )
      layer.contentMesh.material.needsUpdate = true
    })

    return world
  }
}
