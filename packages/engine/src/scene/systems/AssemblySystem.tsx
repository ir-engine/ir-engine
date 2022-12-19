import React, { useEffect } from 'react'

import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getComponent, hasComponent, useComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import { startQueryReactor } from '../../ecs/functions/SystemFunctions'
import { AssemblyComponent, LoadState } from '../components/AssemblyComponent'

export default async function AssemblySystem(world: World) {
  const execute = () => {}
  const queryReactor = startQueryReactor([AssemblyComponent], function (props) {
    const entity = props.root.entity
    if (!hasComponent(entity, AssemblyComponent)) throw props.root.stop()
    const assembly = getComponent(entity, AssemblyComponent)
    const assemblyState = useComponent(entity, AssemblyComponent)

    useEffect(() => {
      switch (assembly.loaded) {
        case LoadState.LOADED:
        case LoadState.LOADING:
          assemblyState.dirty.set(true)
          break
      }
    }, [assemblyState.src])

    useEffect(() => {
      switch (assembly.loaded) {
        case LoadState.LOADED:
        case LoadState.UNLOADED:
          assemblyState.dirty.set(false)
      }
    }, [assemblyState.loaded])

    return <></>
  })
  const cleanup = async () => {
    queryReactor.stop()
  }

  return { execute, cleanup }
}
