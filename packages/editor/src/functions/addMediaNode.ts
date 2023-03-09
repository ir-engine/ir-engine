import { getContentType } from '@etherealengine/common/src/utils/getContentType'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { MediaPrefabs } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { EntityOrObjectUUID, EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { ImageComponent } from '@etherealengine/engine/src/scene/components/ImageComponent'
import { MediaComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { PrefabComponent } from '@etherealengine/engine/src/scene/components/PrefabComponent'
import { ScenePrefabs } from '@etherealengine/engine/src/scene/systems/SceneObjectUpdateSystem'

import { updateProperties } from '../components/properties/Util'
import { EditorControlFunctions } from './EditorControlFunctions'

/**
 * Adds media node from passed url. Type of the media will be detected automatically
 * @param url URL of the passed media
 * @param parent Parent node will be set as parent to newly created node
 * @param before Newly created node will be set before this node in parent's children array
 * @returns Newly created media node
 */
export async function addMediaNode(url: string, parent?: Entity | null, before?: Entity | null) {
  const contentType = (await getContentType(url)) || ''
  const { hostname } = new URL(url)

  let prefabType = ''
  let updateFunc = null! as Function

  let node: Entity | null = null

  if (contentType.startsWith('prefab/')) {
    prefabType = ScenePrefabs.prefab
    updateFunc = () => updateProperties(PrefabComponent, { src: url }, [node!])
  } else if (contentType.startsWith('model/')) {
    prefabType = ScenePrefabs.model
    updateFunc = () => updateProperties(ModelComponent, { src: url }, [node!])
  } else if (contentType.startsWith('video/') || hostname.includes('twitch.tv') || hostname.includes('youtube.com')) {
    prefabType = MediaPrefabs.video
    updateFunc = () => updateProperties(MediaComponent, { paths: [url] }, [node!])
  } else if (contentType.startsWith('image/')) {
    prefabType = ScenePrefabs.image
    updateFunc = () => updateProperties(ImageComponent, { source: url }, [node!])
  } else if (contentType.startsWith('audio/')) {
    prefabType = MediaPrefabs.audio
    updateFunc = () => updateProperties(MediaComponent, { paths: [url] }, [node!])
  } else if (url.includes('.uvol')) {
    prefabType = MediaPrefabs.volumetric
    updateFunc = () => updateProperties(MediaComponent, { paths: [url] }, [node!])
  }

  if (prefabType) {
    node = EditorControlFunctions.createObjectFromPrefab(prefabType, parent, before!)

    if (node) updateFunc()
  }

  return node
}
