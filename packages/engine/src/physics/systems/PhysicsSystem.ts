import CANNON, { Body, ContactMaterial, Material, SAPBroadphase, Shape, Vec3, World } from 'cannon-es';
import { Matrix4, Mesh, Quaternion, Vector3 } from 'three';
import { CameraComponent } from '../../camera/components/CameraComponent';
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent';
import { CameraSystem } from '../../camera/systems/CameraSystem';
import { appplyVectorMatrixXZ } from '../../common/functions/appplyVectorMatrixXZ';
import { cannonFromThreeVector } from '../../common/functions/cannonFromThreeVector';
import { getSignedAngleBetweenVectors } from '../../common/functions/getSignedAngleBetweenVectors';
import { isClient } from '../../common/functions/isClient';
import { isServer } from '../../common/functions/isServer';
import { lerp } from '../../common/functions/MathLerpFunctions';
import { Behavior } from '../../common/interfaces/Behavior';
import { Engine } from '../../ecs/classes/Engine';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { LocalInputReceiver } from "../../input/components/LocalInputReceiver";
import { Network } from '../../networking/classes/Network';
import { Vault } from '../../networking/classes/Vault';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { calculateInterpolation, createSnapshot } from '../../networking/functions/NetworkInterpolationFunctions';
import { Object3DComponent } from '../../scene/components/Object3DComponent';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { onAddedInCar } from '../../templates/vehicle/behaviors/onAddedInCar';
import { onAddEndingInCar } from '../../templates/vehicle/behaviors/onAddEndingInCar';
import { onRemovedFromCar } from '../../templates/vehicle/behaviors/onRemovedFromCar';
import { onStartRemoveFromCar } from '../../templates/vehicle/behaviors/onStartRemoveFromCar';
import { onUpdatePlayerInCar } from '../../templates/vehicle/behaviors/onUpdatePlayerInCar';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { capsuleColliderBehavior } from '../behaviors/capsuleColliderBehavior';
import { handleCollider } from '../behaviors/ColliderBehavior';
import { RigidBodyBehavior } from '../behaviors/RigidBodyBehavior';
import { VehicleBehavior } from '../behaviors/VehicleBehavior';
import { CapsuleCollider } from "../components/CapsuleCollider";
import { ColliderComponent } from '../components/ColliderComponent';
import { PlayerInCar } from '../components/PlayerInCar';
import { RigidBody } from "../components/RigidBody";
import { VehicleBody } from "../components/VehicleBody";
import { CollisionGroups } from '../enums/CollisionGroups';


const vec3 = new Vector3();
const arcadeVelocity = new Vector3();
const simulatedVelocity = new Vector3();
const newVelocity = new Vector3();
let lastRightGamePad = null;
const DEBUG_PHYSICS = false;
/*
const cannonDebugger = isClient ? import('cannon-es-debugger').then((module) => {
  module.default;
  console.log(module.default);
}) : null;
*/
export class PhysicsSystem extends System {
  updateType = SystemUpdateType.Fixed;
  static frame: number
  diffSpeed: number = Engine.physicsFrameRate / Engine.networkFramerate;

  static physicsWorld: World
  static simulate: boolean
  static serverOnlyRigidBodyCollides: boolean

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

    if (!isClient) return;
    const DebugOptions = {
      onInit: (body: Body, mesh: Mesh, shape: Shape) => {
        // console.log("PH INIT: body: ", body, " | mesh: ", mesh, " | shape: ", shape)
      },
      onUpdate: (body: Body, mesh: Mesh, shape: Shape) => {
        //console.log("PH  UPD: body position: ", body.position, " | body: ", body, " | mesh: ", mesh, " | shape: ", shape) }
      }
    };

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

    const clientSnapshot = {
      old: null,
      new: [],
      interpolationSnapshot: isClient ? calculateInterpolation('x y z quat'):'',
      correction: 180//NetworkInterpolation.instance.timeOffset // //speed correction client form server positions
    }

