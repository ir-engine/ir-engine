import { AnimationClip, Bone, Object3D, SkinnedMesh, Vector3 } from "three";
import { countCharacters, findClosestParentBone, findEye, findFoot, findFurthestParentBone, findHand, findHead, findHips, findShoulder, findSpine, getTailBones } from "../../xr/functions/AvatarFunctions";
import { AnimationManager } from "../AnimationManager";
import { SkeletonUtils } from "../SkeletonUtils";

export const standardizeSkeletion = (target: SkinnedMesh, source: SkinnedMesh) => {

  const targetBones = GetBones(target.skeleton);
  const sourceBones = GetBones(source.skeleton);
  Object.values(targetBones).forEach((element, id) => {
    const boneType = Object.keys(targetBones)[id];
    console.log("Target bone is", element.name);
    console.log("Source bone is", sourceBones[boneType].name);
    element.name = sourceBones[boneType].name;
  })

  const newClips: AnimationClip[] = [];
  AnimationManager.instance._animations.forEach((clip) => {
    const newClip = SkeletonUtils.retargetClip(target, source, clip, { hip: sourceBones.Hips.name });
    newClips.push(newClip);
  })

  AnimationManager.instance._animations = newClips;
}


const GetBones = (skeleton) => {
  console.log("Getting bones!");
  console.log(skeleton);
  const findClosestChildBone = (bone, pred) => {
    const _recurse = bone => {
      if (pred(bone)) {
        return bone;
      } else {
        for (let i = 0; i < bone.children.length; i++) {
          const result = _recurse(bone.children[i]);
          if (result) {
            return result;
          }
        }
        return null;
      }
    }
    return _recurse(bone);
  };
  const findHand = shoulderBone => findClosestChildBone(shoulderBone, bone => /hand|wrist/i.test(bone.name));
  const findFinger = (handBone, r) => findClosestChildBone(handBone, bone => r.test(bone.name));

  const getOptional = o => o || new Bone();

  const ensureParent = (o, parent?) => {
    if (!o.parent) {
      if (!parent) {
        parent = new Bone();
      }
      parent.add(o);
    }
    return o.parent;
  };

  const tailBones = getTailBones(skeleton);
  const Eye_L =findEye(tailBones, true);
  const Eye_R =findEye(tailBones, false);
  const Head =findHead(tailBones);
  const Neck = Head.parent;
  const Chest = Neck.parent;
  const Hips =findHips(skeleton);
  const Spine =findSpine(Chest, Hips);
  const Left_shoulder =findShoulder(tailBones, true);
  const Left_wrist =findHand(Left_shoulder);
  const Left_thumb2 =getOptional(findFinger(Left_wrist, /thumb3_end|thumb2_|handthumb3|thumb_distal|thumb02l|l_thumb3|thumb002l/i));
  const Left_thumb1 =ensureParent(Left_thumb2);
  const Left_thumb0 =ensureParent(Left_thumb1, Left_wrist);
  const Left_indexFinger3 =getOptional(findFinger(Left_wrist, /index(?:finger)?3|index_distal|index02l|indexfinger3_l|index002l/i));
  const Left_indexFinger2 =ensureParent(Left_indexFinger3);
  const Left_indexFinger1 =ensureParent(Left_indexFinger2, Left_wrist);
  const Left_middleFinger3 =getOptional(findFinger(Left_wrist, /middle(?:finger)?3|middle_distal|middle02l|middlefinger3_l|middle002l/i));
  const Left_middleFinger2 =ensureParent(Left_middleFinger3);
  const Left_middleFinger1 =ensureParent(Left_middleFinger2, Left_wrist);
  const Left_ringFinger3 =getOptional(findFinger(Left_wrist, /ring(?:finger)?3|ring_distal|ring02l|ringfinger3_l|ring002l/i));
  const Left_ringFinger2 =ensureParent(Left_ringFinger3);
  const Left_ringFinger1 =ensureParent(Left_ringFinger2, Left_wrist);
  const Left_littleFinger3 =getOptional(findFinger(Left_wrist, /little(?:finger)?3|pinky3|little_distal|little02l|lifflefinger3_l|little002l/i));
  const Left_littleFinger2 =ensureParent(Left_littleFinger3);
  const Left_littleFinger1 =ensureParent(Left_littleFinger2, Left_wrist);
  const Left_elbow = Left_wrist.parent;
  const Left_arm = Left_elbow.parent;
  const Right_shoulder =findShoulder(tailBones, false);
  const Right_wrist =findHand(Right_shoulder);
  const Right_thumb2 =getOptional(findFinger(Right_wrist, /thumb3_end|thumb2_|handthumb3|thumb_distal|thumb02r|r_thumb3|thumb002r/i));
  const Right_thumb1 =ensureParent(Right_thumb2);
  const Right_thumb0 =ensureParent(Right_thumb1, Right_wrist);
  const Right_indexFinger3 =getOptional(findFinger(Right_wrist, /index(?:finger)?3|index_distal|index02r|indexfinger3_r|index002r/i));
  const Right_indexFinger2 =ensureParent(Right_indexFinger3);
  const Right_indexFinger1 =ensureParent(Right_indexFinger2, Right_wrist);
  const Right_middleFinger3 =getOptional(findFinger(Right_wrist, /middle(?:finger)?3|middle_distal|middle02r|middlefinger3_r|middle002r/i));
  const Right_middleFinger2 =ensureParent(Right_middleFinger3);
  const Right_middleFinger1 =ensureParent(Right_middleFinger2, Right_wrist);
  const Right_ringFinger3 =getOptional(findFinger(Right_wrist, /ring(?:finger)?3|ring_distal|ring02r|ringfinger3_r|ring002r/i));
  const Right_ringFinger2 =ensureParent(Right_ringFinger3);
  const Right_ringFinger1 =ensureParent(Right_ringFinger2, Right_wrist);
  const Right_littleFinger3 =getOptional(findFinger(Right_wrist, /little(?:finger)?3|pinky3|little_distal|little02r|lifflefinger3_r|little002r/i));
  const Right_littleFinger2 =ensureParent(Right_littleFinger3);
  const Right_littleFinger1 =ensureParent(Right_littleFinger2, Right_wrist);
  const Right_elbow = Right_wrist.parent;
  const Right_arm = Right_elbow.parent;
  const Left_ankle =findFoot(tailBones, true);
  const Left_knee = Left_ankle.parent;
  const Left_leg = Left_knee.parent;
  const Right_ankle =findFoot(tailBones, false);
  const Right_knee = Right_ankle.parent;
  const Right_leg = Right_knee.parent;

  const modelBones = {
    Hips,
    Spine,
    Chest,
    Neck,
    Head,
    /* Eye_L,
    Eye_R, */

    Left_shoulder,
    Left_arm,
    Left_elbow,
    Left_wrist,
    Left_thumb2,
    Left_thumb1,
    Left_thumb0,
    Left_indexFinger3,
    Left_indexFinger2,
    Left_indexFinger1,
    Left_middleFinger3,
    Left_middleFinger2,
    Left_middleFinger1,
    Left_ringFinger3,
    Left_ringFinger2,
    Left_ringFinger1,
    Left_littleFinger3,
    Left_littleFinger2,
    Left_littleFinger1,
    Left_leg,
    Left_knee,
    Left_ankle,

    Right_shoulder,
    Right_arm,
    Right_elbow,
    Right_wrist,
    Right_thumb2,
    Right_thumb1,
    Right_thumb0,
    Right_indexFinger3,
    Right_indexFinger2,
    Right_indexFinger1,
    Right_middleFinger3,
    Right_middleFinger2,
    Right_middleFinger1,
    Right_ringFinger3,
    Right_ringFinger2,
    Right_ringFinger1,
    Right_littleFinger3,
    Right_littleFinger2,
    Right_littleFinger1,
    Right_leg,
    Right_knee,
    Right_ankle,
  };

  return modelBones;
}


export const GetBoneMapping = (skeleton) => {
  const targetBones = GetBones(skeleton);
  const boneMapping = {}
  Object.values(targetBones).forEach((element, id) => {
    const boneType = Object.keys(targetBones)[id];
    //boneMapping[element.name]=DefaultCharacterBones[boneType];
  })
  return boneMapping;
}