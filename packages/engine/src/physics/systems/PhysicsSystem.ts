import CANNON, { Body, ContactMaterial, Material, SAPBroadphase, Shape, Vec3, World } from 'cannon-es';
import { Matrix4, Mesh, Quaternion, Vector3 } from 'three';
import { CameraComponent } from '../../camera/components/CameraComponent';
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent';
import { CameraSystem } from '../../camera/systems/CameraSystem';
import { applyVectorMatrixXZ } from '../../common/functions/applyVectorMatrixXZ';
import { cannonFromThreeVector } from '../../common/functions/cannonFromThreeVector';
import { getSignedAngleBetweenVectors } from '../../common/functions/getSignedAngleBetweenVectors';
import { isServer } from '../../common/functions/isServer';
import { Not } from '../../ecs/functions/ComponentFunctions';
import { Behavior } from '../../common/interfaces/Behavior';
import { Engine } from '../../ecs/classes/Engine';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { LocalInputReceiver } from "../../input/components/LocalInputReceiver";
import { Network } from '../../networking/classes/Network';
import { Vault } from '../../networking/classes/Vault';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { calculateInterpolation, createSnapshot } from '../../networking/functions/NetworkInterpolationFunctions';
import { serverCorrectionBehavior, createNewCorrection } from '../behaviors/serverCorrectionBehavior';
import { interpolationBehavior, findOne } from '../behaviors/interpolationBehavior';
import { Object3DComponent } from '../../scene/components/Object3DComponent';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { onAddedInCar } from '../../templates/vehicle/behaviors/onAddedInCar';
import { onAddEndingInCar } from '../../templates/vehicle/behaviors/onAddEndingInCar';
import { onRemovedFromCar } from '../../templates/vehicle/behaviors/onRemovedFromCar';
import { onStartRemoveFromCar } from '../../templates/vehicle/behaviors/onStartRemoveFromCar';
import { onUpdatePlayerInCar } from '../../templates/vehicle/behaviors/onUpdatePlayerInCar';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { capsuleColliderBehavior, updateVelocityVector } from '../behaviors/capsuleColliderBehavior';
import { handleCollider } from '../behaviors/ColliderBehavior';
import { RigidBodyBehavior } from '../behaviors/RigidBodyBehavior';
import { VehicleBehavior } from '../behaviors/VehicleBehavior';
import { CapsuleCollider } from "../components/CapsuleCollider";
import { ColliderComponent } from '../components/ColliderComponent';
import { PlayerInCar } from '../components/PlayerInCar';
import { RigidBody } from "../components/RigidBody";
import { VehicleBody } from "../components/VehicleBody";
import { InterpolationComponent } from "../components/InterpolationComponent";
import { CollisionGroups } from '../enums/CollisionGroups';


const vec3 = new Vector3();
let lastRightGamePad = null;
const DEBUG_PHYSICS = false;
/*
const cannonDebugger = isClient ? import('cannon-es-debugger').then((module) => {
  module.default;
  console.log(module.default);
}) : null;
*/
export class PhysicsSystem extends System {
  static EVENTS = {
    PORTAL_REDIRECT_EVENT: 'PHYSICS_SYSTEM_PORTAL_REDIRECT',
  };
  updateType = SystemUpdateType.Fixed;
  static frame: number
  diffSpeed: number = Engine.physicsFrameRate / Engine.networkFramerate;

  static physicsWorld: World
  static simulate: boolean
  static serverOnlyRigidBodyCollides: boolean
  static serverCorrectionForRigidBodyTick = 1000

  freezeTimes = 0
  clientSnapshotFreezeTime = 0
  serverSnapshotFreezeTime = 0

  groundMaterial = new Material('groundMaterial')
  wheelMaterial = new Material('wheelMaterial')
  trimMeshMaterial = new Material('trimMeshMaterial')

  wheelGroundContactMaterial = new ContactMaterial(this.wheelMaterial, this.groundMaterial, {
    friction: 0.3,
    restitution: 0.3,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8
  })

  parallelPairs: any[];
  physicsFrameRate: number;
  physicsFrameTime: number;
  physicsMaxPrediction: number;
  constructor() {
    super();
    this.physicsFrameRate = Engine.physicsFrameRate;
    this.physicsFrameTime = 1 / this.physicsFrameRate;
    this.physicsMaxPrediction = this.physicsFrameRate;
    PhysicsSystem.serverOnlyRigidBodyCollides = false;
    // Physics
    PhysicsSystem.simulate = isServer;
    PhysicsSystem.frame = 0;
    PhysicsSystem.physicsWorld = new World();
    PhysicsSystem.physicsWorld.allowSleep = false;
    PhysicsSystem.physicsWorld.gravity.set(0, -9.81, 0);
    PhysicsSystem.physicsWorld.broadphase = new SAPBroadphase(PhysicsSystem.physicsWorld);

    this.parallelPairs = [];

    const DebugOptions = {
      onInit: (body: Body, mesh: Mesh, shape: Shape) => {
        // console.log("PH INIT: body: ", body, " | mesh: ", mesh, " | shape: ", shape)
      },
      onUpdate: (body: Body, mesh: Mesh, shape: Shape) => {
        //console.log("PH  UPD: body position: ", body.position, " | body: ", body, " | mesh: ", mesh, " | shape: ", shape) }
      }
    };

    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENABLE_SCENE, (ev: any) => {
      PhysicsSystem.simulate = ev.enable;
    });

