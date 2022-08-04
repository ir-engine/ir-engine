import * as THREE from 'three'
import { Object3D } from 'three'
import System, { SpriteRenderer } from 'three-nebula'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import UpdateableObject3D from '../../classes/UpdateableObject3D'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent, Object3DWithEntity } from '../../components/Object3DComponent'
import { ParticleEmitterComponent, ParticleEmitterComponentType } from '../../components/ParticleEmitterComponent'
import { UpdatableComponent } from '../../components/UpdatableComponent'
import { DefaultArguments, ParticleLibrary } from '../particles/ParticleLibrary'

export const SCENE_COMPONENT_PARTICLE_EMITTER = 'particle-emitter'
export const SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES = {
  mode: 'LIBRARY',
  src: 'Dust'
}

const initializeParticleSystem = async (entity: Entity) => {
  const world = Engine.instance.currentWorld
  const ptcComp = getComponent(entity, ParticleEmitterComponent)
  let system
  switch (ptcComp.mode) {
    case 'LIBRARY':
      const defaultValues = Object.fromEntries(
        Object.entries(DefaultArguments[ptcComp.src]).map(([k, v]) => [k, (v as any).default])
      )
      system = await ParticleLibrary[ptcComp.src](ptcComp.args ? { ...defaultValues, ...ptcComp.args } : defaultValues)
      break
    case 'JSON':
      system = await System.fromJSONAsync(ptcComp.src.particleSystemState, THREE)
      system.addRenderer(new SpriteRenderer(world.scene, THREE))
      break
  }
  let obj3d = getComponent(entity, Object3DComponent)
  if (!obj3d) {
    const val = new Object3D() as Object3DWithEntity
    val.entity = entity
    world.scene.add(val)
    obj3d = addComponent(entity, Object3DComponent, { value: val })
  }
  const val = obj3d.value as UpdateableObject3D
  val.update = (dt) => {
    system.emitters.map((emitter) => emitter.setPosition(obj3d.value.position))
    system.update()
  }
  if (!hasComponent(entity, UpdatableComponent)) {
    addComponent(entity, UpdatableComponent, {})
  }
}

export const deserializeParticleEmitter: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<ParticleEmitterComponentType>
) => {
  const comp = parseParticleEmitterProperties(json)
  addComponent(entity, ParticleEmitterComponent, comp)
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_PARTICLE_EMITTER)
  updateParticleEmitter(entity, comp)
}

export const updateParticleEmitter: ComponentUpdateFunction = (
  entity: Entity,
  properties: ParticleEmitterComponentType
) => {
  initializeParticleSystem(entity)
}

export const serializeParticleEmitter: ComponentSerializeFunction = (entity: Entity) => {
  const result = { ...getComponent(entity, ParticleEmitterComponent) }
  result.src = JSON.stringify(result.src)
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
  if (result.mode === 'JSON') result.src = JSON.parse(result.src)
  return result
}
