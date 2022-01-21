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
  src: '/static/editor/dot.png',
  startSize: 0.25,
  endSize: 0.25,
  sizeRandomness: 0,
  startVelocity: { x: 0, y: 0, z: 0.5 },
  endVelocity: { x: 0, y: 0, z: 0.5 },
  angularVelocity: 0,
  particleCount: 100,
  lifetime: 5,
  lifetimeRandomness: 5,
  ageRandomness: 10,
  endColor: 0xffffff,
  middleColor: 0xffffff,
  startColor: 0xffffff,
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

  const props = parseParticleEmitterProperties(json.props)
  const mesh = new ParticleEmitterMesh(props)

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

const parseParticleEmitterProperties = (props): any => {
  const result = {
    src: props.src ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.src,
    startSize: props.startSize ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.startSize,
    endSize: props.endSize ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.endSize,
    sizeRandomness: props.sizeRandomness ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.sizeRandomness,
    angularVelocity: props.angularVelocity ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.angularVelocity,
    particleCount: props.particleCount ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.particleCount,
    lifetime: props.lifetime ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.lifetime,
    lifetimeRandomness: props.lifetimeRandomness ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.lifetimeRandomness,
    ageRandomness: props.ageRandomness ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.ageRandomness,
    startOpacity: props.startOpacity ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.startOpacity,
    middleOpacity: props.middleOpacity ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.middleOpacity,
    endOpacity: props.endOpacity ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.endOpacity,
    colorCurve: props.colorCurve ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.colorCurve,
    velocityCurve: props.velocityCurve ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.velocityCurve,
    sizeCurve: props.sizeCurve ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.sizeCurve,
    endColor: new Color(props.endColor ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.endColor),
    middleColor: new Color(props.middleColor ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.middleColor),
    startColor: new Color(props.startColor ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.startColor)
  } as any

  let tempV3 = props.startVelocity ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.startVelocity
  result.startVelocity = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  tempV3 = props.endVelocity ?? SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES.endVelocity
  result.endVelocity = new Vector3(tempV3.x, tempV3.y, tempV3.z)

  return result
}
