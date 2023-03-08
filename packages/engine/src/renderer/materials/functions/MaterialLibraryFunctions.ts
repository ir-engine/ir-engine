import { Color, Material, Mesh, Texture } from 'three'

import { dispatchAction, getMutableState, none } from '@etherealengine/hyperflux'

import { stringHash } from '../../../common/functions/MathFunctions'
import { Engine } from '../../../ecs/classes/Engine'
import { MaterialComponentType } from '../components/MaterialComponent'
import { MaterialPrototypeComponentType } from '../components/MaterialPrototypeComponent'
import { MaterialSource, MaterialSourceComponentType } from '../components/MaterialSource'
import { LibraryEntryType } from '../constants/LibraryEntry'
import { getMaterialLibrary, MaterialLibraryActions } from '../MaterialLibrary'

export function MaterialNotFoundError(message) {
  this.name = 'MaterialNotFound'
  this.message = message
}

export function extractDefaults(defaultArgs) {
  return formatMaterialArgs(
    Object.fromEntries(Object.entries(defaultArgs).map(([k, v]: [string, any]) => [k, v.default])),
    defaultArgs
  )
}

export function injectDefaults(defaultArgs, values) {
  return Object.fromEntries(
    Object.entries(defaultArgs).map(([k, v]: [string, any]) => [k, { ...v, default: values[k] }])
  )
}

export function formatMaterialArgs(args, defaultArgs: any = undefined) {
  if (!args) return args
  return Object.fromEntries(
    Object.entries(args)
      .map(([k, v]: [string, any]) => {
        if (!!defaultArgs && defaultArgs[k]) {
          switch (defaultArgs[k].type) {
            case 'color':
              return [k, v ? ((v as Color).isColor ? v : new Color(v)) : undefined]
          }
        }
        const tex = v as Texture
        if (tex?.isTexture) {
          if (tex.source.data != undefined) {
            return [k, v]
          }
          return [k, undefined]
        }
        if (v === '') return [k, undefined]
        return [k, v]
      })
      .filter(([_, v]) => v !== undefined)
  )
}

export function materialFromId(matId: string): MaterialComponentType {
  const materialLibrary = getMaterialLibrary()
  const material = materialLibrary.materials[matId].get({ noproxy: true })
  if (!material) throw new MaterialNotFoundError('could not find Material with ID ' + matId)
  return material
}

export function prototypeFromId(protoId: string): MaterialPrototypeComponentType {
  const materialLibrary = getMaterialLibrary()
  const prototype = materialLibrary.prototypes[protoId].get({ noproxy: true })
  if (!prototype) throw new Error('could not find Material Prototype for ID ' + protoId)
  return prototype
}

export function materialIdToDefaultArgs(matId: string): Object {
  const material = materialFromId(matId)
  const prototype = prototypeFromId(material.prototype)
  return injectDefaults(prototype.arguments, material.parameters)
}

export function protoIdToFactory(protoId: string): (parms: any) => Material {
  const prototype = prototypeFromId(protoId)
  return (parms) => {
    const defaultParms = extractDefaults(prototype.arguments)
    const formattedParms = { ...defaultParms, ...parms }
    const result = new prototype.baseMaterial(formattedParms)
    if (prototype.onBeforeCompile) {
      result.onBeforeCompile = prototype.onBeforeCompile
      result.needsUpdate = true
    }
    return result
  }
}

export function materialIdToFactory(matId: string): (parms: any) => Material {
  const material = materialFromId(matId)
  const prototype = prototypeFromId(material.prototype)
  return (parms) => {
    const formattedParms = { ...material.parameters, ...parms }
    const result = new prototype.baseMaterial(formattedParms)
    if (prototype.onBeforeCompile) {
      result.onBeforeCompile = prototype.onBeforeCompile
      result.needsUpdate = true
    }
    return result
  }
}

export function materialIdToPrototype(matId: string): MaterialPrototypeComponentType {
  return prototypeFromId(materialFromId(matId).prototype)
}

export function materialToDefaultArgs(material: Material): Object {
  return materialIdToDefaultArgs(material.uuid)
}

export function hashMaterialSource(src: MaterialSource): string {
  return `${stringHash(src.path) ^ stringHash(src.type)}`
}

export function addMaterialSource(src: MaterialSource): boolean {
  const materialLibrary = getMaterialLibrary()
  const srcId = hashMaterialSource(src)
  if (!materialLibrary.sources[srcId].value) {
    materialLibrary.sources[srcId].set({ src, entries: [] })
    return true
  } else return false
}

export function getSourceMaterials(src: MaterialSource): string[] | undefined {
  const materialLibrary = getMaterialLibrary()
  return materialLibrary.sources[hashMaterialSource(src)].value?.entries
}

