import { Engine } from '../../../Execution/Engine'
import { IGraph } from '../../../Graphs/Graph'
import { AsyncNode } from '../../../Nodes/AsyncNode'
import { NodeDescription, NodeDescription2 } from '../../../Nodes/Registry/NodeDescription'
import { Socket } from '../../../Sockets/Socket'

export class Delay extends AsyncNode {
  public static Description = new NodeDescription2({
    typeName: 'time/delay',
    otherTypeNames: ['flow/delay'],
    category: 'Time',
    label: 'Delay',
    factory: (description, graph) => new Delay(description, graph)
  })

  constructor(description: NodeDescription, graph: IGraph) {
    super(
      description,
      graph,
      [new Socket('flow', 'flow'), new Socket('float', 'duration', 1)],
      [new Socket('flow', 'flow')]
    )
  }

  private timeoutPending = false

  triggered(engine: Engine, triggeringSocketName: string, finished: () => void) {
    // if there is a valid timeout running, leave it.
    if (this.timeoutPending) {
      return
    }

    // otherwise start it.
    this.timeoutPending = true
  }

  dispose() {
    this.timeoutPending = false
  }
}
