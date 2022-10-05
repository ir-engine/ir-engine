import * as THREE from 'three'
import { Object3D } from 'three'
import System, { SpriteRenderer } from 'three-nebula'

import { dispatchAction } from '@xrengine/hyperflux'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { entityExists } from '../../../ecs/functions/EntityFunctions'
import { formatMaterialArgs } from '../../../renderer/materials/functions/Utilities'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import UpdateableObject3D from '../../classes/UpdateableObject3D'
import { setCallback } from '../../components/CallbackComponent'
import { Object3DComponent, Object3DWithEntity } from '../../components/Object3DComponent'
import {
  ParticleEmitterComponent,
  ParticleEmitterComponentType,
  SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES
} from '../../components/ParticleEmitterComponent'
import { UpdatableCallback, UpdatableComponent } from '../../components/UpdatableComponent'
import { ParticleSystemActions } from '../../systems/ParticleSystem'
import { DefaultArguments, ParticleLibrary } from '../particles/ParticleLibrary'

export const disposeParticleSystem = (entity: Entity) => {
  dispatchAction(
    ParticleSystemActions.destroyParticleSystem({
      entity
    })
  )
}

export const initializeParticleSystem = async (entity: Entity) => {
  if (!entityExists(entity)) return
  const world = Engine.instance.currentWorld
  const ptcComp = getComponent(entity, ParticleEmitterComponent)
  let transform = getComponent(entity, TransformComponent)
  let system
  switch (ptcComp.mode) {
    case 'LIBRARY':
      const defaultArgs = DefaultArguments[ptcComp.src]
      const defaultValues = Object.fromEntries(Object.entries(defaultArgs).map(([k, v]) => [k, (v as any).default]))
      const args = ptcComp.args ? { ...defaultValues, ...ptcComp.args } : defaultValues
      system = await ParticleLibrary[ptcComp.src](args)
      break
    case 'JSON':
      if (typeof ptcComp.src === 'string') {
        ptcComp.src = JSON.parse(ptcComp.src)
      }
      if (ptcComp.src.particleSystemState) {
        ptcComp.src = ptcComp.src.particleSystemState
      }
      system = await System.fromJSONAsync(ptcComp.src, THREE)
      system.addRenderer(new SpriteRenderer(world.scene, THREE))
      break
  }
  return system
}

export const deserializeParticleEmitter: ComponentDeserializeFunction = (
  entity: Entity,
  data: ParticleEmitterComponentType
) => {
  const comp = parseParticleEmitterProperties(data)
  setComponent(entity, ParticleEmitterComponent, comp)
  dispatchAction(ParticleSystemActions.createParticleSystem({ entity }))
}

export const updateParticleEmitter: ComponentUpdateFunction = (entity: Entity) => {}

export const serializeParticleEmitter: ComponentSerializeFunction = (entity: Entity) => {
  const result = { ...getComponent(entity, ParticleEmitterComponent) }
  if (result.mode === 'JSON') result.src = JSON.stringify(result.src)
  return result
}

const parseParticleEmitterProperties = (props): ParticleEmitterComponentType => {
  const result = {
    ...SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES,
    ...props
  }
  switch (result.mode) {
    case 'LIBRARY':
      result.args = formatMaterialArgs(result.args, DefaultArguments[result.src])
      break
    case 'JSON':
      result.src = JSON.parse(result.src)
  }
  return result
}
