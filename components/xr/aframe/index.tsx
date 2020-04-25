/* eslint-disable no-prototype-builtins */
import playerComp from './player'
import testsphere from './testsphere'
import eaccubeComp from './eaccube'
import playerVrUiComp from './player-vr-ui'
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
  playerComp,
  testsphere,
  eaccubeComp,
  playerVrUiComp
]

function RegisterComponentSystem(compsys: ComponentSystem) : void {
  console.log('RegisterComponentSystem', compsys.name)
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
