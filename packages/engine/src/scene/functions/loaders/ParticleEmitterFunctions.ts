import * as THREE from 'three'
import { Group } from 'three'
import System, { SpriteRenderer } from 'three-nebula'

import { dispatchAction } from '@xrengine/hyperflux'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import {
  getComponent,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { entityExists } from '../../../ecs/functions/EntityFunctions'
import { formatMaterialArgs } from '../../../renderer/materials/functions/MaterialLibraryFunctions'
import {
  ParticleEmitterComponent,
  ParticleEmitterComponentType,
  SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES
} from '../../components/ParticleEmitterComponent'
import { ParticleSystemActions } from '../../systems/ParticleSystem'
import { DefaultArguments, ParticleLibrary } from '../particles/ParticleLibrary'
import { addObjectToGroup } from '../../components/GroupComponent'
import { ParticleSystem } from '../particles/ParticleTypes'

export const disposeParticleSystem = (entity: Entity) => {
  dispatchAction(
    ParticleSystemActions.destroyParticleSystem({
      entity
    })
  )
}

export const initializeParticleSystem = async (entity: Entity) => {
  if (!entityExists(entity)) return
  const container = new Group()
  console.log('initializeParticleSystem', container)
  const ptcComp = getComponent(entity, ParticleEmitterComponent)
  let system: ParticleSystem
  switch (ptcComp.mode) {
    case 'LIBRARY':
      const defaultArgs = DefaultArguments[ptcComp.src]
      const defaultValues = Object.fromEntries(Object.entries(defaultArgs).map(([k, v]) => [k, (v as any).default]))
      const args = ptcComp.args ? { ...defaultValues, ...ptcComp.args } : defaultValues
      system = await ParticleLibrary[ptcComp.src](container, args)
      break
    case 'JSON':
      if (typeof ptcComp.src === 'string') {
        ptcComp.src = JSON.parse(ptcComp.src)
      } else if ((ptcComp.src as any).particleSystemState) {
        ptcComp.src = (ptcComp.src as any).particleSystemState
      }
      system = await System.fromJSONAsync(ptcComp.src, THREE)
      system.addRenderer(new SpriteRenderer(container, THREE))
      break
  }
  addObjectToGroup(entity, container)
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
