import _ from 'lodash';
import { BufferGeometry, Mesh, PerspectiveCamera, Scene } from 'three';
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import AssetLoadingSystem from './assets/systems/AssetLoadingSystem';
import { CameraSystem } from './camera/systems/CameraSystem';
import { isClient } from './common/functions/isClient';
import { Timer } from './common/functions/Timer';
import { Engine } from './ecs/classes/Engine';
import { execute, fixedExecute, initialize } from "./ecs/functions/EngineFunctions";
//import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { registerSystem } from './ecs/functions/SystemFunctions';
import { HighlightSystem } from './effects/systems/EffectSystem';
import { InputSystem } from './input/systems/InputSystem';
import { InteractiveSystem } from "./interaction/systems/InteractiveSystem";
import { MediaStreamSystem } from './networking/systems/MediaStreamSystem';
import { NetworkSystem } from './networking/systems/NetworkSystem';
import { PhysicsSystem } from './physics/systems/PhysicsSystem';
import { WebGLRendererSystem } from './renderer/systems/WebGLRendererSystem';
import { StateSystem } from './state/systems/StateSystem';
import { CharacterInputSchema } from './templates/character/CharacterInputSchema';
import { CharacterStateSchema } from './templates/character/CharacterStateSchema';
import { CharacterSubscriptionSchema } from './templates/character/CharacterSubscriptionSchema';
import { DefaultNetworkSchema } from './templates/networking/DefaultNetworkSchema';
import { TransformSystem } from './transform/systems/TransformSystem';

Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype["computeBoundsTree"] = computeBoundsTree;

export const DefaultInitializationOptions = {
  input: {
    schema: CharacterInputSchema,
    useWebXR: true,
  },
  networking: {
    schema: DefaultNetworkSchema
  },
  state: {
    schema: CharacterStateSchema
  },
  subscriptions: {
    enabled: true,
    schema: CharacterSubscriptionSchema
  }
};

export function initializeEngine(initOptions: any = DefaultInitializationOptions) {
  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

  // Create a new world -- this holds all of our simulation state, entities, etc
  initialize();

  // Create a new three.js scene
  const scene = new Scene();

  // Add the three.js scene to our manager -- it is now available anywhere
  Engine.scene = scene;

  // Networking
  registerSystem(NetworkSystem, { schema: options.networking.schema, app: options.networking.app });

  // Do we want audio and video streams?
  registerSystem(MediaStreamSystem);

  registerSystem(AssetLoadingSystem);

  registerSystem(PhysicsSystem);

  registerSystem(InputSystem, { useWebXR: isClient });

  registerSystem(StateSystem);

  // registerSystem(SubscriptionSystem);

  registerSystem(TransformSystem, { priority: 900 });

  //Object HighlightSystem
  if (isClient) {
    // Create a new camera
    const camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.3, 500);
    // Add the camera to the camera manager so it's available anywhere
    Engine.camera = camera;
    // Add the camera to the three.js scene
    scene.add(camera);

    registerSystem(HighlightSystem);
    registerSystem(InteractiveSystem);
    // registerSystem(ParticleSystem);
    registerSystem(CameraSystem);
    registerSystem(WebGLRendererSystem);
    Engine.viewportElement = Engine.renderer.domElement;
  }

  // Start our timer!
    Engine.engineTimerTimeout = setTimeout(() => {
      Engine.engineTimer = Timer(
        {
          fixedUpdate: (delta:number, elapsedTime: number) => fixedExecute(delta, elapsedTime),
          update: (delta, elapsedTime) => execute(delta, elapsedTime)
        },
        Engine.physicsFrameRate).start();
    }, 1000);
}
