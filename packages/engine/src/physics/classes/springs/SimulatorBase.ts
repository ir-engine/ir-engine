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

export abstract class SimulatorBase {
  mass: any
  damping: any
  frameTime: number
  offset: number
  abstract cache: any[]

  constructor(fps: number, mass: number, damping: number) {
    this.mass = mass
    this.damping = damping
    this.frameTime = 1 / fps
    this.offset = 0
  }

  setFPS(value: number): void {
    this.frameTime = 1 / value
  }

  lastFrame(): any {
    return this.cache[this.cache.length - 1]
  }

  /**
   * Generates frames between last simulation call and the current one
   * @param {timeStep} timeStep
   */
  generateFrames(timeStep: number): void {
    // Update cache
    // Find out how many frames needs to be generated
    const totalTimeStep = this.offset + timeStep
    const framesToGenerate = Math.floor(totalTimeStep / this.frameTime)
    this.offset = totalTimeStep % this.frameTime

    // Generate simulation frames
    if (framesToGenerate > 0) {
      for (let i = 0; i < framesToGenerate; i++) {
        this.cache.push(this.getFrame(i + 1 === framesToGenerate))
      }
      this.cache = this.cache.slice(-2)
    }
  }

  abstract getFrame(isLastFrame: boolean): any
  abstract simulate(timeStep: number): void
}
