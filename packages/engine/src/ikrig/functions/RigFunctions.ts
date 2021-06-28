import { Vector3 } from "three";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { Chain } from "../components/Chain";
import IKRigComponent from "../components/IKRigComponent";

export const addPoint = (entity, name, boneName) => {
  const rig = getMutableComponent(entity, IKRigComponent);
  rig.points[name] = {
    index: rig.skinnedMesh.skeleton.bones.findIndex(bone => bone.name.includes(boneName))
  };
}

export const addChain = (entity, name, nameArray, end_name = null) => {
  const rig = getMutableComponent(entity, IKRigComponent);

  const chain = new Chain(); // axis
  for (const i of nameArray) {
    const index = rig.skinnedMesh.skeleton.bones.findIndex(bone => bone.name.includes(i));
    const bone = rig.skinnedMesh.skeleton.bones[index];
    bone['index'] = index;

    const boneWorldPosition = new Vector3();
    bone.getWorldPosition(boneWorldPosition);

    const boneChildWorldPosition = new Vector3();
    bone.children[0].getWorldPosition(boneChildWorldPosition);

    bone['length'] = bone.children.length > 0 ? boneWorldPosition.distanceTo(boneChildWorldPosition) : 0;

    const o = { index, ref: bone, length: bone['length'] };

    chain.chainBones.push(o);
    chain.cnt++;
    chain.length += length;
  }

  if (end_name) {
    chain.end_idx = rig.skinnedMesh.skeleton.bones.findIndex(bone => bone.name.toLowerCase().includes(end_name.toLowerCase()));
  }

  rig.chains[name] = chain;
}