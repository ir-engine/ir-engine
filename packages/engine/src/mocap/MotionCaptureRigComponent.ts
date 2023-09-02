import { VRMHumanBoneList, VRMHumanBoneName } from '@pixiv/three-vrm'
import { useEffect } from 'react'
import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { proxifyQuaternion, proxifyVector3 } from '../common/proxies/createThreejsProxy'
import { defineComponent } from '../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../ecs/functions/EntityFunctions'
import { QuaternionSchema } from '../transform/components/TransformComponent'

export const MotionCaptureRigComponent = defineComponent({
  name: 'MotionCaptureRigComponent',

  schema: {
    rig: Object.fromEntries(VRMHumanBoneList.map((b) => [b, QuaternionSchema])) as Record<
      VRMHumanBoneName,
      typeof QuaternionSchema
    >
  },

  reactor: function () {
    const entity = useEntityContext()

    useEffect(() => {
      for (const boneName of VRMHumanBoneList) {
        proxifyVector3(AvatarRigComponent.rig[boneName].position, entity)
        proxifyQuaternion(AvatarRigComponent.rig[boneName].rotation, entity)
      }
    }, [])

    return null
  }
})