export function removeMaterialSource(src: MaterialSource): boolean {
  const materialLibrary = getMaterialLibrary()
  const srcId = hashMaterialSource(src)
  if (materialLibrary.sources[srcId].value) {
    const srcComp = materialLibrary.sources[srcId].value
    srcComp.entries.map((matId) => {
      const toDelete = materialFromId(matId)
      Object.values(toDelete.parameters)
        .filter((val) => (val as Texture)?.isTexture)
        .map((val: Texture) => val.dispose())
      toDelete.material.dispose()
      materialLibrary.materials[matId].set(none)
    })
    dispatchAction(MaterialLibraryActions.RemoveSource({ src: srcComp.src }))
    materialLibrary.sources[srcId].set(none)

    return true
  } else return false
}

export function registerMaterial(material: Material, src: MaterialSource, params?: { [_: string]: any }) {
  const materialLibrary = getMaterialLibrary()
  const prototype = prototypeFromId(material.userData.type ?? material.type)
  addMaterialSource(src)
  const srcMats = getSourceMaterials(src)!
  !srcMats.includes(material.uuid) &&
    materialLibrary.sources[hashMaterialSource(src)].entries.set([
      ...materialLibrary.sources[hashMaterialSource(src)].entries.value,
      material.uuid
    ])
  const parameters =
    params ?? Object.fromEntries(Object.keys(extractDefaults(prototype.arguments)).map((k) => [k, material[k]]))
  materialLibrary.materials[material.uuid].set({
    material,
    parameters,
    prototype: prototype.prototypeId,
    src
  })
}

export function unregisterMaterial(material: Material) {
  const materialLibrary = getMaterialLibrary()
  try {
    const matEntry = materialFromId(material.uuid)
    materialLibrary.materials[material.uuid].set(none)
    const srcEntry = materialLibrary.sources[hashMaterialSource(matEntry.src)].entries
    srcEntry.set(srcEntry.value.filter((matId) => matId !== material.uuid))
    return matEntry
  } catch (error) {
    if (error instanceof MaterialNotFoundError) {
      console.warn('material is already not registered')
      return undefined
    } else throw error
  }
}

export function registerMaterialPrototype(prototype: MaterialPrototypeComponentType) {
  const materialLibrary = getMaterialLibrary()
  if (!!materialLibrary.prototypes[prototype.prototypeId].value) {
    console.warn(
      'overwriting existing material prototype!\nnew:',
      prototype.prototypeId,
      '\nold:',
      prototypeFromId(prototype.prototypeId)
    )
  }
  materialLibrary.prototypes[prototype.prototypeId].set(prototype)
}

export function materialsFromSource(src: MaterialSource) {
  return getSourceMaterials(src)?.map(materialFromId)
}

export function changeMaterialPrototype(material: Material, protoId: string) {
  const materialEntry = materialFromId(material.uuid)
  if (materialEntry.prototype === protoId) return

  const prototype = prototypeFromId(protoId)

  const factory = protoIdToFactory(protoId)
  const matKeys = Object.keys(material)
  const commonParms = Object.fromEntries(
    Object.keys(prototype.arguments)
      .filter((key) => matKeys.includes(key))
      .map((key) => [key, material[key]])
  )
  const fullParms = { ...extractDefaults(prototype.arguments), ...commonParms }
  const nuMat = factory(fullParms)
  Engine.instance.scene.traverse((mesh: Mesh) => {
    if (!mesh?.isMesh) return
    if (Array.isArray(mesh.material)) {
      mesh.material.map((meshMat, i) => {
        if (material.uuid === meshMat.uuid) {
          mesh.material[i] = nuMat
        }
      })
    } else {
      if (mesh.material.uuid === material.uuid) {
        mesh.material = nuMat
      }
    }
  })
  nuMat.uuid = material.uuid
  nuMat.name = material.name
  if (material.defines?.['USE_COLOR']) {
    nuMat.defines = nuMat.defines ?? {}
    nuMat.defines!['USE_COLOR'] = material.defines!['USE_COLOR']
  }
  nuMat.userData = {
    ...nuMat.userData,
    ...Object.fromEntries(Object.entries(material.userData).filter(([k, v]) => k !== 'type'))
  }
  registerMaterial(nuMat, materialEntry.src)
  return nuMat
}

export function entryId(
  entry: MaterialComponentType | MaterialPrototypeComponentType | MaterialSourceComponentType,
  type: LibraryEntryType
) {
  switch (type) {
    case LibraryEntryType.MATERIAL:
      return (entry as MaterialComponentType).material.uuid
    case LibraryEntryType.MATERIAL_PROTOTYPE:
      return (entry as MaterialPrototypeComponentType).prototypeId
    case LibraryEntryType.MATERIAL_SOURCE:
      return hashMaterialSource((entry as MaterialSourceComponentType).src)
  }
}
