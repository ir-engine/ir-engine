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
  AsyncNode,
  Easing,
  EasingFunctions,
  EasingModes,
  IGraph,
  NodeDescription,
  Socket,
  toCamelCase,
  VisualScriptEngine
} from '../../../../VisualScriptModule'
import { ILifecycleEventEmitter } from '../../../ProfilesModule'
import { IScene } from '../../abstractions/IScene'

export class EaseSceneProperty extends AsyncNode {
  public static GetDescriptions(
    scene: IScene,
    lifecycleEventEmitter: ILifecycleEventEmitter,
    ...valueTypeNames: string[]
  ) {
    return valueTypeNames.map(
      (valueTypeName) =>
        new NodeDescription(
          `scene/ease/${valueTypeName}`,
          'Action',
          `Ease Scene ${toCamelCase(valueTypeName)}`,
          (description, graph) => new EaseSceneProperty(description, graph, valueTypeName, scene, lifecycleEventEmitter)
        )
    )
  }

  constructor(
    description: NodeDescription,
    graph: IGraph,
    public readonly valueTypeName: string,
    private readonly scene: IScene,
    private readonly lifecycleEventEmitter: ILifecycleEventEmitter
  ) {
    super(
      description,
      graph,
      [
        new Socket('flow', 'flow'),
        new Socket('string', 'jsonPath'),
        new Socket(valueTypeName, 'value'),
        new Socket('string', 'easingFunction', 'linear', undefined, Object.keys(EasingFunctions)),
        new Socket('string', 'easingMode', 'inOut', undefined, Object.keys(EasingModes)),
        new Socket('float', 'easeDuration'),
        new Socket('flow', 'cancel')
      ],
      [new Socket('flow', 'flow')]
    )
  }

  private initialValue: any = undefined
  private targetValue: any = undefined
  private duration = 0
  private elapsedDuration = 0
  private easing: Easing = EasingFunctions['linear']
  private startTime = 0
  private onTick: (() => void) | undefined = undefined

  triggered(engine: VisualScriptEngine, triggeringSocketName: string, finished: () => void) {
    if (triggeringSocketName === 'cancel') {
      this.dispose()
      finished()
      return
    }

    // if existing ease in progress, do nothing
    if (this.elapsedDuration >= this.duration) {
      return
    }

    this.initialValue = this.scene.getProperty(this.readInput('jsonPath'), this.valueTypeName)
    this.targetValue = this.readInput('value')
    this.duration = this.readInput<number>('duration')
    this.elapsedDuration = 0
    this.startTime = Date.now()

    const easingFunction = EasingFunctions[this.readInput('easingFunction') as string]
    const easingMode = EasingModes[this.readInput('easingMode') as string]
    this.easing = easingMode(easingFunction)

    const updateOnTick = () => {
      const valueType = this.graph.values[this.valueTypeName]
      this.elapsedDuration = (Date.now() - this.startTime) / 1000

      const t = Math.min(this.elapsedDuration / this.duration, 1)
      const easedValue = valueType.lerp(this.initialValue, this.targetValue, this.easing(t))

      this.scene.setProperty(this.readInput('jsonPath'), this.valueTypeName, easedValue)

      if (this.elapsedDuration >= this.duration) {
        this.dispose()
        engine.commitToNewFiber(this, 'flow')
        finished()
      }
    }

    this.onTick = updateOnTick
    this.lifecycleEventEmitter.tickEvent.addListener(this.onTick)
  }

  dispose() {
    this.elapsedDuration = this.duration = 0
    if (this.onTick !== undefined) {
      this.lifecycleEventEmitter.tickEvent.removeListener(this.onTick)
      this.onTick = undefined
    }
  }
}
