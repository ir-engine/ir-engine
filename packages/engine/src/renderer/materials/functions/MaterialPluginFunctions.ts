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
  addOBCPlugin(material, pluginComponent.plugin.get(NO_PROXY))
  pluginComponent.instances.set([...pluginComponent.instances.value, material])
}

export function removeMaterialPlugin(material: Material, pluginId: string) {
  const materialLibrary = getMutableState(MaterialLibraryState)
  const pluginComponent = materialLibrary.plugins[pluginId]
  removeOBCPlugin(material, pluginComponent.plugin.value)
  material.needsUpdate = true
  pluginComponent.instances.set(pluginComponent.instances.value.filter((item) => item !== material))
}
