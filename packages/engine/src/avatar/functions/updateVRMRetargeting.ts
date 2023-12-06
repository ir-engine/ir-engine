import { VRM, VRMHumanBoneList } from '@pixiv/three-vrm'
import { Object3D, Quaternion, Vector3 } from 'three'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { MeshComponent } from '../../scene/components/MeshComponent'

export const updateVRMRetargeting = (vrm: VRM, deltaTime: number) => {
  vrm.update(deltaTime)

  const humanoid = (vrm.humanoid as any)._normalizedHumanBones // as VRMHumanoidRig
  for (const boneName of VRMHumanBoneList) {
    const boneNode = humanoid.original.getBoneNode(boneName) as Object3D | null

    if (boneNode != null) {
      const rigBoneNode = humanoid.getBoneNode(boneName)!
      const parentWorldRotation = humanoid._parentWorldRotations[boneName]!
      const invParentWorldRotation = _quatA.copy(parentWorldRotation).invert()
      const boneRotation = humanoid._boneRotations[boneName]!

      boneNode.quaternion
        .copy(rigBoneNode.quaternion)
        .multiply(parentWorldRotation)
        .premultiply(invParentWorldRotation)
        .multiply(boneRotation)

      // Move the mass center of the VRM
      if (boneName === 'hips') {
        const boneWorldPosition = rigBoneNode.getWorldPosition(_boneWorldPos)
        const boneEntity = boneNode.entity
        const parentEntity = getComponent(boneEntity, EntityTreeComponent).parentEntity!
        if (!parentEntity) {
          console.warn('boneNode has no parent', boneNode)
        } else {
          const parentBoneNode =
            getComponent(parentEntity, MeshComponent) ?? getComponent(parentEntity, GroupComponent)?.[0]
          parentBoneNode.updateWorldMatrix(true, false)
          const parentWorldMatrix = parentBoneNode.matrixWorld
          const localPosition = boneWorldPosition.applyMatrix4(parentWorldMatrix.invert())
          boneNode.position.copy(localPosition)
        }
      }
    }
  }
}

const _quatA = new Quaternion()
const _boneWorldPos = new Vector3()
