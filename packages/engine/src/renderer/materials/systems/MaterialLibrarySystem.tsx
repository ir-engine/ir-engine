import { ReactElement, useEffect } from 'react'
import React from 'react'

import { defineActionQueue, getMutableState, removeActionQueue, useState } from '@etherealengine/hyperflux'

import { defineSystem } from '../../../ecs/functions/SystemFunctions'
import { NoiseOffsetSystem } from '../constants/plugins/NoiseOffsetPlugin'
import { registerMaterial, registerMaterialPrototype } from '../functions/MaterialLibraryFunctions'
import { applyMaterialPlugin, removeMaterialPlugin } from '../functions/MaterialPluginFunctions'
import { initializeMaterialLibrary, MaterialLibraryActions, MaterialLibraryState } from '../MaterialLibrary'
import { VegetationPluginSystem } from './VegetationSystem'

const registerMaterialQueue = defineActionQueue(MaterialLibraryActions.RegisterMaterial.matches)
const registerPrototypeQueue = defineActionQueue(MaterialLibraryActions.RegisterPrototype.matches)

const execute = () => {
  for (const action of registerPrototypeQueue()) {
    registerMaterialPrototype(action.$prototype)
  }
  for (const action of registerMaterialQueue()) {
    registerMaterial(action.material, action.src)
  }
}

function MaterialReactor({ materialId }: { materialId: string }) {
  const materialLibrary = useState(getMutableState(MaterialLibraryState))
  const component = materialLibrary.materials[materialId]
  useEffect(() => {
    const material = component.material.value
    component.plugins.value.forEach((plugin) => {
      removeMaterialPlugin(material, plugin)
      applyMaterialPlugin(material, plugin)
    })
  }, [component.plugins])
  return null
}

function PluginReactor({ pluginId }: { pluginId: string }) {
  const materialLibrary = useState(getMutableState(MaterialLibraryState))
  const component = materialLibrary.plugins[pluginId]
  useEffect(() => {
    component.instances.value.forEach((material) => {
      material.needsUpdate = true
    })
  }, [component.parameters])

  return null
}

function reactor(): ReactElement {
  useEffect(() => {
    initializeMaterialLibrary()
    return () => {
      const materialLibraryState = getMutableState(MaterialLibraryState)
      // todo, to make extensible only clear those initialized in initializeMaterialLibrary
      materialLibraryState.materials.set({})
      materialLibraryState.prototypes.set({})
      materialLibraryState.sources.set({})
      materialLibraryState.plugins.set({})
      removeActionQueue(registerMaterialQueue)
      removeActionQueue(registerPrototypeQueue)
    }
  }, [])

  const materialLibrary = useState(getMutableState(MaterialLibraryState))
  const plugins = materialLibrary.plugins
  return (
    <>
      {materialLibrary.materials.keys.map((materialId) => (
        <MaterialReactor materialId={materialId} />
      ))}
      {plugins.keys.map((pluginId) => (
        <PluginReactor pluginId={pluginId} />
      ))}
    </>
  )
}

export const MaterialLibrarySystem = defineSystem({
  uuid: 'ee.engine.scene.MaterialLibrarySystem',
  execute,
  reactor,
  subSystems: [VegetationPluginSystem, NoiseOffsetSystem]
})
