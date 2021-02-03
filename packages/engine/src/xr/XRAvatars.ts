import { Matrix4, Quaternion, Scene, SkinnedMesh, Vector3 } from "three"
import { Component } from "@xr3ngine/engine/src/ecs/classes/Component"
import {
  copySkeleton,
  countActors as countCharacters,
  findArmature,
  findClosestParentBone,
  findEye,
  findFoot,
  findFurthestParentBone,
  findHand,
  findHead,
  findHips,
  findShoulder,
  findSpine,
  getTailBones,
  importSkeleton
} from "./SkeletonFunctions"
import skeletonString from "./Skeleton"
import LegsManager from "./vrarmik/LegsManager"
import PoseManager from "./vrarmik/PoseManager"
import ShoulderTransforms from "./vrarmik/ShoulderTransforms"
import { fixSkeletonZForward } from "./vrarmik/SkeletonUtils"

const upRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2)
const leftRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI * 0.8)
const rightRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI * 0.8)
const localVector = new Vector3()

export class Avatar extends Component<any> {
  model: any
  options: {}
  skinnedMeshes: any[]
  flipZ: boolean
  flipY: boolean
  flipLeg: boolean
  allHairBones: any[]
  hairBones: any[]
  fingerBones: any
  tailBones: any
  armature: any
  skeleton: any
  Eye_L
  Eye_R
  Head
  Neck
  Chest
  Hips
  Spine
  Left_shoulder
  Left_wrist
  Left_elbow
  Left_arm
  Right_shoulder
  Right_wrist
  Right_elbow
  Right_arm
  Left_ankle
  Left_knee
  Left_leg
  Right_ankle
  Right_knee
  Right_leg
  modelBones = {
    Hips: this.Hips,
    Spine: this.Spine,
    Chest: this.Chest,
    Neck: this.Neck,
    Head: this.Head,
    Left_shoulder: this.Left_shoulder,
    Left_arm: this.Left_arm,
    Left_elbow: this.Left_elbow,
    Left_wrist: this.Left_wrist,
    Left_leg: this.Left_leg,
    Left_knee: this.Left_knee,
    Left_ankle: this.Left_ankle,
    Right_shoulder: this.Right_shoulder,
    Right_arm: this.Right_arm,
    Right_elbow: this.Right_elbow,
    Right_wrist: this.Right_wrist,
    Right_leg: this.Right_leg,
    Right_knee: this.Right_knee,
    Right_ankle: this.Right_ankle
  }
  poseManager: any
  shoulderTransforms: any
  legsManager: any
  inputs: any
  height: any
  shoulderWidth: any
  leftArmLength: any
  rightArmLength: any
  lastModelScaleFactor: number
  lastTimestamp: number
  decapitated: boolean
  modelBoneOutputs: any
  volume: number
  outputs: any

  constructor({ object, options = {} }) {
    super()
    this.model = (() => {
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

        const hips = findHips(skinnedMesh.skeleton)
        const armature = findArmature(hips)
        scene.add(armature)

        o = scene
      }
      return o
    })()
    this.options = options

    this.model.updateMatrixWorld(true)
    const skinnedMeshes = []
    this.model.traverse(o => {
      if (o.isSkinnedMesh) {
        skinnedMeshes.push(o)
      }
    })
    skinnedMeshes.sort((a, b) => b.skeleton.bones.length - a.skeleton.bones.length)
    this.skinnedMeshes = skinnedMeshes

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

    this.tailBones = getTailBones(skeleton)
    this.armature = findArmature(this.Hips)

    // const tailBones = skeleton.bones.filter(bone => bone.children.length === 0);

