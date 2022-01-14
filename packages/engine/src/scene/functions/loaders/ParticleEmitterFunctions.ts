import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Color, ShaderMaterial, Vector3 } from 'three'
import { Object3DComponent } from '../../components/Object3DComponent'
import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { ParticleEmitterComponent } from '../../../particles/components/ParticleEmitter'
import { ParticleEmitterMesh } from '../../../particles/functions/ParticleEmitterMesh'
import { RenderedComponent } from '../../components/RenderedComponent'

export const SCENE_COMPONENT_PARTICLE_EMITTER = 'particle-emitter'
export const SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES = {
  startSize: 0.25,
  endSize: 0.25,
  sizeRandomness: 0,
  startVelocity: new Vector3(0, 0, 0.5),
  endVelocity: new Vector3(0, 0, 0.5),
  angularVelocity: 0,
  particleCount: 100,
  lifetime: 5,
  lifetimeRandomness: 5,
  ageRandomness: 10,
  endColor: new Color(),
  middleColor: new Color(),
  startColor: new Color(),
  startOpacity: 1,
  middleOpacity: 1,
  endOpacity: 1,
  colorCurve: 'linear',
  velocityCurve: 'linear',
  sizeCurve: 'linear'
}

// todo: add a directional plane helper via another component

export const deserializeParticleEmitter: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<typeof SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES>
) => {
  if (!isClient) return
  json.props.startColor = new Color(json.props.startColor)
  json.props.middleColor = new Color(json.props.middleColor)
  json.props.endColor = new Color(json.props.endColor)

  json.props.startVelocity = new Vector3(
    json.props.startVelocity.x,
    json.props.startVelocity.y,
    json.props.startVelocity.z
  )
  json.props.endVelocity = new Vector3(json.props.endVelocity.x, json.props.endVelocity.y, json.props.endVelocity.z)

  const mesh = new ParticleEmitterMesh(json.props)
  addComponent(entity, ParticleEmitterComponent, mesh)
  addComponent(entity, Object3DComponent, { value: mesh })
  addComponent(entity, RenderedComponent, {})
}

export const updateParticleEmitter: ComponentUpdateFunction = (entity: Entity, props: any): void => {
  if (props.src) {
    AssetLoader.load({ url: props.src }, (texture) => {
      const component = getComponent(entity, ParticleEmitterComponent)
      ;(component.material as ShaderMaterial).uniforms.map.value = texture
      component.updateParticles()
    })
  }
}

export const serializeParticleEmitter: ComponentSerializeFunction = (entity) => {
  const particleEmitterComponent = getComponent(entity, ParticleEmitterComponent)
  if (particleEmitterComponent) {
    return {
      name: SCENE_COMPONENT_PARTICLE_EMITTER,
      props: {
        src: particleEmitterComponent.src,
        startColor: particleEmitterComponent.startColor,
        middleColor: particleEmitterComponent.middleColor,
        endColor: particleEmitterComponent.endColor,
        startOpacity: particleEmitterComponent.startOpacity,
        middleOpacity: particleEmitterComponent.middleOpacity,
        endOpacity: particleEmitterComponent.endOpacity,
        colorCurve: particleEmitterComponent.colorCurve,
        sizeCurve: particleEmitterComponent.sizeCurve,
        startSize: particleEmitterComponent.startSize,
        endSize: particleEmitterComponent.endSize,
        sizeRandomness: particleEmitterComponent.sizeRandomness,
        ageRandomness: particleEmitterComponent.ageRandomness,
        lifetime: particleEmitterComponent.lifetime,
        lifetimeRandomness: particleEmitterComponent.lifetimeRandomness,
        particleCount: particleEmitterComponent.particleCount,
        startVelocity: particleEmitterComponent.startVelocity,
        endVelocity: particleEmitterComponent.endVelocity,
        velocityCurve: particleEmitterComponent.velocityCurve,
        angularVelocity: particleEmitterComponent.angularVelocity
      }
    }
  }
}
