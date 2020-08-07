import { System } from "ecsy"
import { ParticleEmitter, ParticleEmitterState } from "../components/ParticleEmitter"
import { Object3DComponent } from "ecsy-three"
import Transform from "../../transform/components/Transform"
import TransformParent from "../../transform/components/TransformParent"
import * as THREE from "three"
import { createParticleEmitter, setEmitterMatrixWorld, setEmitterTime } from "../classes/ParticleEmitter.js"

export class ParticleSystem extends System {
  execute(deltaTime, time): void {
    for (const entity of this.queries.emitters.added) {
      const emitter = entity.getComponent(ParticleEmitter) as ParticleEmitter
      const object3D = entity.getComponent(Object3DComponent)

      const matrixWorld = calcMatrixWorld(entity)
      if (!emitter.useEntityRotation) {
        clearMatrixRotation(matrixWorld)
      }

      const emitter3D = createParticleEmitter(emitter, matrixWorld, time)
      entity.addComponent(ParticleEmitterState, {
        emitter3D,
        useEntityRotation: emitter.useEntityRotation,
        syncTransform: emitter.syncTransform
      })
    }

    for (const entity of this.queries.emitterStates.results) {
      const emitterState = entity.getComponent(ParticleEmitterState) as ParticleEmitterState

      if (emitterState.syncTransform) {
        const matrixWorld = calcMatrixWorld(entity)
        if (!emitterState.useEntityRotation) {
          clearMatrixRotation(matrixWorld)
        }

        setEmitterMatrixWorld(emitterState.emitter3D, matrixWorld, time, deltaTime)
      }

      setEmitterTime(emitterState.emitter3D, time)
    }
  }
}

ParticleSystem.queries = {
  emitters: {
    components: [ParticleEmitter],
    listen: {
      added: true,
      removed: true
    }
  },

  emitterStates: {
    components: [ParticleEmitterState]
  }
}

const clearMatrixRotation = (function() {
  const translation = new THREE.Vector3()
  const quaternion = new THREE.Quaternion()
  const scale = new THREE.Vector3()
  const unitQuat = new THREE.Quaternion()

  return function clearMatrixRotation(matrix) {
    matrix.decompose(translation, quaternion, scale)
    return matrix.compose(translation, unitQuat, scale)
  }
})()

const calcMatrixWorld = (function() {
  const scale = new THREE.Vector3()
  const quaternion = new THREE.Quaternion()
  const euler = new THREE.Euler()

  return function calcMatrixWorld(entity, childMatrix = undefined) {
    const object3D = entity.getComponent(Object3DComponent)
    const transform = entity.getComponent(Transform)

    if (object3D) {
      return childMatrix ? childMatrix.multiply(object3D["value"].matrixWorld) : object3D["value"].matrixWorld
    } else if (transform) {
      const transformMatrix = new THREE.Matrix4()

      transformMatrix.compose(transform.position, quaternion.setFromEuler(euler.setFromVector3(transform.rotation)), scale.set(1, 1, 1))

      if (childMatrix) {
        transformMatrix.premultiply(childMatrix)
      }

      const parent = entity.getComponent(TransformParent)
      return parent ? calcMatrixWorld(parent["value"], transformMatrix) : transformMatrix
    } else {
      return new THREE.Matrix4()
    }
  }
})()