    if (isClient && Network.instance.snapshot) {
      clientSnapshot.old = Vault.instance?.get((Network.instance.snapshot as any).timeCorrection, true);
      if (clientSnapshot.old) {
        if (this.clientSnapshotFreezeTime == clientSnapshot.old.time && this.serverSnapshotFreezeTime == Network.instance.snapshot.timeCorrection && this.freezeTimes > 3) {
          clientSnapshot.old = null;
        } else if (this.clientSnapshotFreezeTime == clientSnapshot.old.time && this.serverSnapshotFreezeTime == Network.instance.snapshot.timeCorrection) {
          this.freezeTimes+=1;
        } else {
          this.freezeTimes = 0;
          this.clientSnapshotFreezeTime = clientSnapshot.old.time;
          this.serverSnapshotFreezeTime = Network.instance.snapshot.timeCorrection;
        }
      }
    }

    // Collider

    this.queryResults.collider.added?.forEach(entity => {
      handleCollider(entity, { phase: 'onAdded' });
    });

    this.queryResults.collider.removed?.forEach(entity => {
      handleCollider(entity, { phase: 'onRemoved' });
    });

    // Capsule

    this.queryResults.capsuleCollider.all?.forEach(entity => {
      capsuleColliderBehavior(entity, { phase: 'onUpdate', clientSnapshot });
    });

    this.queryResults.capsuleCollider.removed?.forEach(entity => {
      capsuleColliderBehavior(entity, { phase: 'onRemoved' });
    });

    // RigidBody

    this.queryResults.rigidBody.added?.forEach(entity => {
      RigidBodyBehavior(entity, { phase: 'onAdded' });
    });

    this.queryResults.rigidBody.all?.forEach(entity => {
      RigidBodyBehavior(entity, { phase: 'onUpdate', clientSnapshot });
    });

    // Vehicle

    this.queryResults.vehicleBody.added?.forEach(entity => {
      VehicleBehavior(entity, { phase: 'onAdded' });
    });


    this.queryResults.vehicleBody.all?.forEach(entityCar => {
      const networkCarId = getComponent(entityCar, NetworkObject).networkId;
      VehicleBehavior(entityCar, { phase: 'onUpdate', clientSnapshot });

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





    if (PhysicsSystem.simulate) { // pause physics until loading all component scene
      this.queryResults.character.all?.forEach(entity => physicsPreStep(entity, null, delta));
      PhysicsSystem.frame++;
      PhysicsSystem.physicsWorld.step(this.physicsFrameTime);
      this.queryResults.character.all?.forEach(entity => updateCharacter(entity, null, delta));
      this.queryResults.character.all?.forEach(entity => physicsPostStep(entity, null, delta));
      if (isClient) { Vault.instance.add(createSnapshot(clientSnapshot.new)) }
    }
  }
}

PhysicsSystem.queries = {
  character: {
    components: [CharacterComponent],
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


const up = new Vector3(0, 1, 0);

function haveDifferentSigns(n1: number, n2: number): boolean {
  return (n1 < 0) !== (n2 < 0);
}

function threeFromCannonVector(vec: CANNON.Vec3): Vector3 {
  return new Vector3(vec.x, vec.y, vec.z);
}

function threeFromCannonQuat(quat: CANNON.Quaternion): Quaternion {
  return new Quaternion(quat.x, quat.y, quat.z, quat.w);
}

 const physicsPostStep: Behavior = (entity): void => {	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if(!actor.initialized) return;

	const body = actor.actorCapsule.body;
	if(body.world == null) return;
	// Get velocities
	simulatedVelocity.set(body.velocity.x, body.velocity.y, body.velocity.z);

	// Take local velocity
	arcadeVelocity.copy(actor.velocity).multiplyScalar(actor.moveSpeed);
	// Turn local into global
	arcadeVelocity.copy(appplyVectorMatrixXZ(actor.orientation, arcadeVelocity));

	// Additive velocity mode
	if (actor.arcadeVelocityIsAdditive) {
		newVelocity.copy(simulatedVelocity);

		const globalVelocityTarget = appplyVectorMatrixXZ(actor.orientation, actor.velocityTarget);
		const add = new Vector3().copy(arcadeVelocity).multiply(actor.arcadeVelocityInfluence);
/*
		if (Math.abs(simulatedVelocity.x) < Math.abs(globalVelocityTarget.x * actor.moveSpeed) || haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)) { newVelocity.x += add.x; }
		if (Math.abs(simulatedVelocity.y) < Math.abs(globalVelocityTarget.y * actor.moveSpeed) || haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)) { newVelocity.y += add.y; }
		if (Math.abs(simulatedVelocity.z) < Math.abs(globalVelocityTarget.z * actor.moveSpeed) || haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)) { newVelocity.z += add.z; }
*/
		//console.warn(actor.moveSpeed);
		if ( haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)) { newVelocity.x += add.x; }
		if ( haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)) { newVelocity.y += add.y; }
		if ( haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)) { newVelocity.z += add.z; }
	}
	else {

		newVelocity.set(
			lerp(simulatedVelocity.x, arcadeVelocity.x, actor.arcadeVelocityInfluence.x),
			lerp(simulatedVelocity.y, arcadeVelocity.y, actor.arcadeVelocityInfluence.y),
			lerp(simulatedVelocity.z, arcadeVelocity.z, actor.arcadeVelocityInfluence.z)
		);
	}

