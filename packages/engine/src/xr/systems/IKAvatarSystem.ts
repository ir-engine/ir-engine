import XRPose from '../classes/XRPose';
import LegsManager from '../classes/LegsManager';
import {VRMSpringBoneImporter} from "@pixiv/three-vrm";
import { Quaternion, Vector3, Matrix4, Object3D, Bone, Scene } from 'three';
import { importSkeleton, findHips, findArmature, copySkeleton, makeDebugMeshes, getTailBones, findEye, findHead, findSpine, findShoulder, findHand, findFinger, findFoot, findClosestParentBone, countCharacters, findFurthestParentBone, localMatrix, localVector, localVector2, AnimationMapping, localEuler, localQuaternion, leftRotation, rightRotation, upRotation } from '../functions/AvatarFunctions';
import skeletonString from '../constants/Skeleton';
import ShoulderTransforms from '../classes/ShoulderTransforms';
import { fixSkeletonZForward } from '../classes/SkeletonUtils';

export class Avatar {
  shoulderTransforms: any;
  legsManager: any;
  poseManager: any;
  modelBones: any;
  debugMeshes: any;
  decapitated: boolean;
  sdkInputs: any;
  inputs: any;
  options: {};
  debug = true;
  springBoneManager: any;
  lastModelScaleFactor: any;
  model: any;
  modelBoneOutputs: any;
  outputs: any;
  skinnedMeshesVisemeMappings: any;
  volume: number;
  fingerBoneMap: any;
  object: any;
  skinnedMeshes: any[];
  flipZ: boolean;
  flipY: boolean;
  flipLeg: boolean;
  allHairBones: any[];
  hairBones: any[];
  height: any;
  shoulderWidth: any;
  leftArmLength: any;
  rightArmLength: any;
  handOffsetLeft: Vector3;
  handOffsetRight: Vector3;
  animationMappings: AnimationMapping[];
  direction: Vector3;
  velocity: Vector3;
  jumpState: boolean;
  jumpTime: number;
  flyState: boolean;
  flyTime: number;
  useTime: number;
  useAnimation: any;
  sitState: boolean;
  sitAnimation: any;
  sitTarget: Object3D;
  skeleton: any;
  constructor(object, options = { debug: true, top: true, bottom: true, visemes: true, hair: false } )
  {
    this.object = object;
    const model = (() => {
      let o = object;
      if (o && !o.isMesh) {
        o = o.scene;
      }
      if (!o) {
        const scene = new Scene();

        const skinnedMesh = new Object3D();
        skinnedMesh["isSkinnedMesh"] = true;
        skinnedMesh["skeleton"] = null;
        skinnedMesh["bind"] = (skeleton) => {
          skinnedMesh["skeleton"] = skeleton;
        };
        skinnedMesh["bind"](importSkeleton(skeletonString));
        scene.add(skinnedMesh);

        const hips = findHips(skinnedMesh["skeleton"]);
        const armature = findArmature(hips);
        scene.add(armature);

        o = scene;
      }
      return o;
    })();
    this.model = model;
    this.options = options;

    model.updateMatrixWorld(true);
    const skinnedMeshes = [];
    model.traverse(o => {
      if (o.isSkinnedMesh) {
        skinnedMeshes.push(o);
      }
    });
    skinnedMeshes.sort((a, b) => b.skeleton.bones.length - a.skeleton.bones.length);
    this.skinnedMeshes = skinnedMeshes;

    const skeletonSkinnedMesh = skinnedMeshes.find(o => o.skeleton.bones[0].parent) || null;
    const skeleton = skeletonSkinnedMesh && skeletonSkinnedMesh.skeleton;
    // console.log('got skeleton', skinnedMeshes, skeleton, _exportSkeleton(skeleton));
    const poseSkeletonSkinnedMesh = skeleton ? skinnedMeshes.find(o => o.skeleton !== skeleton && o.skeleton.bones.length >= skeleton.bones.length) : null;
    const poseSkeleton = poseSkeletonSkinnedMesh && poseSkeletonSkinnedMesh.skeleton;
    if (poseSkeleton) {
      copySkeleton(poseSkeleton, skeleton);
      poseSkeletonSkinnedMesh.bind(skeleton);
    }

    if (this.debug) {
      const debugMeshes = makeDebugMeshes();
      this.model.add(debugMeshes);
      this.debugMeshes = debugMeshes;
    } else {
      this.debugMeshes = null;
    }

    const _getOptional = o => o || new Bone();
    const _ensureParent = (o, parent?) => {
      if (!o.parent) {
        if (!parent) {
          parent = new Bone();
        }
        parent.add(o);
      }
      return o.parent;
    };

    const tailBones = getTailBones(skeleton);
    // const tailBones = skeleton.bones.filter(bone => bone.children.length === 0);

    const Eye_L = findEye(tailBones, true);
    const Eye_R = findEye(tailBones, false);
    const Head = findHead(tailBones);
    const Neck = Head.parent;
    const Chest = Neck.parent;
    const Hips = findHips(skeleton);
    const Spine = findSpine(Chest, Hips);
    const Left_shoulder = findShoulder(tailBones, true);
    const Left_wrist = findHand(Left_shoulder);
    const Left_thumb2 = _getOptional(findFinger(Left_wrist, /thumb3_end|thumb2_|handthumb3|thumb_distal|thumb02l|l_thumb3|thumb002l/i));
    const Left_thumb1 = _ensureParent(Left_thumb2);
    const Left_thumb0 = _ensureParent(Left_thumb1, Left_wrist);
    const Left_indexFinger3 = _getOptional(findFinger(Left_wrist, /index(?:finger)?3|index_distal|index02l|indexfinger3_l|index002l/i));
    const Left_indexFinger2 = _ensureParent(Left_indexFinger3);
    const Left_indexFinger1 = _ensureParent(Left_indexFinger2, Left_wrist);
    const Left_middleFinger3 = _getOptional(findFinger(Left_wrist, /middle(?:finger)?3|middle_distal|middle02l|middlefinger3_l|middle002l/i));
    const Left_middleFinger2 = _ensureParent(Left_middleFinger3);
    const Left_middleFinger1 = _ensureParent(Left_middleFinger2, Left_wrist);
    const Left_ringFinger3 = _getOptional(findFinger(Left_wrist, /ring(?:finger)?3|ring_distal|ring02l|ringfinger3_l|ring002l/i));
    const Left_ringFinger2 = _ensureParent(Left_ringFinger3);
    const Left_ringFinger1 = _ensureParent(Left_ringFinger2, Left_wrist);
    const Left_littleFinger3 = _getOptional(findFinger(Left_wrist, /little(?:finger)?3|pinky3|little_distal|little02l|lifflefinger3_l|little002l/i));
    const Left_littleFinger2 = _ensureParent(Left_littleFinger3);
    const Left_littleFinger1 = _ensureParent(Left_littleFinger2, Left_wrist);
    const Left_elbow = Left_wrist.parent;
    const Left_arm = Left_elbow.parent;
    const Right_shoulder = findShoulder(tailBones, false);
    const Right_wrist = findHand(Right_shoulder);
    const Right_thumb2 = _getOptional(findFinger(Right_wrist, /thumb3_end|thumb2_|handthumb3|thumb_distal|thumb02r|r_thumb3|thumb002r/i));
    const Right_thumb1 = _ensureParent(Right_thumb2);
    const Right_thumb0 = _ensureParent(Right_thumb1, Right_wrist);
    const Right_indexFinger3 = _getOptional(findFinger(Right_wrist, /index(?:finger)?3|index_distal|index02r|indexfinger3_r|index002r/i));
    const Right_indexFinger2 = _ensureParent(Right_indexFinger3);
    const Right_indexFinger1 = _ensureParent(Right_indexFinger2, Right_wrist);
    const Right_middleFinger3 = _getOptional(findFinger(Right_wrist, /middle(?:finger)?3|middle_distal|middle02r|middlefinger3_r|middle002r/i));
    const Right_middleFinger2 = _ensureParent(Right_middleFinger3);
    const Right_middleFinger1 = _ensureParent(Right_middleFinger2, Right_wrist);
    const Right_ringFinger3 = _getOptional(findFinger(Right_wrist, /ring(?:finger)?3|ring_distal|ring02r|ringfinger3_r|ring002r/i));
    const Right_ringFinger2 = _ensureParent(Right_ringFinger3);
    const Right_ringFinger1 = _ensureParent(Right_ringFinger2, Right_wrist);
    const Right_littleFinger3 = _getOptional(findFinger(Right_wrist, /little(?:finger)?3|pinky3|little_distal|little02r|lifflefinger3_r|little002r/i));
    const Right_littleFinger2 = _ensureParent(Right_littleFinger3);
    const Right_littleFinger1 = _ensureParent(Right_littleFinger2, Right_wrist);
    const Right_elbow = Right_wrist.parent;
    const Right_arm = Right_elbow.parent;
    const Left_ankle = findFoot(tailBones, true);
    const Left_knee = Left_ankle.parent;
    const Left_leg = Left_knee.parent;
    const Right_ankle = findFoot(tailBones, false);
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
    this.modelBones = modelBones;
    /* for (const k in modelBones) {
      if (!modelBones[k]) {
        console.warn('missing bone', k);
      }
    } */

    const armature = findArmature(Hips);

    const _getEyePosition = () => {
      if (Eye_L && Eye_R) {
        return Eye_L.getWorldPosition(new Vector3())
          .add(Eye_R.getWorldPosition(new Vector3()))
          .divideScalar(2);
      } else {
        const neckToHeadDiff = Head.getWorldPosition(new Vector3()).sub(Neck.getWorldPosition(new Vector3()));
        if (neckToHeadDiff.z < 0) {
          neckToHeadDiff.z *= -1;
        }
        return Head.getWorldPosition(new Vector3()).add(neckToHeadDiff);
      }
    };
    // const eyeDirection = _getEyePosition().sub(Head.getWorldPosition(new Vector3()));
    const leftArmDirection = Left_wrist.getWorldPosition(new Vector3()).sub(Head.getWorldPosition(new Vector3()));
    const flipZ = leftArmDirection.x < 0;//eyeDirection.z < 0;
    const armatureDirection = new Vector3(0, 1, 0).applyQuaternion(armature.quaternion);
    const flipY = armatureDirection.z < -0.5;
    const legDirection = new Vector3(0, 0, -1).applyQuaternion(Left_leg.getWorldQuaternion(new Quaternion()).premultiply(armature.quaternion.clone().invert()));
    const flipLeg = legDirection.y < 0.5;
    // console.log('flip', flipZ, flipY, flipLeg);
    this.flipZ = flipZ;
    this.flipY = flipY;
    this.flipLeg = flipLeg;

    const armatureQuaternion = armature.quaternion.clone();
    const armatureMatrixInverse = armature.matrixWorld.clone().invert();
    armature.position.set(0, 0, 0);
    armature.quaternion.set(0, 0, 0, 1);
    armature.scale.set(1, 1, 1);
    armature.updateMatrix();

    Head.traverse(o => {
      o.savedPosition = o.position.clone();
      o.savedMatrixWorld = o.matrixWorld.clone();
    });

    const allHairBones = [];
    const _recurseAllHairBones = bones => {
      for (let i = 0; i < bones.length; i++) {
        const bone = bones[i];
        if (/hair/i.test(bone.name)) {
          allHairBones.push(bone);
        }
        _recurseAllHairBones(bone.children);
      }
    };
    _recurseAllHairBones(skeleton.bones);
    const hairBones = tailBones.filter(bone => /hair/i.test(bone.name)).map(bone => {
      for (; bone; bone = bone.parent) {
        if (bone.parent === Head) {
          return bone;
        }
      }
      return null;
    }).filter(bone => bone);
    this.allHairBones = allHairBones;
    this.hairBones = hairBones;

    this.springBoneManager = null;
    let springBoneManagerPromise = null;
    if (options.hair) {
      new Promise((accept, reject) => {
        if (!object) {
          object = {};
        }
        if (!object.parser) {
          object.parser = {
            json: {
              extensions: {},
            },
          };
        }
        if (!object.parser.json.extensions) {
          object.parser.json.extensions = {};
        }
        if (!object.parser.json.extensions.VRM) {
          object.parser.json.extensions.VRM = {
            secondaryAnimation: {
              boneGroups: this.hairBones.map(hairBone => {
                const boneIndices = [];
                const _recurse = bone => {
                  boneIndices.push(this.allHairBones.indexOf(bone));
                  if (bone.children.length > 0) {
                    _recurse(bone.children[0]);
                  }
                };
                _recurse(hairBone);
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
                  colliderGroups: [],
                };
              }),
            },
          };
          object.parser.getDependency = async (type, nodeIndex) => {
            if (type === 'node') {
              return this.allHairBones[nodeIndex];
            } else {
              throw new Error('unsupported type');
            }
          };
        }

        springBoneManagerPromise = new VRMSpringBoneImporter().import(object)
          .then(springBoneManager => {
            this.springBoneManager = springBoneManager;
          });
      });
    }

