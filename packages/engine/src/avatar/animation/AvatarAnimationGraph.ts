/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { clamp, cloneDeep } from 'lodash'
import { AnimationClip, AnimationMixer, LoopOnce, LoopRepeat, Object3D, Vector3 } from 'three'

import { defineActionQueue, getState } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { lerp } from '../../common/functions/MathLerpFunctions'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { AnimationState } from '../AnimationManager'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { locomotionPack } from '../functions/avatarFunctions'
import { retargetMixamoAnimation } from '../functions/retargetMixamoRig'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'

const animationQueue = defineActionQueue(AvatarNetworkAction.setAnimationState.matches)

export const getAnimationAction = (name: string, mixer: AnimationMixer, animations?: AnimationClip[]) => {
  const manager = getState(AnimationState)
  const clip = AnimationClip.findByName(animations ?? manager.loadedAnimations[locomotionPack]!.animations, name)
  return mixer.clipAction(clip)
}

const currentActionBlendSpeed = 7
const epsilon = 0.01

//blend between locomotion and animation overrides
export const updateAnimationGraph = (avatarEntities: Entity[]) => {
  for (const newAnimation of animationQueue()) {
    const targetEntity = UUIDComponent.entitiesByUUID[newAnimation.entityUUID]
    if (!hasComponent(targetEntity, AvatarAnimationComponent)) {
      console.warn(
        '[updateAnimationGraph]: AvatarAnimationComponent not found on entity',
        targetEntity,
        newAnimation.entityUUID
      )
      continue
    }
    const graph = getMutableComponent(targetEntity, AvatarAnimationComponent).animationGraph
    graph.fadingOut.set(newAnimation.needsSkip ?? false)
    graph.layer.set(newAnimation.layer ?? 0)
    loadAvatarAnimation(targetEntity, newAnimation.filePath, newAnimation.clipName!, newAnimation.loop!)
  }

  for (const entity of avatarEntities) {
    const animationGraph = getMutableComponent(entity, AvatarAnimationComponent).animationGraph

    setAvatarLocomotionAnimation(entity)

    const currentAction = animationGraph.blendAnimation

    if (currentAction.value) {
      const deltaSeconds = getState(EngineState).deltaSeconds
      const locomotionBlend = animationGraph.blendStrength
      currentAction.value.setEffectiveWeight(locomotionBlend.value)
      if (
        (currentAction.value.time >= currentAction.value.getClip().duration - epsilon &&
          currentAction.value.loop != LoopRepeat) ||
        animationGraph.fadingOut.value
      ) {
        currentAction.value.timeScale = 0
        locomotionBlend.set(Math.max(locomotionBlend.value - deltaSeconds * currentActionBlendSpeed, 0))
        if (locomotionBlend.value <= 0) {
          animationGraph.fadingOut.set(false)
          currentAction.set(undefined)
        }
      } else {
        locomotionBlend.set(Math.min(locomotionBlend.value + deltaSeconds * currentActionBlendSpeed, 1))
      }
    }
  }
}

/**Attempts to get animation by name from animation manager if already loaded, or from
 * default-project/assets/animations if not.*/
export const loadAvatarAnimation = (entity: Entity, filePath: string, clipName?: string, loop?: boolean) => {
  const animationState = getState(AnimationState)
  //get state name and file type
  const stateName = filePath.split('/').pop()!.split('.')[0]
  const fileType = filePath.split('.').pop()!

  if (animationState.loadedAnimations[stateName])
    playAvatarAnimationFromMixamo(entity, animationState.loadedAnimations[stateName].scene, loop, clipName)
  else {
    //load from default-project/assets/animations
    AssetLoader.loadAsync(filePath).then((animationsAsset: GLTF) => {
      //if no clipname specified, set first animation name to state name for lookup
      if (!clipName)
        if (fileType == 'fbx') animationsAsset.scene.animations[0].name = stateName
        else animationsAsset.animations[0].name = stateName
      //if it's a glb, set the scene's animations to the asset's animations
      //this lets us assume they are in the same location for both fbx and glb files
      if (fileType == 'glb') animationsAsset.scene.animations = animationsAsset.animations
      animationState.loadedAnimations[stateName] = animationsAsset
      playAvatarAnimationFromMixamo(entity, animationsAsset.scene, loop, clipName)
    })
  }
}

