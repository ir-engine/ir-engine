import { BufferGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, SkinnedMesh, Texture } from 'three'
import { computeAndSetStaticModes, isStatic } from '../functions/StaticMode'
import asyncTraverse from '../functions/asyncTraverse'
import keysEqual from '../functions/keysEqual'
import hashImage from '../functions/hashImage'
import { collectUniqueMaterials } from '../functions/materials'
import { mergeBufferGeometries } from '@xrengine/engine/src/common/classes/BufferGeometryUtils'

export async function getImageHash(hashCache: Map<string, string>, img: HTMLImageElement): Promise<string> {
  let hash = hashCache.get(img.src)

  if (!hash) {
    hash = await hashImage(img)
    hashCache.set(img.src, hash)
  }

  return hash
}

export async function compareImages(hashCache, a, b) {
  if (a === b) {
    return true
  }

  if (!a || !b) {
    return false
  }

  return (await getImageHash(hashCache, a)) === (await getImageHash(hashCache, b))
}

export async function compareTextures(hashCache, a, b) {
  if (a && b) {
    return (
      a.wrapS === b.wrapS &&
      a.wrapT === b.wrapT &&
      a.magFilter === b.magFilter &&
      a.minFilter === b.minFilter &&
      (await compareImages(hashCache, a.image, b.image))
    )
  }

  return a === b
}

async function meshBasicMaterialComparator(group: MeshCombinationGroup, a: MeshBasicMaterial, b: MeshBasicMaterial) {
  const imageHashes = group.imageHashes

  return (
    a.alphaTest === b.alphaTest &&
    a.blendDst === b.blendDst &&
    a.blendDstAlpha === b.blendDstAlpha &&
    a.blendEquation === b.blendEquation &&
    a.blendEquationAlpha === b.blendEquationAlpha &&
    a.blending === b.blending &&
    a.blendSrc === b.blendSrc &&
    a.blendSrcAlpha === b.blendSrcAlpha &&
    a.opacity === b.opacity &&
    a.side === b.side &&
    a.transparent === b.transparent &&
    a.color.equals(b.color) &&
    a.lightMapIntensity === b.lightMapIntensity &&
    (await compareTextures(imageHashes, a.map, b.map)) &&
    (await compareTextures(imageHashes, a.lightMap, b.lightMap))
  )
}

async function meshStandardMaterialComparator(
  group: MeshCombinationGroup,
  a: MeshStandardMaterial,
  b: MeshStandardMaterial
) {
  const imageHashes = group.imageHashes

  return (
    a.roughness === b.roughness &&
    a.metalness === b.metalness &&
    a.aoMapIntensity === b.aoMapIntensity &&
    a.normalScale.equals(b.normalScale) &&
    a.emissive.equals(b.emissive) &&
    (await meshBasicMaterialComparator(group, a as any, b as any)) &&
    (await compareTextures(imageHashes, a.roughnessMap, b.roughnessMap)) &&
    (await compareTextures(imageHashes, a.metalnessMap, b.metalnessMap)) &&
    (await compareTextures(imageHashes, a.aoMap, b.aoMap)) &&
    (await compareTextures(imageHashes, a.normalMap, b.normalMap)) &&
    (await compareTextures(imageHashes, a.emissiveMap, b.emissiveMap))
  )
}

async function dedupeTexture(
  imageHashes: Map<string, string>,
  textureCache: Map<string, Texture>,
  texture: Texture | null
): Promise<Texture | null> {
  if (!texture || !texture.image) return null

  const imageHash = await getImageHash(imageHashes, texture.image)
  const cachedTexture = textureCache.get(imageHash)

  if (cachedTexture) {
    return cachedTexture
  }

  textureCache.set(imageHash, texture)

  return texture
}

export default class MeshCombinationGroup {
  static MaterialComparators = {
    MeshStandardMaterial: meshStandardMaterialComparator,
    MeshBasicMaterial: meshBasicMaterialComparator
  }
  initialObject: Mesh
  meshes: Mesh[]
  imageHashes: Map<string, string>