    // window["physicsDebugView"] = () => {
    //   debug(Engine.scene, PhysicsSystem.physicsWorld.bodies, DebugOptions);
    // };
    // if (DEBUG_PHYSICS) {
    //   debug(Engine.scene, PhysicsSystem.physicsWorld.bodies, DebugOptions);
    // }
  }

  dispose(): void {
    super.dispose();
    this.groundMaterial = null;
    this.wheelMaterial = null;
    this.trimMeshMaterial = null;
    this.wheelGroundContactMaterial = null;
    PhysicsSystem.frame = 0;
    PhysicsSystem.physicsWorld.broadphase = null;
    PhysicsSystem.physicsWorld = null;
  }

  execute(delta: number): void {

    // Collider

    this.queryResults.collider.added?.forEach(entity => {
      handleCollider(entity, { phase: 'onAdded' });
    });

    this.queryResults.collider.removed?.forEach(entity => {
      handleCollider(entity, { phase: 'onRemoved' });
    });

    // Capsule

    this.queryResults.capsuleCollider.all?.forEach(entity => {
      capsuleColliderBehavior(entity, { phase: 'onAdded' });
    });

    this.queryResults.capsuleCollider.all?.forEach(entity => {
      capsuleColliderBehavior(entity, { phase: 'onUpdate' });
    });

    this.queryResults.capsuleCollider.removed?.forEach(entity => {
      capsuleColliderBehavior(entity, { phase: 'onRemoved' });
    });

    // Update velocity vector for Animations
    this.queryResults.character.all?.forEach(entity => {
      updateVelocityVector(entity, { phase: 'onUpdate' });
    });

    // RigidBody
    this.queryResults.rigidBody.added?.forEach(entity => {
      RigidBodyBehavior(entity, { phase: 'onAdded' });
    });

    this.queryResults.rigidBody.all?.forEach(entity => {
      RigidBodyBehavior(entity, { phase: 'onUpdate' });
    });

    // Vehicle

    this.queryResults.vehicleBody.added?.forEach(entity => {
      VehicleBehavior(entity, { phase: 'onAdded' });
    });


    this.queryResults.vehicleBody.all?.forEach(entityCar => {
      const networkCarId = getComponent(entityCar, NetworkObject).networkId;
      VehicleBehavior(entityCar, { phase: 'onUpdate' });

        this.queryResults.playerInCar.added?.forEach(entity => {
          const component = getComponent(entity, PlayerInCar);
          if (component.networkCarId == networkCarId)
            onAddedInCar(entity, entityCar, component.currentFocusedPart, this.diffSpeed);
        });

        this.queryResults.playerInCar.all?.forEach(entity => {
          const component = getComponent(entity, PlayerInCar);
          if (component.networkCarId == networkCarId) {
            switch (component.state) {
              case 'onAddEnding':
                onAddEndingInCar(entity,  entityCar, component.currentFocusedPart, this.diffSpeed);
                break;
              case 'onUpdate':
                onUpdatePlayerInCar(entity,  entityCar, component.currentFocusedPart, this.diffSpeed);
                break;
              case 'onStartRemove':
                onStartRemoveFromCar(entity, entityCar, component.currentFocusedPart, this.diffSpeed);
                break;
          }}
        });

        this.queryResults.playerInCar.removed?.forEach(entity => {
          let networkPlayerId
          const vehicle = getComponent(entityCar, VehicleBody);
          if(!hasComponent(entity, NetworkObject)) {
            for (let i = 0; i < vehicle.seatPlane.length; i++) {
              if (vehicle[vehicle.seatPlane[i]] != null && !Network.instance.networkObjects[vehicle[vehicle.seatPlane[i]]]) {
                networkPlayerId = vehicle[vehicle.seatPlane[i]];
              }
            }
          } else {
            networkPlayerId = getComponent(entity, NetworkObject).networkId;
          }
          for (let i = 0; i < vehicle.seatPlane.length; i++) {
            if (networkPlayerId == vehicle[vehicle.seatPlane[i]]) {
              onRemovedFromCar(entity, entityCar, i, this.diffSpeed);
            }
          }
        });
    });

    this.queryResults.vehicleBody.removed?.forEach(entity => {
      VehicleBehavior(entity, { phase: 'onRemoved' });
    });

    // All about interpolation and server correction in one plase
    if (this.queryResults.serverCorrection.all.length > 0 && Network.instance.snapshot != undefined) {
      const snapshots = {
        interpolation: calculateInterpolation('x y z quat velocity'),
        correction: Vault.instance?.get((Network.instance.snapshot as any).timeCorrection, true),
        new: []
      }
      // console.warn(snapshots.correction);
      this.queryResults.serverCorrection.all?.forEach(entity => {
        // Creatr new snapshot position for next frame server correction
        createNewCorrection(entity, {
          state: snapshots.new,
          networkId: findOne(entity, null) // if dont have second pamam just return networkId
        });
        // apply previos correction values
        serverCorrectionBehavior(entity, {
          correction: findOne(entity, snapshots.correction),
          snapshot: findOne(entity, Network.instance.snapshot)
        });
      });
      // Creatr new snapshot position for next frame server correction
      Vault.instance.add(createSnapshot(snapshots.new));
      // apply networkInterpolation values
      this.queryResults.networkInterpolation.all?.forEach(entity => {
        interpolationBehavior(entity, {
          snapshot: findOne(entity, snapshots.interpolation )
        });
      })
    }



    if (PhysicsSystem.simulate) { // pause physics until loading all component scene
      PhysicsSystem.frame++;
      PhysicsSystem.physicsWorld.step(this.physicsFrameTime);
    }
  }
}

