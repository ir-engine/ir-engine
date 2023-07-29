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

import { CustomEvent } from '../../../Events/CustomEvent'
import { Fiber } from '../../../Execution/Fiber'
import { IGraph } from '../../../Graphs/Graph'
import { FlowNode2 } from '../../../Nodes/FlowNode'
import { NodeConfiguration } from '../../../Nodes/Node'
import { NodeDescription, NodeDescription2 } from '../../../Nodes/Registry/NodeDescription'
import { Socket } from '../../../Sockets/Socket'
export class triggerLoadAsset extends FlowNode2 {
  public static Description = new NodeDescription2({
    typeName: 'engine/loadAsset',
    category: 'Action',
    label: 'load asset',
    configuration: {
      customEventId: {
        valueType: 'string',
        defaultValue: '1'
      }
    },
    factory: (description, graph, configuration) => new triggerLoadAsset(description, graph, configuration)
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
      inputs: [new Socket('flow', 'flow'), ...eventParameters],
      outputs: [new Socket('flow', 'flow')],
      configuration
    })

    this.customEvent = customEvent
    graph.customEvents[configuration.customEventId] = customEvent
  }

  triggered(fiber: Fiber, triggeringSocketName: string) {
    const parameters: { [parameterName: string]: any } = {
      assetPath: 'string',
      initialPosition: 'vec3',
      initialRotation: 'vec3',
      isAvatar: 'boolean',
      entity: 'entity'
    }
    this.customEvent.parameters.forEach((parameterSocket) => {
      parameters[parameterSocket.name] = this.readInput(parameterSocket.name)
    })
    this.customEvent.eventEmitter.emit(parameters)
    fiber.commit(this, 'flow')
  }
}