  static async combineMeshes(rootObject: Object3D) {
    computeAndSetStaticModes(rootObject)
    rootObject.traverse((object) => {
      if (object.parent && !object.parent.visible) {
        object.visible = false
      }
    })

    const meshCombinationGroups = [] as MeshCombinationGroup[]
    const imageHashes = new Map<string, string>()
    const textureCache = new Map<string, Texture>()

    const materials = collectUniqueMaterials(rootObject as Mesh)

    for (const material of materials as MeshStandardMaterial[]) {
      material.map = await dedupeTexture(imageHashes, textureCache, material.map)
      material.roughnessMap = await dedupeTexture(imageHashes, textureCache, material.roughnessMap)
      material.metalnessMap = await dedupeTexture(imageHashes, textureCache, material.metalnessMap)
      material.aoMap = await dedupeTexture(imageHashes, textureCache, material.aoMap)
      material.normalMap = await dedupeTexture(imageHashes, textureCache, material.normalMap)
      material.emissiveMap = await dedupeTexture(imageHashes, textureCache, material.emissiveMap)
      material.lightMap = await dedupeTexture(imageHashes, textureCache, material.lightMap)
    }

    await asyncTraverse(rootObject, async (object: Mesh) => {
      if (isStatic(object) && object.isMesh) {
        let added = false

        for (const group of meshCombinationGroups) {
          if (await group._tryAdd(object)) {
            added = true
            break
          }
        }

        if (!added) meshCombinationGroups.push(new MeshCombinationGroup(object, imageHashes))
      }
    })

    for (const group of meshCombinationGroups) {
      const combinedMesh = group._combine()

      if (combinedMesh) {
        rootObject.add(combinedMesh)
      }
    }

    return rootObject
  }

  constructor(initialObject: Mesh, imageHashes: Map<string, string>) {
    if (!initialObject.isMesh) {
      throw new Error('MeshCombinationGroup must be initialized with a Mesh.')
    }

    this.initialObject = initialObject
    this.meshes = [initialObject]
    this.imageHashes = imageHashes
  }

  async _tryAdd(object: Mesh): Promise<boolean> {
    if (!object.isMesh || (object as SkinnedMesh).isSkinnedMesh) {
      return false
    }

    if (!object.geometry.isBufferGeometry) {
      return false
    }

    const compareMaterial = MeshCombinationGroup.MaterialComparators[(object.material as any).type]

    if (
      object.visible !== this.initialObject.visible ||
      object.castShadow !== this.initialObject.castShadow ||
      object.receiveShadow !== this.initialObject.receiveShadow ||
      object.userData.gltfExtensions
    ) {
      return false
    }

    if (!(compareMaterial && (await compareMaterial(this, this.initialObject.material, object.material)))) {
      return false
    }

    if (!keysEqual(this.initialObject.geometry.attributes, object.geometry.attributes)) {
      return false
    }

    this.meshes.push(object)

    return true
  }

  _combine(): Mesh | null {
    const originalMesh = this.meshes[0]
    if (this.meshes.length === 1) return null

    const bufferGeometries = [] as BufferGeometry[]

    for (const mesh of this.meshes) {
      // Clone buffer geometry in case it is re-used across meshes with different materials.
      const clonedBufferGeometry = mesh.geometry.clone()

      const matrixWorld = mesh.matrixWorld
      clonedBufferGeometry.applyMatrix4(matrixWorld)

      // TODO: geometry.applyMatrix should handle this
      const hasNegativeScale = matrixWorld.elements[0] * matrixWorld.elements[5] * matrixWorld.elements[10] < 0

      const indices = clonedBufferGeometry.index

      if (hasNegativeScale && indices) {
        for (let i = 0; i < indices.count; i++) {
          indices.setXYZ(i, indices.getX(i), indices.getZ(i), indices.getY(i))
        }
      }

      bufferGeometries.push(clonedBufferGeometry)
      mesh.parent?.remove(mesh)
    }

    const combinedGeometry = mergeBufferGeometries(bufferGeometries)
    if (!combinedGeometry) return null

    delete combinedGeometry.userData.mergedUserData
    const combinedMesh = new Mesh(combinedGeometry, originalMesh.material)
    combinedMesh.name = 'CombinedMesh'
    combinedMesh.userData.gltfExtensions = {
      componentData: {
        visible: {
          visible: originalMesh.visible
        },
        shadow: {
          cast: originalMesh.castShadow,
          receive: originalMesh.receiveShadow
        }
      }
    }

    return combinedMesh
  }
}