PhysicsSystem.queries = {
  character: {
    components: [LocalInputReceiver, CapsuleCollider, CharacterComponent, NetworkObject],
  },
  serverCorrection: {
    components: [LocalInputReceiver, InterpolationComponent, NetworkObject],
  },
  networkInterpolation: {
    components: [Not(LocalInputReceiver), InterpolationComponent, NetworkObject],
  },
  capsuleCollider: {
    components: [CapsuleCollider, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  collider: {
    components: [ColliderComponent, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  rigidBody: {
    components: [RigidBody, TransformComponent],
    listen: {
      added: true
    }
  },
  vehicleBody: {
    components: [VehicleBody, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  playerInCar: {
    components: [PlayerInCar],
    listen: {
      added: true,
      removed: true
    }
  }
};

const updateIK = (entity: Entity) => {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
  const dateOffset = Math.floor(Math.random() * 60 * 1000);
  const realDateNow = (now => () => dateOffset + now())(Date.now);

  const positionOffset = Math.sin((realDateNow() % 10000) / 10000 * Math.PI * 2) * 2;
  const positionOffset2 = -Math.sin((realDateNow() % 5000) / 5000 * Math.PI * 2) * 1;
  const standFactor = actor.height * (0.9 + Math.sin((realDateNow() % 2000) / 2000 * Math.PI * 2) * 0.2);
  const rotationAngle = (realDateNow() % 5000) / 5000 * Math.PI * 2;

  if (actor.inputs) {
    // actor.inputs.hmd.position.set(positionOffset, 0.6 + standFactor, 0);
    actor.inputs.hmd.position.set(positionOffset, standFactor, positionOffset2);
    actor.inputs.hmd.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), rotationAngle)
      .multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.sin((realDateNow() % 2000) / 2000 * Math.PI * 2) * Math.PI * 0.2))
      .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.sin((realDateNow() % 2000) / 2000 * Math.PI * 2) * Math.PI * 0.25));

    actor.inputs.rightGamepad.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), rotationAngle)
    // .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.sin((realDateNow()%5000)/5000*Math.PI*2)*Math.PI*0.6));
    actor.inputs.rightGamepad.position.set(positionOffset, actor.height * 0.7 + Math.sin((realDateNow() % 2000) / 2000 * Math.PI * 2) * 0.1, positionOffset2).add(
      new Vector3(-actor.shoulderWidth / 2, 0, -0.2).applyQuaternion(actor.inputs.rightGamepad.quaternion)
    )/*.add(
      new Vector3(-0.1, 0, -1).normalize().multiplyScalar(actor.rightArmLength*0.4).applyQuaternion(actor.inputs.rightGamepad.quaternion)
    ); */
    if (lastRightGamePad !== actor.inputs.rightGamepad.position) {
      // console.log(actor);
      // console.log(actor.inputs.rightGamepad.position);
    }
    lastRightGamePad = actor.inputs.rightGamepad.position;
    actor.inputs.leftGamepad.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), rotationAngle);
    actor.inputs.leftGamepad.position.set(positionOffset, actor.height * 0.7, positionOffset2).add(
      new Vector3(actor.shoulderWidth / 2, 0, -0.2).applyQuaternion(actor.inputs.leftGamepad.quaternion)
    )/*.add(
      new Vector3(0.1, 0, -1).normalize().multiplyScalar(actor.leftArmLength*0.4).applyQuaternion(actor.inputs.leftGamepad.quaternion)
    );*/

    actor.inputs.leftGamepad.pointer = (Math.sin((Date.now() % 10000) / 10000 * Math.PI * 2) + 1) / 2;
    actor.inputs.leftGamepad.grip = (Math.sin((Date.now() % 10000) / 10000 * Math.PI * 2) + 1) / 2;

    actor.inputs.rightGamepad.pointer = (Math.sin((Date.now() % 10000) / 10000 * Math.PI * 2) + 1) / 2;
    actor.inputs.rightGamepad.grip = (Math.sin((Date.now() % 10000) / 10000 * Math.PI * 2) + 1) / 2;

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

      if ((actor.options as any).visemes) {
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
