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

// based on the description here: https://blog.webdevsimplified.com/2022-03/debounce-vs-throttle/

import {
  Assert,
  AsyncNode,
  IGraph,
  NodeCategory,
  NodeDescription,
  Socket,
  VisualScriptEngine
} from '../../../VisualScriptModule'

export class Throttle extends AsyncNode {
  public static Description = new NodeDescription(
    'flow/rate/throttle',
    NodeCategory.Flow,
    'Throttle',
    (description, graph) => new Throttle(description, graph)
  )

  constructor(description: NodeDescription, graph: IGraph) {
    super(
      description,
      graph,
      [new Socket('flow', 'flow'), new Socket('float', 'duration', 1), new Socket('flow', 'cancel')],
      [new Socket('flow', 'flow')]
    )
  }

  private triggerVersion = 0
  private timeoutPending = false

  triggered(engine: VisualScriptEngine, triggeringSocketName: string, finished: () => void) {
    // if cancelling, just increment triggerVersion and do not set a timer. :)
    if (triggeringSocketName === 'cancel') {
      if (this.timeoutPending) {
        this.triggerVersion++
        this.timeoutPending = false
      }
      return
    }

    // if there is a valid timeout running, leave it.
    if (this.timeoutPending) {
      return
    }

    // otherwise start it.
    this.triggerVersion++
    const localTriggerCount = this.triggerVersion
    this.timeoutPending = true
    setTimeout(
      () => {
        if (this.triggerVersion !== localTriggerCount) {
          return
        }
        Assert.mustBeTrue(this.timeoutPending)
        this.timeoutPending = false
        engine.commitToNewFiber(this, 'flow')
        finished()
      },
      this.readInput<number>('duration') * 1000
    )
  }

  dispose() {
    this.triggerVersion++ // equivalent to 'cancel' trigger behavior.
    this.timeoutPending = false
  }
}
