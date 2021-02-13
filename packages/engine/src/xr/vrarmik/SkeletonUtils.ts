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

import { Matrix4, Quaternion, Vector3 } from "three"

function fixSkeletonZForward(rootBone, context) {
  context = context || {}
  precalculateZForwards(rootBone, context)
  if (context.exclude) {
    const bones = [rootBone]
    rootBone.traverse(b => bones.push(b))
    bones.forEach(b => {
      if (~context.exclude.indexOf(b.id) || ~context.exclude.indexOf(b.name)) {
        delete context.averagedDirs[b.id]
      }
    })
  }
  return setZForward(rootBone, context)
}

const RESETQUAT = new Quaternion()
const Y_AXIS = new Vector3(0, 1, 0)

/**
 * Takes in a rootBone and recursively traverses the bone heirarchy,
 * setting each bone's +Z axis to face it's child bones. The IK system follows this
 * convention, so this step is necessary to update the bindings of a skinned mesh.
 *
 * Must rebind the model to it's skeleton after this function.
 *
 * @param {BONE} rootBone
 */

function precalculateZForwards(rootBone, context) {
  context = context || rootBone
  context.worldPos = context.worldPos || {}
  context.averagedDirs = context.averagedDirs || {}
  context.preRotations = context.preRotations || {}
  getOriginalWorldPositions(rootBone, context.worldPos)
  calculateAverages(rootBone, context.worldPos, context.averagedDirs)
  return context
}

function setZForward(rootBone, context) {
  if (!context || !context.worldPos) {
    context = context || {}
    precalculateZForwards(rootBone, context)
  }
  updateTransformations(rootBone, context.worldPos, context.averagedDirs, context.preRotations)
  return context
}

function calculateAverages(parentBone, worldPos, averagedDirs) {
  const averagedDir = new Vector3()
  parentBone.children.forEach(childBone => {
    //average the child bone world pos
    const childBonePosWorld = worldPos[childBone.id][0]
    averagedDir.add(childBonePosWorld)
  })

  averagedDir.multiplyScalar(1 / parentBone.children.length)
  averagedDirs[parentBone.id] = averagedDir

  parentBone.children.forEach(childBone => {
    calculateAverages(childBone, worldPos, averagedDirs)
  })
}

function updateTransformations(parentBone, worldPos, averagedDirs, preRotations) {
  const averagedDir = averagedDirs[parentBone.id]
  if (averagedDir) {
    //set quaternion
    parentBone.quaternion.copy(RESETQUAT)
    // parentBone.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI*2));
    parentBone.updateMatrixWorld()

    //get the child bone position in local coordinates
    // var childBoneDir = parentBone.worldToLocal(averagedDir.clone()).normalize();

    //set direction to face child
    // setQuaternionFromDirection(childBoneDir, Y_AXIS, parentBone.quaternion)
    // console.log('new quaternion', parentBone.quaternion.toArray().join(','));
  }
  const preRot = preRotations[parentBone.id] || preRotations[parentBone.name]
  if (preRot) parentBone.quaternion.multiply(preRot)
  // parentBone.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI));
  parentBone.updateMatrixWorld()

  //set child bone position relative to the new parent matrix.
  parentBone.children.forEach(childBone => {
    const childBonePosWorld = worldPos[childBone.id][0].clone()
    parentBone.worldToLocal(childBonePosWorld)
    childBone.position.copy(childBonePosWorld)
  })

  parentBone.children.forEach(childBone => {
    updateTransformations(childBone, worldPos, averagedDirs, preRotations)
  })
}

//borrowing this from utils.js , not sure how to import it
const t1 = new Vector3()
const t2 = new Vector3()
const t3 = new Vector3()
const m1 = new Matrix4()
function setQuaternionFromDirection(direction, up, target) {
  const x = t1
  const y = t2
  const z = t3
  const m = m1
  const el = m1.elements

  z.copy(direction)
  x.crossVectors(up, z)

  if (x.lengthSq() === 0) {
    // parallel
    if (Math.abs(up.z) === 1) {
      z.x += 0.0001
    } else {
      z.z += 0.0001
    }
    z.normalize()
    x.crossVectors(up, z)
  }

  x.normalize()
  y.crossVectors(z, x)

  el[0] = x.x
  el[4] = y.x
  el[8] = z.x
  el[1] = x.y
  el[5] = y.y
  el[9] = z.y
  el[2] = x.z
  el[6] = y.z
  el[10] = z.z

  return target.setFromRotationMatrix(m)
}

function getOriginalWorldPositions(rootBone, worldPos) {
  const rootBoneWorldPos = rootBone.getWorldPosition(new Vector3())
  worldPos[rootBone.id] = [rootBoneWorldPos]
  rootBone.children.forEach(child => {
    getOriginalWorldPositions(child, worldPos)
  })
}

function _worldToLocalDirection(direction, parent) {
  const inverseParent = new Matrix4().getInverse(parent.matrixWorld)
  direction.transformDirection(inverseParent)
  return direction
}

function _localToWorldDirection(direction, parent) {
  const parentMat = parent.matrixWorld
  direction.transformDirection(parentMat)
  return direction
}

function clone(source) {

		const sourceLookup = new Map();
		const cloneLookup = new Map();

		const clone = source.clone();

		parallelTraverse( source, clone, ( sourceNode, clonedNode ) => {

			sourceLookup.set( clonedNode, sourceNode );
			cloneLookup.set( sourceNode, clonedNode );

		} );

		clone.traverse( ( node ) => {

			if ( ! node.isSkinnedMesh ) return;

			const clonedMesh = node;
			const sourceMesh = sourceLookup.get( node );
			const sourceBones = sourceMesh.skeleton.bones;

			clonedMesh.skeleton = sourceMesh.skeleton.clone();
			clonedMesh.bindMatrix.copy( sourceMesh.bindMatrix );

			clonedMesh.skeleton.bones = sourceBones.map( ( bone ) => {

				return cloneLookup.get( bone );

			} );

			clonedMesh.bind( clonedMesh.skeleton, clonedMesh.bindMatrix );

		} );

		return clone;

}



function parallelTraverse( a, b, callback ) {

	callback( a, b );

	for ( let i = 0; i < a.children.length; i ++ ) {

		parallelTraverse( a.children[ i ], b.children[ i ], callback );

	}

}

export { fixSkeletonZForward, setQuaternionFromDirection, clone }
