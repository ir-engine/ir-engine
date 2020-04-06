
// import testcomp from './testcomp'
import testsphere from './testsphere'
import AFRAME from 'aframe'
import React from 'react'

type ComponentSystem = {
  name: string,
  system?: AFRAME.SystemDefinition,
  component?: AFRAME.ComponentDefinition,
  primitive?: AFRAME.PrimitiveDefinition
}

const ComponentSystemArray: ComponentSystem[] = [
  // testcomp,
  testsphere
]

function RegisterComponetSystem(compsys: ComponentSystem) : void {
  if (compsys.system) AFRAME.registerSystem(compsys.name, compsys.system)
  if (compsys.component) AFRAME.registerComponent(compsys.name, compsys.component)
  if (compsys.primitive) AFRAME.registerPrimitive('a-' + compsys.name, compsys.primitive)
}
export default class AframeComponentRegisterer extends React.Component {
  constructor(args: any) {
    super(args)
    ComponentSystemArray.forEach((compsys) => RegisterComponetSystem(compsys))
  }

  render() {
    return ''
  }
}
