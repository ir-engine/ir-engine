// ASYNC - asynchronous evaluation
// also called "delay"

import { AsyncNode, Engine, IGraph, NodeDescription, NodeDescription2, Socket } from '../../../VisualScriptModule'

export class Delay extends AsyncNode {
  public static Description = new NodeDescription2({
    typeName: 'flow/time/delay',
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
    setTimeout(
      () => {
        // check if cancelled
        if (!this.timeoutPending) return
        this.timeoutPending = false
        engine.commitToNewFiber(this, 'flow')
        finished()
      },
      this.readInput<number>('duration') * 1000
    )
  }

  dispose() {
    this.timeoutPending = false
  }
}
