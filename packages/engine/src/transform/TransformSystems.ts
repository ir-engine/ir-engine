import { PhysicsSystem } from '../physics/systems/PhysicsSystem'
import { TransformSystem } from './systems/TransformSystem'

export const TransformSystems = () => [TransformSystem, PhysicsSystem]
