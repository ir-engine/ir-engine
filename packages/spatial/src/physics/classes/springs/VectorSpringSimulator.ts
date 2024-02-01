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

import { Vector3 } from 'three'

import { SimulatorBase } from './SimulatorBase'

class SimulationFrameVector {
  position: Vector3
  velocity: Vector3

  constructor(position: Vector3, velocity: Vector3) {
    this.position = position
    this.velocity = velocity
  }
}

const vec3 = new Vector3()

export class VectorSpringSimulator extends SimulatorBase {
  position: Vector3
  velocity: Vector3
  target: Vector3
  cache: SimulationFrameVector[]

  constructor(fps: number, mass: number, damping: number) {
    // Construct base
    super(fps, mass, damping)

    this.init()
  }

  init(): void {
    this.position = new Vector3()
    this.velocity = new Vector3()
    this.target = new Vector3()

    // Initialize cache by pushing two frames
    this.cache = []
    for (let i = 0; i < 2; i++) {
      this.cache.push(new SimulationFrameVector(new Vector3(), new Vector3()))
    }
  }

  /**
   * Advances the simulation by given time step
   * @param {number} timeStep
   */
  simulate(timeStep: number): void {
    // Generate new frames
    this.generateFrames(timeStep)

    // Return interpolation
    this.position.lerpVectors(this.cache[0].position, this.cache[1].position, this.offset / this.frameTime)
    this.velocity.lerpVectors(this.cache[0].velocity, this.cache[1].velocity, this.offset / this.frameTime)
  }

  /**
   * Gets another simulation frame
   */
  getFrame(isLastFrame: boolean): SimulationFrameVector {
    // Deep clone data from previous frame
    const newSpring = new SimulationFrameVector(this.lastFrame().position.clone(), this.lastFrame().velocity.clone())

    // Calculate new Spring
    const acceleration = vec3.subVectors(this.target, newSpring.position)
    acceleration.divideScalar(this.mass)
    newSpring.velocity.add(acceleration)
    newSpring.velocity.multiplyScalar(this.damping)
    newSpring.position.add(newSpring.velocity)

    // Return new Spring
    return newSpring
  }
}