    const findFingerBone = (r, left) => {
      const fingerTipBone = tailBones
        .filter(bone => r.test(bone.name) && findClosestParentBone(bone, bone => bone === modelBones.Left_wrist || bone === modelBones.Right_wrist))
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
    /* const fingerBones = {
      left: {
        thumb: findFingerBone(/thumb/gi, true),
        index: findFingerBone(/index/gi, true),
        middle: findFingerBone(/middle/gi, true),
        ring: findFingerBone(/ring/gi, true),
        little: findFingerBone(/little/gi, true) || findFingerBone(/pinky/gi, true),
      },
      right: {
        thumb: findFingerBone(/thumb/gi, false),
        index: findFingerBone(/index/gi, false),
        middle: findFingerBone(/middle/gi, false),
        ring: findFingerBone(/ring/gi, false),
        little: findFingerBone(/little/gi, false) || findFingerBone(/pinky/gi, false),
      },
    };
    this.fingerBones = fingerBones; */

    const preRotations = {};
    const _ensurePrerotation = k => {
      const boneName = modelBones[k].name;
      if (!preRotations[boneName]) {
        preRotations[boneName] = new Quaternion();
      }
      return preRotations[boneName];
    };
    if (flipY) {
      _ensurePrerotation('Hips').premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2));
    }
    if (flipZ) {
      _ensurePrerotation('Hips').premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI));
    }
    if (flipLeg) {
      ['Left_leg', 'Right_leg'].forEach(k => {
        _ensurePrerotation(k).premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2));
      });
    }

    const _recurseBoneAttachments = o => {
      for (const child of o.children) {
        if (child.isBone) {
          _recurseBoneAttachments(child);
        } else {
          child.matrix
            .premultiply(localMatrix.compose(localVector.set(0, 0, 0), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI), localVector2.set(1, 1, 1)))
            .decompose(child.position, child.quaternion, child.scale);
        }
      }
    };
    _recurseBoneAttachments(modelBones['Hips']);

    const qrArm = flipZ ? Left_arm : Right_arm;
    const qrElbow = flipZ ? Left_elbow : Right_elbow;
    const qrWrist = flipZ ? Left_wrist : Right_wrist;
    const qr = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2)
      .premultiply(
        new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(
          new Vector3(0, 0, 0),
          qrElbow.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse)
            .sub(qrArm.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
            .applyQuaternion(armatureQuaternion),
          new Vector3(0, 1, 0),
        ))
      );
    const qr2 = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2)
      .premultiply(
        new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(
          new Vector3(0, 0, 0),
          qrWrist.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse)
            .sub(qrElbow.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
            .applyQuaternion(armatureQuaternion),
          new Vector3(0, 1, 0),
        ))
      );
    const qlArm = flipZ ? Right_arm : Left_arm;
    const qlElbow = flipZ ? Right_elbow : Left_elbow;
    const qlWrist = flipZ ? Right_wrist : Left_wrist;
    const ql = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
      .premultiply(
        new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(
          new Vector3(0, 0, 0),
          qlElbow.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse)
            .sub(qlArm.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
            .applyQuaternion(armatureQuaternion),
          new Vector3(0, 1, 0),
        ))
      );
    const ql2 = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
      .premultiply(
        new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(
          new Vector3(0, 0, 0),
          qlWrist.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse)
            .sub(qlElbow.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
            .applyQuaternion(armatureQuaternion),
          new Vector3(0, 1, 0),
        ))
      );

    _ensurePrerotation('Right_arm')
      .multiply(qr.clone().invert());
    _ensurePrerotation('Right_elbow')
      .multiply(qr.clone())
      .premultiply(qr2.clone().invert());
    _ensurePrerotation('Left_arm')
      .multiply(ql.clone().invert());
    _ensurePrerotation('Left_elbow')
      .multiply(ql.clone())
      .premultiply(ql2.clone().invert());

    _ensurePrerotation('Left_leg').premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2));
    _ensurePrerotation('Right_leg').premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2));

    for (const k in preRotations) {
      preRotations[k].invert();
    }
    fixSkeletonZForward(armature.children[0], {
      preRotations,
    });
    model.traverse(o => {
      if (o.isSkinnedMesh) {
        o.bind((o.skeleton.bones.length === skeleton.bones.length && o.skeleton.bones.every((bone, i) => bone === skeleton.bones[i])) ? skeleton : o.skeleton);
      }
    });
    if (flipY) {
      modelBones.Hips.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2));
    }
    if (!flipZ) {
      /* ['Left_arm', 'Right_arm'].forEach((name, i) => {
        const bone = modelBones[name];
        if (bone) {
          bone.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), (i === 0 ? 1 : -1) * Math.PI*0.25));
        }
      }); */
    } else {
      modelBones.Hips.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI));
    }
    modelBones.Right_arm.quaternion.premultiply(qr.clone().invert());
    modelBones.Right_elbow.quaternion
      .premultiply(qr)
      .premultiply(qr2.clone().invert());
    modelBones.Left_arm.quaternion.premultiply(ql.clone().invert());
    modelBones.Left_elbow.quaternion
      .premultiply(ql)
      .premultiply(ql2.clone().invert());
    model.updateMatrixWorld(true);

    Hips.traverse(bone => {
      if (bone.isBone) {
        bone.initialQuaternion = bone.quaternion.clone();
      }
    });

    const _averagePoint = points => {
      const result = new Vector3();
      for (let i = 0; i < points.length; i++) {
        result.add(points[i]);
      }
      result.divideScalar(points.length);
      return result;
    };
    const eyePosition = _getEyePosition();

    this.poseManager = new XRPose();
    this.shoulderTransforms = new ShoulderTransforms(this);
    this.legsManager = new LegsManager(this);

    const fingerBoneMap = {
      left: [
        {
          bones: [this.poseManager.vrTransforms.leftHand.leftThumb0, this.poseManager.vrTransforms.leftHand.leftThumb1, this.poseManager.vrTransforms.leftHand.leftThumb2],
          finger: 'thumb',
        },
        {
          bones: [this.poseManager.vrTransforms.leftHand.leftIndexFinger1, this.poseManager.vrTransforms.leftHand.leftIndexFinger2, this.poseManager.vrTransforms.leftHand.leftIndexFinger3],
          finger: 'index',
        },
        {
          bones: [this.poseManager.vrTransforms.leftHand.leftMiddleFinger1, this.poseManager.vrTransforms.leftHand.leftMiddleFinger2, this.poseManager.vrTransforms.leftHand.leftMiddleFinger3],
          finger: 'middle',
        },
        {
          bones: [this.poseManager.vrTransforms.leftHand.leftRingFinger1, this.poseManager.vrTransforms.leftHand.leftRingFinger2, this.poseManager.vrTransforms.leftHand.leftRingFinger3],
          finger: 'ring',
        },
        {
          bones: [this.poseManager.vrTransforms.leftHand.leftLittleFinger1, this.poseManager.vrTransforms.leftHand.leftLittleFinger2, this.poseManager.vrTransforms.leftHand.leftLittleFinger3],
          finger: 'little',
        },
      ],
      right: [
        {
          bones: [this.poseManager.vrTransforms.rightHand.rightThumb0, this.poseManager.vrTransforms.rightHand.rightThumb1, this.poseManager.vrTransforms.rightHand.rightThumb2],
          finger: 'thumb',
        },
        {
          bones: [this.poseManager.vrTransforms.rightHand.rightIndexFinger1, this.poseManager.vrTransforms.rightHand.rightIndexFinger2, this.poseManager.vrTransforms.rightHand.rightIndexFinger3],
          finger: 'index',
        },
        {
          bones: [this.poseManager.vrTransforms.rightHand.rightMiddleFinger1, this.poseManager.vrTransforms.rightHand.rightMiddleFinger2, this.poseManager.vrTransforms.rightHand.rightMiddleFinger3],
          finger: 'middle',
        },
        {
          bones: [this.poseManager.vrTransforms.rightHand.rightRingFinger1, this.poseManager.vrTransforms.rightHand.rightRingFinger2, this.poseManager.vrTransforms.rightHand.rightRingFinger3],
          finger: 'ring',
        },
        {
          bones: [this.poseManager.vrTransforms.rightHand.rightLittleFinger1, this.poseManager.vrTransforms.rightHand.rightLittleFinger2, this.poseManager.vrTransforms.rightHand.rightLittleFinger3],
          finger: 'little',
        },
      ],
    };
    this.fingerBoneMap = fingerBoneMap;

    const _getOffset = (bone, parent = bone.parent) => bone.getWorldPosition(new Vector3()).sub(parent.getWorldPosition(new Vector3()));
    this.initializeBonePositions({
      spine: _getOffset(modelBones.Spine),
      chest: _getOffset(modelBones.Chest, modelBones.Spine),
      neck: _getOffset(modelBones.Neck),
      head: _getOffset(modelBones.Head),
      eyes: eyePosition.clone().sub(Head.getWorldPosition(new Vector3())),

      leftShoulder: _getOffset(modelBones.Right_shoulder),
      leftUpperArm: _getOffset(modelBones.Right_arm),
      leftLowerArm: _getOffset(modelBones.Right_elbow),
      leftHand: _getOffset(modelBones.Right_wrist),
      leftThumb2: _getOffset(modelBones.Right_thumb2),
      leftThumb1: _getOffset(modelBones.Right_thumb1),
      leftThumb0: _getOffset(modelBones.Right_thumb0),
      leftIndexFinger1: _getOffset(modelBones.Right_indexFinger1),
      leftIndexFinger2: _getOffset(modelBones.Right_indexFinger2),
      leftIndexFinger3: _getOffset(modelBones.Right_indexFinger3),
      leftMiddleFinger1: _getOffset(modelBones.Right_middleFinger1),
      leftMiddleFinger2: _getOffset(modelBones.Right_middleFinger2),
      leftMiddleFinger3: _getOffset(modelBones.Right_middleFinger3),
      leftRingFinger1: _getOffset(modelBones.Right_ringFinger1),
      leftRingFinger2: _getOffset(modelBones.Right_ringFinger2),
      leftRingFinger3: _getOffset(modelBones.Right_ringFinger3),
      leftLittleFinger1: _getOffset(modelBones.Right_littleFinger1),
      leftLittleFinger2: _getOffset(modelBones.Right_littleFinger2),
      leftLittleFinger3: _getOffset(modelBones.Right_littleFinger3),

      rightShoulder: _getOffset(modelBones.Left_shoulder),
      rightUpperArm: _getOffset(modelBones.Left_arm),
      rightLowerArm: _getOffset(modelBones.Left_elbow),
      rightHand: _getOffset(modelBones.Left_wrist),
      rightThumb2: _getOffset(modelBones.Left_thumb2),
      rightThumb1: _getOffset(modelBones.Left_thumb1),
      rightThumb0: _getOffset(modelBones.Left_thumb0),
      rightIndexFinger1: _getOffset(modelBones.Left_indexFinger1),
      rightIndexFinger2: _getOffset(modelBones.Left_indexFinger2),
      rightIndexFinger3: _getOffset(modelBones.Left_indexFinger3),
      rightMiddleFinger1: _getOffset(modelBones.Left_middleFinger1),
      rightMiddleFinger2: _getOffset(modelBones.Left_middleFinger2),
      rightMiddleFinger3: _getOffset(modelBones.Left_middleFinger3),
      rightRingFinger1: _getOffset(modelBones.Left_ringFinger1),
      rightRingFinger2: _getOffset(modelBones.Left_ringFinger2),
      rightRingFinger3: _getOffset(modelBones.Left_ringFinger3),
      rightLittleFinger1: _getOffset(modelBones.Left_littleFinger1),
      rightLittleFinger2: _getOffset(modelBones.Left_littleFinger2),
      rightLittleFinger3: _getOffset(modelBones.Left_littleFinger3),

      leftUpperLeg: _getOffset(modelBones.Right_leg),
      leftLowerLeg: _getOffset(modelBones.Right_knee),
      leftFoot: _getOffset(modelBones.Right_ankle),

      rightUpperLeg: _getOffset(modelBones.Left_leg),
      rightLowerLeg: _getOffset(modelBones.Left_knee),
      rightFoot: _getOffset(modelBones.Left_ankle),
    });

    this.height = eyePosition.clone().sub(_averagePoint([modelBones.Left_ankle.getWorldPosition(new Vector3()), modelBones.Right_ankle.getWorldPosition(new Vector3())])).y;
    this.shoulderWidth = modelBones.Left_arm.getWorldPosition(new Vector3()).distanceTo(modelBones.Right_arm.getWorldPosition(new Vector3()));
    this.leftArmLength = this.shoulderTransforms.leftArm.armLength;
    this.rightArmLength = this.shoulderTransforms.rightArm.armLength;
    const indexDistance = modelBones.Left_indexFinger1.getWorldPosition(new Vector3())
      .distanceTo(modelBones.Left_wrist.getWorldPosition(new Vector3()));
    const handWidth = modelBones.Left_indexFinger1.getWorldPosition(new Vector3())
      .distanceTo(modelBones.Left_littleFinger1.getWorldPosition(new Vector3()));
    this.handOffsetLeft = new Vector3(handWidth * 0.7, -handWidth * 0.75, indexDistance * 0.5);
    this.handOffsetRight = new Vector3(-handWidth * 0.7, -handWidth * 0.75, indexDistance * 0.5);
    this.eyeToHipsOffset = modelBones.Hips.getWorldPosition(new Vector3()).sub(eyePosition);

    const _makeInput = () => {
      const result = new Object3D();
      result["pointer"] = 0;
      result["grip"] = 0;
      result["enabled"] = false;
      return result;
    };
    this.inputs = {
      hmd: _makeInput(),
      leftGamepad: _makeInput(),
      rightGamepad: _makeInput(),
    };
    this.sdkInputs = {
      hmd: this.poseManager.vrTransforms.head,
      leftGamepad: this.poseManager.vrTransforms.leftHand,
      rightGamepad: this.poseManager.vrTransforms.rightHand,
    };
    this.sdkInputs.hmd.scaleFactor = 1;
    this.lastModelScaleFactor = 1;
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
      rightFoot: this.legsManager.rightLeg.foot,
      leftThumb2: this.shoulderTransforms.rightArm.thumb2,
      leftThumb1: this.shoulderTransforms.rightArm.thumb1,
      leftThumb0: this.shoulderTransforms.rightArm.thumb0,
      leftIndexFinger3: this.shoulderTransforms.rightArm.indexFinger3,
      leftIndexFinger2: this.shoulderTransforms.rightArm.indexFinger2,
      leftIndexFinger1: this.shoulderTransforms.rightArm.indexFinger1,
      leftMiddleFinger3: this.shoulderTransforms.rightArm.middleFinger3,
      leftMiddleFinger2: this.shoulderTransforms.rightArm.middleFinger2,
      leftMiddleFinger1: this.shoulderTransforms.rightArm.middleFinger1,
      leftRingFinger3: this.shoulderTransforms.rightArm.ringFinger3,
      leftRingFinger2: this.shoulderTransforms.rightArm.ringFinger2,
      leftRingFinger1: this.shoulderTransforms.rightArm.ringFinger1,
      leftLittleFinger3: this.shoulderTransforms.rightArm.littleFinger3,
      leftLittleFinger2: this.shoulderTransforms.rightArm.littleFinger2,
      leftLittleFinger1: this.shoulderTransforms.rightArm.littleFinger1,
      rightThumb2: this.shoulderTransforms.leftArm.thumb2,
      rightThumb1: this.shoulderTransforms.leftArm.thumb1,
      rightThumb0: this.shoulderTransforms.leftArm.thumb0,
      rightIndexFinger3: this.shoulderTransforms.leftArm.indexFinger3,
      rightIndexFinger2: this.shoulderTransforms.leftArm.indexFinger2,
      rightIndexFinger1: this.shoulderTransforms.leftArm.indexFinger1,
      rightMiddleFinger3: this.shoulderTransforms.leftArm.middleFinger3,
      rightMiddleFinger2: this.shoulderTransforms.leftArm.middleFinger2,
      rightMiddleFinger1: this.shoulderTransforms.leftArm.middleFinger1,
      rightRingFinger3: this.shoulderTransforms.leftArm.ringFinger3,
      rightRingFinger2: this.shoulderTransforms.leftArm.ringFinger2,
      rightRingFinger1: this.shoulderTransforms.leftArm.ringFinger1,
      rightLittleFinger3: this.shoulderTransforms.leftArm.littleFinger3,
      rightLittleFinger2: this.shoulderTransforms.leftArm.littleFinger2,
      rightLittleFinger1: this.shoulderTransforms.leftArm.littleFinger1,
    };
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
      Left_thumb2: this.outputs.leftThumb2,
      Left_thumb1: this.outputs.leftThumb1,
      Left_thumb0: this.outputs.leftThumb0,
      Left_indexFinger3: this.outputs.leftIndexFinger3,
      Left_indexFinger2: this.outputs.leftIndexFinger2,
      Left_indexFinger1: this.outputs.leftIndexFinger1,
      Left_middleFinger3: this.outputs.leftMiddleFinger3,
      Left_middleFinger2: this.outputs.leftMiddleFinger2,
      Left_middleFinger1: this.outputs.leftMiddleFinger1,
      Left_ringFinger3: this.outputs.leftRingFinger3,
      Left_ringFinger2: this.outputs.leftRingFinger2,
      Left_ringFinger1: this.outputs.leftRingFinger1,
      Left_littleFinger3: this.outputs.leftLittleFinger3,
      Left_littleFinger2: this.outputs.leftLittleFinger2,
      Left_littleFinger1: this.outputs.leftLittleFinger1,
      Left_leg: this.outputs.rightUpperLeg,
      Left_knee: this.outputs.rightLowerLeg,
      Left_ankle: this.outputs.rightFoot,

      Right_shoulder: this.outputs.leftShoulder,
      Right_arm: this.outputs.leftUpperArm,
      Right_elbow: this.outputs.leftLowerArm,
      Right_wrist: this.outputs.leftHand,
      Right_thumb2: this.outputs.rightThumb2,
      Right_thumb1: this.outputs.rightThumb1,
      Right_thumb0: this.outputs.rightThumb0,
      Right_indexFinger3: this.outputs.rightIndexFinger3,
      Right_indexFinger2: this.outputs.rightIndexFinger2,
      Right_indexFinger1: this.outputs.rightIndexFinger1,
      Right_middleFinger3: this.outputs.rightMiddleFinger3,
      Right_middleFinger2: this.outputs.rightMiddleFinger2,
      Right_middleFinger1: this.outputs.rightMiddleFinger1,
      Right_ringFinger3: this.outputs.rightRingFinger3,
      Right_ringFinger2: this.outputs.rightRingFinger2,
      Right_ringFinger1: this.outputs.rightRingFinger1,
      Right_littleFinger3: this.outputs.rightLittleFinger3,
      Right_littleFinger2: this.outputs.rightLittleFinger2,
      Right_littleFinger1: this.outputs.rightLittleFinger1,
      Right_leg: this.outputs.leftUpperLeg,
      Right_knee: this.outputs.leftLowerLeg,
      Right_ankle: this.outputs.leftFoot,
    };

    if (options.visemes) {
      const vrmExtension = this.object && this.object.userData && this.object.userData.gltfExtensions && this.object.userData.gltfExtensions.VRM;
      const blendShapes = vrmExtension && vrmExtension.blendShapeMaster && vrmExtension.blendShapeMaster.blendShapeGroups;
      // ["Neutral", "A", "I", "U", "E", "O", "Blink", "Blink_L", "Blink_R", "Angry", "Fun", "Joy", "Sorrow", "Surprised"]
      const _getVrmBlendShapeIndex = r => {
        if (Array.isArray(blendShapes)) {
          const shape = blendShapes.find(blendShape => r.test(blendShape.name));
          if (shape && shape.binds && shape.binds.length > 0 && typeof shape.binds[0].index === 'number') {
            return shape.binds[0].index;
          } else {
            return null;
          }
        } else {
          return null;
        }
      };
      this.skinnedMeshesVisemeMappings = this.skinnedMeshes.map(o => {
        const { morphTargetDictionary, morphTargetInfluences } = o;
        if (morphTargetDictionary && morphTargetInfluences) {
          const aaIndex = _getVrmBlendShapeIndex(/^a$/i) || morphTargetDictionary['vrc.v_aa'] || null;
          const blinkLeftIndex = _getVrmBlendShapeIndex(/^(?:blink_l|blinkleft)$/i) || morphTargetDictionary['vrc.blink_left'] || null;
          const blinkRightIndex = _getVrmBlendShapeIndex(/^(?:blink_r|blinkright)$/i) || morphTargetDictionary['vrc.blink_right'] || null;
          return [
            morphTargetInfluences,
            aaIndex,
            blinkLeftIndex,
            blinkRightIndex,
          ];
        } else {
          return null;
        }
      });
    } else {
      this.skinnedMeshesVisemeMappings = [];
    }

    // this.lastTimestamp = Date.now();

    this.shoulderTransforms.Start();
    this.legsManager.Start();

    if (options.top !== undefined) {
      this.setTopEnabled(!!options.top);
    }
    if (options.bottom !== undefined) {
      this.setBottomEnabled(!!options.bottom);
    }

    /* this.decapitated = false;
    if (options.decapitate) {
      if (springBoneManagerPromise) {
        springBoneManagerPromise.then(() => {
          this.decapitate();
        });
      } else {
        this.decapitate();
      }
    } */

    this.animationMappings = [
      new AnimationMapping('mixamorigHips.quaternion', this.outputs.hips.quaternion, false),
      new AnimationMapping('mixamorigSpine.quaternion', this.outputs.spine.quaternion, false),
      // new AnimationMapping('mixamorigSpine1.quaternion', null, false),
      new AnimationMapping('mixamorigSpine2.quaternion', this.outputs.chest.quaternion, false),
      new AnimationMapping('mixamorigNeck.quaternion', this.outputs.neck.quaternion, false),
      new AnimationMapping('mixamorigHead.quaternion', this.outputs.head.quaternion, false),

      new AnimationMapping('mixamorigLeftShoulder.quaternion', this.outputs.rightShoulder.quaternion, true),
      new AnimationMapping('mixamorigLeftArm.quaternion', this.outputs.rightUpperArm.quaternion, true),
      new AnimationMapping('mixamorigLeftForeArm.quaternion', this.outputs.rightLowerArm.quaternion, true),
      new AnimationMapping('mixamorigLeftHand.quaternion', this.outputs.leftHand.quaternion, true),
      new AnimationMapping('mixamorigLeftHandMiddle1.quaternion', this.outputs.leftMiddleFinger1.quaternion, true),
      new AnimationMapping('mixamorigLeftHandMiddle2.quaternion', this.outputs.leftMiddleFinger2.quaternion, true),
      new AnimationMapping('mixamorigLeftHandMiddle3.quaternion', this.outputs.leftMiddleFinger3.quaternion, true),
      new AnimationMapping('mixamorigLeftHandThumb1.quaternion', this.outputs.leftThumb0.quaternion, true),
      new AnimationMapping('mixamorigLeftHandThumb2.quaternion', this.outputs.leftThumb1.quaternion, true),
      new AnimationMapping('mixamorigLeftHandThumb3.quaternion', this.outputs.leftThumb2.quaternion, true),
      new AnimationMapping('mixamorigLeftHandIndex1.quaternion', this.outputs.leftIndexFinger1.quaternion, true),
      new AnimationMapping('mixamorigLeftHandIndex2.quaternion', this.outputs.leftIndexFinger2.quaternion, true),
      new AnimationMapping('mixamorigLeftHandIndex3.quaternion', this.outputs.leftIndexFinger3.quaternion, true),
      new AnimationMapping('mixamorigLeftHandRing1.quaternion', this.outputs.leftRingFinger1.quaternion, true),
      new AnimationMapping('mixamorigLeftHandRing2.quaternion', this.outputs.leftRingFinger2.quaternion, true),
      new AnimationMapping('mixamorigLeftHandRing3.quaternion', this.outputs.leftRingFinger3.quaternion, true),
      new AnimationMapping('mixamorigLeftHandPinky1.quaternion', this.outputs.leftLittleFinger1.quaternion, true),
      new AnimationMapping('mixamorigLeftHandPinky2.quaternion', this.outputs.leftLittleFinger2.quaternion, true),
      new AnimationMapping('mixamorigLeftHandPinky3.quaternion', this.outputs.leftLittleFinger3.quaternion, true),

      new AnimationMapping('mixamorigRightShoulder.quaternion', this.outputs.leftShoulder.quaternion, true),
      new AnimationMapping('mixamorigRightArm.quaternion', this.outputs.leftUpperArm.quaternion, true),
      new AnimationMapping('mixamorigRightForeArm.quaternion', this.outputs.leftLowerArm.quaternion, true),
      new AnimationMapping('mixamorigRightHand.quaternion', this.outputs.rightHand.quaternion, true),
      new AnimationMapping('mixamorigRightHandMiddle1.quaternion', this.outputs.rightMiddleFinger1.quaternion, true),
      new AnimationMapping('mixamorigRightHandMiddle2.quaternion', this.outputs.rightMiddleFinger2.quaternion, true),
      new AnimationMapping('mixamorigRightHandMiddle3.quaternion', this.outputs.rightMiddleFinger3.quaternion, true),
      new AnimationMapping('mixamorigRightHandThumb1.quaternion', this.outputs.rightThumb0.quaternion, true),
      new AnimationMapping('mixamorigRightHandThumb2.quaternion', this.outputs.rightThumb1.quaternion, true),
      new AnimationMapping('mixamorigRightHandThumb3.quaternion', this.outputs.rightThumb2.quaternion, true),
      new AnimationMapping('mixamorigRightHandIndex1.quaternion', this.outputs.rightIndexFinger1.quaternion, true),
      new AnimationMapping('mixamorigRightHandIndex2.quaternion', this.outputs.rightIndexFinger2.quaternion, true),
      new AnimationMapping('mixamorigRightHandIndex3.quaternion', this.outputs.rightIndexFinger3.quaternion, true),
      new AnimationMapping('mixamorigRightHandRing1.quaternion', this.outputs.rightRingFinger1.quaternion, true),
      new AnimationMapping('mixamorigRightHandRing2.quaternion', this.outputs.rightRingFinger2.quaternion, true),
      new AnimationMapping('mixamorigRightHandRing3.quaternion', this.outputs.rightRingFinger3.quaternion, true),
      new AnimationMapping('mixamorigRightHandPinky1.quaternion', this.outputs.rightLittleFinger1.quaternion, true),
      new AnimationMapping('mixamorigRightHandPinky2.quaternion', this.outputs.rightLittleFinger2.quaternion, true),
      new AnimationMapping('mixamorigRightHandPinky3.quaternion', this.outputs.rightLittleFinger3.quaternion, true),

      new AnimationMapping('mixamorigRightUpLeg.quaternion', this.outputs.leftUpperLeg.quaternion, false),
      new AnimationMapping('mixamorigRightLeg.quaternion', this.outputs.leftLowerLeg.quaternion, false),
      new AnimationMapping('mixamorigRightFoot.quaternion', this.outputs.leftFoot.quaternion, false),
      // new AnimationMapping('mixamorigRightToeBase.quaternion', null, false),

      new AnimationMapping('mixamorigLeftUpLeg.quaternion', this.outputs.rightUpperLeg.quaternion, false),
      new AnimationMapping('mixamorigLeftLeg.quaternion', this.outputs.rightLowerLeg.quaternion, false),
      new AnimationMapping('mixamorigLeftFoot.quaternion', this.outputs.rightFoot.quaternion, false),
      // new AnimationMapping('mixamorigLeftToeBase.quaternion', null, false),
    ];

    this.direction = new Vector3();
    this.velocity = new Vector3();
    this.jumpState = false;
    this.jumpTime = NaN;
    this.flyState = false;
    this.flyTime = NaN;
    this.useTime = NaN;
    this.useAnimation = null;
    this.sitState = false;
    this.sitAnimation = null;
    this.sitTarget = new Object3D();
  }
  initializeBonePositions(setups) {
    this.shoulderTransforms.spine.position.copy(setups.spine);
    this.shoulderTransforms.transform.position.copy(setups.chest);
    this.shoulderTransforms.neck.position.copy(setups.neck);
    this.shoulderTransforms.head.position.copy(setups.head);
    this.shoulderTransforms.eyes.position.copy(setups.eyes);

    this.shoulderTransforms.leftShoulderAnchor.position.copy(setups.leftShoulder);
    this.shoulderTransforms.leftArm.upperArm.position.copy(setups.leftUpperArm);
    this.shoulderTransforms.leftArm.lowerArm.position.copy(setups.leftLowerArm);
    this.shoulderTransforms.leftArm.hand.position.copy(setups.leftHand);
    this.shoulderTransforms.leftArm.thumb2.position.copy(setups.leftThumb2);
    this.shoulderTransforms.leftArm.thumb1.position.copy(setups.leftThumb1);
    this.shoulderTransforms.leftArm.thumb0.position.copy(setups.leftThumb0);
    this.shoulderTransforms.leftArm.indexFinger3.position.copy(setups.leftIndexFinger3);
    this.shoulderTransforms.leftArm.indexFinger2.position.copy(setups.leftIndexFinger2);
    this.shoulderTransforms.leftArm.indexFinger1.position.copy(setups.leftIndexFinger1);
    this.shoulderTransforms.leftArm.middleFinger3.position.copy(setups.leftMiddleFinger3);
    this.shoulderTransforms.leftArm.middleFinger2.position.copy(setups.leftMiddleFinger2);
    this.shoulderTransforms.leftArm.middleFinger1.position.copy(setups.leftMiddleFinger1);
    this.shoulderTransforms.leftArm.ringFinger3.position.copy(setups.leftRingFinger3);
    this.shoulderTransforms.leftArm.ringFinger2.position.copy(setups.leftRingFinger2);
    this.shoulderTransforms.leftArm.ringFinger1.position.copy(setups.leftRingFinger1);
    this.shoulderTransforms.leftArm.littleFinger3.position.copy(setups.leftLittleFinger3);
    this.shoulderTransforms.leftArm.littleFinger2.position.copy(setups.leftLittleFinger2);
    this.shoulderTransforms.leftArm.littleFinger1.position.copy(setups.leftLittleFinger1);

    this.shoulderTransforms.rightShoulderAnchor.position.copy(setups.rightShoulder);
    this.shoulderTransforms.rightArm.upperArm.position.copy(setups.rightUpperArm);
    this.shoulderTransforms.rightArm.lowerArm.position.copy(setups.rightLowerArm);
    this.shoulderTransforms.rightArm.hand.position.copy(setups.rightHand);
    this.shoulderTransforms.rightArm.thumb2.position.copy(setups.rightThumb2);
    this.shoulderTransforms.rightArm.thumb1.position.copy(setups.rightThumb1);
    this.shoulderTransforms.rightArm.thumb0.position.copy(setups.rightThumb0);
    this.shoulderTransforms.rightArm.indexFinger3.position.copy(setups.rightIndexFinger3);
    this.shoulderTransforms.rightArm.indexFinger2.position.copy(setups.rightIndexFinger2);
    this.shoulderTransforms.rightArm.indexFinger1.position.copy(setups.rightIndexFinger1);
    this.shoulderTransforms.rightArm.middleFinger3.position.copy(setups.rightMiddleFinger3);
    this.shoulderTransforms.rightArm.middleFinger2.position.copy(setups.rightMiddleFinger2);
    this.shoulderTransforms.rightArm.middleFinger1.position.copy(setups.rightMiddleFinger1);
    this.shoulderTransforms.rightArm.ringFinger3.position.copy(setups.rightRingFinger3);
    this.shoulderTransforms.rightArm.ringFinger2.position.copy(setups.rightRingFinger2);
    this.shoulderTransforms.rightArm.ringFinger1.position.copy(setups.rightRingFinger1);
    this.shoulderTransforms.rightArm.littleFinger3.position.copy(setups.rightLittleFinger3);
    this.shoulderTransforms.rightArm.littleFinger2.position.copy(setups.rightLittleFinger2);
    this.shoulderTransforms.rightArm.littleFinger1.position.copy(setups.rightLittleFinger1);

    this.legsManager.leftLeg.upperLeg.position.copy(setups.leftUpperLeg);
    this.legsManager.leftLeg.lowerLeg.position.copy(setups.leftLowerLeg);
    this.legsManager.leftLeg.foot.position.copy(setups.leftFoot);

    this.legsManager.rightLeg.upperLeg.position.copy(setups.rightUpperLeg);
    this.legsManager.rightLeg.lowerLeg.position.copy(setups.rightLowerLeg);
    this.legsManager.rightLeg.foot.position.copy(setups.rightFoot);

    this.shoulderTransforms.hips.updateMatrixWorld();
  }
  setHandEnabled(i, enabled) {
    this.shoulderTransforms.handsEnabled[i] = enabled;
  }
  getHandEnabled(i) {
    return this.shoulderTransforms.handsEnabled[i];
  }
  setTopEnabled(enabled) {
    this.shoulderTransforms.enabled = enabled;
  }
  getTopEnabled() {
    return this.shoulderTransforms.enabled;
  }
  setBottomEnabled(enabled) {
    this.legsManager.enabled = enabled;
  }
  getBottomEnabled() {
    return this.legsManager.enabled;
  }
  update(timeDiff) {
    /* const wasDecapitated = this.decapitated;
    if (this.springBoneManager && wasDecapitated) {
      this.undecapitate();
    } */

    const now = Date.now();


    if (this.getTopEnabled()) {
      this.sdkInputs.hmd.position.copy(this.inputs.hmd.position);
      this.sdkInputs.hmd.quaternion.copy(this.inputs.hmd.quaternion);
      this.sdkInputs.leftGamepad.position.copy(this.inputs.leftGamepad.position).add(localVector.copy(this.handOffsetLeft).applyQuaternion(this.inputs.leftGamepad.quaternion));
      this.sdkInputs.leftGamepad.quaternion.copy(this.inputs.leftGamepad.quaternion);
      this.sdkInputs.leftGamepad.pointer = this.inputs.leftGamepad.pointer;
      this.sdkInputs.leftGamepad.grip = this.inputs.leftGamepad.grip;
      this.sdkInputs.rightGamepad.position.copy(this.inputs.rightGamepad.position).add(localVector.copy(this.handOffsetRight).applyQuaternion(this.inputs.rightGamepad.quaternion));
      this.sdkInputs.rightGamepad.quaternion.copy(this.inputs.rightGamepad.quaternion);
      this.sdkInputs.rightGamepad.pointer = this.inputs.rightGamepad.pointer;
      this.sdkInputs.rightGamepad.grip = this.inputs.rightGamepad.grip;

      const modelScaleFactor = this.sdkInputs.hmd.scaleFactor;
      if (modelScaleFactor !== this.lastModelScaleFactor) {
        this.model.scale.set(modelScaleFactor, modelScaleFactor, modelScaleFactor);
        this.lastModelScaleFactor = modelScaleFactor;

        this.springBoneManager && this.springBoneManager.springBoneGroupList.forEach(springBoneGroup => {
          springBoneGroup.forEach(springBone => {
            springBone._worldBoneLength = springBone.bone
              .localToWorld(localVector.copy(springBone._initialLocalChildPosition))
              .sub(springBone._worldPosition)
              .length();
          });
        });
      }
      // @ts-ignore
      if (this.options.fingers) {
        const _traverse = (o, fn) => {
          fn(o);
          for (const child of o.children) {
            _traverse(child, fn);
          }
        };
        const _processFingerBones = left => {
          const fingerBones = left ? this.fingerBoneMap.left : this.fingerBoneMap.right;
          const gamepadInput = left ? this.sdkInputs.leftGamepad : this.sdkInputs.rightGamepad;
          for (const fingerBone of fingerBones) {
            // if (fingerBone) {
            const { bones, finger } = fingerBone;
            let setter;
            if (finger === 'thumb') {
              setter = (q, i) => q.setFromAxisAngle(localVector.set(0, left ? -1 : 1, 0), gamepadInput.grip * Math.PI * (i === 0 ? 0.125 : 0.25));
            } else if (finger === 'index') {
              setter = (q, i) => q.setFromAxisAngle(localVector.set(0, 0, left ? 1 : -1), gamepadInput.pointer * Math.PI * 0.5);
            } else {
              setter = (q, i) => q.setFromAxisAngle(localVector.set(0, 0, left ? 1 : -1), gamepadInput.grip * Math.PI * 0.5);
            }
            for (let i = 0; i < bones.length; i++) {
              setter(bones[i].quaternion, i);
            }
            // }
          }
        };
        _processFingerBones(true);
        _processFingerBones(false);
      }
    }
    if (!this.getBottomEnabled()) {
      this.outputs.hips.position.copy(this.inputs.hmd.position)
        .add(this.eyeToHipsOffset);

      localEuler.setFromQuaternion(this.inputs.hmd.quaternion, 'YXZ');
      localEuler.x = 0;
      localEuler.z = 0;
      localEuler.y += Math.PI;
      this.outputs.hips.quaternion.premultiply(localQuaternion.setFromEuler(localEuler));
    }
    if (!this.getTopEnabled() && this.debugMeshes) {
      this.outputs.hips.updateMatrixWorld();
    }

    this.shoulderTransforms.Update();
    this.legsManager.Update();

    for (const k in this.modelBones) {
      const modelBone = this.modelBones[k];
      const modelBoneOutput = this.modelBoneOutputs[k];

      if (/hips|thumb|finger/i.test(k)) {
        modelBone.position.copy(modelBoneOutput.position);
      }
      modelBone.quaternion.multiplyQuaternions(modelBoneOutput.quaternion, modelBone.initialQuaternion)

      if (this.getTopEnabled()) {
        if (k === 'Left_wrist') {
          if (this.getHandEnabled(1)) {
            modelBone.quaternion.multiply(leftRotation); // center
          }
        } else if (k === 'Right_wrist') {
          if (this.getHandEnabled(0)) {
            modelBone.quaternion.multiply(rightRotation); // center
          }
        }
      }
      if (this.getBottomEnabled()) {
        if (k === 'Left_ankle' || k === 'Right_ankle') {
          modelBone.quaternion.multiply(upRotation);
        }
      }
      modelBone.updateMatrixWorld();
    }

    if (this.springBoneManager) {
      this.springBoneManager.lateUpdate(timeDiff);
    }
    /* if (this.springBoneManager && wasDecapitated) {
      this.decapitate();
    } */
    // @ts-ignore
    if (this.options.visemes) {
      const aaValue = Math.min(this.volume * 10, 1);
      const blinkValue = (() => {
        const nowWindow = now % 2000;
        if (nowWindow >= 0 && nowWindow < 100) {
          return nowWindow / 100;
        } else if (nowWindow >= 100 && nowWindow < 200) {
          return 1 - (nowWindow - 100) / 100;
        } else {
          return 0;
        }
      })();
      for (const visemeMapping of this.skinnedMeshesVisemeMappings) {
        if (visemeMapping) {
          const [morphTargetInfluences, aaIndex, blinkLeftIndex, blinkRightIndex] = visemeMapping;
          if (aaIndex !== null) {
            morphTargetInfluences[aaIndex] = aaValue;
          }
          if (blinkLeftIndex !== null) {
            morphTargetInfluences[blinkLeftIndex] = blinkValue;
          }
          if (blinkRightIndex !== null) {
            morphTargetInfluences[blinkRightIndex] = blinkValue;
          }
        }
      }
    }

    if (this.debugMeshes) {
      if (this.getTopEnabled()) {
        this.getHandEnabled(0) && this.outputs.leftHand.quaternion.multiply(rightRotation); // center
        this.outputs.leftHand.updateMatrixWorld();
        this.getHandEnabled(1) && this.outputs.rightHand.quaternion.multiply(leftRotation); // center
        this.outputs.rightHand.updateMatrixWorld();
      }

      for (const k in this.debugMeshes.attributes) {
        const attribute = this.debugMeshes.attributes[k];
        if (attribute.visible) {
          const output = this.outputs[k];
          attribute.array.set(attribute.srcGeometry.attributes.position.array);
          attribute.applyMatrix4(localMatrix.multiplyMatrices(this.model.matrixWorld, output.matrixWorld));
        } else {
          attribute.array.fill(0);
        }
      }
      this.debugMeshes.geometry.attributes.position.needsUpdate = true;
    }
  }
  eyeToHipsOffset(eyeToHipsOffset: any) {
    throw new Error('Method not implemented.');
  }
  decapitate() {
    if (!this.decapitated) {
      this.modelBones.Head.traverse(o => {
        if (o.savedPosition) { // three-vrm adds vrmColliderSphere which will not be saved
          o.savedPosition.copy(o.position);
          o.savedMatrixWorld.copy(o.matrixWorld);
          o.position.set(NaN, NaN, NaN);
          o.matrixWorld.set(NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN);
        }
      });
      if (this.debugMeshes) {
        [this.debugMeshes.attributes.eyes, this.debugMeshes.attributes.head].forEach(attribute => {
          attribute.visible = false;
        });
      }
      this.decapitated = true;
    }
  }
  undecapitate() {
    if (this.decapitated) {
      this.modelBones.Head.traverse(o => {
        if (o.savedPosition) {
          o.position.copy(o.savedPosition);
          o.matrixWorld.copy(o.savedMatrixWorld);
        }
      });
      if (this.debugMeshes) {
        [this.debugMeshes.attributes.eyes, this.debugMeshes.attributes.head].forEach(attribute => {
          attribute.visible = true;
        });
      }
      this.decapitated = false;
    }
  }
  setFloorHeight(floorHeight) {
    this.poseManager.vrTransforms.floorHeight = floorHeight;
  }
  getFloorHeight() {
    return this.poseManager.vrTransforms.floorHeight;
  }
}

export default Avatar;
