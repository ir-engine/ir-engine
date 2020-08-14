import { System } from "ecsy"
import { Object3DComponent } from "ecsy-three"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { TransformParentComponent } from "../../transform/components/TransformParentComponent"
import { createParticleEmitter, setEmitterMatrixWorld, setEmitterTime } from "../classes/ParticleEmitter.js"
import { ParticleEmitter, ParticleEmitterState } from "../components/ParticleEmitter"
import { Vector3 } from "three/src/math/Vector3"
import { Quaternion } from "three/src/math/Quaternion"
import { Matrix4 } from "three/src/math/Matrix4"
import { Euler } from "three/src/math/Euler"

export class ParticleSystem extends System {
  execute(deltaTime, time): void {
    for (const entity of this.queries.emitters.added) {
      const emitter = entity.getComponent(ParticleEmitter) as ParticleEmitter

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
  const translation = new Vector3()
  const quaternion = new Quaternion()
  const scale = new Vector3()
  const unitQuat = new Quaternion()

  return function clearMatrixRotation(matrix) {
    matrix.decompose(translation, quaternion, scale)
    return matrix.compose(translation, unitQuat, scale)
  }
})()

const calcMatrixWorld = (function() {
  const scale = new Vector3()
  const quaternion = new Quaternion()
  const euler = new Euler()

  return function calcMatrixWorld(entity, childMatrix = undefined) {
    const object3D = entity.getComponent(Object3DComponent)
    const transform = entity.getComponent(TransformComponent)

    if (object3D) {
      return childMatrix ? childMatrix.multiply(object3D["value"].matrixWorld) : object3D["value"].matrixWorld
    } else if (transform) {
      const transformMatrix = new Matrix4()

      transformMatrix.compose(
        transform.position,
        quaternion.setFromEuler(euler.setFromVector3(transform.rotation)),
        scale.set(1, 1, 1)
      )

      if (childMatrix) {
        transformMatrix.premultiply(childMatrix)
      }

      const parent = entity.getComponent(TransformParentComponent)
      return parent ? calcMatrixWorld(parent["value"], transformMatrix) : transformMatrix
    } else {
      return new Matrix4()
    }
  }
})()
