import { VRMSpringBoneImporter } from "@pixiv/three-vrm";
import { Bone, Matrix4, Object3D, Quaternion, Scene, Vector3 } from 'three';
import { System } from "../../ecs/classes/System";
import { addComponent, getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { AvatarLegs } from "../components/AvatarLegs";
import AvatarShoulders from "../components/AvatarShoulders";
import { XRAvatarRig } from "../components/XRAvatarRig";
import XRPose from "../components/XRPose";
import skeletonString from '../constants/Skeleton';
import { Side, updateXRArmIK } from "../functions/AvatarBodyFunctions";
import { AnimationMapping, copySkeleton, countCharacters, findArmature, findClosestParentBone, findEye, findFinger, findFoot, findFurthestParentBone, findHand, findHead, findHips, findShoulder, findSpine, getTailBones, importSkeleton, localMatrix, localVector, localVector2 } from '../functions/AvatarMathFunctions';
import { fixSkeletonZForward } from '../functions/SkeletonUtils';

const localVector = new Vector3();
const localVector2 = new Vector3();
const localMatrix = new Matrix4();


const _makeFingers = () => {
  const result = Array(25);
  for (let i = 0; i < result.length; i++) {
    result[i] = new Object3D();
  }
  return result;
};

export class AvatarRigSystem extends System {

    /**
     * Executes the system. Called each frame by default from the Engine.
     * @param delta Time since last frame.
     */
    execute(delta: number): void {


        this.queryResults.animation.all?.forEach((entity) => {
          const avatarRig = getMutableComponent(entity, XRAvatarRig);
          avatarRig.options = { top: true, bottom: true, visemes: true, hair: true, fingers: true}
          const model = (() => {
            let o = avatarRig.object;
            if (!o) {
              const object = new Scene();
      
              const skinnedMesh = new Object3D();
              skinnedMesh["isSkinnedMesh"] = true;
              skinnedMesh["skeleton"] = null;
              skinnedMesh["bind"] = (skeleton) => {
                skinnedMesh["skeleton"] = skeleton;
              };
              skinnedMesh["bind"](importSkeleton(skeletonString));
              object.add(skinnedMesh);
      
              const hips = findHips(skinnedMesh["skeleton"]);
              const armature = findArmature(hips);
              object.add(armature);
      
              o = object;
            }
            return o;
          })();
          avatarRig.model = model;
      
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
          for (const k in modelBones) {
            if (!modelBones[k]) {
              console.warn('missing bone', k);
            }
          }
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
          if (avatarRig.options.hair) {
            new Promise((accept, reject) => {
              let object;
              if (!avatarRig.object) {
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
                  avatarRig.springBoneManager = springBoneManager;
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
          const fingerBones = {
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
          avatarRig.fingerBones = fingerBones;
      
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
      

          addComponent(entity, XRPose);
          avatarRig.pose = getComponent(entity, XRPose);

            avatarRig.pose.head = new Object3D();
            avatarRig.pose.leftHand = new Object3D();
            avatarRig.pose.leftHand.pointer = 0;
            avatarRig.pose.leftHand.grip = 0;
            avatarRig.pose.leftHand.fingers = _makeFingers();
            avatarRig.pose.leftHand.leftThumb0 = avatarRig.pose.leftHand.fingers[1];
            avatarRig.pose.leftHand.leftThumb1 = avatarRig.pose.leftHand.fingers[2];
            avatarRig.pose.leftHand.leftThumb2 = avatarRig.pose.leftHand.fingers[3];
            avatarRig.pose.leftHand.leftIndexFinger1 = avatarRig.pose.leftHand.fingers[6];
            avatarRig.pose.leftHand.leftIndexFinger2 = avatarRig.pose.leftHand.fingers[7];
            avatarRig.pose.leftHand.leftIndexFinger3 = avatarRig.pose.leftHand.fingers[8];
            avatarRig.pose.leftHand.leftMiddleFinger1 = avatarRig.pose.leftHand.fingers[11];
            avatarRig.pose.leftHand.leftMiddleFinger2 = avatarRig.pose.leftHand.fingers[12];
            avatarRig.pose.leftHand.leftMiddleFinger3 = avatarRig.pose.leftHand.fingers[13];
            avatarRig.pose.leftHand.leftRingFinger1 = avatarRig.pose.leftHand.fingers[16];
            avatarRig.pose.leftHand.leftRingFinger2 = avatarRig.pose.leftHand.fingers[17];
            avatarRig.pose.leftHand.leftRingFinger3 = avatarRig.pose.leftHand.fingers[18];
            avatarRig.pose.leftHand.leftLittleFinger1 = avatarRig.pose.leftHand.fingers[21];
            avatarRig.pose.leftHand.leftLittleFinger2 = avatarRig.pose.leftHand.fingers[22];
            avatarRig.pose.leftHand.leftLittleFinger3 = avatarRig.pose.leftHand.fingers[23];
            
            avatarRig.pose.rightHand = new Object3D();
            avatarRig.pose.rightHand.pointer = 0;
            avatarRig.pose.rightHand.grip = 0;
            avatarRig.pose.rightHand.fingers = _makeFingers();
            avatarRig.pose.rightHand.rightThumb0 = avatarRig.pose.rightHand.fingers[1];
            avatarRig.pose.rightHand.rightThumb1 = avatarRig.pose.rightHand.fingers[2];
            avatarRig.pose.rightHand.rightThumb2 = avatarRig.pose.rightHand.fingers[3];
            avatarRig.pose.rightHand.rightIndexFinger1 = avatarRig.pose.rightHand.fingers[6];
            avatarRig.pose.rightHand.rightIndexFinger2 = avatarRig.pose.rightHand.fingers[7];
            avatarRig.pose.rightHand.rightIndexFinger3 = avatarRig.pose.rightHand.fingers[8];
            avatarRig.pose.rightHand.rightMiddleFinger1 = avatarRig.pose.rightHand.fingers[11];
            avatarRig.pose.rightHand.rightMiddleFinger2 = avatarRig.pose.rightHand.fingers[12];
            avatarRig.pose.rightHand.rightMiddleFinger3 = avatarRig.pose.rightHand.fingers[13];
            avatarRig.pose.rightHand.rightRingFinger1 = avatarRig.pose.rightHand.fingers[16];
            avatarRig.pose.rightHand.rightRingFinger2 = avatarRig.pose.rightHand.fingers[17];
            avatarRig.pose.rightHand.rightRingFinger3 = avatarRig.pose.rightHand.fingers[18];
            avatarRig.pose.rightHand.rightLittleFinger1 = avatarRig.pose.rightHand.fingers[21];
            avatarRig.pose.rightHand.rightLittleFinger2 = avatarRig.pose.rightHand.fingers[22];
            avatarRig.pose.rightHand.rightLittleFinger3 = avatarRig.pose.rightHand.fingers[23];
        
            avatarRig.pose.floorHeight = 0;
          
          avatarRig.pose.vrTransforms =  getComponent(entity, avatarRig.pose);
            // Oculus uses a different reference position -> 0 is the reference head position if the user is standing in the middle of the room. 
            // In OpenVR, the 0 position is the ground position and the user is then at (0, playerHeightHmd, 0) if he is in the middle of the room, so I need to correct this for shoulder calculation 
            // this.vrSystemOffsetHeight = 0.0;
            avatarRig.pose.referencePlayerHeightHmd = 1.7;
            avatarRig.pose.referencePlayerWidthWrist = 1.39;
            avatarRig.pose.playerHeightHmd = 1.70;
            avatarRig.pose.playerWidthWrist = 1.39;
            avatarRig.pose
          addComponent(entity, AvatarShoulders);
          avatarRig.shoulderTransforms = getComponent(entity, AvatarShoulders);

          avatarRig.avatarLegs = addComponent(entity, AvatarLegs);
      
          const fingerBoneMap = {
            left: [
              {
                bones: [avatarRig.pose.vrTransforms.leftHand.leftThumb0, avatarRig.pose.vrTransforms.leftHand.leftThumb1, avatarRig.pose.vrTransforms.leftHand.leftThumb2],
                finger: 'thumb',
              },
              {
                bones: [avatarRig.pose.vrTransforms.leftHand.leftIndexFinger1, avatarRig.pose.vrTransforms.leftHand.leftIndexFinger2, avatarRig.pose.vrTransforms.leftHand.leftIndexFinger3],
                finger: 'index',
              },
              {
                bones: [avatarRig.pose.vrTransforms.leftHand.leftMiddleFinger1, avatarRig.pose.vrTransforms.leftHand.leftMiddleFinger2, avatarRig.pose.vrTransforms.leftHand.leftMiddleFinger3],
                finger: 'middle',
              },
              {
                bones: [avatarRig.pose.vrTransforms.leftHand.leftRingFinger1, avatarRig.pose.vrTransforms.leftHand.leftRingFinger2, avatarRig.pose.vrTransforms.leftHand.leftRingFinger3],
                finger: 'ring',
              },
              {
                bones: [avatarRig.pose.vrTransforms.leftHand.leftLittleFinger1, avatarRig.pose.vrTransforms.leftHand.leftLittleFinger2, avatarRig.pose.vrTransforms.leftHand.leftLittleFinger3],
                finger: 'little',
              },
            ],
            right: [
              {
                bones: [avatarRig.pose.vrTransforms.rightHand.rightThumb0, avatarRig.pose.vrTransforms.rightHand.rightThumb1, avatarRig.pose.vrTransforms.rightHand.rightThumb2],
                finger: 'thumb',
              },
              {
                bones: [avatarRig.pose.vrTransforms.rightHand.rightIndexFinger1, avatarRig.pose.vrTransforms.rightHand.rightIndexFinger2, avatarRig.pose.vrTransforms.rightHand.rightIndexFinger3],
                finger: 'index',
              },
              {
                bones: [avatarRig.pose.vrTransforms.rightHand.rightMiddleFinger1, avatarRig.pose.vrTransforms.rightHand.rightMiddleFinger2, avatarRig.pose.vrTransforms.rightHand.rightMiddleFinger3],
                finger: 'middle',
              },
              {
                bones: [avatarRig.pose.vrTransforms.rightHand.rightRingFinger1, avatarRig.pose.vrTransforms.rightHand.rightRingFinger2, avatarRig.pose.vrTransforms.rightHand.rightRingFinger3],
                finger: 'ring',
              },
              {
                bones: [avatarRig.pose.vrTransforms.rightHand.rightLittleFinger1, avatarRig.pose.vrTransforms.rightHand.rightLittleFinger2, avatarRig.pose.vrTransforms.rightHand.rightLittleFinger3],
                finger: 'little',
              },
            ],
          };
          avatarRig.fingerBoneMap = fingerBoneMap;
      
          const _getOffset = (bone, parent = bone.parent) => bone.getWorldPosition(new Vector3()).sub(parent.getWorldPosition(new Vector3()));
      
          avatarRig.shoulderTransforms.spine.position.copy(_getOffset(modelBones.Spine));
          avatarRig.shoulderTransforms.transform.position.copy( _getOffset(modelBones.Chest, modelBones.Spine));
          avatarRig.shoulderTransforms.neck.position.copy(_getOffset(modelBones.Neck));
          avatarRig.shoulderTransforms.head.position.copy(_getOffset(modelBones.Head));
          avatarRig.shoulderTransforms.eyes.position.copy(eyePosition.clone().sub(Head.getWorldPosition(new Vector3())));
      
          avatarRig.shoulderTransforms.leftShoulderAnchor.position.copy(_getOffset(modelBones.Left_shoulder));
          avatarRig.shoulderTransforms.leftArm.upperArm.position.copy(_getOffset(modelBones.Left_arm));
          avatarRig.shoulderTransforms.leftArm.lowerArm.position.copy(_getOffset(modelBones.Left_elbow));
          avatarRig.shoulderTransforms.leftArm.hand.position.copy(_getOffset(modelBones.Left_wrist));
          avatarRig.shoulderTransforms.leftArm.thumb2.position.copy(_getOffset(modelBones.Left_thumb2));
          avatarRig.shoulderTransforms.leftArm.thumb1.position.copy(_getOffset(modelBones.Left_thumb1));
          avatarRig.shoulderTransforms.leftArm.thumb0.position.copy(_getOffset(modelBones.Left_thumb0));
          avatarRig.shoulderTransforms.leftArm.indexFinger3.position.copy(_getOffset(modelBones.Left_indexFinger3));
          avatarRig.shoulderTransforms.leftArm.indexFinger2.position.copy(_getOffset(modelBones.Left_indexFinger2));
          avatarRig.shoulderTransforms.leftArm.indexFinger1.position.copy(_getOffset(modelBones.Left_indexFinger1));
          avatarRig.shoulderTransforms.leftArm.middleFinger3.position.copy(_getOffset(modelBones.Left_middleFinger3));
          avatarRig.shoulderTransforms.leftArm.middleFinger2.position.copy(_getOffset(modelBones.Left_middleFinger2));
          avatarRig.shoulderTransforms.leftArm.middleFinger1.position.copy(_getOffset(modelBones.Left_middleFinger1));
          avatarRig.shoulderTransforms.leftArm.ringFinger3.position.copy(_getOffset(modelBones.Left_ringFinger3));
          avatarRig.shoulderTransforms.leftArm.ringFinger2.position.copy(_getOffset(modelBones.Left_ringFinger2));
          avatarRig.shoulderTransforms.leftArm.ringFinger1.position.copy(_getOffset(modelBones.Left_ringFinger1));
          avatarRig.shoulderTransforms.leftArm.littleFinger3.position.copy(_getOffset(modelBones.Left_littleFinger3));
          avatarRig.shoulderTransforms.leftArm.littleFinger2.position.copy(_getOffset(modelBones.Left_littleFinger2));
          avatarRig.shoulderTransforms.leftArm.littleFinger1.position.copy(_getOffset(modelBones.Left_littleFinger1));
      
          avatarRig.shoulderTransforms.rightShoulderAnchor.position.copy(_getOffset(modelBones.Right_shoulder));
          avatarRig.shoulderTransforms.rightArm.upperArm.position.copy(_getOffset(modelBones.Right_arm));
          avatarRig.shoulderTransforms.rightArm.lowerArm.position.copy(_getOffset(modelBones.Right_elbow));
          avatarRig.shoulderTransforms.rightArm.hand.position.copy(_getOffset(modelBones.Right_wrist));
          avatarRig.shoulderTransforms.rightArm.thumb2.position.copy(_getOffset(modelBones.Right_thumb2));
          avatarRig.shoulderTransforms.rightArm.thumb1.position.copy(_getOffset(modelBones.Right_thumb1));
          avatarRig.shoulderTransforms.rightArm.thumb0.position.copy(_getOffset(modelBones.Right_thumb0));
          avatarRig.shoulderTransforms.rightArm.indexFinger3.position.copy(_getOffset(modelBones.Right_indexFinger3));
          avatarRig.shoulderTransforms.rightArm.indexFinger2.position.copy(_getOffset(modelBones.Right_indexFinger2));
          avatarRig.shoulderTransforms.rightArm.indexFinger1.position.copy(_getOffset(modelBones.Right_indexFinger1));
          avatarRig.shoulderTransforms.rightArm.middleFinger3.position.copy(_getOffset(modelBones.Right_middleFinger3));
          avatarRig.shoulderTransforms.rightArm.middleFinger2.position.copy(_getOffset(modelBones.Right_middleFinger2));
          avatarRig.shoulderTransforms.rightArm.middleFinger1.position.copy(_getOffset(modelBones.Right_middleFinger1));
          avatarRig.shoulderTransforms.rightArm.ringFinger3.position.copy(_getOffset(modelBones.Right_ringFinger3));
          avatarRig.shoulderTransforms.rightArm.ringFinger2.position.copy(_getOffset(modelBones.Right_ringFinger2));
          avatarRig.shoulderTransforms.rightArm.ringFinger1.position.copy(_getOffset(modelBones.Right_ringFinger1));
          avatarRig.shoulderTransforms.rightArm.littleFinger3.position.copy(_getOffset(modelBones.Right_littleFinger3));
          avatarRig.shoulderTransforms.rightArm.littleFinger2.position.copy(_getOffset(modelBones.Right_littleFinger2));
          avatarRig.shoulderTransforms.rightArm.littleFinger1.position.copy(_getOffset(modelBones.Right_littleFinger1));
      
          avatarRig.avatarLegs.leftLeg.upperLeg.position.copy(_getOffset(modelBones.Left_leg));
          avatarRig.avatarLegs.leftLeg.lowerLeg.position.copy(_getOffset(modelBones.Left_knee));
          avatarRig.avatarLegs.leftLeg.foot.position.copy(_getOffset(modelBones.Left_ankle));
      
          avatarRig.avatarLegs.rightLeg.upperLeg.position.copy(_getOffset(modelBones.Right_leg));
          avatarRig.avatarLegs.rightLeg.lowerLeg.position.copy(_getOffset(modelBones.Right_knee));
          avatarRig.avatarLegs.rightLeg.foot.position.copy(_getOffset(modelBones.Right_ankle));
      
          avatarRig.shoulderTransforms.hips.updateMatrixWorld();
      
          avatarRig.height = eyePosition.clone().sub(_averagePoint([modelBones.Left_ankle.getWorldPosition(new Vector3()), modelBones.Right_ankle.getWorldPosition(new Vector3())])).y;
          avatarRig.shoulderWidth = modelBones.Left_arm.getWorldPosition(new Vector3()).distanceTo(modelBones.Right_arm.getWorldPosition(new Vector3()));
          avatarRig.leftArmLength = avatarRig.shoulderTransforms.leftArm.armLength;
          avatarRig.rightArmLength = avatarRig.shoulderTransforms.rightArm.armLength;
          const indexDistance = modelBones.Left_indexFinger1.getWorldPosition(new Vector3())
            .distanceTo(modelBones.Left_wrist.getWorldPosition(new Vector3()));
          const handWidth = modelBones.Left_indexFinger1.getWorldPosition(new Vector3())
            .distanceTo(modelBones.Left_littleFinger1.getWorldPosition(new Vector3()));
          avatarRig.handOffsetLeft = new Vector3(handWidth * 0.7, -handWidth * 0.75, indexDistance * 0.5);
          avatarRig.handOffsetRight = new Vector3(-handWidth * 0.7, -handWidth * 0.75, indexDistance * 0.5);
          avatarRig.eyeToHipsOffset = modelBones.Hips.getWorldPosition(new Vector3()).sub(eyePosition);
      
          const _makeInput = () => {
            const result = new Object3D();
            result["pointer"] = 0;
            result["grip"] = 0;
            result["enabled"] = false;
            return result;
          };
          avatarRig.inputs = {
            hmd: _makeInput(),
            leftGamepad: _makeInput(),
            rightGamepad: _makeInput(),
          };
          avatarRig.sdkInputs = {
            hmd: avatarRig.pose.vrTransforms.head,
            leftGamepad: avatarRig.pose.vrTransforms.leftHand,
            rightGamepad: avatarRig.pose.vrTransforms.rightHand,
          };
          avatarRig.sdkInputs.hmd.scaleFactor = 1;
          avatarRig.lastModelScaleFactor = 1;
          avatarRig.outputs = {
            eyes: avatarRig.shoulderTransforms.eyes,
            head: avatarRig.shoulderTransforms.head,
            hips: avatarRig.avatarLegs.hips,
            spine: avatarRig.shoulderTransforms.spine,
            chest: avatarRig.shoulderTransforms.transform,
            neck: avatarRig.shoulderTransforms.neck,
            leftShoulder: avatarRig.shoulderTransforms.leftShoulderAnchor,
            leftUpperArm: avatarRig.shoulderTransforms.leftArm.upperArm,
            leftLowerArm: avatarRig.shoulderTransforms.leftArm.lowerArm,
            leftHand: avatarRig.shoulderTransforms.leftArm.hand,
            rightShoulder: avatarRig.shoulderTransforms.rightShoulderAnchor,
            rightUpperArm: avatarRig.shoulderTransforms.rightArm.upperArm,
            rightLowerArm: avatarRig.shoulderTransforms.rightArm.lowerArm,
            rightHand: avatarRig.shoulderTransforms.rightArm.hand,
            leftUpperLeg: avatarRig.avatarLegs.leftLeg.upperLeg,
            leftLowerLeg: avatarRig.avatarLegs.leftLeg.lowerLeg,
            leftFoot: avatarRig.avatarLegs.leftLeg.foot,
            rightUpperLeg: avatarRig.avatarLegs.rightLeg.upperLeg,
            rightLowerLeg: avatarRig.avatarLegs.rightLeg.lowerLeg,
            rightFoot: avatarRig.avatarLegs.rightLeg.foot,
            leftThumb2: avatarRig.shoulderTransforms.rightArm.thumb2,
            leftThumb1: avatarRig.shoulderTransforms.rightArm.thumb1,
            leftThumb0: avatarRig.shoulderTransforms.rightArm.thumb0,
            leftIndexFinger3: avatarRig.shoulderTransforms.rightArm.indexFinger3,
            leftIndexFinger2: avatarRig.shoulderTransforms.rightArm.indexFinger2,
            leftIndexFinger1: avatarRig.shoulderTransforms.rightArm.indexFinger1,
            leftMiddleFinger3: avatarRig.shoulderTransforms.rightArm.middleFinger3,
            leftMiddleFinger2: avatarRig.shoulderTransforms.rightArm.middleFinger2,
            leftMiddleFinger1: avatarRig.shoulderTransforms.rightArm.middleFinger1,
            leftRingFinger3: avatarRig.shoulderTransforms.rightArm.ringFinger3,
            leftRingFinger2: avatarRig.shoulderTransforms.rightArm.ringFinger2,
            leftRingFinger1: avatarRig.shoulderTransforms.rightArm.ringFinger1,
            leftLittleFinger3: avatarRig.shoulderTransforms.rightArm.littleFinger3,
            leftLittleFinger2: avatarRig.shoulderTransforms.rightArm.littleFinger2,
            leftLittleFinger1: avatarRig.shoulderTransforms.rightArm.littleFinger1,
            rightThumb2: avatarRig.shoulderTransforms.leftArm.thumb2,
            rightThumb1: avatarRig.shoulderTransforms.leftArm.thumb1,
            rightThumb0: avatarRig.shoulderTransforms.leftArm.thumb0,
            rightIndexFinger3: avatarRig.shoulderTransforms.leftArm.indexFinger3,
            rightIndexFinger2: avatarRig.shoulderTransforms.leftArm.indexFinger2,
            rightIndexFinger1: avatarRig.shoulderTransforms.leftArm.indexFinger1,
            rightMiddleFinger3: avatarRig.shoulderTransforms.leftArm.middleFinger3,
            rightMiddleFinger2: avatarRig.shoulderTransforms.leftArm.middleFinger2,
            rightMiddleFinger1: avatarRig.shoulderTransforms.leftArm.middleFinger1,
            rightRingFinger3: avatarRig.shoulderTransforms.leftArm.ringFinger3,
            rightRingFinger2: avatarRig.shoulderTransforms.leftArm.ringFinger2,
            rightRingFinger1: avatarRig.shoulderTransforms.leftArm.ringFinger1,
            rightLittleFinger3: avatarRig.shoulderTransforms.leftArm.littleFinger3,
            rightLittleFinger2: avatarRig.shoulderTransforms.leftArm.littleFinger2,
            rightLittleFinger1: avatarRig.shoulderTransforms.leftArm.littleFinger1,
          };
          avatarRig.modelBoneOutputs = {
            Hips: avatarRig.outputs.hips,
            Spine: avatarRig.outputs.spine,
            Chest: avatarRig.outputs.chest,
            Neck: avatarRig.outputs.neck,
            Head: avatarRig.outputs.head,
      
            Left_shoulder: avatarRig.outputs.rightShoulder,
            Left_arm: avatarRig.outputs.rightUpperArm,
            Left_elbow: avatarRig.outputs.rightLowerArm,
            Left_wrist: avatarRig.outputs.rightHand,
            Left_thumb2: avatarRig.outputs.leftThumb2,
            Left_thumb1: avatarRig.outputs.leftThumb1,
            Left_thumb0: avatarRig.outputs.leftThumb0,
            Left_indexFinger3: avatarRig.outputs.leftIndexFinger3,
            Left_indexFinger2: avatarRig.outputs.leftIndexFinger2,
            Left_indexFinger1: avatarRig.outputs.leftIndexFinger1,
            Left_middleFinger3: avatarRig.outputs.leftMiddleFinger3,
            Left_middleFinger2: avatarRig.outputs.leftMiddleFinger2,
            Left_middleFinger1: avatarRig.outputs.leftMiddleFinger1,
            Left_ringFinger3: avatarRig.outputs.leftRingFinger3,
            Left_ringFinger2: avatarRig.outputs.leftRingFinger2,
            Left_ringFinger1: avatarRig.outputs.leftRingFinger1,
            Left_littleFinger3: avatarRig.outputs.leftLittleFinger3,
            Left_littleFinger2: avatarRig.outputs.leftLittleFinger2,
            Left_littleFinger1: avatarRig.outputs.leftLittleFinger1,
            Left_leg: avatarRig.outputs.rightUpperLeg,
            Left_knee: avatarRig.outputs.rightLowerLeg,
            Left_ankle: avatarRig.outputs.rightFoot,
      
            Right_shoulder: avatarRig.outputs.leftShoulder,
            Right_arm: avatarRig.outputs.leftUpperArm,
            Right_elbow: avatarRig.outputs.leftLowerArm,
            Right_wrist: avatarRig.outputs.leftHand,
            Right_thumb2: avatarRig.outputs.rightThumb2,
            Right_thumb1: avatarRig.outputs.rightThumb1,
            Right_thumb0: avatarRig.outputs.rightThumb0,
            Right_indexFinger3: avatarRig.outputs.rightIndexFinger3,
            Right_indexFinger2: avatarRig.outputs.rightIndexFinger2,
            Right_indexFinger1: avatarRig.outputs.rightIndexFinger1,
            Right_middleFinger3: avatarRig.outputs.rightMiddleFinger3,
            Right_middleFinger2: avatarRig.outputs.rightMiddleFinger2,
            Right_middleFinger1: avatarRig.outputs.rightMiddleFinger1,
            Right_ringFinger3: avatarRig.outputs.rightRingFinger3,
            Right_ringFinger2: avatarRig.outputs.rightRingFinger2,
            Right_ringFinger1: avatarRig.outputs.rightRingFinger1,
            Right_littleFinger3: avatarRig.outputs.rightLittleFinger3,
            Right_littleFinger2: avatarRig.outputs.rightLittleFinger2,
            Right_littleFinger1: avatarRig.outputs.rightLittleFinger1,
            Right_leg: avatarRig.outputs.leftUpperLeg,
            Right_knee: avatarRig.outputs.leftLowerLeg,
            Right_ankle: avatarRig.outputs.leftFoot,
          };
      
          if (avatarRig.options.visemes) {
            const vrmExtension = avatarRig.object && avatarRig.object.userData && avatarRig.object.userData.gltfExtensions && avatarRig.object.userData.gltfExtensions.VRM;
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
            avatarRig.skinnedMeshesVisemeMappings = avatarRig.skinnedMeshes.map(o => {
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
            avatarRig.skinnedMeshesVisemeMappings = [];
          }
      
          // avatarRig.lastTimestamp = Date.now();
      
          avatarRig.shoulderTransforms.Start();
          avatarRig.avatarLegs.Start();
      
          if (avatarRig.options.top !== undefined) {
            avatarRig.shoulderTransforms.enabled = !!avatarRig.options.top;
          }
          if (avatarRig.options.bottom !== undefined) {
            avatarRig.avatarLegs.enabled = !!avatarRig.options.bottom;
          }
      
          avatarRig.animationMappings = [
            new AnimationMapping('mixamorigHips.quaternion', avatarRig.outputs.hips.quaternion, false),
            new AnimationMapping('mixamorigSpine.quaternion', avatarRig.outputs.spine.quaternion, false),
            // new AnimationMapping('mixamorigSpine1.quaternion', null, false),
            new AnimationMapping('mixamorigSpine2.quaternion', avatarRig.outputs.chest.quaternion, false),
            new AnimationMapping('mixamorigNeck.quaternion', avatarRig.outputs.neck.quaternion, false),
            new AnimationMapping('mixamorigHead.quaternion', avatarRig.outputs.head.quaternion, false),
      
            new AnimationMapping('mixamorigLeftShoulder.quaternion', avatarRig.outputs.rightShoulder.quaternion, true),
            new AnimationMapping('mixamorigLeftArm.quaternion', avatarRig.outputs.rightUpperArm.quaternion, true),
            new AnimationMapping('mixamorigLeftForeArm.quaternion', avatarRig.outputs.rightLowerArm.quaternion, true),
            new AnimationMapping('mixamorigLeftHand.quaternion', avatarRig.outputs.leftHand.quaternion, true),
            new AnimationMapping('mixamorigLeftHandMiddle1.quaternion', avatarRig.outputs.leftMiddleFinger1.quaternion, true),
            new AnimationMapping('mixamorigLeftHandMiddle2.quaternion', avatarRig.outputs.leftMiddleFinger2.quaternion, true),
            new AnimationMapping('mixamorigLeftHandMiddle3.quaternion', avatarRig.outputs.leftMiddleFinger3.quaternion, true),
            new AnimationMapping('mixamorigLeftHandThumb1.quaternion', avatarRig.outputs.leftThumb0.quaternion, true),
            new AnimationMapping('mixamorigLeftHandThumb2.quaternion', avatarRig.outputs.leftThumb1.quaternion, true),
            new AnimationMapping('mixamorigLeftHandThumb3.quaternion', avatarRig.outputs.leftThumb2.quaternion, true),
            new AnimationMapping('mixamorigLeftHandIndex1.quaternion', avatarRig.outputs.leftIndexFinger1.quaternion, true),
            new AnimationMapping('mixamorigLeftHandIndex2.quaternion', avatarRig.outputs.leftIndexFinger2.quaternion, true),
            new AnimationMapping('mixamorigLeftHandIndex3.quaternion', avatarRig.outputs.leftIndexFinger3.quaternion, true),
            new AnimationMapping('mixamorigLeftHandRing1.quaternion', avatarRig.outputs.leftRingFinger1.quaternion, true),
            new AnimationMapping('mixamorigLeftHandRing2.quaternion', avatarRig.outputs.leftRingFinger2.quaternion, true),
            new AnimationMapping('mixamorigLeftHandRing3.quaternion', avatarRig.outputs.leftRingFinger3.quaternion, true),
            new AnimationMapping('mixamorigLeftHandPinky1.quaternion', avatarRig.outputs.leftLittleFinger1.quaternion, true),
            new AnimationMapping('mixamorigLeftHandPinky2.quaternion', avatarRig.outputs.leftLittleFinger2.quaternion, true),
            new AnimationMapping('mixamorigLeftHandPinky3.quaternion', avatarRig.outputs.leftLittleFinger3.quaternion, true),
      
            new AnimationMapping('mixamorigRightShoulder.quaternion', avatarRig.outputs.leftShoulder.quaternion, true),
            new AnimationMapping('mixamorigRightArm.quaternion', avatarRig.outputs.leftUpperArm.quaternion, true),
            new AnimationMapping('mixamorigRightForeArm.quaternion', avatarRig.outputs.leftLowerArm.quaternion, true),
            new AnimationMapping('mixamorigRightHand.quaternion', avatarRig.outputs.rightHand.quaternion, true),
            new AnimationMapping('mixamorigRightHandMiddle1.quaternion', avatarRig.outputs.rightMiddleFinger1.quaternion, true),
            new AnimationMapping('mixamorigRightHandMiddle2.quaternion', avatarRig.outputs.rightMiddleFinger2.quaternion, true),
            new AnimationMapping('mixamorigRightHandMiddle3.quaternion', avatarRig.outputs.rightMiddleFinger3.quaternion, true),
            new AnimationMapping('mixamorigRightHandThumb1.quaternion', avatarRig.outputs.rightThumb0.quaternion, true),
            new AnimationMapping('mixamorigRightHandThumb2.quaternion', avatarRig.outputs.rightThumb1.quaternion, true),
            new AnimationMapping('mixamorigRightHandThumb3.quaternion', avatarRig.outputs.rightThumb2.quaternion, true),
            new AnimationMapping('mixamorigRightHandIndex1.quaternion', avatarRig.outputs.rightIndexFinger1.quaternion, true),
            new AnimationMapping('mixamorigRightHandIndex2.quaternion', avatarRig.outputs.rightIndexFinger2.quaternion, true),
            new AnimationMapping('mixamorigRightHandIndex3.quaternion', avatarRig.outputs.rightIndexFinger3.quaternion, true),
            new AnimationMapping('mixamorigRightHandRing1.quaternion', avatarRig.outputs.rightRingFinger1.quaternion, true),
            new AnimationMapping('mixamorigRightHandRing2.quaternion', avatarRig.outputs.rightRingFinger2.quaternion, true),
            new AnimationMapping('mixamorigRightHandRing3.quaternion', avatarRig.outputs.rightRingFinger3.quaternion, true),
            new AnimationMapping('mixamorigRightHandPinky1.quaternion', avatarRig.outputs.rightLittleFinger1.quaternion, true),
            new AnimationMapping('mixamorigRightHandPinky2.quaternion', avatarRig.outputs.rightLittleFinger2.quaternion, true),
            new AnimationMapping('mixamorigRightHandPinky3.quaternion', avatarRig.outputs.rightLittleFinger3.quaternion, true),
      
            new AnimationMapping('mixamorigRightUpLeg.quaternion', avatarRig.outputs.leftUpperLeg.quaternion, false),
            new AnimationMapping('mixamorigRightLeg.quaternion', avatarRig.outputs.leftLowerLeg.quaternion, false),
            new AnimationMapping('mixamorigRightFoot.quaternion', avatarRig.outputs.leftFoot.quaternion, false),
            // new AnimationMapping('mixamorigRightToeBase.quaternion', null, false),
      
            new AnimationMapping('mixamorigLeftUpLeg.quaternion', avatarRig.outputs.rightUpperLeg.quaternion, false),
            new AnimationMapping('mixamorigLeftLeg.quaternion', avatarRig.outputs.rightLowerLeg.quaternion, false),
            new AnimationMapping('mixamorigLeftFoot.quaternion', avatarRig.outputs.rightFoot.quaternion, false),
            // new AnimationMapping('mixamorigLeftToeBase.quaternion', null, false),
          ];
    });

    this.queryResults.avatarWithShoulders.all?.forEach((entity) => {
      const avatarShoulders = getMutableComponent(entity, AvatarShoulders);
      updateXRArmIK(entity, Side.Left);
      avatarShoulders.leftArmIk.Update();
      avatarShoulders.rightArmIk.Update();
    });
  };
}

AvatarRigSystem.queries = {
    animation: {
        components: [XRAvatarRig],
        listen: {
            added: true,
            removed: true
        }
    },
    avatarWithLegs: {
      components: [XRAvatarRig, AvatarLegs],
      listen: {
          added: true,
          removed: true
      }
  },
  avatarWithShoulders: {
    components: [XRAvatarRig, AvatarShoulders],
    listen: {
        added: true,
        removed: true
    }
  }
};