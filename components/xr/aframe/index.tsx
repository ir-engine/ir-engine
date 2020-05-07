/* eslint-disable no-prototype-builtins */
import arrowComp from './arrow'
import clickableComp from './clickable'
import eaccubeComp from './eaccube'
import gridComp from './grid'
import gridCellComp from './grid-cell'
import mediaCellComp from './media-cell'
import playerComp from './player'
import playerVrUiComp from './video-player-vr-ui'
import videoDetails from './video-details'

import AFRAME from 'aframe'
import React from 'react'

type ComponentSystem = {
  name: string,
  system?: AFRAME.SystemDefinition,
  component?: AFRAME.ComponentDefinition,
  primitive?: AFRAME.PrimitiveDefinition,
  shader?: AFRAME.ShaderDefinition
}

const ComponentSystemArray: ComponentSystem[] = [
  arrowComp,
  clickableComp,
  eaccubeComp,
  gridComp,
  gridCellComp,
  mediaCellComp,
  playerComp,
  playerVrUiComp,
  videoDetails
]

function RegisterComponentSystem(compsys: ComponentSystem) : void {
  if (compsys.system && !AFRAME.systems.hasOwnProperty(compsys.name)) {
    AFRAME.registerSystem(compsys.name, compsys.system)
  }
  if (compsys.component && !AFRAME.components.hasOwnProperty(compsys.name)) {
    AFRAME.registerComponent(compsys.name, compsys.component)
  }
  if (compsys.primitive && !AFRAME.primitives.primitives.hasOwnProperty('a-' + compsys.name)) {
    AFRAME.registerPrimitive('a-' + compsys.name, compsys.primitive)
  }
  if (compsys.shader && !AFRAME.shaders.hasOwnProperty(compsys.name)) {
    AFRAME.registerShader(compsys.name, compsys.shader)
  }
}
export default class AframeComponentRegisterer extends React.Component {
  constructor(args: any) {
    super(args)
    ComponentSystemArray.forEach((compsys) => {
      RegisterComponentSystem(compsys)
    })
  }

  render() {
    return ''
  }
}
