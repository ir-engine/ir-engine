import { LifecycleValue } from "@xr3ngine/engine/src/common/enums/LifecycleValue";
import { isClient } from "@xr3ngine/engine/src/common/functions/isClient";
import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { addObject3DComponent } from "@xr3ngine/engine/src/scene/behaviors/addObject3DComponent";
import { Vec3 } from "cannon-es";
import { AnimationClip, AnimationMixer, BoxGeometry, Group, Matrix4, Mesh, MeshLambertMaterial, Quaternion, Scene, SkinnedMesh, Vector3 } from "three";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { AssetLoaderState } from "../../../assets/components/AssetLoaderState";
import { GLTFLoader } from "../../../assets/loaders/gltf/GLTFLoader";
import { PositionalAudioComponent } from '../../../audio/components/PositionalAudioComponent';
import { FollowCameraComponent } from '../../../camera/components/FollowCameraComponent';
import { CameraModes } from '../../../camera/types/CameraModes';
import { Entity } from "../../../ecs/classes/Entity";
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from "../../../ecs/functions/EntityFunctions";
import { Input } from '../../../input/components/Input';
import { LocalInputReceiver } from '../../../input/components/LocalInputReceiver';
import { Interactor } from '../../../interaction/components/Interactor';
import { NetworkPrefab } from '../../../networking/interfaces/NetworkPrefab';
import { RelativeSpringSimulator } from "../../../physics/classes/SpringSimulator";
import { VectorSpringSimulator } from "../../../physics/classes/VectorSpringSimulator";
import { CapsuleCollider } from "../../../physics/components/CapsuleCollider";
import { CollisionGroups } from "../../../physics/enums/CollisionGroups";
import { PhysicsSystem } from "../../../physics/systems/PhysicsSystem";
import { createShadow } from "../../../scene/behaviors/createShadow";
import TeleportToSpawnPoint from '../../../scene/components/TeleportToSpawnPoint';
import { setState } from "../../../state/behaviors/setState";
import { State } from '../../../state/components/State';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import skeletonString from "../../../xr/Skeleton";
import {
	copySkeleton,
	countActors as countCharacters,
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
} from "../../../xr/SkeletonFunctions";
import PoseManager from "../../../xr/vrarmik/PoseManager";
import ShoulderTransforms from "../../../xr/vrarmik/ShoulderTransforms";
import { fixSkeletonZForward } from "../../../xr/vrarmik/SkeletonUtils";
import { CharacterAvatars } from "../CharacterAvatars";
import { CharacterInputSchema } from '../CharacterInputSchema';
import { CharacterStateSchema } from '../CharacterStateSchema';
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from '../components/CharacterComponent';
import { NamePlateComponent } from '../components/NamePlateComponent';


export class AnimationManager {
	static instance: AnimationManager = new AnimationManager();
	public initialized = false

	_animations: AnimationClip[] = []
	getAnimations(): Promise<AnimationClip[]> {
		return new Promise(resolve => {
			if (!isClient) {
				resolve([]);
				return;
			}

			new GLTFLoader().load('/models/avatars/Animation.glb', gltf => {
					this._animations = gltf.animations;
					this._animations?.forEach(clip => {
						// TODO: make list of morph targets names
						clip.tracks = clip.tracks.filter(track => !track.name.match(/^CC_Base_/));
					});
					resolve(this._animations);
				}
			);
		});
	}

	constructor () {
		this.getAnimations();
	}
}


export const loadActorAvatar: Behavior = (entity) => {
  const avatarId: string = getComponent(entity, CharacterComponent)?.avatarId;
  const avatarSource = CharacterAvatars.find(avatarData => avatarData.id === avatarId)?.src;

  if (hasComponent(entity, AssetLoader)) removeComponent(entity, AssetLoader, true);
  if (hasComponent(entity, AssetLoaderState)) removeComponent(entity, AssetLoaderState, true);

  const tmpGroup = new Group();
  addComponent(entity, AssetLoader, {
    url: avatarSource,
    receiveShadow: true,
    castShadow: true,
    parent: tmpGroup,
  });
  createShadow(entity, { objArgs: { castShadow: true, receiveShadow: true }})
  const loader = getComponent(entity, AssetLoader);
  loader.onLoaded.push(async (entity, args) => {
    console.log("Actor Avatar loaded")
    const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
    actor.mixer && actor.mixer.stopAllAction();
    // forget that we have any animation playing
    actor.currentAnimationAction = [];

    // clear current avatar mesh
    ([...actor.modelContainer.children])
      .forEach(child => actor.modelContainer.remove(child));

    tmpGroup.children.forEach(child => actor.modelContainer.add(child));

    actor.mixer = new AnimationMixer(actor.modelContainer.children[0]);
	// TODO: Remove this. Currently we are double-sampling the samplerate
	actor.mixer.timeScale = 0.5;
    
    initiateIKSystem(entity, args.asset.children[0]);
    const stateComponent = getComponent(entity, State);
    // trigger all states to restart?
    stateComponent.data.forEach(data => data.lifecycleState = LifecycleValue.STARTED);
  })
};

