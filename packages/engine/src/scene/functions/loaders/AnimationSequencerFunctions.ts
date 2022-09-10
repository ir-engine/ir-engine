import { RigidBodyType } from '@dimforge/rapier3d-compat'
import { BoxBufferGeometry, Mesh, MeshBasicMaterial, Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getComponentCountOfType,
  hasComponent,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { CollisionGroups, DefaultCollisionMask } from '../../../physics/enums/CollisionGroups'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import {
  AnimationSequencerComponent,
  AnimationSequencerComponentType,
  SequencerAction
} from '../../components/AnimationSequencerComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_ANIMATION_SEQUENCER = 'animation-sequencer'
export const SCENE_COMPONENT_ANIMATION_SEQUENCER_DEFAULT_VALUES = {
  animationIndex: 0,
  targetObject: '',
  loop: false,
  playOnStart: false,
  action: SequencerAction
}

export const deserializeAnimationSequencer: ComponentDeserializeFunction = (
  entity: Entity,
  data: AnimationSequencerComponentType
): void => {
  const props = parseAnimationSequencerProperties(data)
  const seq = setComponent(entity, AnimationSequencerComponent, props)
  if (seq.playOnStart) seq.action.play()

  let obj3d: Object3D = null!
  if (hasComponent(entity, Object3DComponent)) {
    obj3d = getComponent(entity, Object3DComponent).value
  } else {
    obj3d = new Object3D()
    addComponent(entity, Object3DComponent, { value: obj3d })
  }
}

export const serializeAnimationSequencer: ComponentSerializeFunction = (entity) => {
  const animationSequencerComponent = getComponent(entity, AnimationSequencerComponent)
  return {
    name: SCENE_COMPONENT_ANIMATION_SEQUENCER,
    props: {
      animationIndex: animationSequencerComponent.animationIndex,
      targetObject: animationSequencerComponent.targetObject,
      loop: animationSequencerComponent.loop,
      playOnStart: animationSequencerComponent.playOnStart
    }
  }
}

export const shouldDeserializeAnimationSequencer: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(AnimationSequencerComponent) <= 0
}

export const parseAnimationSequencerProperties = (json): AnimationSequencerComponentType => {
  const ac = {
    animationIndex: json.props.animationIndex ?? SCENE_COMPONENT_ANIMATION_SEQUENCER_DEFAULT_VALUES.animationIndex,
    targetObject: json.props.targetObject ?? SCENE_COMPONENT_ANIMATION_SEQUENCER_DEFAULT_VALUES.targetObject,
    loop: json.props.loop ?? SCENE_COMPONENT_ANIMATION_SEQUENCER_DEFAULT_VALUES.loop,
    playOnStart: json.props.playOnStart ?? SCENE_COMPONENT_ANIMATION_SEQUENCER_DEFAULT_VALUES.playOnStart,

    action: new SequencerAction(
      json.props.targetObject ?? SCENE_COMPONENT_ANIMATION_SEQUENCER_DEFAULT_VALUES.targetObject,
      json.props.animationIndex ?? SCENE_COMPONENT_ANIMATION_SEQUENCER_DEFAULT_VALUES.animationIndex,
      json.props.loop ?? SCENE_COMPONENT_ANIMATION_SEQUENCER_DEFAULT_VALUES.loop
    )
  }
  ac.loop = json.props.loop
  console.log(ac)
  console.log(json.props)
  return ac
}
