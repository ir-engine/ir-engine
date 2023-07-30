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

import {
  Assert,
  CustomEvent,
  Engine,
  EventNode2,
  IGraph,
  NodeConfiguration,
  NodeDescription,
  NodeDescription2,
  Socket
} from '@behave-graph/core'
import { getContentType } from '@etherealengine/common/src/utils/getContentType'
import { PositionalAudioComponent } from '../../../../../audio/components/PositionalAudioComponent'
import { Entity } from '../../../../../ecs/classes/Entity'
import { setComponent } from '../../../../../ecs/functions/ComponentFunctions'
import { ImageComponent } from '../../../../../scene/components/ImageComponent'
import { MediaComponent } from '../../../../../scene/components/MediaComponent'
import { ModelComponent } from '../../../../../scene/components/ModelComponent'
import { PrefabComponent } from '../../../../../scene/components/PrefabComponent'
import { VideoComponent } from '../../../../../scene/components/VideoComponent'
import { VolumetricComponent } from '../../../../../scene/components/VolumetricComponent'
import { addEntityToScene } from '../helper/entityHelper'

async function addMediaComponent(url: string, parent?: Entity | null, before?: Entity | null) {
  const contentType = (await getContentType(url)) || ''
  const { hostname } = new URL(url)

  let componentName: string | null = null
  let updateFunc = null! as Function

  let node: Entity | null = null

  if (contentType.startsWith('prefab/')) {
    componentName = PrefabComponent.name
    updateFunc = () => setComponent(node!, PrefabComponent, { src: url })
  } else if (contentType.startsWith('model/')) {
    componentName = ModelComponent.name
    updateFunc = () => setComponent(node!, ModelComponent, { src: url })
  } else if (contentType.startsWith('video/') || hostname.includes('twitch.tv') || hostname.includes('youtube.com')) {
    componentName = VideoComponent.name
    updateFunc = () => setComponent(node!, MediaComponent, { paths: [url] })
  } else if (contentType.startsWith('image/')) {
    componentName = ImageComponent.name
    updateFunc = () => setComponent(node!, ImageComponent, { source: url })
  } else if (contentType.startsWith('audio/')) {
    componentName = PositionalAudioComponent.name
    updateFunc = () => setComponent(node!, MediaComponent, { paths: [url] })
  } else if (url.includes('.uvol')) {
    componentName = VolumetricComponent.name
    updateFunc = () => setComponent(node!, MediaComponent, { paths: [url] })
  }

  if (componentName) {
    node = addEntityToScene(componentName, parent, before)

    if (node) updateFunc()
  }

  return node
}

export class onLoadAsset extends EventNode2 {
  public static Description = new NodeDescription2({
    typeName: 'engine/onLoadAsset',
    category: 'Event',
    label: 'load asset done',
    configuration: {
      customEventId: {
        valueType: 'string',
        defaultValue: '1'
      }
    },
    factory: (description, graph, configuration) => new onLoadAsset(description, graph, configuration)
  })

  private readonly customEvent: CustomEvent

  constructor(description: NodeDescription, graph: IGraph, configuration: NodeConfiguration) {
    const eventParameters = [
      new Socket('string', 'assetPath'),
      new Socket('vec3', 'initialPosition'),
      new Socket('vec3', 'initialRotation')
    ]
    const customEvent =
      graph.customEvents[configuration.customEventId] ||
      new CustomEvent(configuration.customEventId, configuration.label, eventParameters)
    super({
      description,
      graph,
      outputs: [new Socket('flow', 'flow'), new Socket('entity', 'entity')],
      configuration
    })
    this.customEvent = customEvent
    graph.customEvents[configuration.customEventId] = customEvent
  }
  private onCustomEvent: ((parameters: { [parameter: string]: any }) => void) | undefined = undefined

  init(engine: Engine) {
    Assert.mustBeTrue(this.onCustomEvent === undefined)

    this.onCustomEvent = async (parameters) => {
      const assetPath = parameters['assetPath']
      const node = await addMediaComponent(assetPath)
      this.writeOutput('entity', node)
      engine.commitToNewFiber(this, 'flow')
    }
    this.customEvent.eventEmitter.addListener(this.onCustomEvent)
  }

  dispose(engine: Engine) {
    Assert.mustBeTrue(this.onCustomEvent !== undefined)

    if (this.onCustomEvent !== undefined) {
      this.customEvent.eventEmitter.removeListener(this.onCustomEvent)
    }
  }
}
