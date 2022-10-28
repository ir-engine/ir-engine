import { Collider, RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import { subscribable } from '@hookstate/subscribable'
import { Component } from 'bitecs'
import { Vector3 } from 'three'

import { hookstate, StateMethodsDestroy } from '@xrengine/hyperflux/functions/StateFunctions'

import { Entity } from '../../ecs/classes/Entity'
import {
  createMappedComponent,
  defineComponent,
  getComponent,
  updateComponent
} from '../../ecs/functions/ComponentFunctions'
import { CollisionGroups, DefaultCollisionMask } from '../../physics/enums/CollisionGroups'
import { updateCollider } from '../functions/loaders/ColliderFunctions'
import { EmptyCallback } from './CallbackComponent'

export const ColliderComponent = defineComponent({
  name: 'ColliderComponent',

  onAdd: (entity: Entity) => {
    const state = hookstate(
      {
        bodyType: RigidBodyType.Fixed,
        shapeType: ShapeType.Cuboid,
        scaleMultiplier: { x: 1, y: 1, z: 1 } as Vector3,
        triggerCount: 0,
        /**
         * removeMesh will clean up any objects in the scene hierarchy after the collider bodies have been processed.
         *   This can be used to reduce CPU load by only persisting colliders in the physics simulation.
         */
        removeMesh: false,
        collisionLayer: CollisionGroups.Default,
        collisionMask: DefaultCollisionMask,
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is entered.
         */
        onEnter: [EmptyCallback],
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is exited.
         */
        onExit: [EmptyCallback],
        /**
         * uuid (string)
         *
         * empty string represents self
         *
         * TODO: how do we handle non-scene entities?
         */
        target: ['']
      },
      subscribable()
    )
    return state as typeof state & StateMethodsDestroy
  },

  toJSON(entity, component) {
    return {
      bodyType: component.bodyType.value,
      shapeType: component.shapeType.value,
      scaleMultiplier: component.scaleMultiplier.value,
      triggerCount: component.triggerCount.value,

      removeMesh: component.removeMesh.value,
      collisionLayer: component.collisionLayer.value,
      collisionMask: component.collisionMask.value,

      onEnter: component.onEnter.value,
      onExit: component.onExit.value,

      target: component.target.value
    }
  },

  onUpdate: (entity, component, json) => {
    if (json.bodyType != undefined) component.bodyType.set(json.bodyType)
    if (json.shapeType != undefined) component.shapeType.set(json.shapeType)
    if (json.scaleMultiplier != undefined) component.scaleMultiplier.set(json.scaleMultiplier)
    if (json.triggerCount != undefined) component.triggerCount.set(json.triggerCount)

    if (json.removeMesh != undefined) component.removeMesh.set(json.removeMesh)
    if (json.collisionLayer != undefined) component.collisionLayer.set(json.collisionLayer)

    if (json.onEnter != undefined) {
      for (let i = 0; i < json.onEnter.length; i++) {
        component.onEnter[i].set(json.onEnter[i])
      }
    }

    if (json.onExit != undefined) {
      for (let i = 0; i < json.onExit.length; i++) {
        component.onExit[i].set(json.onExit[i])
      }
    }

    if (json.target != undefined) {
      for (let i = 0; i < json.target.length; i++) {
        component.target[i].set(json.target[i])
      }
    }

    updateCollider(entity)
  },

  onRemove: (entity, component) => {
    component.destroy()
  }
})
export const SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES = {
  bodyType: RigidBodyType.Fixed,
  shapeType: ShapeType.Cuboid,
  scaleMultiplier: { x: 1, y: 1, z: 1 } as Vector3,
  triggerCount: 0,
  removeMesh: false,
  collisionLayer: CollisionGroups.Default,
  collisionMask: DefaultCollisionMask
}
export const SCENE_COMPONENT_COLLIDER = 'collider'
