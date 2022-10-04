import { Color, Material, Mesh, Texture } from 'three'

import { dispatchAction } from '@xrengine/hyperflux'

import { stringHash } from '../../../common/functions/MathFunctions'
import { Engine } from '../../../ecs/classes/Engine'
import { MaterialComponentType } from '../components/MaterialComponent'
import { MaterialPrototypeComponentType } from '../components/MaterialPrototypeComponent'
import { MaterialSource, MaterialSourceComponentType } from '../components/MaterialSource'
import { LibraryEntryType } from '../constants/LibraryEntry'
import { MaterialLibrary, MaterialLibraryActions } from '../MaterialLibrary'

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
  const material = MaterialLibrary.materials.get(matId)
  if (!material) throw new Error('could not find Material ' + matId)
  return material
}

export function prototypeFromId(protoId: string): MaterialPrototypeComponentType {
  const prototype = MaterialLibrary.prototypes.get(protoId)
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
  const srcId = hashMaterialSource(src)
  if (!MaterialLibrary.sources.has(srcId)) {
    MaterialLibrary.sources.set(srcId, { src, entries: [] })
    return true
  } else return false
}

export function getSourceMaterials(src: MaterialSource): string[] | undefined {
  return MaterialLibrary.sources.get(hashMaterialSource(src))?.entries
}

export function removeMaterialSource(src: MaterialSource): boolean {
  const srcId = hashMaterialSource(src)
  if (MaterialLibrary.sources.has(srcId)) {
    const srcComp = MaterialLibrary.sources.get(srcId)!
    srcComp.entries.map((matId) => {
      const toDelete = materialFromId(matId)
      Object.values(toDelete.parameters)
        .filter((val) => (val as Texture).isTexture)
        .map((val: Texture) => val.dispose())
      toDelete.material.dispose()
      MaterialLibrary.materials.delete(matId)
    })
    MaterialLibrary.sources.delete(srcId)
    dispatchAction(MaterialLibraryActions.RemoveSource({ src: srcComp.src }))
    return true
  } else return false
}

export function registerMaterial(material: Material, src: MaterialSource, params?: { [_: string]: any }) {
  const prototype = prototypeFromId(material.type)

  addMaterialSource(src)
  getSourceMaterials(src)!.push(material.uuid)

  const parameters =
    params ?? Object.fromEntries(Object.keys(extractDefaults(prototype.arguments)).map((k) => [k, material[k]]))
  MaterialLibrary.materials.set(material.uuid, {
    material,
    parameters,
    prototype: prototype.prototypeId,
    src
  })
}

export function registerMaterialPrototype(prototype: MaterialPrototypeComponentType) {
  if (MaterialLibrary.prototypes.has(prototype.prototypeId)) {
    console.warn(
      'overwriting existing material prototype!\nnew:',
      prototype.prototypeId,
      '\nold:',
      prototypeFromId(prototype.prototypeId)
    )
  }
  MaterialLibrary.prototypes.set(prototype.prototypeId, prototype)
}

export function materialsFromSource(src: MaterialSource) {
  return getSourceMaterials(src)?.map(materialFromId)
}

export function changeMaterialPrototype(material: Material, protoId: string) {
  const materialEntry = materialFromId(material.uuid)
  if (materialEntry.prototype === protoId) return

  const prototype = prototypeFromId(protoId)

  const factory = protoIdToFactory(protoId)
  const commonParms = Object.fromEntries(Object.keys(prototype.arguments).map((key) => [key, material[key]]))
  const fullParms = { ...extractDefaults(prototype.arguments), ...commonParms }
  const nuMat = factory(fullParms)
  Engine.instance.currentWorld.scene.traverse((mesh: Mesh) => {
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
  nuMat.userData = material.userData
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
