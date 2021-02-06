/**
 * Takes in a rootBone and recursively traverses the bone heirarchy,
 * setting each bone's +Z axis to face it's child bones. The IK system follows this
 * convention, so this step is necessary to update the bindings of a skinned mesh.
 *
 * Must rebind the model to it's skeleton after this function.
 *
 * @param {Bone} rootBone
 * @param {Object} context - options and buffer for stateful bone calculations
 *                 context.exclude: [ boneNames to exclude ]
 *                 context.preRotations: { boneName: Quaternion, ... }
 */
declare function fixSkeletonZForward(rootBone: any, context: any): any;
declare function setQuaternionFromDirection(direction: any, up: any, target: any): any;
declare function clone(source: any): any;
export { fixSkeletonZForward, setQuaternionFromDirection, clone };
