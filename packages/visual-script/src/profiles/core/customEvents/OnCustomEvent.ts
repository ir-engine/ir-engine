/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import {
  Assert,
  CustomEvent,
  EventNode2,
  IGraph,
  NodeConfiguration,
  NodeDescription,
  NodeDescription2,
  Socket,
  VisualScriptEngine
} from '../../../VisualScriptModule'

export class OnCustomEvent extends EventNode2 {
  public static Description = new NodeDescription2({
    typeName: 'customEvent/onTriggered',
    category: 'Event',
    label: 'On Triggered',
    configuration: {
      customEventId: {
        valueType: 'string',
        defaultValue: '-1'
      }
    },
    factory: (description, graph, configuration) => new OnCustomEvent(description, graph, configuration)
  })

  private readonly customEvent: CustomEvent

  constructor(description: NodeDescription, graph: IGraph, configuration: NodeConfiguration) {
    const customEvent = graph.customEvents[configuration.customEventId] || new CustomEvent('-1', 'undefined')
    super({
      description,
      graph,
      outputs: [
        new Socket('flow', 'flow'),
        ...customEvent.parameters.map(
          (parameter) => new Socket(parameter.valueTypeName, parameter.name, parameter.value, parameter.label)
        )
      ],
      configuration
    })
    this.customEvent = customEvent
    graph.customEvents[configuration.customEventId] = customEvent
  }
  private onCustomEvent: ((parameters: { [parameter: string]: any }) => void) | undefined = undefined

  init(engine: VisualScriptEngine) {
    Assert.mustBeTrue(this.onCustomEvent === undefined)

    this.onCustomEvent = (parameters) => {
      this.customEvent.parameters.forEach((parameterSocket) => {
        if (!(parameterSocket.name in parameters)) {
          throw new Error(
            `parameters of custom event do not align with parameters of custom event node, missing ${parameterSocket.name}`
          )
        }
        this.writeOutput(parameterSocket.name, parameters[parameterSocket.name])
      })
      engine.commitToNewFiber(this, 'flow')
    }
    this.customEvent.eventEmitter.addListener(this.onCustomEvent)
  }

  dispose(engine: VisualScriptEngine) {
    Assert.mustBeTrue(this.onCustomEvent !== undefined)

    if (this.onCustomEvent !== undefined) {
      this.customEvent.eventEmitter.removeListener(this.onCustomEvent)
    }
  }
}
