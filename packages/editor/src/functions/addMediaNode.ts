import { getContentType } from '@xrengine/common/src/utils/getContentType'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { MediaPrefabs } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { createEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { AssetComponent } from '@xrengine/engine/src/scene/components/AssetComponent'
import { ImageComponent } from '@xrengine/engine/src/scene/components/ImageComponent'
import { LinkComponent } from '@xrengine/engine/src/scene/components/LinkComponent'
import { MediaComponent } from '@xrengine/engine/src/scene/components/MediaComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { ScenePrefabs } from '@xrengine/engine/src/scene/systems/SceneObjectUpdateSystem'

import { executeCommandWithHistory, setPropertyOnEntityNode } from '../classes/History'
import EditorCommands from '../constants/EditorCommands'

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

  if (contentType.startsWith('asset/')) {
    prefabType = ScenePrefabs.asset
    updateFunc = () =>
      setPropertyOnEntityNode(
        {
          affectedNodes: [node],
          component: AssetComponent,
          properties: [{ path: url }]
        },
        false
      )
  } else if (contentType.startsWith('model/')) {
    prefabType = ScenePrefabs.model
    updateFunc = () =>
      setPropertyOnEntityNode(
        {
          affectedNodes: [node],
          component: ModelComponent,
          properties: [{ src: url }]
        },
        false
      )
  } else if (contentType.startsWith('video/') || hostname.includes('twitch.tv') || hostname.includes('youtube.com')) {
    prefabType = MediaPrefabs.video
    updateFunc = () =>
      setPropertyOnEntityNode(
        {
          affectedNodes: [node],
          component: MediaComponent,
          properties: [{ paths: [url] }]
        },
        false
      )
  } else if (contentType.startsWith('image/')) {
    prefabType = ScenePrefabs.image
    updateFunc = () =>
      setPropertyOnEntityNode(
        {
          affectedNodes: [node],
          component: ImageComponent,
          properties: [{ source: url }]
        },
        false
      )
  } else if (contentType.startsWith('audio/')) {
    prefabType = MediaPrefabs.audio
    updateFunc = () =>
      setPropertyOnEntityNode(
        {
          affectedNodes: [node],
          component: MediaComponent,
          properties: [{ paths: [url] }]
        },
        false
      )
  } else if (url.includes('.uvol')) {
    prefabType = MediaPrefabs.volumetric
    updateFunc = () =>
      setPropertyOnEntityNode(
        {
          affectedNodes: [node],
          component: MediaComponent,
          properties: [{ paths: [url] }]
        },
        false
      )
  }

  if (prefabType) {
    executeCommandWithHistory({
      type: EditorCommands.ADD_OBJECTS,
      affectedNodes: [node],
      prefabTypes: [prefabType],
      parents: parent ? [parent] : undefined,
      befores: before ? [before] : undefined
    })

    updateFunc()
  }

  return node
}