	// If we're hitting the ground, stick to ground
	if (actor.rayHasHit) {
		// console.log("We are hitting the ground")
		// Flatten velocity
		newVelocity.y = 0;

		// Move on top of moving objects
		if (actor.rayResult.body.mass > 0) {
			const pointVelocity = new Vec3();
			actor.rayResult.body.getVelocityAtWorldPoint(actor.rayResult.hitPointWorld, pointVelocity);
			newVelocity.add(threeFromCannonVector(pointVelocity));
		}

		// Measure the normal vector offset from direct "up" vector
		// and transform it into a matrix
		const normal = new Vector3(actor.rayResult.hitNormalWorld.x, actor.rayResult.hitNormalWorld.y, actor.rayResult.hitNormalWorld.z);
		const q = new Quaternion().setFromUnitVectors(up, normal);
		const m = new Matrix4().makeRotationFromQuaternion(q);

		// Rotate the velocity vector
		newVelocity.applyMatrix4(m);

		// Compensate for gravity
		// newVelocity.y -= body.world.physicsWorld.gravity.y / body.actor.world.physicsFrameRate;
		// Apply velocity
	//	if (!isClient) {
			//console.error(body.velocity.x);

			body.velocity.x = newVelocity.x;
			body.velocity.y = newVelocity.y;
			body.velocity.z = newVelocity.z;
	//	}
		// Ground actor
		body.position.y = actor.rayResult.hitPointWorld.y + actor.rayCastLength + (newVelocity.y / Engine.physicsFrameRate);
	}
	else {
		// If we're in air
		body.velocity.x = newVelocity.x;
		body.velocity.y = newVelocity.y;
		body.velocity.z = newVelocity.z;

		// Save last in-air information
		actor.groundImpactVelocity.x = body.velocity.x;
		actor.groundImpactVelocity.y = body.velocity.y;
		actor.groundImpactVelocity.z = body.velocity.z;
	}

	// Jumping
	if (actor.wantsToJump) {
		// If initJumpSpeed is set
		if (actor.initJumpSpeed > -1) {


			// Flatten velocity
		//	body.velocity.y = 0;
		//	const speed = 0.1
	//		body.velocity = cannonFromThreeVector(actor.orientation.clone().multiplyScalar(speed));
	//		console.warn(body.velocity);
		}
		else if (actor.rayHasHit) {
			// Moving objects compensation
			const add = new Vec3();
			actor.rayResult.body.getVelocityAtWorldPoint(actor.rayResult.hitPointWorld, add);
			body.velocity.vsub(add, body.velocity);
		}

		// Add positive vertical velocity
		body.velocity.y += 4;
		// Move above ground by 2x safe offset value
		body.position.y += actor.raySafeOffset * 2;
		// Reset flag
		actor.wantsToJump = false;
	}


	// const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
	// transform.position.set(body.position.x, body.position.y, body.position.z);
}

