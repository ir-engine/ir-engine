import { getContentType } from '@xrengine/common/src/utils/getContentType'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { MediaPrefabs } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { createEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { ImageComponent } from '@xrengine/engine/src/scene/components/ImageComponent'
import { MediaComponent } from '@xrengine/engine/src/scene/components/MediaComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { PrefabComponent } from '@xrengine/engine/src/scene/components/PrefabComponent'
import { ScenePrefabs } from '@xrengine/engine/src/scene/systems/SceneObjectUpdateSystem'

import { updateProperties } from '../components/properties/Util'
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
  parent?: EntityTreeNode,
  before?: EntityTreeNode
): Promise<EntityTreeNode> {
  let contentType = (await getContentType(url)) || ''
  const { hostname } = new URL(url)

  let node = createEntityNode(createEntity())
  let prefabType = ''
  let updateFunc = null! as Function

  if (contentType.startsWith('prefab/')) {
    prefabType = ScenePrefabs.prefab
    updateFunc = () => updateProperties(PrefabComponent, { src: url }, [node])
  } else if (contentType.startsWith('model/')) {
    prefabType = ScenePrefabs.model
    updateFunc = () => updateProperties(ModelComponent, { src: url }, [node])
  } else if (contentType.startsWith('video/') || hostname.includes('twitch.tv') || hostname.includes('youtube.com')) {
    prefabType = MediaPrefabs.video
    updateFunc = () => updateProperties(MediaComponent, { paths: [url] }, [node])
  } else if (contentType.startsWith('image/')) {
    prefabType = ScenePrefabs.image
    updateFunc = () => updateProperties(ImageComponent, { source: url }, [node])
  } else if (contentType.startsWith('audio/')) {
    prefabType = MediaPrefabs.audio
    updateFunc = () => updateProperties(MediaComponent, { paths: [url] }, [node])
  } else if (url.includes('.uvol')) {
    prefabType = MediaPrefabs.volumetric
    updateFunc = () => updateProperties(MediaComponent, { paths: [url] }, [node])
  }

  if (prefabType) {
    EditorControlFunctions.addObject([node], parent ? [parent] : [], before ? [before] : [], [prefabType], [], true)

    updateFunc()
  }

  return node
}
