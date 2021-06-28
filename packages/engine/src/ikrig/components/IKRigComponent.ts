import { SkinnedMesh } from "three";
import { Component } from "../../ecs/classes/Component";
import IKRigDebugHelper from "../classes/IKRigDebugHelper";
import Pose from "../classes/Pose";
import { Chain } from "./Chain";
import { IKPoseComponent } from "./IKPoseComponent";
import Points from "./IKRigPointsComponent";

type ChainGroup = {
  [x: string]: Chain
}

type PointsGroup = {
  [x: string]: Points
}

class IKRigComponent extends Component<IKRigComponent>{
  tpose: Pose = null; // Base pose to calculate math from
  pose: Pose = null; // Working pose to apply math to and copy back to bones
  chains: ChainGroup = {}; // IK Chains
  points: PointsGroup = {}; // Individual IK points (hands, head, feet)

  sourcePose: IKPoseComponent;
  sourceRig: IKRigComponent;
  skinnedMesh: SkinnedMesh
}

export default IKRigComponent;