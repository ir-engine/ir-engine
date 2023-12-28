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

import { getContentType } from '@etherealengine/common/src/utils/getContentType'
import { PositionalAudioComponent } from '@etherealengine/engine/src/audio/components/PositionalAudioComponent'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { ImageComponent } from '@etherealengine/engine/src/scene/components/ImageComponent'
import { MediaComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { VideoComponent } from '@etherealengine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@etherealengine/engine/src/scene/components/VolumetricComponent'

import { CameraComponent } from '@etherealengine/engine/src/camera/components/CameraComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineQuery, getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { IntersectObject } from '@etherealengine/engine/src/renderer/materials/MaterialLibrary'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { ObjectLayerComponents } from '@etherealengine/engine/src/scene/components/ObjectLayerComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import { ComponentJsonType } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { getState } from '@etherealengine/hyperflux'
import { Raycaster, Vector2 } from 'three'
import { EditorControlFunctions } from './EditorControlFunctions'

/**
 * Adds media node from passed url. Type of the media will be detected automatically
 * @param url URL of the passed media
 * @param parent Parent node will be set as parent to newly created node
 * @param before Newly created node will be set before this node in parent's children array
 * @returns Newly created media node
 */

export async function addMediaNode(
  url: string,
  parent?: Entity,
  before?: Entity,
  extraComponentJson: ComponentJsonType[] = []
) {
  const contentType = (await getContentType(url)) || ''
  const { hostname } = new URL(url)

  if (contentType.startsWith('model/')) {
    console.log('gltf files')
    if (contentType.startsWith('model/material')) {
      console.log(url)
      EditorControlFunctions.createObjectFromSceneElement(
        [{ name: ModelComponent.jsonID, props: { src: url } }, ...extraComponentJson],
        parent!,
        before
      )
      //find current material
      //const currentmaterial
      console.log('Material files')
      // Swap material of the current model
      const objectLayerQuery = defineQuery([ObjectLayerComponents[ObjectLayers.Scene]])
      const sceneObjects = objectLayerQuery().flatMap((entity) => getComponent(entity, GroupComponent))
      //const sceneObjects = Array.from(Engine.instance.objectLayerList[ObjectLayers.Scene] || [])
      let mouse = new Vector2()
      const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
      const pointerScreenRaycaster = new Raycaster()

      const mouseEvent = event as MouseEvent // Type assertion
      mouse.x = (mouseEvent.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(mouseEvent.clientY / window.innerHeight) * 2 + 1
      pointerScreenRaycaster.setFromCamera(mouse, camera) // Assuming 'camera' is your Three.js camera

      pointerScreenRaycaster.setFromCamera(mouse, camera) // Assuming 'camera' is your Three.js camera

      const intersect = pointerScreenRaycaster.intersectObjects(sceneObjects, true)
      //swap material of intersected object with current material
      const intersected = pointerScreenRaycaster.intersectObjects(sceneObjects)[0]
      const inter = getState(IntersectObject)
      inter.intersected = intersected
      // const materialLibrary = getState(MaterialLibraryState)
      // iterateObject3D(intersected.object, (mesh: Mesh) => {
      //   if (!mesh?.isMesh) return
      //   const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

      //   materials.forEach(material => {
      //     const prototypeId = material.userData.type ?? material.type
      //     const prototype = prototypeFromId(prototypeId)
      //     const parameters = Object.fromEntries(Object.keys(extractDefaults(prototype.arguments)).map((k) => [k, material[k]]))
      //     const col=parameters.color
      //     // parameters.color.r=1.0
      //     // parameters.color.g=0.0
      //     // parameters.color.b=0.0
      //      //material=currentmaterial as Material
      //   })
      // })
    } else {
      EditorControlFunctions.createObjectFromSceneElement(
        [{ name: ModelComponent.jsonID, props: { src: url } }, ...extraComponentJson],
        parent!,
        before
      )
    }
  } else if (contentType.startsWith('video/') || hostname.includes('twitch.tv') || hostname.includes('youtube.com')) {
    EditorControlFunctions.createObjectFromSceneElement(
      [
        { name: VideoComponent.jsonID },
        { name: MediaComponent.jsonID, props: { resources: [url] } },
        ...extraComponentJson
      ],
      parent!,
      before
    )
  } else if (contentType.startsWith('image/')) {
    EditorControlFunctions.createObjectFromSceneElement(
      [{ name: ImageComponent.jsonID, props: { source: url } }, ...extraComponentJson],
      parent!,
      before
    )
  } else if (contentType.startsWith('audio/')) {
    EditorControlFunctions.createObjectFromSceneElement(
      [
        { name: PositionalAudioComponent.jsonID },
        { name: MediaComponent.jsonID, props: { resources: [url] } },
        ...extraComponentJson
      ],
      parent!,
      before
    )
  } else if (url.includes('.uvol')) {
    EditorControlFunctions.createObjectFromSceneElement(
      [
        { name: VolumetricComponent.jsonID },
        { name: MediaComponent.jsonID, props: { resources: [url] } },
        ...extraComponentJson
      ],
      parent!,
      before
    )
  }
}
