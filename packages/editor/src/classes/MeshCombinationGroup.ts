import { BufferGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, SkinnedMesh, Texture } from 'three'
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

  if (
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
    a.lightMapIntensity === b.lightMapIntensity
  ) {
    return Promise.all([
      compareTextures(imageHashes, a.lightMap, b.lightMap),
      compareTextures(imageHashes, a.map, b.map)
    ]).then((results) => {
      for (let i = 0; i < results.length; i++) {
        if (!results[i]) return false
      }

      return true
    })
  }

  return false
}

async function meshStandardMaterialComparator(
  group: MeshCombinationGroup,
  a: MeshStandardMaterial,
  b: MeshStandardMaterial
) {
  const imageHashes = group.imageHashes

  if (
    a.roughness === b.roughness &&
    a.metalness === b.metalness &&
    a.aoMapIntensity === b.aoMapIntensity &&
    a.normalScale.equals(b.normalScale) &&
    a.emissive.equals(b.emissive)
  ) {
    return Promise.all([
      meshBasicMaterialComparator(group, a as any, b as any),
      compareTextures(imageHashes, a.roughnessMap, b.roughnessMap),
      compareTextures(imageHashes, a.metalnessMap, b.metalnessMap),
      compareTextures(imageHashes, a.aoMap, b.aoMap),
      compareTextures(imageHashes, a.normalMap, b.normalMap),
      compareTextures(imageHashes, a.emissiveMap, b.emissiveMap)
    ]).then((results) => {
      for (let i = 0; i < results.length; i++) {
        if (!results[i]) return false
      }

      return true
    })
  }

  return false
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
    rootObject.traverse((object) => {
      if (object.parent && !object.parent.visible) {
        object.visible = false
      }
    })

    const meshCombinationGroups = [] as MeshCombinationGroup[]
    const imageHashes = new Map<string, string>()
    const textureCache = new Map<string, Texture>()

    const materials = collectUniqueMaterials(rootObject as Mesh)
    const matPromises = [] as Promise<Texture | null>[]

    for (const material of materials as MeshStandardMaterial[]) {
      matPromises.push(
        dedupeTexture(imageHashes, textureCache, material.map).then((texture) => (material.map = texture)),
        dedupeTexture(imageHashes, textureCache, material.roughnessMap).then(
          (texture) => (material.roughnessMap = texture)
        ),
        dedupeTexture(imageHashes, textureCache, material.metalnessMap).then(
          (texture) => (material.metalnessMap = texture)
        ),
        dedupeTexture(imageHashes, textureCache, material.aoMap).then((texture) => (material.aoMap = texture)),
        dedupeTexture(imageHashes, textureCache, material.normalMap).then((texture) => (material.normalMap = texture)),
        dedupeTexture(imageHashes, textureCache, material.emissiveMap).then(
          (texture) => (material.emissiveMap = texture)
        ),
        dedupeTexture(imageHashes, textureCache, material.lightMap).then((texture) => (material.lightMap = texture))
      )
    }

    await Promise.all(matPromises)

    await asyncTraverse(rootObject, async (object: Mesh) => {
      if (object.isMesh) {
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
