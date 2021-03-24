import { Matrix4, Quaternion, Scene, SkinnedMesh, Vector3 } from "three";
import { Entity } from "../../ecs/classes/Entity";
import { getMutableComponent, } from "../../ecs/functions/EntityFunctions";
import skeletonString from "../constants/Skeleton";
import {
	copySkeleton,
	countCharacters,
	findArmature,
	findClosestParentBone,
	findEye,
	findFurthestParentBone,
	findHand,
	findHead,
	findHips,
	findShoulder,
	findSpine,
	getTailBones,
	importSkeleton
} from "../functions/AvatarFunctions";
import XRPose from "../classes/XRPose";
import { fixSkeletonZForward } from "../classes/SkeletonUtils";
import ShoulderTransforms from "../classes/ShoulderTransforms";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";

export function initiateIKSystem(entity: Entity, object) {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
  const options = {
    fingers: true,
    hair: true,
    visemes: true,
  }
	actor.model = (() => {
		let o = object
		if (o && !o.isMesh) {
			o = o.scene
		}
		if (!o) {
			const scene = new Scene()

			const skinnedMesh = new SkinnedMesh()
			skinnedMesh.skeleton = null
			skinnedMesh.bind = function(skeleton) {
				this.skeleton = skeleton
			}
			skinnedMesh.bind(importSkeleton(skeletonString))
			scene.add(skinnedMesh)

      console.log(skinnedMesh);
      const hips = findHips(skinnedMesh.skeleton)
			const armature = findArmature(hips)
			scene.add(armature)

			o = scene
		}
		return o
	})()
	actor.options = options

	actor.model.updateMatrixWorld(true)
	const skinnedMeshes = []
	actor.model.traverse(o => {
		if (o.isSkinnedMesh) {
			skinnedMeshes.push(o)
		}
	})
	skinnedMeshes.sort((a, b) => b.skeleton.bones.length - a.skeleton.bones.length)
	actor.skinnedMeshes = skinnedMeshes

	const skeletonSkinnedMesh = skinnedMeshes.find(o => o.skeleton.bones[0].parent) || null
	const skeleton = skeletonSkinnedMesh && skeletonSkinnedMesh.skeleton
	// console.log('got skeleton', skinnedMeshes, skeleton, _exportSkeleton(skeleton));
	const poseSkeletonSkinnedMesh = skeleton
		? skinnedMeshes.find(o => o.skeleton !== skeleton && o.skeleton.bones.length >= skeleton.bones.length)
		: null
	const poseSkeleton = poseSkeletonSkinnedMesh && poseSkeletonSkinnedMesh.skeleton
	if (poseSkeleton) {
		copySkeleton(poseSkeleton, skeleton)
		poseSkeletonSkinnedMesh.bind(skeleton)
	}

	actor.tailBones = getTailBones(skeleton)

  actor.skeleton = skeleton;
	// const tailBones = skeleton.bones.filter(bone => bone.children.length === 0);

	/* for (const k in modelBones) {
								if (!modelBones[k]) {
									console.warn('missing bone', k);
								}
							} */
	actor.Eye_L = findEye(actor.tailBones, true)
	actor.Eye_R = findEye(actor.tailBones, false)
	actor.Head = findHead(actor.tailBones)
	actor.Neck = actor.Head.parent
	actor.Chest = actor.Neck.parent
	actor.Hips = findHips(skeleton)
	actor.Spine = findSpine(actor.Chest, actor.Hips)
  actor.Left_shoulder = findShoulder(actor.tailBones, true)
	actor.Left_wrist = findHand(actor.Left_shoulder)
	actor.Left_elbow = actor.Left_wrist.parent
	actor.Left_arm = actor.Left_elbow.parent
	actor.Right_shoulder = findShoulder(actor.tailBones, false)
	actor.Right_wrist = findHand(actor.Right_shoulder)
	actor.Right_elbow = actor.Right_wrist.parent
	actor.Right_arm = actor.Right_elbow.parent
	actor.modelBones = {
		Spine: actor.Spine,
		Chest: actor.Chest,
		Neck: actor.Neck,
		Head: actor.Head,
		Left_shoulder: actor.Left_shoulder,
		Left_arm: actor.Left_arm,
		Left_elbow: actor.Left_elbow,
		Left_wrist: actor.Left_wrist,
		Right_shoulder: actor.Right_shoulder,
		Right_arm: actor.Right_arm,
		Right_elbow: actor.Right_elbow,
		Right_wrist: actor.Right_wrist
	}

  actor.armature = findArmature(actor.Hips)

	const _getEyePosition = () => {
		if (actor.Eye_L && actor.Eye_R) {
			return actor.Eye_L.getWorldPosition(new Vector3())
				.add(actor.Eye_R.getWorldPosition(new Vector3()))
				.divideScalar(2)
		} else {
			const neckToHeadDiff = actor.Head.getWorldPosition(new Vector3()).sub(actor.Neck.getWorldPosition(new Vector3()))
			if (neckToHeadDiff.z < 0) {
				neckToHeadDiff.z *= -1
			}
			return actor.Head.getWorldPosition(new Vector3()).add(neckToHeadDiff)
		}
	}
	// const eyeDirection = _getEyePosition().sub(Head.getWorldPosition(new Vector3()));
	const leftArmDirection = actor.Left_wrist.getWorldPosition(new Vector3()).sub(
		actor.Head.getWorldPosition(new Vector3())
	)
	const flipZ = leftArmDirection.x < 0 //eyeDirection.z < 0;
	const armatureDirection = new Vector3(0, 1, 0).applyQuaternion(actor.armature.quaternion)
	const flipY = armatureDirection.z < -0.5

	const armatureQuaternion = actor.armature.quaternion.clone()
	const armatureMatrixInverse = new Matrix4().getInverse(actor.armature.matrixWorld)
	actor.armature.position.set(0, 0, 0)
	actor.armature.quaternion.set(0, 0, 0, 1)
	actor.armature.scale.set(1, 1, 1)
	actor.armature.updateMatrix()

	actor.Head.traverse(o => {
		o.savedPosition = o.position.clone()
		o.savedMatrixWorld = o.matrixWorld.clone()
	})

	const allHairBones = []
	const _recurseAllHairBones = bones => {
		for (let i = 0; i < bones.length; i++) {
			const bone = bones[i]
			if (/hair/i.test(bone.name)) {
				allHairBones.push(bone)
			}
			_recurseAllHairBones(bone.children)
		}
	}
	_recurseAllHairBones(skeleton.bones)
	const hairBones = actor.tailBones
		.filter(bone => /hair/i.test(bone.name))
		.map(bone => {
			for (; bone; bone = bone.parent) {
				if (bone.parent === actor.Head) {
					return bone
				}
			}
			return null
		})
		.filter(bone => bone)
	actor.allHairBones = allHairBones
	actor.hairBones = hairBones

	if ((options as any).hair) {
		new Promise((accept, reject) => {
			if (!object) {
				object = {}
			}
			if (!object.parser) {
				object.parser = {
					json: {
						extensions: {}
					}
				}
			}
			if (!object.parser.json.extensions) {
				object.parser.json.extensions = {}
			}
			if (!object.parser.json.extensions.VRM) {
				object.parser.json.extensions.VRM = {
					secondaryAnimation: {
						boneGroups: actor.hairBones.map(hairBone => {
							const boneIndices = []
							const _recurse = bone => {
								boneIndices.push(actor.allHairBones.indexOf(bone))
								if (bone.children.length > 0) {
									_recurse(bone.children[0])
								}
							}
							_recurse(hairBone)
							return {
								comment: hairBone.name,
								stiffiness: 0.5,
								gravityPower: 0.2,
								gravityDir: {
									x: 0,
									y: -1,
									z: 0
								},
								dragForce: 0.3,
								center: -1,
								hitRadius: 0.02,
								bones: boneIndices,
								colliderGroups: []
							}
						})
					}
				}
				object.parser.getDependency = async (type, nodeIndex) => {
					if (type === "node") {
						return actor.allHairBones[nodeIndex]
					} else {
						throw new Error("unsupported type")
					}
				}
			}
		})
	}

	const findFinger = (r, left) => {
		const fingerTipBone = actor.tailBones
			.filter(
				bone =>
					r.test(bone.name) &&
					findClosestParentBone(
						bone,
						bone => bone === actor.modelBones.Left_wrist || bone === actor.modelBones.Right_wrist
					)
			)
			.sort((a, b) => {
				const aName = a.name.replace(r, "")
				const aLeftBalance = countCharacters(aName, /l/i) - countCharacters(aName, /r/i)
				const bName = b.name.replace(r, "")
				const bLeftBalance = countCharacters(bName, /l/i) - countCharacters(bName, /r/i)
				if (!left) {
					return aLeftBalance - bLeftBalance
				} else {
					return bLeftBalance - aLeftBalance
				}
			})
		const fingerRootBone =
			fingerTipBone.length > 0 ? findFurthestParentBone(fingerTipBone[0], bone => r.test(bone.name)) : null
		return fingerRootBone
	}
	const fingerBones = {
		left: {
			thumb: findFinger(/thumb/gi, true),
			index: findFinger(/index/gi, true),
			middle: findFinger(/middle/gi, true),
			ring: findFinger(/ring/gi, true),
			little: findFinger(/little/gi, true) || findFinger(/pinky/gi, true)
		},
		right: {
			thumb: findFinger(/thumb/gi, false),
			index: findFinger(/index/gi, false),
			middle: findFinger(/middle/gi, false),
			ring: findFinger(/ring/gi, false),
			little: findFinger(/little/gi, false) || findFinger(/pinky/gi, false)
		}
	}
	actor.fingerBones = fingerBones

	const preRotations = {}
	const _ensurePrerotation = k => {
		const boneName = actor.modelBones[k].name
		if (!preRotations[boneName]) {
			preRotations[boneName] = new Quaternion()
		}
		return preRotations[boneName]
	}
	if (flipY) {
		actor.Hips.forEach(k => {
			_ensurePrerotation(k).premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2))
		})
	}
	if (flipZ) {
		actor.Hips.forEach(k => {
			_ensurePrerotation(k).premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI))
		})
	}

	const qrArm = flipZ ? actor.Left_arm : actor.Right_arm
	const qrElbow = flipZ ? actor.Left_elbow : actor.Right_elbow
	const qrWrist = flipZ ? actor.Left_wrist : actor.Right_wrist
	const qr = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2).premultiply(
		new Quaternion().setFromRotationMatrix(
			new Matrix4().lookAt(
				new Vector3(0, 0, 0),
				qrElbow
					.getWorldPosition(new Vector3())
					.applyMatrix4(armatureMatrixInverse)
					.sub(qrArm.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
					.applyQuaternion(armatureQuaternion),
				new Vector3(0, 1, 0)
			)
		)
	)
	const qr2 = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2).premultiply(
		new Quaternion().setFromRotationMatrix(
			new Matrix4().lookAt(
				new Vector3(0, 0, 0),
				qrWrist
					.getWorldPosition(new Vector3())
					.applyMatrix4(armatureMatrixInverse)
					.sub(qrElbow.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
					.applyQuaternion(armatureQuaternion),
				new Vector3(0, 1, 0)
			)
		)
	)
	const qlArm = flipZ ? actor.Right_arm : actor.Left_arm
	const qlElbow = flipZ ? actor.Right_elbow : actor.Left_elbow
	const qlWrist = flipZ ? actor.Right_wrist : actor.Left_wrist
	const ql = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2).premultiply(
		new Quaternion().setFromRotationMatrix(
			new Matrix4().lookAt(
				new Vector3(0, 0, 0),
				qlElbow
					.getWorldPosition(new Vector3())
					.applyMatrix4(armatureMatrixInverse)
					.sub(qlArm.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
					.applyQuaternion(armatureQuaternion),
				new Vector3(0, 1, 0)
			)
		)
	)
	const ql2 = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2).premultiply(
		new Quaternion().setFromRotationMatrix(
			new Matrix4().lookAt(
				new Vector3(0, 0, 0),
				qlWrist
					.getWorldPosition(new Vector3())
					.applyMatrix4(armatureMatrixInverse)
					.sub(qlElbow.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
					.applyQuaternion(armatureQuaternion),
				new Vector3(0, 1, 0)
			)
		)
	)

	_ensurePrerotation("Right_arm").multiply(qr.clone().invert())
	_ensurePrerotation("Right_elbow")
		.multiply(qr.clone())
		.premultiply(qr2.clone().invert())
	_ensurePrerotation("Left_arm").multiply(ql.clone().invert())
	_ensurePrerotation("Left_elbow")
		.multiply(ql.clone())
		.premultiply(ql2.clone().invert())

	for (const k in preRotations) {
		preRotations[k].invert()
	}
	fixSkeletonZForward(actor.armature.children[0], {
		preRotations
	})
	actor.model.traverse(o => {
		if (o.isSkinnedMesh) {
			o.bind(
				o.skeleton.bones.length === skeleton.bones.length &&
					o.skeleton.bones.every((bone, i) => bone === skeleton.bones[i])
					? skeleton
					: o.skeleton
			)
		}
	})
	if (flipY) {
		actor.modelBones.Hips.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2))
	}
	if (flipZ) {
		actor.modelBones.Hips.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI))
	}
	actor.modelBones.Right_arm.quaternion.premultiply(qr.clone().invert())
	actor.modelBones.Right_elbow.quaternion.premultiply(qr).premultiply(qr2.clone().invert())
	actor.modelBones.Left_arm.quaternion.premultiply(ql.clone().invert())
	actor.modelBones.Left_elbow.quaternion.premultiply(ql).premultiply(ql2.clone().invert())
	actor.model.updateMatrixWorld(true)

	actor.Hips.traverse(bone => {
		bone.initialQuaternion = bone.quaternion.clone()
	})

	const _averagePoint = points => {
		const result = new Vector3()
		for (let i = 0; i < points.length; i++) {
			result.add(points[i])
		}
		result.divideScalar(points.length)
		return result
	}
	const eyePosition = _getEyePosition()

	actor.poseManager = new XRPose()
	actor.shoulderTransforms = new ShoulderTransforms(actor)

	const _getOffset = (bone, parent = bone.parent) =>
		bone.getWorldPosition(new Vector3()).sub(parent.getWorldPosition(new Vector3()))
	initializeBonePositions(actor, {
		spine: _getOffset(actor.modelBones.Spine),
		chest: _getOffset(actor.modelBones.Chest, actor.modelBones.Spine),
		neck: _getOffset(actor.modelBones.Neck),
		head: _getOffset(actor.modelBones.Head),
		eyes: eyePosition.clone().sub(actor.Head.getWorldPosition(new Vector3())),

		leftShoulder: _getOffset(actor.modelBones.Right_shoulder),
		leftUpperArm: _getOffset(actor.modelBones.Right_arm),
		leftLowerArm: _getOffset(actor.modelBones.Right_elbow),
		leftHand: _getOffset(actor.modelBones.Right_wrist),

		rightShoulder: _getOffset(actor.modelBones.Left_shoulder),
		rightUpperArm: _getOffset(actor.modelBones.Left_arm),
		rightLowerArm: _getOffset(actor.modelBones.Left_elbow),
		rightHand: _getOffset(actor.modelBones.Left_wrist),
	})

	actor.shoulderWidth = actor.modelBones.Left_arm.getWorldPosition(new Vector3()).distanceTo(
		actor.modelBones.Right_arm.getWorldPosition(new Vector3())
	)
	actor.leftArmLength = actor.shoulderTransforms.leftArm.armLength
	actor.rightArmLength = actor.shoulderTransforms.rightArm.armLength

	actor.inputs = {
		hmd: actor.poseManager.vrTransforms.head,
		leftGamepad: actor.poseManager.vrTransforms.leftHand,
		rightGamepad: actor.poseManager.vrTransforms.rightHand
  }
  console.log('load actor status', actor.inputs);

	actor.inputs.hmd.scaleFactor = 1
	actor.lastModelScaleFactor = 1
	actor.outputs = {
		eyes: actor.shoulderTransforms.eyes,
		head: actor.shoulderTransforms.head,
		spine: actor.shoulderTransforms.spine,
		chest: actor.shoulderTransforms.transform,
		neck: actor.shoulderTransforms.neck,
		leftShoulder: actor.shoulderTransforms.leftShoulderAnchor,
		leftUpperArm: actor.shoulderTransforms.leftArm.upperArm,
		leftLowerArm: actor.shoulderTransforms.leftArm.lowerArm,
		leftHand: actor.shoulderTransforms.leftArm.hand,
		rightShoulder: actor.shoulderTransforms.rightShoulderAnchor,
		rightUpperArm: actor.shoulderTransforms.rightArm.upperArm,
		rightLowerArm: actor.shoulderTransforms.rightArm.lowerArm,
		rightHand: actor.shoulderTransforms.rightArm.hand,
	}
	actor.modelBoneOutputs = {
		Hips: actor.outputs.hips,
		Spine: actor.outputs.spine,
		Chest: actor.outputs.chest,
		Neck: actor.outputs.neck,
		Head: actor.outputs.head,

		Left_shoulder: actor.outputs.rightShoulder,
		Left_arm: actor.outputs.rightUpperArm,
		Left_elbow: actor.outputs.rightLowerArm,
		Left_wrist: actor.outputs.rightHand,

		Right_shoulder: actor.outputs.leftShoulder,
		Right_arm: actor.outputs.leftUpperArm,
		Right_elbow: actor.outputs.leftLowerArm,
		Right_wrist: actor.outputs.leftHand,
	}

	actor.lastTimestamp = Date.now()

  actor.shoulderTransforms.Start()

}

function initializeBonePositions(actor, setups) {
	actor.shoulderTransforms.spine.position.copy(setups.spine)
	actor.shoulderTransforms.transform.position.copy(setups.chest)
	actor.shoulderTransforms.neck.position.copy(setups.neck)
	actor.shoulderTransforms.head.position.copy(setups.head)
	actor.shoulderTransforms.eyes.position.copy(setups.eyes)

	actor.shoulderTransforms.leftShoulderAnchor.position.copy(setups.leftShoulder)
	actor.shoulderTransforms.leftArm.upperArm.position.copy(setups.leftUpperArm)
	actor.shoulderTransforms.leftArm.lowerArm.position.copy(setups.leftLowerArm)
	actor.shoulderTransforms.leftArm.hand.position.copy(setups.leftHand)

	actor.shoulderTransforms.rightShoulderAnchor.position.copy(setups.rightShoulder)
	actor.shoulderTransforms.rightArm.upperArm.position.copy(setups.rightUpperArm)
	actor.shoulderTransforms.rightArm.lowerArm.position.copy(setups.rightLowerArm)
	actor.shoulderTransforms.rightArm.hand.position.copy(setups.rightHand)

	actor.shoulderTransforms.hips.updateMatrixWorld()
}