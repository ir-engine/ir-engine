/* eslint-disable no-prototype-builtins */
import playerComp from './player'
import gridComp from './grid'
import gridCellComp from './grid-cell'
import mediaCellComp from './media-cell'
import AFRAME from 'aframe'
import React from 'react'

type ComponentSystem = {
  name: string,
  system?: AFRAME.SystemDefinition,
  component?: AFRAME.ComponentDefinition,
  primitive?: AFRAME.PrimitiveDefinition
}

const ComponentSystemArray: ComponentSystem[] = [
  playerComp,
  gridComp,
  gridCellComp,
  mediaCellComp
]

function RegisterComponetSystem(compsys: ComponentSystem) : void {
  if (compsys.system && !AFRAME.systems.hasOwnProperty(compsys.name)) {
    AFRAME.registerSystem(compsys.name, compsys.system)
  }
  if (compsys.component && !AFRAME.components.hasOwnProperty(compsys.name)) {
    AFRAME.registerComponent(compsys.name, compsys.component)
  }
  if (compsys.primitive && !AFRAME.primitives.primitives.hasOwnProperty('a-' + compsys.name)) {
    AFRAME.registerPrimitive('a-' + compsys.name, compsys.primitive)
  }
}
export default class AframeComponentRegisterer extends React.Component {
  constructor(args: any) {
    super(args)
    ComponentSystemArray.forEach((compsys) => {
      RegisterComponetSystem(compsys)
    })
  }

  render() {
    return ''
  }
}
