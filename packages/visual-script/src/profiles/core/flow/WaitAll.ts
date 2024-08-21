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

import { Fiber, FlowNode, IGraph, NodeDescription, NodeDescription2, Socket } from '../../../VisualScriptModule'

// this is equivalent to Promise.all()
export class WaitAll extends FlowNode {
  public static Description = new NodeDescription2({
    typeName: 'flow/waitAll',
    category: 'Flow',
    label: 'WaitAll',
    configuration: {
      numInputs: {
        valueType: 'number',
        defaultValue: 3
      }
    },
    factory: (description, graph, configuration) => new WaitAll(description, graph, configuration.numInputs)
  })

  private isOn = true

  constructor(
    description: NodeDescription,
    graph: IGraph,
    private numInputs: number
  ) {
    const inputs: Socket[] = []
    for (let i = 1; i <= numInputs; i++) {
      inputs.push(new Socket('flow', `${i}`))
    }

    super(
      description,
      graph,
      [...inputs, new Socket('flow', 'reset'), new Socket('boolean', 'autoReset')],
      [new Socket('flow', 'flow')]
    )

    this.reset()
  }

  private triggeredMap: { [key: string]: boolean } = {}
  private triggeredCount = 0
  private outputTriggered = false

  private reset() {
    for (let inputIndex = 1; inputIndex <= this.numInputs; inputIndex++) {
      this.triggeredMap[`${inputIndex}`] = false
    }
    this.triggeredCount = 0
    this.outputTriggered = false
  }

  triggered(fiber: Fiber, triggeringSocketName: string) {
    if (triggeringSocketName === 'reset') {
      this.reset()
      return
    }

    if (this.triggeredMap[triggeringSocketName]) {
      return
    }

    this.triggeredMap[triggeringSocketName] = true
    this.triggeredCount++

    // if a & b are triggered, first output!
    if (this.triggeredCount === this.numInputs && !this.outputTriggered) {
      fiber.commit(this, 'flow')
      this.outputTriggered = true

      // auto-reset if required.
      if (this.readInput('autoReset') === true) {
        this.reset()
      }
    }
  }
}
