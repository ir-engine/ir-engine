import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { IKRigComponent, IKRigTargetComponent } from '../components/IKRigComponent'
import { IKPoseComponent } from '../components/IKPoseComponent'
import { applyIKPoseToIKRig, computeIKPose } from '../functions/IKFunctions'

import { World } from '../../ecs/classes/World'
import { System } from '../../ecs/classes/System'
import { bonesData2 } from '../../avatar/DefaultSkeletonBones'
import { Quaternion, Vector3 } from 'three'

const logCustomTargetRigBones = (targetRig) => {
  if (targetRig.name !== 'custom') {
    return
  }

  console.log('check bones')
  bonesData2.forEach((boneData, index) => {
    const p = new Vector3(...boneData.position)
    const r = new Quaternion(...boneData.quaternion)
    const s = new Vector3(...boneData.scale)
    const tbone = targetRig.tpose!.bones[index]
    console.log(
      '    ',
      boneData.name,
      p.equals(tbone.bone.position),
      r.equals(tbone.bone.quaternion),
      s.equals(tbone.bone.scale)
    )
  })
  console.log('---------')
}

export default async function SkeletonRigSystem(world: World): Promise<System> {
  const ikposeQuery = defineQuery([IKPoseComponent, IKRigComponent, IKRigTargetComponent])

  return () => {
    for (const entity of ikposeQuery()) {
      const ikPose = getComponent(entity, IKPoseComponent)
      const rig = getComponent(entity, IKRigComponent)
      const targetRig = getComponent(entity, IKRigTargetComponent)

      logCustomTargetRigBones(targetRig)
      computeIKPose(rig, ikPose)
      applyIKPoseToIKRig(targetRig, ikPose)
    }
  }
}
