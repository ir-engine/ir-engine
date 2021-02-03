import { playerModelInCar } from '@xr3ngine/engine/src/templates/car/behaviors/playerModelInCar';
import { Body, ContactMaterial, Material, SAPBroadphase, Shape, World } from 'cannon-es';
import debug from "cannon-es-debugger";
import { Mesh } from 'three';
import { isClient } from '../../common/functions/isClient';
import { Engine } from '../../ecs/classes/Engine';
import { System } from '../../ecs/classes/System';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { Network } from '../../networking/classes/Network';
import { Vault } from '../../networking/classes/Vault';
import { calculateInterpolation, createSnapshot } from '../../networking/functions/NetworkInterpolationFunctions';
import { physicsPostStep } from '../../templates/character/behaviors/physicsPostStep';
import { physicsPreStep } from '../../templates/character/behaviors/physicsPreStep';
import { updateCharacter } from '../../templates/character/behaviors/updateCharacter';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
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
  static physicsWorld: World
  static simulate: boolean
  static serverOnlyRigidBodyCollides: boolean
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
    PhysicsSystem.simulate = true;
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

      window["physicsDebugView"] = () => {
        debug(Engine.scene, PhysicsSystem.physicsWorld.bodies, DebugOptions);
      };
      if (DEBUG_PHYSICS) {
        debug(Engine.scene, PhysicsSystem.physicsWorld.bodies, DebugOptions);
      }
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
      interpolationSnapshot: calculateInterpolation('x y z quat'),
      correction: 180 //speed correction client form server positions
    }

    if (isClient && Network.instance.snapshot) {
      clientSnapshot.old = Vault.instance?.get((Network.instance.snapshot as any).timeCorrection - 15, true)
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
      const col = getComponent(entity, CapsuleCollider)
      if(col) PhysicsSystem.physicsWorld.removeBody(col.body);
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

    this.queryResults.vehicleBody.all?.forEach(entity => {
      VehicleBehavior(entity, { phase: 'onUpdate' });
    });
    this.queryResults.vehicleBody.removed?.forEach(entity => {
      VehicleBehavior(entity, { phase: 'onRemoved' });
    });

    // Player 3d model in car

    this.queryResults.playerInCar.added?.forEach(entity => {
      playerModelInCar(entity, { phase: 'onAdded' }, delta);
    });

    this.queryResults.playerInCar.all?.forEach(entity => {
      playerModelInCar(entity, { phase: 'onUpdate' }, delta);
    });

    this.queryResults.playerInCar.removed?.forEach(entity => {
      playerModelInCar(entity, { phase: 'onRemoved' }, delta);
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
