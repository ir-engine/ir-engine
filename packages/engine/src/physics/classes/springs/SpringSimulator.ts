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

import * as THREE from 'three'

import { SimulationFrame } from './SimulationFrame'
import { SimulatorBase } from './SimulatorBase'

function spring(source: number, dest: number, velocity: number, mass: number, damping: number): SimulationFrame {
  let acceleration = dest - source
  acceleration /= mass
  velocity += acceleration
  velocity *= damping

  const position = source + velocity

  return new SimulationFrame(position, velocity)
}

export class SpringSimulator extends SimulatorBase {
  public position: number
  public velocity: number
  public target: number
  public cache: SimulationFrame[]

  constructor(fps: number, mass: number, damping: number, startPosition = 0, startVelocity = 0) {
    // Construct base
    super(fps, mass, damping)

    // Simulated values
    this.position = startPosition
    this.velocity = startVelocity

    // Simulation parameters
    this.target = 0

    // Initialize cache by pushing two frames
    this.cache = [] // At least two frames
    for (let i = 0; i < 2; i++) {
      this.cache.push(new SimulationFrame(startPosition, startVelocity))
    }
  }

  /**
   * Advances the simulation by given time step
   * @param {number} timeStep
   */
  public simulate(timeStep: number): void {
    // Generate new frames
    this.generateFrames(timeStep)

    // Return values interpolated between cached frames
    this.position = THREE.MathUtils.lerp(this.cache[0].position, this.cache[1].position, this.offset / this.frameTime)
    this.velocity = THREE.MathUtils.lerp(this.cache[0].velocity, this.cache[1].velocity, this.offset / this.frameTime)
  }

  /**
   * Gets another simulation frame
   */
  public getFrame(isLastFrame: boolean): SimulationFrame {
    return spring(this.lastFrame().position, this.target, this.lastFrame().velocity, this.mass, this.damping)
  }
}

export class RelativeSpringSimulator extends SimulatorBase {
  public position: number
  public velocity: number
  public target: number
  public lastLerp: number
  public cache: SimulationFrame[]

  constructor(fps: number, mass: number, damping: number, startPosition = 0, startVelocity = 0) {
    // Construct base
    super(fps, mass, damping)

    // Simulated values
    this.position = startPosition
    this.velocity = startVelocity

    // Simulation parameters
    this.target = 0

    // Last lerped position for relative output
    this.lastLerp = 0

    // Initialize cache by pushing two frames
    this.cache = [] // At least two frames
    for (let i = 0; i < 2; i++) {
      this.cache.push({
        position: startPosition,
        velocity: startVelocity
      })
    }
  }

  /**
   * Advances the simulation by given time step
   * @param {number} timeStep
   */
  public simulate(timeStep: number): void {
    this.generateFrames(timeStep)

    // SpringR lerping
    // Lerp from 0 to next frame
    const lerp = THREE.MathUtils.lerp(0, this.cache[1].position, this.offset / this.frameTime)

    // Substract last lerp from current to make output relative
    this.position = lerp - this.lastLerp
    this.lastLerp = lerp

    this.velocity = THREE.MathUtils.lerp(this.cache[0].velocity, this.cache[1].velocity, this.offset / this.frameTime)
  }

  /**
   * Gets another simulation frame
   */
  public getFrame(isLastFrame: boolean): SimulationFrame {
    const newFrame = Object.assign({}, this.lastFrame())

    if (isLastFrame) {
      // Reset position
      newFrame.position = 0
      // Transition to next frame
      this.lastLerp = this.lastLerp - this.lastFrame().position
    }

    return spring(newFrame.position, this.target, newFrame.velocity, this.mass, this.damping)
  }
}
