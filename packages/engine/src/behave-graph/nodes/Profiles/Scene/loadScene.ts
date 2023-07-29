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

import { Group } from 'three'
import { DRACOLoader } from '../../../../assets/loaders/gltf/DRACOLoader'
import { GLTF, GLTFLoader } from '../../../../assets/loaders/gltf/GLTFLoader'

import { IScene } from './Abstractions/IScene'
import { ObjectMap, buildScene } from './buildScene'

// Taken from react-three-fiber
// Collects nodes and materials from a THREE.Object3D
export function buildGraph(object: Group) {
  const data: ObjectMap = { nodes: {}, materials: {} }
  if (object) {
    object.traverse((obj: any) => {
      if (obj.name) data.nodes[obj.name] = obj
      if (obj.material && !data.materials[obj.material.name]) data.materials[obj.material.name] = obj.material
    })
  }
  return data
}

type ThreeSceneReturn = {
  scene: IScene
  gltf: GLTF & ObjectMap
}

/**
 * Loads a gltf, and corresponding IScene from a url
 * @param url
 * @param onProgress invoked on progress of loading the gltf
 * @returns
 */
export const loadGltfAndBuildScene = (
  url: string,
  onProgress?: (progress: number) => void
): Promise<ThreeSceneReturn> => {
  const loader = new GLTFLoader()

  // Optional: Provide a DRACOLoader instance to decode compressed mesh data
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.3/')
  loader.setDRACOLoader(dracoLoader)

  // Load a glTF resource

  // eslint-disable-next-line promise/avoid-new
  const result = new Promise<ThreeSceneReturn>((resolve, reject) => {
    loader.load(
      // resource URL
      url,
      // called when the resource is loaded
      function (gltf) {
        Object.assign(gltf, buildGraph(gltf.scene))
        const asObjectMap = gltf as GLTF & ObjectMap

        const scene = buildScene({
          gltf: asObjectMap,
          setOnClickListeners: undefined,
          setActiveAnimations: undefined
        })

        resolve({
          scene,
          gltf: asObjectMap
        })
      },
      // called while loading is progressing
      function (xhr) {
        const progress = (xhr.loaded / xhr.total) * 100
        if (onProgress) onProgress(progress)
      },
      // called when loading has errors
      function (error) {
        reject(error)
      }
    )
  })

  return result
}