const physicsPreStep: Behavior = (entity): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if(!actor.initialized) return;
	const body = actor.actorCapsule.body;
	if(body.world == null) return;
	const transform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent);

	// BUG: Setting position but this should be handled properly
	if(isNaN( actor.actorCapsule.body.position.x) || isNaN( actor.actorCapsule.body.position.y)) {
		console.log("body pose is nan");
		actor.actorCapsule.body.position = cannonFromThreeVector(transform.position);
	}
	// Player ray casting
	// Create ray
	const actorRaycastStart = new Vec3(body.position.x, body.position.y, body.position.z);
	const actorRaycastEnd = new Vec3(body.position.x, body.position.y - actor.rayCastLength - actor.raySafeOffset, body.position.z);
	// Raycast options
	const actorRaycastOptions = {
		collisionFilterMask: CollisionGroups.Default,
		skipBackfaces: true /* ignore back faces */
	};
	// Cast the ray
	actor.rayHasHit = PhysicsSystem.physicsWorld.raycastClosest(actorRaycastStart, actorRaycastEnd, actorRaycastOptions, actor.rayResult);


	// Raycast debug
	// if (actor.rayHasHit) {
	// 	if (actor.raycastBox.visible) {
	// 		actor.raycastBox.position.x = actor.rayResult.hitPointWorld.x;
	// 		actor.raycastBox.position.y = actor.rayResult.hitPointWorld.y;
	// 		actor.raycastBox.position.z = actor.rayResult.hitPointWorld.z;
	// 	}
	// }
	// else {
	// 	if (actor.raycastBox.visible) {
	// 		actor.raycastBox.position.set(body.position.x, body.position.y - actor.rayCastLength - actor.raySafeOffset, body.position.z);
	// 	}
	// }
};

const updateCharacter: Behavior = (entity: Entity, args = null, deltaTime) => {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  const actorTransform = getMutableComponent<TransformComponent>(entity, TransformComponent as any);
  if (actor.mixer) {
    actor.mixer.update(deltaTime);
  }

  const body = actor.actorCapsule.body;
	if(body.world == null) return;

  if (isClient && Engine.camera && hasComponent(entity, LocalInputReceiver)) {
    actor.viewVector = new Vector3(0, 0, -1).applyQuaternion(Engine.camera.quaternion);
  }

  if (actor.physicsEnabled) {
    // transfer localMovementDirection into velocityTarget
    actor.velocityTarget.copy(actor.localMovementDirection);

    // Handle Rotation
    // Figure out angle between current and target orientation
    const angle = getSignedAngleBetweenVectors(actor.orientation, actor.orientationTarget);

    // Simulator
    actor.rotationSimulator.target = angle;
    actor.rotationSimulator.simulate(deltaTime);
    const rot = actor.rotationSimulator.position;

    // Updating values
    actor.orientation.applyAxisAngle(new Vector3(0, 1, 0), rot);
    actor.angularVelocity = actor.rotationSimulator.velocity;

    // Handle Movement
    // Simulator
    actor.velocitySimulator.target.copy(actor.velocityTarget);
    actor.velocitySimulator.simulate(deltaTime);

    // Update values
    actor.velocity.copy(actor.velocitySimulator.position);
    actor.acceleration.copy(actor.velocitySimulator.velocity);

    updateIK(entity);

    if (!isClient) {
      actorTransform.position.set(
        actor.actorCapsule.body.position.x,
        actor.actorCapsule.body.position.y,
        actor.actorCapsule.body.position.z
      );
    } else {
      const networkComponent = getComponent<NetworkObject>(entity, NetworkObject)
      if (networkComponent) {
        if (networkComponent.ownerId === Network.instance.userId) {
          actorTransform.position.set(
            actor.actorCapsule.body.position.x,
            actor.actorCapsule.body.position.y,
            actor.actorCapsule.body.position.z
          );
        }
      }
    }
  }
  else {
    const newPos = new Vector3();
    getMutableComponent(entity, Object3DComponent).value.getWorldPosition(newPos);
    actor.actorCapsule.body.position.copy(cannonFromThreeVector(newPos));
    actor.actorCapsule.body.interpolatedPosition.copy(cannonFromThreeVector(newPos));
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

    actor.update();
  }
}
