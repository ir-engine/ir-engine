import * as THREE from 'three'
import { AdditiveBlending, Object3D, Sprite, SpriteMaterial } from 'three'
import System, {
  Alpha,
  Body,
  Color,
  ease,
  Emitter,
  Gravity,
  Life,
  Mass,
  PointZone,
  Position,
  RadialVelocity,
  Radius,
  RandomDrift,
  Rate,
  Rotate,
  Scale,
  Span,
  SphereZone,
  SpriteRenderer,
  Vector3D,
  Velocity
} from 'three-nebula'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import UpdateableObject3D from '../../classes/UpdateableObject3D'
import { Object3DComponent, Object3DWithEntity } from '../../components/Object3DComponent'
import { ParticleEmitterComponentType } from '../../components/ParticleEmitterComponent'
import { UpdatableComponent } from '../../components/UpdatableComponent'

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

const initializeParticleSystem = async (entity: Entity) => {
  const map = await AssetLoader.loadAsync('/static/editor/dot.png')
  const createSprite = () => {
    const material = new SpriteMaterial({
      map,
      color: 0xf00,
      blending: AdditiveBlending,
      fog: true
    })
    return new Sprite(material)
  }

  const createEmitter = () => {
    const emitter = new Emitter()
    return emitter
      .setRate(new Rate(new Span(10, 15), new Span(0.05, 0.1)))
      .addInitializers([
        new Body(createSprite()),
        new Mass(1),
        new Life(1, 3),
        new Position(new SphereZone(20)),
        new RadialVelocity(new Span(500, 800), new Vector3D(0, 1, 0), 30)
      ])
      .addBehaviours([
        new RandomDrift(10, 10, 10, 0.05),
        new Scale(new Span(2, 3.5), 0),
        new Gravity(6),
        new Color('#FF0026', ['#ffff00', '#ffff11'], Infinity, ease.easeOutSine)
      ])
      .setPosition({ x: 0, y: -150 })
      .emit()
  }
  const world = Engine.instance.currentWorld
  const system = new System()
  system.addEmitter(createEmitter()).addRenderer(new SpriteRenderer(world.scene, THREE))

  let obj3d = getComponent(entity, Object3DComponent)
  if (!obj3d) {
    const val = new Object3D() as Object3DWithEntity
    val.entity = entity
    world.scene.add(val)
    obj3d = addComponent(entity, Object3DComponent, { value: val })
  }
  const val = obj3d.value as UpdateableObject3D

  val.update = (dt) => system.update()
  if (!hasComponent(entity, UpdatableComponent)) {
    addComponent(entity, UpdatableComponent, {})
  }
}

export const deserializeParticleEmitter: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<ParticleEmitterComponentType>
) => {
  updateParticleEmitter(entity, {})
}

export const updateParticleEmitter: ComponentUpdateFunction = (
  entity: Entity,
  properties: ParticleEmitterComponentType
) => {
  initializeParticleSystem(entity)
}

export const serializeParticleEmitter: ComponentSerializeFunction = (entity: Entity) => {
  return {
    name: SCENE_COMPONENT_PARTICLE_EMITTER,
    props: {}
  }
}

const parseParticleEmitterProperties = (props): ParticleEmitterComponentType => {
  return {
    ...SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES,
    ...props
  }
}