/** Retargets a mixamo animation to the entity's avatar model, then blends in and out of the default locomotion state. */
export const playAvatarAnimationFromMixamo = (
  entity: Entity,
  animationsScene: Object3D,
  loop?: boolean,
  clipName?: string
) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  const avatarAnimationComponent = getMutableComponent(entity, AvatarAnimationComponent)
  const rigComponent = getComponent(entity, AvatarRigComponent)
  if (!rigComponent || !rigComponent.vrm) return
  //if animation is already present on animation component, use it instead of retargeting again
  let retargetedAnimation = animationComponent.animations.find(
    (clip) => clip.name == (clipName ?? animationsScene.animations[0].name)
  )
  //otherwise retarget and push to animation component's animations
  if (!retargetedAnimation) {
    retargetedAnimation = retargetMixamoAnimation(
      cloneDeep(
        clipName
          ? animationsScene.animations.find((clip) => clip.name == clipName) ?? animationsScene.animations[0]
          : animationsScene.animations[0]
      ),
      animationsScene,
      rigComponent.vrm
    )
    animationComponent.animations.push(retargetedAnimation)
  }
  const currentAction = avatarAnimationComponent.animationGraph.blendAnimation
  //before setting animation, stop previous animation if it exists
  if (currentAction.value) currentAction.value.stop()
  //set the animation to the current action
  currentAction.set(
    getAnimationAction(retargetedAnimation.name, animationComponent.mixer, animationComponent.animations)
  )
  if (currentAction.value) {
    currentAction.value.timeScale = 1
    currentAction.value.time = 0
    currentAction.value.loop = loop ? LoopRepeat : LoopOnce
    currentAction.value.play()
  }
  console.log(currentAction.value, 'needs to be ' + LoopRepeat)
}

const moveLength = new Vector3()
let runWeight = 0,
  walkWeight = 0,
  idleWeight = 1

export const setAvatarLocomotionAnimation = (entity: Entity) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  if (!animationComponent.animations) return
  const avatarAnimationComponent = getMutableComponent(entity, AvatarAnimationComponent)

  const idle = getAnimationAction('Idle', animationComponent.mixer, animationComponent.animations)
  const run = getAnimationAction('Run', animationComponent.mixer, animationComponent.animations)
  const walk = getAnimationAction('Walk', animationComponent.mixer, animationComponent.animations)
  if (!idle || !run || !walk) return
  idle.play()
  run.play()
  walk.play()

  //for now we're hard coding layer overrides into the locomotion blending function
  const animationGraph = avatarAnimationComponent.animationGraph
  const idleBlendStrength = animationGraph.blendStrength.value
  const layerOverride = animationGraph.layer.value > 0
  const locomoteBlendStrength = layerOverride ? animationGraph.blendStrength.value : 0
  const needsSkip = animationGraph.fadingOut

  const magnitude = moveLength.copy(avatarAnimationComponent.value.locomotion).setY(0).lengthSq()
  if (animationGraph.blendAnimation && magnitude > 1 && idleBlendStrength >= 1 && !layerOverride) needsSkip.set(true)

  walkWeight = lerp(
    walk.getEffectiveWeight(),
    clamp(1 / (magnitude - 1.65) - locomoteBlendStrength, 0, 1),
    getState(EngineState).deltaSeconds * 4
  )
  runWeight = clamp(magnitude * 0.1 - walkWeight, 0, 1) - locomoteBlendStrength // - fallWeight
  idleWeight = clamp(1 - runWeight - walkWeight, 0, 1) // - fallWeight
  run.setEffectiveWeight(runWeight)
  walk.setEffectiveWeight(walkWeight)
  idle.setEffectiveWeight(idleWeight - idleBlendStrength)
}

export const getRootSpeed = (clip: AnimationClip) => {
  //calculate the speed of the root motion of the clip
  const tracks = clip.tracks
  const rootTrack = tracks[0]
  if (!rootTrack) return 0
  const startPos = new Vector3(rootTrack.values[0], rootTrack.values[1], rootTrack.values[2])
  const endPos = new Vector3(
    rootTrack.values[rootTrack.values.length - 3],
    rootTrack.values[rootTrack.values.length - 2],
    rootTrack.values[rootTrack.values.length - 1]
  )
  const speed = new Vector3().subVectors(endPos, startPos).length() / clip.duration
  return speed
}
