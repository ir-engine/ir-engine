import { Object3D } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { BoneStructure } from '../AvatarBoneMatching'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'

/**
 * pre-cache height & other necessary measurements based on bone structure in rig component upon avatar load
 *   h: head to foot, a: head to hips, b: hips to knee, c: knee to feet
 */

/**
 *
 * @param bone
 * @param target
 */
export function solveHipHeight(entity: Entity, target: Object3D) {
  const rigComponent = getComponent(entity, AvatarRigComponent)
  const headTargetY = Math.sin(Engine.instance.currentWorld.elapsedSeconds) * 0.25 + 0.75
  rigComponent.rig.Hips.position.y = headTargetY
}