    /* for (const k in modelBones) {
                  if (!modelBones[k]) {
                    console.warn('missing bone', k);
                  }
                } */
    this.Eye_L = findEye(this.tailBones, true)
    this.Eye_R = findEye(this.tailBones, false)
    this.Head = findHead(this.tailBones)
    this.Neck = this.Head.parent
    this.Chest = this.Neck.parent
    this.Hips = findHips(this.skeleton)
    this.Spine = findSpine(this.Chest, this.Hips)
    this.Left_shoulder = findShoulder(this.tailBones, true)
    this.Left_wrist = findHand(this.Left_shoulder)
    this.Left_elbow = this.Left_wrist.parent
    this.Left_arm = this.Left_elbow.parent
    this.Right_shoulder = findShoulder(this.tailBones, false)
    this.Right_wrist = findHand(this.Right_shoulder)
    this.Right_elbow = this.Right_wrist.parent
    this.Right_arm = this.Right_elbow.parent
    this.Left_ankle = findFoot(this.tailBones, true)
    this.Left_knee = this.Left_ankle.parent
    this.Left_leg = this.Left_knee.parent
    this.Right_ankle = findFoot(this.tailBones, false)
    this.Right_knee = this.Right_ankle.parent
    this.Right_leg = this.Right_knee.parent
    this.modelBones = {
      Hips: this.Hips,
      Spine: this.Spine,
      Chest: this.Chest,
      Neck: this.Neck,
      Head: this.Head,
      Left_shoulder: this.Left_shoulder,
      Left_arm: this.Left_arm,
      Left_elbow: this.Left_elbow,
      Left_wrist: this.Left_wrist,
      Left_leg: this.Left_leg,
      Left_knee: this.Left_knee,
      Left_ankle: this.Left_ankle,
      Right_shoulder: this.Right_shoulder,
      Right_arm: this.Right_arm,
      Right_elbow: this.Right_elbow,
      Right_wrist: this.Right_wrist,
      Right_leg: this.Right_leg,
      Right_knee: this.Right_knee,
      Right_ankle: this.Right_ankle
    }

    const _getEyePosition = () => {
      if (this.Eye_L && this.Eye_R) {
        return this.Eye_L.getWorldPosition(new Vector3())
          .add(this.Eye_R.getWorldPosition(new Vector3()))
          .divideScalar(2)
      } else {
        const neckToHeadDiff = this.Head.getWorldPosition(new Vector3()).sub(this.Neck.getWorldPosition(new Vector3()))
        if (neckToHeadDiff.z < 0) {
          neckToHeadDiff.z *= -1
        }
        return this.Head.getWorldPosition(new Vector3()).add(neckToHeadDiff)
      }
    }
    // const eyeDirection = _getEyePosition().sub(Head.getWorldPosition(new Vector3()));
    const leftArmDirection = this.Left_wrist.getWorldPosition(new Vector3()).sub(
      this.Head.getWorldPosition(new Vector3())
    )
    const flipZ = leftArmDirection.x < 0 //eyeDirection.z < 0;
    const armatureDirection = new Vector3(0, 1, 0).applyQuaternion(this.armature.quaternion)
    const flipY = armatureDirection.z < -0.5
    const legDirection = new Vector3(0, 0, -1).applyQuaternion(
      this.Left_leg.getWorldQuaternion(new Quaternion()).premultiply(this.armature.quaternion.clone().inverse())
    )
    const flipLeg = legDirection.y < 0.5
    console.log("flip", flipZ, flipY, flipLeg)
    this.flipZ = flipZ
    this.flipY = flipY
    this.flipLeg = flipLeg

    const armatureQuaternion = this.armature.quaternion.clone()
    const armatureMatrixInverse = new Matrix4().getInverse(this.armature.matrixWorld)
    this.armature.position.set(0, 0, 0)
    this.armature.quaternion.set(0, 0, 0, 1)
    this.armature.scale.set(1, 1, 1)
    this.armature.updateMatrix()

