import { Collider, ShapeContact } from '@dimforge/rapier3d-compat'
import { ECSState, Entity, defineQuery, defineSystem, getComponent } from '@etherealengine/ecs'
import { getState } from '@etherealengine/hyperflux'
import { Vector3 } from 'three'
import { ColliderComponent } from '../components/ColliderComponent'
import { RigidBodyComponent, RigidBodyDynamicTagComponent } from '../components/RigidBodyComponent'
import { PhysicsState } from '../state/PhysicsState'
import { Shapes } from '../types/PhysicsTypes'
import { PhysicsSystem } from './PhysicsSystem'

const vec3 = new Vector3()
const maxVelocity = new Vector3()

const getContacts = (collider1: Collider) => {
  const contacts = [] as { contact: ShapeContact; collider: Collider }[]
  const physicsWorld = getState(PhysicsState).physicsWorld
  physicsWorld.contactsWith(collider1, (collider2) => {
    const contact = collider1.contactCollider(collider2, 0)
    if (!contact) return
    contacts.push({
      contact,
      collider: collider2
    })
  })
  return contacts
}

const eps = 1e-6

/**
 * Rapier does not implement rolling friction... so let's do something approximating it ourselves.
 * Implements a simple rolling friction model for dynamic rigid bodies.
 * Caveats:
 * - This system only works on rigidbodies that have a single sphere collider.
 * - The friction is applied in the opposite direction of the linear velocity.
 */

const dynamicRigidBodyQuery = defineQuery([RigidBodyComponent, RigidBodyDynamicTagComponent, ColliderComponent])

const execute = () => {
  const dT = getState(ECSState).deltaSeconds
  const physicsWorld = getState(PhysicsState).physicsWorld

  for (const entity of dynamicRigidBodyQuery()) {
    const collider = getComponent(entity, ColliderComponent)
    if (collider.shape !== Shapes.Sphere) continue

    const collider1 = collider.collider
    if (!collider1) continue

    const rigidbody = getComponent(entity, RigidBodyComponent)

    const linVel = rigidbody.linearVelocity
    const staticCoef = collider.friction * linVel.length()

    const contacts = getContacts(collider1)

    for (const { contact, collider: collider2 } of contacts) {
      if (!contact) return

      const rigid2 = collider2.parent()!
      const rigid2Entity = (rigid2.userData as any).entity as Entity
      const rigidbody2 = getComponent(rigid2Entity, RigidBodyComponent)
      const rigidbody1Velocity = rigidbody.linearVelocity
      const rigidbody2Velocity = rigidbody2.linearVelocity
      const relativeVelocity = vec3.subVectors(rigidbody2Velocity, rigidbody1Velocity)

      const normal1 = contact.normal1 as Vector3
      const normal2 = contact.normal2 as Vector3

      //FlatVector tangent = relativeVelocity - FlatMath.Dot(relativeVelocity, normal) * normal;

      const tangent = new Vector3().subVectors(
        relativeVelocity,
        new Vector3().copy(normal1).multiplyScalar(new Vector3().copy(relativeVelocity).dot(normal1))
      )

      if (tangent.lengthSq() < eps) continue

      tangent.normalize()

      const point1 = contact.point1 as Vector3
      const point2 = contact.point2 as Vector3

      const ra = new Vector3().copy(point1).sub(rigidbody.position)
      const rb = new Vector3().copy(point2).sub(rigidbody.position)

      console.log(ra, rb)

      const raPerp = new Vector3().crossVectors(ra, normal1)
      const rbPerp = new Vector3().crossVectors(rb, normal2)

      const raPerpDotT = raPerp.dot(tangent)
      const rbPerpDotT = rbPerp.dot(tangent)

      const denom =
        rigidbody.body.invMass() +
        rigidbody2.body.invMass() +
        raPerpDotT * raPerpDotT * new Vector3().copy(rigidbody.body.invPrincipalInertiaSqrt() as Vector3).length() +
        rbPerpDotT * rbPerpDotT * new Vector3().copy(rigidbody2.body.invPrincipalInertiaSqrt() as Vector3).length()

      const jt = -relativeVelocity.dot(tangent) / denom

      // rapier only has one friction value, not static and dynamic
      const sf = (collider.friction + collider.friction) * 0.5
      const df = (collider.friction + collider.friction) * 0.5

      const frictionImpulse = new Vector3()
      if (Math.abs(jt) <= sf) {
        frictionImpulse.copy(tangent).multiplyScalar(jt)
      } else {
        frictionImpulse.copy(tangent).multiplyScalar(-jt * df)
      }

      // console.log([jt, denom])

      // console.log(entity, 'frictionImpulse', frictionImpulse.length(), relativeVelocity.length())

      rigidbody.body.applyImpulse(frictionImpulse, false)
    }
  }
}

export const PhysicsRollFrictionSystem = defineSystem({
  uuid: 'ee.engine.PhysicsRollFrictionSystem',
  insert: { before: PhysicsSystem },
  execute
})
