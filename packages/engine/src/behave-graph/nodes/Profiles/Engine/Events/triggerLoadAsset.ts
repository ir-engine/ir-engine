import { CustomEvent } from '../../../Events/CustomEvent.js'
import { Fiber } from '../../../Execution/Fiber.js'
import { IGraph } from '../../../Graphs/Graph'
import { FlowNode2 } from '../../../Nodes/FlowNode.js'
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
