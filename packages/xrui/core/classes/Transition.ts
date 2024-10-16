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
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY, State, useImmediateEffect } from '@ir-engine/hyperflux'
import { Easing } from '@tweenjs/tween.js'
import { Quaternion, Vector3 } from 'three'
import { BorderRadius } from '../components/HTMLComponent'

export type TimestampedValue<V> = {
  timestamp: number
  value: V
}

export interface TransitionData<T> {
  buffer: TimestampedValue<T>[]
  current: T
  maxBufferSize: number
  duration: number
  easingFunction: (t: number) => number
  interpolationFunction: (a: T, b: T, t: number, out?: T) => T
}

export const Transition = {
  defineTransition: function <V>(
    config: Partial<TransitionData<V>> & {
      buffer: TimestampedValue<V>[]
      interpolationFunction: (a: V, b: V, t: number, out?: V) => V
    }
  ) {
    return S.Object({
      buffer: S.Array(
        S.Object({
          timestamp: S.Number(),
          value: S.Type<V>()
        })
      ),
      current: S.Type<V>(),
      maxBufferSize: S.Number(10),
      duration: S.Number(500),
      easingFunction: S.Func([S.Number()], S.Number(), Easing.Elastic.InOut),
      interpolationFunction: S.Func(
        [S.Type<V>(), S.Type<V>(), S.Number(), S.Optional(S.Type<V>())],
        S.Type<V>(),
        config.interpolationFunction
      )
    })
  },

  defineScalarTransition: (config?: Partial<TransitionData<number>>) => {
    return Transition.defineTransition<number>({
      buffer: [{ timestamp: 0, value: 0 }],
      interpolationFunction: (a: number, b: number, t: number) => a + (b - a) * t,
      ...config
    })
  },

  defineVector3Transition: (config?: Partial<TransitionData<Vector3>>) => {
    return Transition.defineTransition<Vector3>({
      buffer: [{ timestamp: 0, value: new Vector3() }],
      interpolationFunction: (a: Vector3, b: Vector3, t: number, out?: Vector3) => {
        out = out || new Vector3()
        out.x = a.x + (b.x - a.x) * t
        out.y = a.y + (b.y - a.y) * t
        out.z = a.z + (b.z - a.z) * t
        return out
      },
      ...config
    })
  },

  defineQuaternionTransition: (config?: Partial<TransitionData<Quaternion>>) => {
    return Transition.defineTransition<Quaternion>({
      buffer: [{ timestamp: 0, value: new Quaternion() }],
      interpolationFunction: (a: Quaternion, b: Quaternion, t: number, out?: Quaternion) => {
        out = out || new Quaternion()
        out.copy(a).slerp(b, t)
        return out
      },
      ...config
    })
  },

  defineBorderRadiusTransition: (config?: Partial<TransitionData<BorderRadius>>) => {
    return Transition.defineTransition<BorderRadius>({
      buffer: [{ timestamp: 0, value: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 } }],
      interpolationFunction: (a: BorderRadius, b: BorderRadius, t: number, out?: BorderRadius) => {
        out = out || { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }
        out.topLeft = a.topLeft + (b.topLeft - a.topLeft) * t
        out.topRight = a.topRight + (b.topRight - a.topRight) * t
        out.bottomLeft = a.bottomLeft + (b.bottomLeft - a.bottomLeft) * t
        out.bottomRight = a.bottomRight + (b.bottomRight - a.bottomRight) * t
        return out
      },
      ...config
    })
  },

  applyNewTarget<T, V extends State<T, unknown>>(data: State<TransitionData<T>>, target: V, timestamp: number) {
    const d = data as unknown as State<TransitionData<any>, object>
    // Add new sample
    const value = d.get(NO_PROXY).interpolationFunction(target.value as T, target.value as T, 0) // make a copy
    d.buffer.merge([{ timestamp, value }])

    // Remove samples older than the duration
    const cutoffTime = timestamp - d.duration.value
    d.buffer.set((b) => b.filter((sample) => sample.timestamp >= cutoffTime))

    // If buffer exceeds max size, resample
    if (d.buffer.length > d.maxBufferSize.value) {
      Transition.resampleBuffer(d)
    }
  },

  useTransitionTarget<T, V extends State<T, unknown>>(
    transition: State<TransitionData<T>>,
    target: V,
    simulationTime: number
  ) {
    useImmediateEffect(() => {
      Transition.applyNewTarget(transition, target, simulationTime)
    }, [transition, target])
  },

  resampleBuffer(data: State<TransitionData<any>>) {
    const newBuffer: TimestampedValue<any>[] = []
    const timeStep = data.duration.value / (data.maxBufferSize.value - 1)
    const latestTimestamp = data.buffer.value[data.buffer.value.length - 1].timestamp

    for (let i = 0; i < data.maxBufferSize.value; i++) {
      const timestamp = latestTimestamp - (data.maxBufferSize.value - 1 - i) * timeStep
      newBuffer.push({
        timestamp,
        value: Transition.interpolateBufferAtTime(timestamp, data)
      })
    }

    data.buffer.set(newBuffer)
  },

  interpolateBufferAtTime<S extends State<TransitionData<any>>>(
    timestamp: number,
    data: S
  ): S['value']['buffer'][number]['value'] {
    // Find the two closest samples and interpolate between them
    let lowerIndex = 0
    let upperIndex = 0
    for (let i = 0; i < data.buffer.value.length; i++) {
      if (data.buffer.value[i].timestamp <= timestamp) {
        lowerIndex = i
        upperIndex = i + 1
      }
    }
    const a = data.buffer.value[lowerIndex].value
    const b = data.buffer.value[upperIndex].value
    const t =
      (timestamp - data.buffer.value[lowerIndex].timestamp) /
      (data.buffer.value[upperIndex].timestamp - data.buffer.value[lowerIndex].timestamp)
    return data.value.interpolationFunction(a, b, t)
  },

  computeCurrentValue<V>(data: TransitionData<V>, timestamp: number) {
    // Finite Impulse Response Filter
    const current = data.interpolationFunction(data.buffer[0].value, data.buffer[0].value, 0, data.current)
    for (let i = 0; i < data.buffer.length; i++) {
      const t = data.easingFunction((timestamp - data.buffer[i].timestamp) / data.duration)
      data.interpolationFunction(current, data.buffer[i].value, t, current)
    }
  }
}
