import { System } from "../../ecs/classes/System";
import { addComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import IKRigComponent from "../components/IKRigComponent";
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import IKRigDebugHelper from "../classes/IKRigDebugHelper";
import { IKPoseComponent } from "../components/IKPoseComponent";
import IKRigLinesComponent from "../components/IKRigLinesComponent";
import IKRigPointsComponent from "../components/IKRigPointsComponent";
import { FORWARD, UP } from "../constants/Vector3Constants";
import { applyHip, applyLimb, applyLookTwist, applySpine, computeHip, computeLimb, computeLookTwist, computeSpine, visualizeHip, visualizeLimb, visualizeLookTwist, visualizeSpine } from "../functions/IKFunctions";
import { Vector3 } from "three";

export class IKRigSystem extends System {
  updateType = SystemUpdateType.Fixed;

  execute(delta: number): void {

    for(const entity of this.queryResults.ikpose.all) {
      const ikPose = getMutableComponent(entity, IKPoseComponent);
      const rig = getMutableComponent(entity, IKRigComponent);

      computeHip(rig, ikPose);

      computeLimb(rig.pose, rig.chains.leg_l, ikPose.leg_l);
      // computeLimb(rig.pose, rig.chains.leg_r, ikPose.leg_r);

      // computeLookTwist(rig, rig.points.foot_l, ikPose.foot_l, FORWARD, UP); // Look = Fwd, Twist = Up
      // computeLookTwist(rig, rig.points.foot_r, ikPose.foot_r, FORWARD, UP);

      // computeSpine(rig, rig.chains.spine, ikPose, UP, FORWARD);

      // computeLimb(rig.pose, rig.chains.arm_l, ikPose.arm_l);
      // computeLimb(rig.pose, rig.chains.arm_r, ikPose.arm_r);

      // computeLookTwist(rig, rig.points.head, ikPose.head, FORWARD, UP);

      applyHip(ikPose);

      applyLimb(ikPose, rig.chains.leg_l, ikPose.leg_l);
      // applyLimb(ikPose, rig.chains.leg_r, ikPose.leg_r);

      // applyLookTwist(entity, rig.points.foot_l, ikPose.foot_l, FORWARD, UP);
      // applyLookTwist(entity, rig.points.foot_r, ikPose.foot_r, FORWARD, UP);
      // applySpine(entity, rig.chains.spine, ikPose.spine, UP, FORWARD);

      // applyLimb(ikPose, rig.chains.arm_l, ikPose.arm_l);
      // applyLimb(ikPose, rig.chains.arm_r, ikPose.arm_r);

      // applyLookTwist(entity, rig.points.head, ikPose.head, FORWARD, UP);

      rig.pose.apply();
    }

    for(const entity of this.queryResults.debug.added) {

      addComponent(entity, IKRigPointsComponent);

      const debug = getMutableComponent(entity, IKRigDebugHelper);
      debug.points = getMutableComponent(entity, IKRigPointsComponent);
      debug.points.init();

      addComponent(entity, IKRigLinesComponent);
      debug.lines = getMutableComponent(entity, IKRigLinesComponent);
      debug.lines.init();
    }

    for(const entity of this.queryResults.debug.all) {
      const rig = getMutableComponent(entity, IKRigComponent);
      const ikPose = rig.sourcePose
      const debug = getMutableComponent(entity, IKRigDebugHelper);
      debug.reset();

      // visualizeHip(debug, rig, ikPose);

      visualizeLimb(debug, rig, rig.chains.leg_l, ikPose.leg_l);
      // visualizeLimb(debug, rig, rig.chains.leg_r, ikPose.leg_r);

      // visualizeLookTwist(debug, rig, rig.points.foot_l, ikPose.foot_l);
      // visualizeLookTwist(debug, rig, rig.points.foot_r, ikPose.foot_r);

      // visualizeSpine(debug, rig, rig.chains.spine, ikPose.spine);

      // visualizeLimb(debug, rig, rig.chains.arm_l, ikPose.arm_l);
      // visualizeLimb(debug, rig, rig.chains.arm_r, ikPose.arm_r);
      // visualizeLookTwist(debug, rig, rig.points.head, ikPose.head);

    }
  }
}

IKRigSystem.queries = {
  ikrig: {
    components: [IKRigComponent],
    listen: {
      added: true,
      removed: true,
      changed: true
    }
  },
  ikpose: {
    components: [IKPoseComponent],
    listen: {
      added: true,
      removed: true,
      changed: true
    }
  },
  debug: {
    components: [IKRigDebugHelper],
    listen: {
      added: true,
      removed: true
    }
  }
};