    this.Head.traverse(o => {
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
    const hairBones = this.tailBones
      .filter(bone => /hair/i.test(bone.name))
      .map(bone => {
        for (; bone; bone = bone.parent) {
          if (bone.parent === this.Head) {
            return bone
          }
        }
        return null
      })
      .filter(bone => bone)
    this.allHairBones = allHairBones
    this.hairBones = hairBones

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
              boneGroups: this.hairBones.map(hairBone => {
                const boneIndices = []
                const _recurse = bone => {
                  boneIndices.push(this.allHairBones.indexOf(bone))
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
              return this.allHairBones[nodeIndex]
            } else {
              throw new Error("unsupported type")
            }
          }
        }
      })
    }

    const _findFinger = (r, left) => {
      const fingerTipBone = this.tailBones
        .filter(
          bone =>
            r.test(bone.name) &&
            findClosestParentBone(
              bone,
              bone => bone === this.modelBones.Left_wrist || bone === this.modelBones.Right_wrist
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
    this.fingerBones = fingerBones

    const preRotations = {}
    const _ensurePrerotation = k => {
      const boneName = this.modelBones[k].name
      if (!preRotations[boneName]) {
        preRotations[boneName] = new Quaternion()
      }
      return preRotations[boneName]
    }
    if (flipY) {
      this.Hips.forEach(k => {
        _ensurePrerotation(k).premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2))
      })
    }
    if (flipZ) {
      this.Hips.forEach(k => {
        _ensurePrerotation(k).premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI))
      })
    }
    if (flipLeg) {
      this.Left_leg.forEach(k => {
        _ensurePrerotation(k).premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2))
      })
      this.Right_leg.forEach(k => {
        _ensurePrerotation(k).premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2))
      })
    }

    const qrArm = flipZ ? this.Left_arm : this.Right_arm
    const qrElbow = flipZ ? this.Left_elbow : this.Right_elbow
    const qrWrist = flipZ ? this.Left_wrist : this.Right_wrist
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
    const qlArm = flipZ ? this.Right_arm : this.Left_arm
    const qlElbow = flipZ ? this.Right_elbow : this.Left_elbow
    const qlWrist = flipZ ? this.Right_wrist : this.Left_wrist
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

    _ensurePrerotation("Right_arm").multiply(qr.clone().inverse())
    _ensurePrerotation("Right_elbow")
      .multiply(qr.clone())
      .premultiply(qr2.clone().inverse())
    _ensurePrerotation("Left_arm").multiply(ql.clone().inverse())
    _ensurePrerotation("Left_elbow")
      .multiply(ql.clone())
      .premultiply(ql2.clone().inverse())

    _ensurePrerotation("Left_leg").premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2))
    _ensurePrerotation("Right_leg").premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2))

    for (const k in preRotations) {
      preRotations[k].inverse()
    }
    fixSkeletonZForward(this.armature.children[0], {
      preRotations
    })
    this.model.traverse(o => {
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
      this.modelBones.Hips.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2))
    }
    if (flipZ) {
      this.modelBones.Hips.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI))
    }
    this.modelBones.Right_arm.quaternion.premultiply(qr.clone().inverse())
    this.modelBones.Right_elbow.quaternion.premultiply(qr).premultiply(qr2.clone().inverse())
    this.modelBones.Left_arm.quaternion.premultiply(ql.clone().inverse())
    this.modelBones.Left_elbow.quaternion.premultiply(ql).premultiply(ql2.clone().inverse())
    this.model.updateMatrixWorld(true)

    this.Hips.traverse(bone => {
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

    this.poseManager = new PoseManager(this)
    this.shoulderTransforms = new ShoulderTransforms(this)
    this.legsManager = new LegsManager(this)

    const _getOffset = (bone, parent = bone.parent) =>
      bone.getWorldPosition(new Vector3()).sub(parent.getWorldPosition(new Vector3()))
    this.initializeBonePositions({
      spine: _getOffset(this.modelBones.Spine),
      chest: _getOffset(this.modelBones.Chest, this.modelBones.Spine),
      neck: _getOffset(this.modelBones.Neck),
      head: _getOffset(this.modelBones.Head),
      eyes: eyePosition.clone().sub(this.Head.getWorldPosition(new Vector3())),

      leftShoulder: _getOffset(this.modelBones.Right_shoulder),
      leftUpperArm: _getOffset(this.modelBones.Right_arm),
      leftLowerArm: _getOffset(this.modelBones.Right_elbow),
      leftHand: _getOffset(this.modelBones.Right_wrist),

      rightShoulder: _getOffset(this.modelBones.Left_shoulder),
      rightUpperArm: _getOffset(this.modelBones.Left_arm),
      rightLowerArm: _getOffset(this.modelBones.Left_elbow),
      rightHand: _getOffset(this.modelBones.Left_wrist),

      leftUpperLeg: _getOffset(this.modelBones.Right_leg),
      leftLowerLeg: _getOffset(this.modelBones.Right_knee),
      leftFoot: _getOffset(this.modelBones.Right_ankle),

      rightUpperLeg: _getOffset(this.modelBones.Left_leg),
      rightLowerLeg: _getOffset(this.modelBones.Left_knee),
      rightFoot: _getOffset(this.modelBones.Left_ankle)
    })

    this.height = eyePosition.sub(
      _averagePoint([
        this.modelBones.Left_ankle.getWorldPosition(new Vector3()),
        this.modelBones.Right_ankle.getWorldPosition(new Vector3())
      ])
    ).y
    this.shoulderWidth = this.modelBones.Left_arm.getWorldPosition(new Vector3()).distanceTo(
      this.modelBones.Right_arm.getWorldPosition(new Vector3())
    )
    this.leftArmLength = this.shoulderTransforms.leftArm.armLength
    this.rightArmLength = this.shoulderTransforms.rightArm.armLength

    this.inputs = {
      hmd: this.poseManager.vrTransforms.head,
      leftGamepad: this.poseManager.vrTransforms.leftHand,
      rightGamepad: this.poseManager.vrTransforms.rightHand
    }
    this.inputs.hmd.scaleFactor = 1
    this.lastModelScaleFactor = 1
    this.outputs = {
      eyes: this.shoulderTransforms.eyes,
      head: this.shoulderTransforms.head,
      hips: this.legsManager.hips,
      spine: this.shoulderTransforms.spine,
      chest: this.shoulderTransforms.transform,
      neck: this.shoulderTransforms.neck,
      leftShoulder: this.shoulderTransforms.leftShoulderAnchor,
      leftUpperArm: this.shoulderTransforms.leftArm.upperArm,
      leftLowerArm: this.shoulderTransforms.leftArm.lowerArm,
      leftHand: this.shoulderTransforms.leftArm.hand,
      rightShoulder: this.shoulderTransforms.rightShoulderAnchor,
      rightUpperArm: this.shoulderTransforms.rightArm.upperArm,
      rightLowerArm: this.shoulderTransforms.rightArm.lowerArm,
      rightHand: this.shoulderTransforms.rightArm.hand,
      leftUpperLeg: this.legsManager.leftLeg.upperLeg,
      leftLowerLeg: this.legsManager.leftLeg.lowerLeg,
      leftFoot: this.legsManager.leftLeg.foot,
      rightUpperLeg: this.legsManager.rightLeg.upperLeg,
      rightLowerLeg: this.legsManager.rightLeg.lowerLeg,
      rightFoot: this.legsManager.rightLeg.foot
    }
    this.modelBoneOutputs = {
      Hips: this.outputs.hips,
      Spine: this.outputs.spine,
      Chest: this.outputs.chest,
      Neck: this.outputs.neck,
      Head: this.outputs.head,

      Left_shoulder: this.outputs.rightShoulder,
      Left_arm: this.outputs.rightUpperArm,
      Left_elbow: this.outputs.rightLowerArm,
      Left_wrist: this.outputs.rightHand,
      Left_leg: this.outputs.rightUpperLeg,
      Left_knee: this.outputs.rightLowerLeg,
      Left_ankle: this.outputs.rightFoot,

      Right_shoulder: this.outputs.leftShoulder,
      Right_arm: this.outputs.leftUpperArm,
      Right_elbow: this.outputs.leftLowerArm,
      Right_wrist: this.outputs.leftHand,
      Right_leg: this.outputs.leftUpperLeg,
      Right_knee: this.outputs.leftLowerLeg,
      Right_ankle: this.outputs.leftFoot
    }

    this.lastTimestamp = Date.now()

    this.shoulderTransforms.Start()
    this.legsManager.Start()

    this.decapitated = false
    if ((options as any).decapitate) {
      this.decapitate()
    }
  }
  initializeBonePositions(setups) {
    this.shoulderTransforms.spine.position.copy(setups.spine)
    this.shoulderTransforms.transform.position.copy(setups.chest)
    this.shoulderTransforms.neck.position.copy(setups.neck)
    this.shoulderTransforms.head.position.copy(setups.head)
    this.shoulderTransforms.eyes.position.copy(setups.eyes)

    this.shoulderTransforms.leftShoulderAnchor.position.copy(setups.leftShoulder)
    this.shoulderTransforms.leftArm.upperArm.position.copy(setups.leftUpperArm)
    this.shoulderTransforms.leftArm.lowerArm.position.copy(setups.leftLowerArm)
    this.shoulderTransforms.leftArm.hand.position.copy(setups.leftHand)

    this.shoulderTransforms.rightShoulderAnchor.position.copy(setups.rightShoulder)
    this.shoulderTransforms.rightArm.upperArm.position.copy(setups.rightUpperArm)
    this.shoulderTransforms.rightArm.lowerArm.position.copy(setups.rightLowerArm)
    this.shoulderTransforms.rightArm.hand.position.copy(setups.rightHand)

    this.legsManager.leftLeg.upperLeg.position.copy(setups.leftUpperLeg)
    this.legsManager.leftLeg.lowerLeg.position.copy(setups.leftLowerLeg)
    this.legsManager.leftLeg.foot.position.copy(setups.leftFoot)

    this.legsManager.rightLeg.upperLeg.position.copy(setups.rightUpperLeg)
    this.legsManager.rightLeg.lowerLeg.position.copy(setups.rightLowerLeg)
    this.legsManager.rightLeg.foot.position.copy(setups.rightFoot)

    this.shoulderTransforms.hips.updateMatrixWorld()
  }
  update() {
    // return;

    const wasDecapitated = this.decapitated
    if (wasDecapitated) {
      this.undecapitate()
    }

    const modelScaleFactor = this.inputs.hmd.scaleFactor
    if (modelScaleFactor !== this.lastModelScaleFactor) {
      this.model.scale.set(modelScaleFactor, modelScaleFactor, modelScaleFactor)
      this.lastModelScaleFactor = modelScaleFactor
    }

    this.shoulderTransforms.Update()
    this.legsManager.Update()

    for (const k in this.modelBones) {
      const modelBone = this.modelBones[k]
      const modelBoneOutput = this.modelBoneOutputs[k]

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
    const timeDiff = Math.min(now - this.lastTimestamp, 1000)
    this.lastTimestamp = now

    if ((this.options as any).fingers) {
      const _processFingerBones = left => {
        const fingerBones = left ? this.fingerBones.left : this.fingerBones.right
        const gamepadInput = left ? this.inputs.rightGamepad : this.inputs.leftGamepad
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

    if (wasDecapitated) {
      this.decapitate()
    }

    if ((this.options as any).visemes) {
      const aaValue = Math.min(this.volume * 10, 1)
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
      this.skinnedMeshes.forEach(o => {
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

  decapitate() {
    if (!this.decapitated) {
      this.modelBones.Head.traverse(o => {
        o.savedPosition.copy(o.position)
        o.savedMatrixWorld.copy(o.matrixWorld)
        o.position.set(NaN, NaN, NaN)
        o.matrixWorld.set(NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN)
      })
      this.decapitated = true
    }
  }
  undecapitate() {
    if (this.decapitated) {
      this.modelBones.Head.traverse(o => {
        o.position.copy(o.savedPosition)
        o.matrixWorld.copy(o.savedMatrixWorld)
      })
      this.decapitated = false
    }
  }

  destroy() {
    //
  }
}
export default Avatar
