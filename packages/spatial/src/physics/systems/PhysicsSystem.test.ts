// /*
// CPAL-1.0 License

// The contents of this file are subject to the Common Public Attribution License
// Version 1.0. (the "License"); you may not use this file except in compliance
// with the License. You may obtain a copy of the License at
// https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
// The License is based on the Mozilla Public License Version 1.1, but Sections 14
// and 15 have been added to cover use of software over a computer network and
// provide for limited attribution for the Original Developer. In addition,
// Exhibit A has been modified to be consistent with Exhibit B.

// Software distributed under the License is distributed on an "AS IS" basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
// specific language governing rights and limitations under the License.

// The Original Code is Ethereal Engine.

// The Original Developer is the Initial Developer. The Initial Developer of the
// Original Code is the Ethereal Engine team.

// All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023
// Ethereal Engine. All Rights Reserved.
// */

// import { destroyEngine } from '@etherealengine/ecs/src/Engine'

// import {
//   Entity,
//   SystemDefinitions,
//   SystemUUID,
//   UUIDComponent,
//   UndefinedEntity,
//   createEntity,
//   getComponent,
//   getMutableComponent,
//   hasComponent,
//   removeEntity,
//   setComponent
// } from '@etherealengine/ecs'
// import { createEngine } from '@etherealengine/ecs/src/Engine'
// import assert from 'assert'
// import { Quaternion, Vector3 } from 'three'
// import { TransformComponent } from '../../SpatialModule'
// import { Vector3_Zero } from '../../common/constants/MathConstants'
// import { smootheLerpAlpha } from '../../common/functions/MathLerpFunctions'
// import { SceneComponent } from '../../renderer/components/SceneComponents'
// import { EntityTreeComponent } from '../../transform/components/EntityTree'
// import { Physics, PhysicsWorld } from '../classes/Physics'
// import { assertVecAllApproxNotEq, assertVecAnyApproxNotEq, assertVecApproxEq } from '../classes/Physics.test'
// import { ColliderComponent } from '../components/ColliderComponent'
// import { CollisionComponent } from '../components/CollisionComponent'
// import { RigidBodyComponent } from '../components/RigidBodyComponent'
// import { BodyTypes } from '../types/PhysicsTypes'
// import { PhysicsSystem } from './PhysicsSystem'

// // Epsilon Constants for Interpolation
// const LerpEpsilon = 0.000001
// /** @note three.js Quat.slerp fails tests at 6 significant figures, but passes at 5 */
// const SLerpEpsilon = 0.00001

// const Quaternion_Zero = new Quaternion(0, 0, 0, 1).normalize()

// describe('smoothKinematicBody', () => {
//   /** @description Pair of `deltaTime` and `substep` values that will be used during an interpolation test */
//   type Step = { dt: number; substep: number }
//   /** @description Creates a Step object. @note Just a clarity/readability alias */
//   function createStep(dt: number, substep: number): Step {
//     return { dt, substep }
//   }

//   const DeltaTime = 1 / 60
//   const Start = {
//     position: new Vector3(1, 2, 3),
//     rotation: new Quaternion(0.5, 0.3, 0.2, 0.0).normalize()
//   }
//   const Final = {
//     position: new Vector3(4, 5, 6),
//     rotation: new Quaternion(0.0, 0.2, 0.8, 0.0).normalize()
//   }

//   /** @description List of steps that will be tested against for both the linear and smoooth interpolation tests */
//   const Step = {
//     Tenth: createStep(DeltaTime, 0.1),
//     Quarter: createStep(DeltaTime, 0.25),
//     Half: createStep(DeltaTime, 0.5),
//     One: createStep(DeltaTime, 1),
//     Two: createStep(DeltaTime, 2)
//   }

//   /** @description {@link Step} list, in array form */
//   const Steps = [Step.Tenth, Step.Quarter, Step.Half, Step.One, Step.Two]

//   /** @description List of non-zero values that {@link RigidbodyComponent.targetKinematicLerpMultiplier} will be set to during the gradual smoothing tests */
//   const KinematicMultiplierCases = [0.5, 0.25, 0.1, 0.01, 0.001, 0.0001, 2, 3, 4, 5]

//   /**
//    *  @section Initialize/Terminate the engine, entities and physics
//    */
//   let testEntity = UndefinedEntity
//   let physicsWorld: PhysicsWorld
//   let physicsWorldEntity = UndefinedEntity

