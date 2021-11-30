import { AmbientLight, AnimationClip, DirectionalLight, Object3D, PointLight, Group, Mesh } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { createGLTFLoader } from './createGLTFLoader'
import { instanceGLTF } from './transformGLTF'
import { corsAnywhereUrl } from '@xrengine/client-core/src/util/cors'

/**
 * Interface for result of the GLTF Asset load.
 */
export interface LoadGLTFResultInterface {
  animations: AnimationClip[]
  scene: Object3D | Group | Mesh
  json: any
  stats: any
}
const loader = createGLTFLoader()
export function getLoader(): any {
  return loader
}

export function disposeDracoLoaderWorkers(): void {
  loader.dracoLoader?.dispose()
}

/**
 * Loads an Asset which is in GLTF format.
 *
 * @param url URL of the asset.
 * @returns a promise of {@link LoadGLTFResultInterface}.
 */
export async function LoadGLTF(url: string): Promise<LoadGLTFResultInterface> {
  return await new Promise<LoadGLTFResultInterface>((resolve, reject) => {
    getLoader().load(
      corsAnywhereUrl(url),
      (gltf) => {
        // TODO: Remove me when we add retargeting
        gltf.scene.traverse((o) => {
          o.name = o.name.replace('mixamorig', '')
        })

        loadExtentions(gltf)
        resolve({ animations: gltf.animations, scene: gltf.scene, json: {}, stats: {} })
      },
      null,
      (e) => {
        console.log(e)
        reject(e)
      }
    )
  })
}

/**
 * Loads an Instanced Asset which is in GLTF format and uses EXT_mesh_gpu_instancing extension.
 *
 * @param url URL of the asset.
 * @returns a promise of {@link LoadGLTFResultInterface}.
 */
export async function LoadInstancedGLTF(url: string): Promise<LoadGLTFResultInterface> {
  let buffer = await instanceGLTF(url)
  return await new Promise<LoadGLTFResultInterface>((resolve, reject) => {
    getLoader().parse(
      buffer,
      null,
      (gltf) => {
        // TODO: Remove me when we add retargeting
        gltf.scene.traverse((o) => {
          o.name = o.name.replace('mixamorig', '')
        })

        loadExtentions(gltf)
        resolve({ animations: gltf.animations, scene: gltf.scene, json: {}, stats: {} })
      },
      (e) => {
        console.log(e)
        reject(e)
      }
    )
  })
}

export const loadExtentions = (gltf) => {
  loadLightmaps(gltf.parser)
  loadLights(gltf)
}

const loadLightmaps = (parser) => {
  const loadLightmap = async (materialIndex) => {
    const lightmapDef = parser.json.materials[materialIndex].extensions.MOZ_lightmap
    const [material, lightMap] = await Promise.all([
      parser.getDependency('material', materialIndex),
      parser.getDependency('texture', lightmapDef.index)
    ])
    material.lightMap = lightMap
    material.lightMapIntensity = lightmapDef.intensity !== undefined ? lightmapDef.intensity : 1
    material.needsUpdate = true
    return lightMap
  }
  for (let i = 0; i < parser.json.materials?.length; i++) {
    const materialNode = parser.json.materials[i]

    if (!materialNode.extensions) continue

    if (materialNode.extensions.MOZ_lightmap) {
      loadLightmap(i)
    }
  }
}

// this isn't the best solution. instead we should expose the plugin/extension register in GLTFLoader.js

const loadLights = (gltf) => {
  if (gltf.parser.json?.extensions?.MOZ_hubs_components?.MOZ_hubs_components?.version === 3) {
    const objsToRemove: any[] = []
    gltf.scene.traverse((obj) => {
      if (obj.userData.gltfExtensions && obj.userData.gltfExtensions.MOZ_hubs_components) {
        let replacement
        switch (Object.keys(obj.userData.gltfExtensions.MOZ_hubs_components)[0]) {
          case 'directional-light':
            replacement = _directional(obj)
            break
          case 'point-light':
            replacement = _point(obj)
            break
          case 'ambient-light':
            replacement = _ambient(obj)
            break
          default:
            break
        }
        if (replacement) {
          replacement.position.copy(obj.position)
          replacement.quaternion.copy(obj.quaternion)
          obj.parent.add(replacement)
          objsToRemove.push(obj)
          console.log(replacement)
        }
      }
    })
    for (const obj of objsToRemove) {
      obj.parent.remove(obj)
    }
  }
}

const _shadow = (light, lightData) => {
  if (typeof lightData.castShadow !== 'undefined') light.castShadow = lightData.castShadow
  if (typeof lightData.shadowResolution !== 'undefined')
    light.shadow.mapSize.set(lightData.shadowResolution[0], lightData.shadowResolution[1])
  if (typeof lightData.shadowBias !== 'undefined') light.shadow.bias = lightData.shadowBias
  if (typeof lightData.shadowRadius !== 'undefined') light.shadow.radius = lightData.shadowRadius
}

const _directional = (obj) => {
  if (!Engine.csm) return // currently this breaks CSM
  const lightData = obj.userData.gltfExtensions.MOZ_hubs_components['directional-light']
  const light = new DirectionalLight(lightData.color, lightData.intensity)
  _shadow(light, lightData)
  return light
}

const _point = (obj) => {
  const lightData = obj.userData.gltfExtensions.MOZ_hubs_components['point-light']
  const light = new PointLight(lightData.color, lightData.intensity, lightData.distance, lightData.decay)
  _shadow(light, lightData)
  return light
}

const _ambient = (obj) => {
  const lightData = obj.userData.gltfExtensions.MOZ_hubs_components['ambient-light']
  const light = new AmbientLight(lightData.color, lightData.intensity)
  return light
}
