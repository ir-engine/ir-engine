import { AnimationClip, Matrix4, Quaternion, SkinnedMesh, Vector3 } from "three";
import { AvatarAnimationSystem } from "../systems/AvatarAnimationSystem";
import { createModelBones, _ensurePrerotation, recurseBoneAttachments } from "./AvatarBodyFunctions";
import { fixSkeletonZForward, retargetClip } from "./SkeletonUtils";

export const standardizeSkeletion = (target: SkinnedMesh) => {
  const source =  AvatarAnimationSystem.instance._defaultSkeleton;
  if(source === undefined){
    return setTimeout(() => {
      standardizeSkeletion(target);
    }, 100);
  }

  
}
