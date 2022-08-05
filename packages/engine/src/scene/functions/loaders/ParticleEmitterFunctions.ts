import * as THREE from 'three'
import { Object3D } from 'three'
import System, { SpriteRenderer } from 'three-nebula'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { dispatchAction } from '@xrengine/hyperflux'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { formatMaterialArgs } from '../../../renderer/materials/Utilities'
import UpdateableObject3D from '../../classes/UpdateableObject3D'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent, Object3DWithEntity } from '../../components/Object3DComponent'
import { ParticleEmitterComponent, ParticleEmitterComponentType } from '../../components/ParticleEmitterComponent'
import { UpdatableComponent } from '../../components/UpdatableComponent'
import { ParticleSystemActions } from '../../systems/ParticleSystem'
import { DefaultArguments, ParticleLibrary } from '../particles/ParticleLibrary'

export const SCENE_COMPONENT_PARTICLE_EMITTER = 'particle-emitter'
export const SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES = {
  mode: 'LIBRARY',
  src: 'Dust'
}

export const disposeParticleSystem = (entity: Entity) => {
  const obj3d = getComponent(entity, Object3DComponent)?.value
  if (!obj3d) return
  dispatchAction(
    ParticleSystemActions.disposeParticleSystem({
      entity
    })
  )
}

export const initializeParticleSystem = async (entity: Entity) => {
  const world = Engine.instance.currentWorld
  const ptcComp = getComponent(entity, ParticleEmitterComponent)
  let obj3d = getComponent(entity, Object3DComponent)
  if (!obj3d) {
    const val = new Object3D() as Object3DWithEntity
    val.entity = entity
    world.scene.add(val)
    obj3d = addComponent(entity, Object3DComponent, { value: val })
  }
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
  const val = obj3d.value as UpdateableObject3D
  val.update = (dt) => {
    system.emitters.map((emitter) => emitter.setPosition(obj3d.value.position))
    system.update(dt)
  }
  if (!hasComponent(entity, UpdatableComponent)) addComponent(entity, UpdatableComponent, {})

  return system
}

export const deserializeParticleEmitter: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<ParticleEmitterComponentType>
) => {
  const comp = parseParticleEmitterProperties(json.props)
  addComponent(entity, ParticleEmitterComponent, comp)
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_PARTICLE_EMITTER)
  dispatchAction(ParticleSystemActions.createParticleSystem({ entity }))
  //initializeParticleSystem(entity)
  //updateParticleEmitter(entity, comp)
}

export const updateParticleEmitter: ComponentUpdateFunction = (
  entity: Entity,
  properties: ParticleEmitterComponentType
) => {
  //dispatchAction(ParticleSystemActions.createParticleSystem({entity}))
  //initializeParticleSystem(entity)
  //initializeParticleSystem(entity)
}

export const serializeParticleEmitter: ComponentSerializeFunction = (entity: Entity) => {
  const result = { ...getComponent(entity, ParticleEmitterComponent) }
  if (result.mode === 'JSON') result.src = JSON.stringify(result.src)
  return {
    name: SCENE_COMPONENT_PARTICLE_EMITTER,
    props: result
  }
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
