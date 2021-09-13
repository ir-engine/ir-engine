import { Vector3 } from 'three'
import { SimulatorBase } from './SimulatorBase'

class SimulationFrameVector {
  public position: Vector3
  public velocity: Vector3

  constructor(position: Vector3, velocity: Vector3) {
    this.position = position
    this.velocity = velocity
  }
}

const vec3 = new Vector3()

export class VectorSpringSimulator extends SimulatorBase {
  public position: Vector3
  public velocity: Vector3
  public target: Vector3
  public cache: SimulationFrameVector[]

  constructor(fps: number, mass: number, damping: number) {
    // Construct base
    super(fps, mass, damping)

    this.init()
  }

  public init(): void {
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
  public simulate(timeStep: number): void {
    // Generate new frames
    this.generateFrames(timeStep)

    // Return interpolation
    this.position.lerpVectors(this.cache[0].position, this.cache[1].position, this.offset / this.frameTime)
    this.velocity.lerpVectors(this.cache[0].velocity, this.cache[1].velocity, this.offset / this.frameTime)
  }

  /**
   * Gets another simulation frame
   */
  public getFrame(isLastFrame: boolean): SimulationFrameVector {
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
