import { AnimationClip, Object3D, SkinnedMesh, Vector3 } from "three";
import { countCharacters, findClosestParentBone, findEye, findFoot, findFurthestParentBone, findHand, findHead, findHips, findShoulder, findSpine, getTailBones } from "../../../xr/functions/AvatarFunctions";
import { SkeletonUtils } from '../../../assets/threejs-various/SkeletonUtils.js';
import { AnimationManager } from "../prefabs/NetworkPlayerCharacter";


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

  const findFinger = (r, left) => {
    const fingerTipBone = tailBones
      .filter(bone => r.test(bone.name) && findClosestParentBone(bone, bone => bone === Left_wrist || bone === Right_wrist))
      .sort((a, b) => {
        const aName = a.name.replace(r, '');
        const aLeftBalance = countCharacters(aName, /l/i) - countCharacters(aName, /r/i);
        const bName = b.name.replace(r, '');
        const bLeftBalance = countCharacters(bName, /l/i) - countCharacters(bName, /r/i);
        if (!left) {
          return aLeftBalance - bLeftBalance;
        } else {
          return bLeftBalance - aLeftBalance;
        }
      });
    const fingerRootBone = fingerTipBone.length > 0 ? findFurthestParentBone(fingerTipBone[0], bone => r.test(bone.name)) : null;
    return fingerRootBone;
  };



  const tailBones = getTailBones(skeleton);
  const Eye_L = findEye(tailBones, true);
  const Eye_R = findEye(tailBones, false);
  const Head = findHead(tailBones);
  const Neck = Head.parent;
  const Chest = Neck.parent;
  const Hips = findHips(skeleton);
  const Spine = findSpine(Chest, Hips);
  const Left_shoulder = findShoulder(tailBones, true);
  const Left_wrist = findHand(Left_shoulder);
  const Left_elbow = Left_wrist.parent;
  const Left_arm = Left_elbow.parent;
  const Right_shoulder = findShoulder(tailBones, false);
  const Right_wrist = findHand(Right_shoulder);
  const Right_elbow = Right_wrist.parent;
  const Right_arm = Right_elbow.parent;
  const Left_ankle = findFoot(tailBones, true);
  const Left_knee = Left_ankle.parent;
  const Left_leg = Left_knee.parent;
  const Right_ankle = findFoot(tailBones, false);
  const Right_knee = Right_ankle.parent;
  const Right_leg = Right_knee.parent;

  const Leftthumb = findFinger(/thumb/gi, true);
  const Leftindex = findFinger(/index/gi, true);
  const Leftmiddle = findFinger(/middle/gi, true);
  const Leftring = findFinger(/ring/gi, true);
  const Leftlittle = findFinger(/little/gi, true) || findFinger(/pinky/gi, true);

  const Rightthumb = findFinger(/thumb/gi, false);
  const Rightindex = findFinger(/index/gi, false);
  const Rightmiddle = findFinger(/middle/gi, false);
  const Rightring = findFinger(/ring/gi, false);
  const Rightlittle = findFinger(/little/gi, false) || findFinger(/pinky/gi, false);

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
    Left_leg,
    Left_knee,
    Left_ankle,

    Right_shoulder,
    Right_arm,
    Right_elbow,
    Right_wrist,
    Right_leg,
    Right_knee,
    Right_ankle,

    Leftthumb,
    Leftindex,
    Leftmiddle,
    Leftring,
    Leftlittle,

    Rightthumb,
    Rightindex,
    Rightmiddle,
    Rightring,
    Rightlittle,

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