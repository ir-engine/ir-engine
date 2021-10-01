import { State, useState } from '@hookstate/core'
import { useUserState } from '@xrengine/client-core/src/user/store/UserState'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import React from 'react'
import { Matrix4, MathUtils } from 'three'
import { getGolfPlayerNumber } from './functions/golfFunctions'
import { GolfColours } from './GolfGameConstants'
import { GolfState } from './GolfSystem'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

export function createScorecardUI() {
  return createXRUI(GolfScorecardView, GolfState)
}

function getUserById(id: UserId, userState: ReturnType<typeof useUserState>) {
  return userState.layerUsers.find((user) => user.id.value === id)
}

const GolfLabelColumn = () => {
  const userState = useUserState()
  const players = useState(GolfState.players)
  return (
    <div
      id="labels"
      xr-layer="true"
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
        // console.log('PLAYER ' + p.id.value)
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
            {getUserById(p.userId.value, userState)?.name.value || `Player${i}`}
          </div>
        )
      })}
    </div>
  )
}

const GolfScoreBox = (props: { scoreState: State<number | undefined> }) => {
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
      {score ?? '-'}
    </div>
  )
}

const GolfHoleColumn = (props: { hole: number }) => {
  const players = useState(GolfState.players)
  const holeState = useState(GolfState.holes)
  return (
    <div
      className="hole"
      xr-layer="true"
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

export const GolfScorecardUISystem = async (world: World) => {
  const ui = createScorecardUI()

  return () => {
    // return world

    const uiComponent = getComponent(ui.entity, XRUIComponent)
    if (!uiComponent) return world

    const layer = uiComponent.layer
    layer.position.set(0, 0, -0.5)
    layer.quaternion.set(0, 0, 0, 1)
    layer.scale.setScalar(1)
    layer.matrix.compose(layer.position, layer.quaternion, layer.scale).premultiply(Engine.camera.matrixWorld)
    layer.matrix.decompose(layer.position, layer.quaternion, layer.scale)

    const localPlayerNumber = getGolfPlayerNumber(Engine.userId)
    const viewingScorecard = GolfState.players.value[localPlayerNumber]?.viewingScorecard
    // console.log(GolfState.players[localPlayerNumber].viewingScorecard)

    const targetOpacity = viewingScorecard ? 1 : 0
    layer.rootLayer.traverseLayersPreOrder((layer) => {
      layer.contentMesh.material.opacity = MathUtils.lerp(
        layer.contentMesh.material.opacity,
        targetOpacity,
        world.delta * 10
      )
      layer.contentMesh.material.needsUpdate = true
    })

    // uiComponent.layer.querySelector()

    // uiTransform.rotation.copy(cameraTransform.rotation)
    // uiTransform.position.copy(cameraTransform.position)
    // uiTransform.position.z = -10
    // ui.z
    // uiTransform.scale.setScalar(Math.max(1, Engine.camera.position.distanceTo(avatarTransform.position) / 3))
    // uiTransform.position.copy(avatarTransform.position)
    // uiTransform.position.y += avatarHeight + 0.3

    return world
  }
}

const GolfScorecardUI = new Map<Entity, ReturnType<typeof createScorecardUI>>()
