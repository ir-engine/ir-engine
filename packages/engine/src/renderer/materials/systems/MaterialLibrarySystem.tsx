/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { ReactElement, useEffect } from 'react'

import { getMutableState, useState } from '@etherealengine/hyperflux'

import { defineSystem } from '../../../ecs/functions/SystemFunctions'
import { NoiseOffsetSystem } from '../constants/plugins/NoiseOffsetPlugin'
import { applyMaterialPlugin, removeMaterialPlugin } from '../functions/MaterialPluginFunctions'
import { initializeMaterialLibrary, MaterialLibraryState } from '../MaterialLibrary'

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
    }
  }, [])

  const materialLibrary = useState(getMutableState(MaterialLibraryState))
  const plugins = materialLibrary.plugins
  return (
    <>
      {materialLibrary.materials.keys.map((materialId) => (
        <MaterialReactor key={materialId} materialId={materialId} />
      ))}
      {plugins.keys.map((pluginId) => (
        <PluginReactor pluginId={pluginId} key={pluginId} />
      ))}
    </>
  )
}

export const MaterialLibrarySystem = defineSystem({
  uuid: 'ee.engine.scene.MaterialLibrarySystem',
  reactor,
  subSystems: [NoiseOffsetSystem]
})