//   beforeEach(async () => {
//     createEngine()
//     await Physics.load()
//     physicsWorldEntity = createEntity()
//     setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
//     setComponent(physicsWorldEntity, SceneComponent)
//     setComponent(physicsWorldEntity, TransformComponent)
//     setComponent(physicsWorldEntity, EntityTreeComponent)
//     physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))

//     testEntity = createEntity()
//     setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
//     setComponent(testEntity, TransformComponent)
//     setComponent(testEntity, RigidBodyComponent)
//     // Set the Start..Final values for interpolation
//     const body = getComponent(testEntity, RigidBodyComponent)
//     body.previousPosition.set(Start.position.x, Start.position.y, Start.position.z)
//     body.previousRotation.set(Start.rotation.x, Start.rotation.y, Start.rotation.z, Start.rotation.w)
//     body.targetKinematicPosition.set(Final.position.x, Final.position.y, Final.position.z)
//     body.targetKinematicRotation.set(Final.rotation.x, Final.rotation.y, Final.rotation.z, Final.rotation.w)
//   })

//   afterEach(() => {
//     removeEntity(testEntity)
//     return destroyEngine()
//   })

//   describe('when RigidbodyComponent.targetKinematicLerpMultiplier is set to 0 ...', () => {
//     /** @description Calculates the Deterministic Lerp value for the `@param entity`, as expected by the tests, based on the given {@link Step.substep} value  */
//     function computeLerp(entity: Entity, step: Step) {
//       const body = getComponent(entity, RigidBodyComponent)
//       const result = {
//         position: body.previousPosition.clone().lerp(body.targetKinematicPosition.clone(), step.substep).clone(),
//         rotation: body.previousRotation.clone().slerp(body.targetKinematicRotation.clone(), step.substep).clone()
//       }
//       return result
//     }
//     /** @description Set the {@link RigidBodyComponent.targetKinematicLerpMultiplier} to 0 for all of the linear interpolation tests */
//     beforeEach(() => {
//       getMutableComponent(testEntity, RigidBodyComponent).targetKinematicLerpMultiplier.set(0)
//     })

//     it('... should apply deterministic linear interpolation to the position of the KinematicBody of the given entity', () => {
//       // Check data before
//       const body = getComponent(testEntity, RigidBodyComponent)
//       const before = body.position.clone()
//       assertVecApproxEq(before, Vector3_Zero, 3, LerpEpsilon)

//       // Run and Check resulting data
//       Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Quarter.dt, Step.Quarter.substep)
//       const after = body.position.clone()
//       assertVecAllApproxNotEq(before, after, 3, LerpEpsilon)
//       assertVecApproxEq(after, computeLerp(testEntity, Step.Quarter).position, 3, LerpEpsilon)
//       // Check the other Step cases
//       getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
//       Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Tenth.dt, Step.Tenth.substep)
//       assertVecApproxEq(body.position.clone(), computeLerp(testEntity, Step.Tenth).position, 3, LerpEpsilon)
//       getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
//       Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Half.dt, Step.Half.substep)
//       assertVecApproxEq(body.position.clone(), computeLerp(testEntity, Step.Half).position, 3, LerpEpsilon)
//       getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
//       Physics.smoothKinematicBody(physicsWorld, testEntity, Step.One.dt, Step.One.substep)
//       assertVecApproxEq(body.position.clone(), computeLerp(testEntity, Step.One).position, 3, LerpEpsilon)
//       getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
//       Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Two.dt, Step.Two.substep)
//       assertVecApproxEq(body.position.clone(), computeLerp(testEntity, Step.Two).position, 3, LerpEpsilon)
//       // Check substep precision Step cases
//       const TestCount = 1_000_000
//       for (let divider = 1; divider <= TestCount; divider += 1_000) {
//         const step = createStep(DeltaTime, 1 / divider)
//         getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
//         Physics.smoothKinematicBody(physicsWorld, testEntity, step.dt, step.substep)
//         assertVecApproxEq(body.position.clone(), computeLerp(testEntity, step).position, 3, LerpEpsilon)
//       }
//     })

//     it('... should apply deterministic spherical linear interpolation to the rotation of the KinematicBody of the given entity', () => {
//       // Check data before
//       const body = getComponent(testEntity, RigidBodyComponent)
//       const before = body.rotation.clone()
//       assertVecApproxEq(before, new Quaternion(0, 0, 0, 1), 3, SLerpEpsilon)