function initiateIKSystem(entity: Entity, object) {
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

	const _findFinger = (r, left) => {
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
			thumb: _findFinger(/thumb/gi, true),
			index: _findFinger(/index/gi, true),
			middle: _findFinger(/middle/gi, true),
			ring: _findFinger(/ring/gi, true),
			little: _findFinger(/little/gi, true) || _findFinger(/pinky/gi, true)
		},
		right: {
			thumb: _findFinger(/thumb/gi, false),
			index: _findFinger(/index/gi, false),
			middle: _findFinger(/middle/gi, false),
			ring: _findFinger(/ring/gi, false),
			little: _findFinger(/little/gi, false) || _findFinger(/pinky/gi, false)
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

	actor.poseManager = new PoseManager(actor)
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

  actor.update = () => {
    const upRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2)
    const leftRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI * 0.8)
    const rightRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI * 0.8)
    const localVector = new Vector3()
    const modelScaleFactor = actor.inputs.hmd.scaleFactor
    if (modelScaleFactor !== actor.lastModelScaleFactor) {
      actor.model.scale.set(modelScaleFactor, modelScaleFactor, modelScaleFactor)
      actor.lastModelScaleFactor = modelScaleFactor
    }

    actor.shoulderTransforms.Update()

    for (const k in actor.modelBones) {
      const modelBone = actor.modelBones[k]
      const modelBoneOutput = actor.modelBoneOutputs[k]

      if (k === "Hips") {
        modelBone.position.copy(modelBoneOutput.position)
      }
      modelBone.quaternion.multiplyQuaternions(modelBoneOutput.quaternion, modelBone.initialQuaternion)

      if (k === "Left_ankle" || k === "Right_ankle") {
        modelBone.quaternion.multiply(upRotation)
      } else if (k === "Left_wrist") {
        modelBone.quaternion.multiply(leftRotation) // center
      } else if (k === "Right_wrist") {
        modelBone.quaternion.multiply(rightRotation) // center
      }
      modelBone.updateMatrixWorld()
    }

    const now = Date.now()
    const timeDiff = Math.min(now - actor.lastTimestamp, 1000)
    actor.lastTimestamp = now

    if ((actor.options as any).fingers) {
      const _processFingerBones = left => {
        const fingerBones = left ? actor.fingerBones.left : actor.fingerBones.right
        const gamepadInput = left ? actor.inputs.rightGamepad : actor.inputs.leftGamepad
        for (const k in fingerBones) {
          const fingerBone = fingerBones[k]
          if (fingerBone) {
            let setter
            if (k === "thumb") {
              setter = (q, i) =>
                q.setFromAxisAngle(
                  localVector.set(0, left ? 1 : -1, 0),
                  gamepadInput.grip * Math.PI * (i === 0 ? 0.125 : 0.25)
                )
            } else if (k === "index") {
              setter = (q, i) =>
                q.setFromAxisAngle(localVector.set(0, 0, left ? -1 : 1), gamepadInput.pointer * Math.PI * 0.5)
            } else {
              setter = (q, i) =>
                q.setFromAxisAngle(localVector.set(0, 0, left ? -1 : 1), gamepadInput.grip * Math.PI * 0.5)
            }
            let index = 0
            fingerBone.traverse(subFingerBone => {
              setter(subFingerBone.quaternion, index++)
            })
          }
        }
      }
      _processFingerBones(true)
      _processFingerBones(false)
    }

    if ((options as any).visemes) {
      const aaValue = Math.min(actor.volume * 10, 1)
      const blinkValue = (() => {
        const nowWindow = now % 2000
        if (nowWindow >= 0 && nowWindow < 100) {
          return nowWindow / 100
        } else if (nowWindow >= 100 && nowWindow < 200) {
          return 1 - (nowWindow - 100) / 100
        } else {
          return 0
        }
      })()
      actor.skinnedMeshes.forEach(o => {
        const { morphTargetDictionary, morphTargetInfluences } = o
        if (morphTargetDictionary && morphTargetInfluences) {
          let aaMorphTargetIndex = morphTargetDictionary["vrc.v_aa"]
          if (aaMorphTargetIndex === undefined) {
            aaMorphTargetIndex = morphTargetDictionary["morphTarget26"]
          }
          if (aaMorphTargetIndex !== undefined) {
            morphTargetInfluences[aaMorphTargetIndex] = aaValue
          }

          let blinkLeftMorphTargetIndex = morphTargetDictionary["vrc.blink_left"]
          if (blinkLeftMorphTargetIndex === undefined) {
            blinkLeftMorphTargetIndex = morphTargetDictionary["morphTarget16"]
          }
          if (blinkLeftMorphTargetIndex !== undefined) {
            morphTargetInfluences[blinkLeftMorphTargetIndex] = blinkValue
          }

          let blinkRightMorphTargetIndex = morphTargetDictionary["vrc.blink_right"]
          if (blinkRightMorphTargetIndex === undefined) {
            blinkRightMorphTargetIndex = morphTargetDictionary["morphTarget17"]
          }
          if (blinkRightMorphTargetIndex !== undefined) {
            morphTargetInfluences[blinkRightMorphTargetIndex] = blinkValue
          }
        }
      })
    }
  }
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
const initializeCharacter: Behavior = (entity): void => {	
	// console.warn("Initializing character for ", entity.id);
	if (!hasComponent(entity, CharacterComponent as any)){
		console.warn("Character does not have a character component, adding");
		addComponent(entity, CharacterComponent as any);
	} else {
		// console.warn("Character already had a character component, not adding, but we should handle")
	}

	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	actor.mixer?.stopAllAction();

	// forget that we have any animation playing
	actor.currentAnimationAction = [];

	// clear current avatar mesh
	if(actor.modelContainer !== undefined)
	  ([ ...actor.modelContainer.children ])
		.forEach(child => actor.modelContainer.remove(child));
	const stateComponent = getComponent(entity, State);
	// trigger all states to restart?
	stateComponent.data.forEach(data => data.lifecycleState = LifecycleValue.STARTED);

	// The visuals group is centered for easy actor tilting
	actor.tiltContainer = new Group();
	actor.tiltContainer.name = 'Actor (tiltContainer)'+entity.id;

	// // Model container is used to reliably ground the actor, as animation can alter the position of the model itself
	actor.modelContainer = new Group();
	actor.modelContainer.name = 'Actor (modelContainer)'+entity.id;
	actor.modelContainer.position.y = -actor.rayCastLength;
	actor.tiltContainer.add(actor.modelContainer);

	// by default all asset childs are moved into entity object3dComponent, which is tiltContainer
	// we should keep it clean till asset loaded and all it's content moved into modelContainer
	addObject3DComponent(entity, { obj3d: actor.tiltContainer });

	if(isClient){
			AnimationManager.instance.getAnimations().then(animations => {
				actor.animations = animations;
			});
		}

	actor.velocitySimulator = new VectorSpringSimulator(60, actor.defaultVelocitySimulatorMass, actor.defaultVelocitySimulatorDamping);
	actor.rotationSimulator = new RelativeSpringSimulator(60, actor.defaultRotationSimulatorMass, actor.defaultRotationSimulatorDamping);

	if(actor.viewVector == null) actor.viewVector = new Vector3();

	const transform = getComponent(entity, TransformComponent);

	// Physics
	// Player Capsule
	addComponent(entity, CapsuleCollider, {
		mass: actor.actorMass,
		position: new Vec3( ...transform.position.toArray() ), // actor.capsulePosition ?
		height: actor.actorHeight,
		radius: actor.capsuleRadius,
		segments: actor.capsuleSegments,
		friction: actor.capsuleFriction
	});

	actor.actorCapsule = getMutableComponent<CapsuleCollider>(entity, CapsuleCollider);
	actor.actorCapsule.body.shapes.forEach((shape) => {
		shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
	});
	actor.actorCapsule.body.allowSleep = false;
	// Move actor to different collision group for raycasting
	actor.actorCapsule.body.collisionFilterGroup = 2;

	// Disable actor rotation
	actor.actorCapsule.body.fixedRotation = true;
	actor.actorCapsule.body.updateMassProperties();

	// Ray cast debug
	const boxGeo = new BoxGeometry(0.1, 0.1, 0.1);
	const boxMat = new MeshLambertMaterial({
		color: 0xff0000
	});
	actor.raycastBox = new Mesh(boxGeo, boxMat);
	//actor.raycastBox.visible = true;
	//Engine.scene.add(actor.raycastBox);
	PhysicsSystem.physicsWorld.addBody(actor.actorCapsule.body);

	// Physics pre/post step callback bindings
	// States
	setState(entity, { state: CharacterStateTypes.DEFAULT });
	actor.initialized = true;

	// };
};


// Prefab is a pattern for creating an entity and component collection as a prototype
export const NetworkPlayerCharacter: NetworkPrefab = {
  // These will be created for all players on the network
  networkComponents: [
    // ActorComponent has values like movement speed, deceleration, jump height, etc
    { type: CharacterComponent },
    // Handle character's body
    { type: CharacterComponent, data: { avatarId: 'Rose' }},
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent },
    // Local player input mapped to behaviors in the input map
    { type: Input, data: { schema: CharacterInputSchema } },
    // Current state (isJumping, isidle, etc)
    { type: State, data: { schema: CharacterStateSchema } },
    { type: NamePlateComponent },
    { type: PositionalAudioComponent }
  ],
  // These are only created for the local player who owns this prefab
  localClientComponents: [
    { type: LocalInputReceiver },
    { type: FollowCameraComponent, data: { distance: 3, mode: CameraModes.ThirdPerson } },
    { type: Interactor }
  
  ],
  serverComponents: [
    { type: TeleportToSpawnPoint },
  ],
  onAfterCreate: [
    {
      behavior: initializeCharacter,
      networked: true
    },
    {
      behavior: loadActorAvatar,
      networked: true
    }

  ],
  onBeforeDestroy: [

  ]
};
