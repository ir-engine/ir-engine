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

import { Material } from 'three'

import { getMutableState, NO_PROXY, none } from '@etherealengine/hyperflux'

import { addOBCPlugin, removeOBCPlugin } from '../../../common/functions/OnBeforeCompilePlugin'
import { MaterialPluginType } from '../components/MaterialPluginComponent'
import { MaterialLibraryState } from '../MaterialLibrary'
import { addMaterialSource, getSourceItems, hashMaterialSource } from './MaterialLibraryFunctions'

export function registerMaterialPlugin(component: MaterialPluginType) {
  const materialLibrary = getMutableState(MaterialLibraryState)
  const src = component.src
  addMaterialSource(src)
  const srcItems = getSourceItems(src)!
  !srcItems.includes(component.plugin.id) &&
    materialLibrary.sources[hashMaterialSource(component.src)].entries.set([...srcItems, component.plugin.id])
  materialLibrary.plugins[component.plugin.id].set(component)
}

export function unregisterMaterialPlugin(component: MaterialPluginType) {
  const materialLibrary = getMutableState(MaterialLibraryState)
  const srcItems = getSourceItems(component.src)!
  materialLibrary.sources[component.plugin.id].entries.set(srcItems.filter((item) => item !== component.plugin.id))
  materialLibrary.plugins[component.plugin.id].set(none)
}

export function applyMaterialPlugin(material: Material, pluginId: string) {
  const materialLibrary = getMutableState(MaterialLibraryState)
  const pluginComponent = materialLibrary.plugins[pluginId]
  if (!pluginComponent.plugin.value) {
    console.warn('Unsupported material plugin ' + pluginId)
    return
  }
  addOBCPlugin(material, pluginComponent.plugin.get(NO_PROXY))
}

export function removeMaterialPlugin(material: Material, pluginId: string) {
  const materialLibrary = getMutableState(MaterialLibraryState)
  const pluginComponent = materialLibrary.plugins[pluginId].value
  if (!pluginComponent) return
  removeOBCPlugin(material, pluginComponent.plugin)
  material.needsUpdate = true
}