//       // Run and Check resulting data
//       Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Quarter.dt, Step.Quarter.substep)
//       const after = body.rotation.clone()
//       assertVecAllApproxNotEq(before, after, 4, SLerpEpsilon)
//       assertVecApproxEq(after, computeLerp(testEntity, Step.Quarter).rotation, 4, SLerpEpsilon)
//       // Check the other Step cases
//       getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
//       Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Tenth.dt, Step.Tenth.substep)
//       assertVecApproxEq(body.rotation.clone(), computeLerp(testEntity, Step.Tenth).rotation, 4, SLerpEpsilon)
//       getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
//       Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Half.dt, Step.Half.substep)
//       assertVecApproxEq(body.rotation.clone(), computeLerp(testEntity, Step.Half).rotation, 4, SLerpEpsilon)
//       getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
//       Physics.smoothKinematicBody(physicsWorld, testEntity, Step.One.dt, Step.One.substep)
//       assertVecApproxEq(body.rotation.clone(), computeLerp(testEntity, Step.One).rotation, 4, SLerpEpsilon)
//       getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
//       Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Two.dt, Step.Two.substep)
//       assertVecApproxEq(body.rotation.clone(), computeLerp(testEntity, Step.Two).rotation, 4, SLerpEpsilon)
//       // Check substep precision Step cases
//       const TestCount = 1_000_000
//       for (let divider = 1; divider <= TestCount; divider += 1_000) {
//         const step = createStep(DeltaTime, 1 / divider)
//         getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
//         Physics.smoothKinematicBody(physicsWorld, testEntity, step.dt, step.substep)
//         assertVecApproxEq(body.rotation.clone(), computeLerp(testEntity, step).rotation, 4, SLerpEpsilon)
//       }
//     })
//   })

//   describe('when RigidbodyComponent.targetKinematicLerpMultiplier is set to a value other than 0 ...', () => {
//     type LerpData = {
//       position: { start: Vector3; final: Vector3 }
//       rotation: { start: Quaternion; final: Quaternion }
//     }

//     /**
//      *  @description Sets the entity's {@link RigidBodyComponent.targetKinematicLerpMultiplier} property to `@param mult`
//      *  @returns The `@param mult` itself  */
//     function setMultiplier(entity: Entity, mult: number): number {
//       getMutableComponent(entity, RigidBodyComponent).targetKinematicLerpMultiplier.set(mult)
//       return mult
//     }
//     /**
//      *  @description Sets the entity's {@link RigidBodyComponent.targetKinematicLerpMultiplier} property to `@param mult` and calculates its smooth lerp alpha
//      *  @returns The exponentially smootheed Lerp Alpha value to use as `dt` in {@link smoothKinematicBody}  */
//     function getAlphaWithMultiplier(entity: Entity, dt: number, mult: number): number {
//       return smootheLerpAlpha(setMultiplier(entity, mult), dt)
//     }

//     /** @description Computes the lerp of the (`@param start`,`@param final`) input Vectors without mutating their values */
//     function lerpNoRef(start: Vector3, final: Vector3, dt: number) {
//       return start.clone().lerp(final.clone(), dt).clone()
//     }
//     /** @description Computes the fastSlerp of the (`@param start`,`@param final`) input Quaternions without mutating their values */
//     function fastSlerpNoRef(start: Quaternion, final: Quaternion, dt: number) {
//       return start.clone().fastSlerp(final.clone(), dt).clone()
//     }

//     /** @description Calculates the Exponential Lerp value for the `@param data`, as expected by the tests, based on the given `@param dt` alpha value  */
//     function computeELerp(data: LerpData, alpha: number) {
//       return {
//         position: lerpNoRef(data.position.start, data.position.final, alpha),
//         rotation: fastSlerpNoRef(data.rotation.start, data.rotation.final, alpha)
//       }
//     }

//     it('... should apply gradual smoothing (aka exponential interpolation) to the position of the KinematicBody of the given entity', () => {
//       // Check data before
//       const body = getComponent(testEntity, RigidBodyComponent)
//       const before = body.position.clone()
//       assertVecApproxEq(before, Vector3_Zero, 3, LerpEpsilon)

//       // Run and Check resulting data
//       // ... Infinite smoothing case
//       const MultInfinite = 1 // Multiplier 1 shouldn't change the position (aka. infinite smoothing)
//       setMultiplier(testEntity, MultInfinite)
//       Physics.smoothKinematicBody(physicsWorld, testEntity, DeltaTime, /*substep*/ 1)
//       assertVecApproxEq(before, body.position, 3, LerpEpsilon)

//       // ... Hardcoded case
//       setMultiplier(testEntity, 0.12345)
//       Physics.smoothKinematicBody(physicsWorld, testEntity, 1 / 60, 1)
//       const ExpectedHardcoded = { x: 0.1370581001805662, y: 0.17132262522570774, z: 0.20558715027084928 }
//       assertVecApproxEq(body.position.clone(), ExpectedHardcoded, 3)

//       // ... Check the other Step cases
//       for (const multiplier of KinematicMultiplierCases) {
//         for (const step of Steps) {
//           getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
//           const alpha = getAlphaWithMultiplier(testEntity, step.dt, multiplier)
//           const before = {
//             position: { start: body.position.clone(), final: body.targetKinematicPosition.clone() },
//             rotation: { start: body.rotation.clone(), final: body.targetKinematicRotation.clone() }
//           }
//           Physics.smoothKinematicBody(physicsWorld, testEntity, step.dt, step.substep)
//           assertVecApproxEq(body.position, computeELerp(before, alpha).position, 3, LerpEpsilon)
//         }
//       }
//     })

//     it('... should apply gradual smoothing (aka exponential interpolation) to the rotation of the KinematicBody of the given entity', () => {
//       // Check data before
//       const body = getComponent(testEntity, RigidBodyComponent)
//       const before = body.rotation.clone()
//       assertVecApproxEq(before, Quaternion_Zero, 4, SLerpEpsilon)

//       // Run and Check resulting data
//       // ... Infinite smoothing case
//       const MultInfinite = 1 // Multiplier 1 shouldn't change the rotation (aka. infinite smoothing)
//       setMultiplier(testEntity, MultInfinite)
//       Physics.smoothKinematicBody(physicsWorld, testEntity, DeltaTime, /*substep*/ 1)
//       assertVecApproxEq(before, body.rotation, 3, SLerpEpsilon)

//       // ... Hardcoded case
//       setMultiplier(testEntity, 0.12345)
//       Physics.smoothKinematicBody(physicsWorld, testEntity, 1 / 60, 1)
//       const ExpectedHardcoded = new Quaternion(0, 0.013047535062645674, 0.052190140250582696, 0.9985524073985961)
//       assertVecApproxEq(body.rotation.clone(), ExpectedHardcoded, 4)

//       // ... Check the other Step cases
//       for (const multiplier of KinematicMultiplierCases) {
//         for (const step of Steps) {
//           getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
//           const alpha = getAlphaWithMultiplier(testEntity, step.dt, multiplier)
//           const before = {
//             position: { start: body.position.clone(), final: body.targetKinematicPosition.clone() },
//             rotation: { start: body.rotation.clone(), final: body.targetKinematicRotation.clone() }
//           } as LerpData
//           Physics.smoothKinematicBody(physicsWorld, testEntity, step.dt, step.substep)
//           assertVecApproxEq(body.rotation, computeELerp(before, alpha).rotation, 3, SLerpEpsilon)
//         }
//       }
//     })
//   })
// })

// describe('PhysicsSystem', () => {
//   describe('IDs', () => {
//     it("should define the PhysicsSystem's UUID with the expected value", () => {
//       assert.equal(PhysicsSystem, 'ee.engine.PhysicsSystem' as SystemUUID)
//     })
//   })

//   describe('execute', () => {
//     let testEntity = UndefinedEntity
//     let physicsWorld: PhysicsWorld
//     let physicsWorldEntity = UndefinedEntity

//     beforeEach(async () => {
//       createEngine()
//       await Physics.load()
//       physicsWorldEntity = createEntity()
//       setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
//       setComponent(physicsWorldEntity, SceneComponent)
//       setComponent(physicsWorldEntity, TransformComponent)
//       setComponent(physicsWorldEntity, EntityTreeComponent)
//       physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))
//       physicsWorld.timestep = 1 / 60

//       testEntity = createEntity()
//       setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
//       setComponent(testEntity, TransformComponent)
//       setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
//       setComponent(testEntity, ColliderComponent)
//     })

//     afterEach(() => {
//       removeEntity(testEntity)
//       return destroyEngine()
//     })

//     const physicsSystemExecute = SystemDefinitions.get(PhysicsSystem)!.execute

//     it('should step the physics', () => {
//       const testImpulse = new Vector3(1, 2, 3)
//       const beforeBody = physicsWorld.Rigidbodies.get(testEntity)
//       assert.ok(beforeBody)
//       const before = beforeBody.linvel()
//       assertVecApproxEq(before, Vector3_Zero, 3)
//       Physics.applyImpulse(physicsWorld, testEntity, testImpulse)
//       physicsSystemExecute()
//       const afterBody = physicsWorld.Rigidbodies.get(testEntity)
//       assert.ok(afterBody)
//       const after = afterBody.linvel()
//       assertVecAllApproxNotEq(after, before, 3)
//     })

//     function cloneRigidBodyPoseData(entity: Entity) {
//       const body = getComponent(testEntity, RigidBodyComponent)
//       return {
//         previousPosition: body.previousPosition.clone(),
//         previousRotation: body.previousRotation.clone(),
//         position: body.position.clone(),
//         rotation: body.rotation.clone(),
//         targetKinematicPosition: body.targetKinematicPosition.clone(),
//         targetKinematicRotation: body.targetKinematicRotation.clone(),
//         linearVelocity: body.linearVelocity.clone(),
//         angularVelocity: body.angularVelocity.clone()
//       }
//     }

//     it('should update poses on the ECS', () => {
//       const testImpulse = new Vector3(1, 2, 3)
//       const before = cloneRigidBodyPoseData(testEntity)
//       const body = getComponent(testEntity, RigidBodyComponent)
//       assertVecApproxEq(before.previousPosition, body.previousPosition.clone(), 3)
//       assertVecApproxEq(before.previousRotation, body.previousRotation.clone(), 3)
//       assertVecApproxEq(before.position, body.position.clone(), 3)
//       assertVecApproxEq(before.rotation, body.rotation.clone(), 4)
//       assertVecApproxEq(before.targetKinematicPosition, body.targetKinematicPosition.clone(), 3)
//       assertVecApproxEq(before.targetKinematicRotation, body.targetKinematicRotation.clone(), 4)
//       assertVecApproxEq(before.linearVelocity, body.linearVelocity.clone(), 3)
//       assertVecApproxEq(before.angularVelocity, body.angularVelocity.clone(), 3)

//       Physics.applyImpulse(physicsWorld, testEntity, testImpulse)
//       physicsSystemExecute()

//       const after = cloneRigidBodyPoseData(testEntity)
//       assertVecAnyApproxNotEq(after.previousPosition, before.previousPosition, 3)
//       assertVecAnyApproxNotEq(after.previousRotation, before.previousRotation, 3)
//       assertVecAnyApproxNotEq(after.position, before.position, 3)
//       assertVecAnyApproxNotEq(after.rotation, before.rotation, 4)
//       assertVecAnyApproxNotEq(after.targetKinematicPosition, before.targetKinematicPosition, 3)
//       assertVecAnyApproxNotEq(after.targetKinematicRotation, before.targetKinematicRotation, 4)
//       assertVecAnyApproxNotEq(after.linearVelocity, before.linearVelocity, 3)
//       assertVecAnyApproxNotEq(after.angularVelocity, before.angularVelocity, 3)
//     })

//     it('should update collisions on the ECS', () => {
//       const testImpulse = new Vector3(1, 2, 3)
//       const entity1 = createEntity()
//       setComponent(entity1, TransformComponent)
//       setComponent(entity1, RigidBodyComponent, { type: BodyTypes.Dynamic })
//       setComponent(entity1, ColliderComponent)
//       const entity2 = createEntity()
//       setComponent(entity2, TransformComponent)
//       setComponent(entity2, RigidBodyComponent, { type: BodyTypes.Dynamic })
//       setComponent(entity2, ColliderComponent)
//       // Check before
//       assert.ok(!hasComponent(entity1, CollisionComponent))
//       assert.ok(!hasComponent(entity2, CollisionComponent))

//       // Run and Check after
//       Physics.applyImpulse(physicsWorld, entity1, testImpulse)
//       physicsSystemExecute()
//       assert.ok(hasComponent(entity1, ColliderComponent))
//       assert.ok(hasComponent(entity2, ColliderComponent))
//     })
//   })

//   /**
//   // @note The reactor is currently just binding data onMount and onUnmount
//   // describe('reactor', () => {})
//   */
// })
